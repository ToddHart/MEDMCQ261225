import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CRMPage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);

  // Form states
  const [contactForm, setContactForm] = useState({
    name: '', email: '', phone: '', company: '', status: 'lead', notes: '', source: ''
  });
  const [noteForm, setNoteForm] = useState({ content: '' });
  const [taskForm, setTaskForm] = useState({ title: '', due_date: '', priority: 'medium', description: '' });

  useEffect(() => {
    fetchContacts();
    fetchTasks();
    fetchStats();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/crm/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/crm/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/crm/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${BACKEND_URL}/api/crm/contacts`, contactForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowContactModal(false);
      setContactForm({ name: '', email: '', phone: '', company: '', status: 'lead', notes: '', source: '' });
      fetchContacts();
      fetchStats();
    } catch (error) {
      alert('Error creating contact: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleUpdateContact = async (contactId, updates) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(`${BACKEND_URL}/api/crm/contacts/${contactId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
      fetchStats();
      if (selectedContact?.id === contactId) {
        setSelectedContact({ ...selectedContact, ...updates });
      }
    } catch (error) {
      alert('Error updating contact: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${BACKEND_URL}/api/crm/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
      fetchStats();
      setSelectedContact(null);
    } catch (error) {
      alert('Error deleting contact: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${BACKEND_URL}/api/crm/contacts/${selectedContact.id}/notes`, noteForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowNoteModal(false);
      setNoteForm({ content: '' });
      // Refresh contact details
      const response = await axios.get(`${BACKEND_URL}/api/crm/contacts/${selectedContact.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedContact(response.data);
    } catch (error) {
      alert('Error adding note: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const taskData = { ...taskForm };
      if (selectedContact) {
        taskData.contact_id = selectedContact.id;
      }
      await axios.post(`${BACKEND_URL}/api/crm/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowTaskModal(false);
      setTaskForm({ title: '', due_date: '', priority: 'medium', description: '' });
      fetchTasks();
    } catch (error) {
      alert('Error creating task: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(`${BACKEND_URL}/api/crm/tasks/${taskId}`, { completed: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      alert('Error completing task: ' + (error.response?.data?.detail || error.message));
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColour = (status) => {
    const colours = {
      'lead': 'bg-blue-100 text-blue-800',
      'prospect': 'bg-yellow-100 text-yellow-800',
      'customer': 'bg-green-100 text-green-800',
      'churned': 'bg-red-100 text-red-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    return colours[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColour = (priority) => {
    const colours = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colours[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Customer Relationship Management</h1>
          <p className="opacity-90">Manage contacts, track interactions, and follow up on opportunities</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total_contacts}</div>
              <div className="text-gray-600 text-sm">Total Contacts</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.leads}</div>
              <div className="text-gray-600 text-sm">Leads</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.prospects}</div>
              <div className="text-gray-600 text-sm">Prospects</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.customers}</div>
              <div className="text-gray-600 text-sm">Customers</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.pending_tasks}</div>
              <div className="text-gray-600 text-sm">Pending Tasks</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-3 font-medium ${activeTab === 'contacts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Contacts
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 font-medium ${activeTab === 'tasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Tasks & Follow-ups
            </button>
          </div>
        </div>

        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contacts List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              {/* Filters */}
              <div className="p-4 border-b flex flex-wrap gap-4">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="lead">Leads</option>
                  <option value="prospect">Prospects</option>
                  <option value="customer">Customers</option>
                  <option value="churned">Churned</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  + Add Contact
                </button>
              </div>

              {/* Contact List */}
              <div className="divide-y max-h-96 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No contacts found. Add your first contact to get started.
                  </div>
                ) : (
                  filteredContacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                          {contact.company && <div className="text-sm text-gray-400">{contact.company}</div>}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColour(contact.status)}`}>
                          {contact.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow">
              {selectedContact ? (
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{selectedContact.name}</h3>
                    <button
                      onClick={() => handleDeleteContact(selectedContact.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <div className="text-gray-900">{selectedContact.email || '-'}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Phone</label>
                      <div className="text-gray-900">{selectedContact.phone || '-'}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Company</label>
                      <div className="text-gray-900">{selectedContact.company || '-'}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Source</label>
                      <div className="text-gray-900">{selectedContact.source || '-'}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Status</label>
                      <select
                        value={selectedContact.status}
                        onChange={(e) => handleUpdateContact(selectedContact.id, { status: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      >
                        <option value="lead">Lead</option>
                        <option value="prospect">Prospect</option>
                        <option value="customer">Customer</option>
                        <option value="churned">Churned</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Notes</h4>
                      <button
                        onClick={() => setShowNoteModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add Note
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedContact.notes_history?.length > 0 ? (
                        selectedContact.notes_history.map((note, idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="text-gray-700">{note.content}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(note.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No notes yet</div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t pt-4 mt-4">
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium text-sm"
                    >
                      Create Follow-up Task
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Select a contact to view details
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Tasks & Follow-ups</h3>
              <button
                onClick={() => { setSelectedContact(null); setShowTaskModal(true); }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
              >
                + Create Task
              </button>
            </div>
            <div className="divide-y">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No tasks yet. Create a task to track follow-ups.
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className={`p-4 ${task.completed ? 'bg-gray-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => !task.completed && handleCompleteTask(task.id)}
                          className="mt-1"
                        />
                        <div>
                          <div className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500">{task.description}</div>
                          )}
                          {task.contact_name && (
                            <div className="text-sm text-blue-600">Contact: {task.contact_name}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColour(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <div className="text-xs text-gray-500 mt-1">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Add Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Add New Contact</h3>
                <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleCreateContact} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organisation</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={contactForm.source}
                    onChange={(e) => setContactForm({ ...contactForm, source: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select source</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social_media">Social Media</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={contactForm.status}
                    onChange={(e) => setContactForm({ ...contactForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Notes</label>
                  <textarea
                    value={contactForm.notes}
                    onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Contact
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Add Note</h3>
                <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleAddNote} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note Content *</label>
                  <textarea
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Note
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Create Task</h3>
                <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleCreateTask} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                {selectedContact && (
                  <div className="text-sm text-gray-600">
                    Linked to: <span className="font-medium">{selectedContact.name}</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Create Task
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CRMPage;
