import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminEmailPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/users-for-email`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      setResult({ success: false, message: 'Please select at least one user' });
      return;
    }
    
    if (!subject.trim() || !message.trim()) {
      setResult({ success: false, message: 'Subject and message are required' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/send-email`,
        {
          user_ids: selectedUsers,
          subject: subject.trim(),
          message: message.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setResult({ success: true, message: response.data.message, details: response.data.results });
      setSelectedUsers([]);
      setSubject('');
      setMessage('');
    } catch (error) {
      setResult({ 
        success: false, 
        message: error.response?.data?.detail || 'Failed to send emails' 
      });
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📧 Email Users</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Select Recipients</h2>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl mb-4 focus:border-blue-500 focus:outline-none"
            />
            
            {/* Select All */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 mr-3 accent-blue-500"
                />
                <span className="font-medium">Select All ({filteredUsers.length})</span>
              </label>
              <span className="text-sm text-gray-500">
                {selectedUsers.length} selected
              </span>
            </div>
            
            {/* User List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredUsers.map(user => (
                <label 
                  key={user.id} 
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  } border`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="w-5 h-5 mr-3 accent-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{user.full_name || 'No Name'}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.subscription_plan === 'free' 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {user.subscription_plan || 'free'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Compose Email */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Compose Email</h2>
            
            <p className="text-sm text-gray-500 mb-4">
              Emails will be sent from <strong>support@medmcq.com.au</strong>
            </p>
            
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  required
                />
              </div>
              
              {result && (
                <div className={`p-4 rounded-xl ${
                  result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {result.message}
                </div>
              )}
              
              <button
                type="submit"
                disabled={sending || selectedUsers.length === 0}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  `Send Email to ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminEmailPage;
