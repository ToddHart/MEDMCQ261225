import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminEmailPage = () => {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Compose state
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sending, setSending] = useState(false);
  const [replyToId, setReplyToId] = useState(null);
  const [replyToFolder, setReplyToFolder] = useState(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = activeFolder === 'inbox' ? '/api/admin/email/inbox' : '/api/admin/email/sent';
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(response.data.emails || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }, [activeFolder]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/email/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchUnreadCount();
  }, [fetchEmails]);

  const openEmail = async (email) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/admin/email/message/${email.id}?folder=${activeFolder === 'inbox' ? 'INBOX' : 'Sent'}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedEmail(response.data);
      
      // Refresh unread count after opening
      if (activeFolder === 'inbox' && !email.is_read) {
        fetchUnreadCount();
        // Update local state to mark as read
        setEmails(prev => prev.map(e => 
          e.id === email.id ? { ...e, is_read: true } : e
        ));
      }
    } catch (error) {
      console.error('Failed to fetch email:', error);
      alert('Failed to load email');
    }
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    
    setComposeTo(selectedEmail.from.email);
    setComposeSubject(
      selectedEmail.subject.toLowerCase().startsWith('re:') 
        ? selectedEmail.subject 
        : `Re: ${selectedEmail.subject}`
    );
    setComposeBody('');
    setReplyToId(selectedEmail.id);
    setReplyToFolder(selectedEmail.folder);
    setShowCompose(true);
  };

  const handleNewEmail = () => {
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setReplyToId(null);
    setReplyToFolder(null);
    setShowCompose(true);
  };

  const handleSend = async () => {
    if (!composeTo || !composeSubject || !composeBody) {
      alert('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (replyToId) {
        // Send as reply
        await axios.post(
          `${BACKEND_URL}/api/admin/email/reply`,
          {
            original_email_id: replyToId,
            folder: replyToFolder || 'INBOX',
            body: composeBody
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Send as new email
        await axios.post(
          `${BACKEND_URL}/api/admin/email/send`,
          {
            to: composeTo,
            subject: composeSubject,
            body: composeBody
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      alert('Email sent successfully!');
      setShowCompose(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setReplyToId(null);
      setSelectedEmail(null);
      
      // Refresh emails if in sent folder
      if (activeFolder === 'sent') {
        fetchEmails();
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      alert(error.response?.data?.detail || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      return isToday ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
        <div className="flex h-full bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-4">
              <button
                onClick={handleNewEmail}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Compose
              </button>
            </div>
            
            <nav className="flex-1 px-2">
              <button
                onClick={() => { setActiveFolder('inbox'); setSelectedEmail(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeFolder === 'inbox' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  Inbox
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => { setActiveFolder('sent'); setSelectedEmail(null); }}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeFolder === 'sent' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Sent
              </button>
            </nav>
            
            <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
              support@medmcq.com.au
            </div>
          </div>
          
          {/* Email List */}
          <div className={`${selectedEmail || showCompose ? 'hidden md:block md:w-80' : 'flex-1'} border-r border-gray-200 flex flex-col`}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 capitalize">{activeFolder}</h2>
              <button
                onClick={fetchEmails}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : emails.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No emails in {activeFolder}
                </div>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => openEmail(email)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedEmail?.id === email.id 
                        ? 'bg-blue-50' 
                        : 'hover:bg-gray-50'
                    } ${!email.is_read && activeFolder === 'inbox' ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm truncate ${!email.is_read && activeFolder === 'inbox' ? 'font-bold' : 'font-medium'} text-gray-800`}>
                        {activeFolder === 'inbox' 
                          ? (email.from?.name || email.from?.email || 'Unknown')
                          : (email.to?.name || email.to?.email || 'Unknown')
                        }
                      </span>
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {formatDate(email.date)}
                      </span>
                    </div>
                    <div className={`text-sm truncate ${!email.is_read && activeFolder === 'inbox' ? 'font-semibold' : ''} text-gray-700`}>
                      {email.subject}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {email.preview}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Email Detail / Compose */}
          <div className={`flex-1 flex flex-col ${!selectedEmail && !showCompose ? 'hidden md:flex' : ''}`}>
            {showCompose ? (
              /* Compose View */
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">
                    {replyToId ? 'Reply' : 'New Message'}
                  </h2>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <input
                        type="email"
                        value={composeTo}
                        onChange={(e) => setComposeTo(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        placeholder="Subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        rows={12}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="Write your message..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {sending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : selectedEmail ? (
              /* Email Detail View */
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg md:hidden"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center space-x-2">
                    {activeFolder === 'inbox' && (
                      <button
                        onClick={handleReply}
                        className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Reply
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-4">
                    {selectedEmail.subject}
                  </h1>
                  
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <div className="font-medium text-gray-800">
                        {selectedEmail.from?.name || selectedEmail.from?.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedEmail.from?.email}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedEmail.date}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    To: {selectedEmail.to?.name || selectedEmail.to?.email} &lt;{selectedEmail.to?.email}&gt;
                  </div>
                  
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 text-base leading-relaxed">
                      {selectedEmail.body}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>Select an email to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminEmailPage;
