import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users. Make sure you have admin access.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleGrantFreeAccess = async (userId, plan) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${BACKEND_URL}/api/admin/grant-access`, {
        user_id: userId,
        subscription_plan: plan,
        duration_days: plan === 'annual' ? 365 : plan === 'quarterly' ? 90 : plan === 'monthly' ? 30 : 7
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Free access granted successfully!');
      fetchUsers();
      setShowUserModal(false);
    } catch (error) {
      console.error('Error granting access:', error);
      alert('Failed to grant access: ' + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAccess = async (userId) => {
    if (!window.confirm('Are you sure you want to revoke this user\'s subscription?')) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${BACKEND_URL}/api/admin/revoke-access`, {
        user_id: userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Access revoked successfully!');
      fetchUsers();
      setShowUserModal(false);
    } catch (error) {
      console.error('Error revoking access:', error);
      alert('Failed to revoke access: ' + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, makeAdmin) => {
    if (!window.confirm(`Are you sure you want to ${makeAdmin ? 'grant' : 'revoke'} admin access?`)) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${BACKEND_URL}/api/admin/toggle-admin`, {
        user_id: userId,
        is_admin: makeAdmin
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Admin access ${makeAdmin ? 'granted' : 'revoked'} successfully!`);
      fetchUsers();
      setShowUserModal(false);
    } catch (error) {
      console.error('Error toggling admin:', error);
      alert('Failed to toggle admin: ' + (error.response?.data?.detail || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSubscription === 'all' || 
                         user.subscription_status === filterSubscription ||
                         (filterSubscription === 'admin' && user.is_admin);
    return matchesSearch && matchesFilter;
  });

  const getSubscriptionBadge = (user) => {
    if (user.subscription_status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">{user.subscription_plan || 'Active'}</span>;
    }
    if (user.subscription_status === 'free_grant') {
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">Free Grant</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Free</span>;
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
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg opacity-90">Manage users, subscriptions, and monitor platform usage</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-600">{stats.total_users}</div>
              <div className="text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-600">{stats.active_subscriptions}</div>
              <div className="text-gray-600">Active Subscriptions</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-purple-600">{stats.free_grants}</div>
              <div className="text-gray-600">Free Grants</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-orange-600">{stats.total_questions_answered}</div>
              <div className="text-gray-600">Questions Answered</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              data-testid="search-users"
            />
            <select
              value={filterSubscription}
              onChange={(e) => setFilterSubscription(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active Subscription</option>
              <option value="free">Free Users</option>
              <option value="free_grant">Free Grants</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">AI Uses</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                        <span className="text-white font-bold">{user.email?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name || 'No name'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.is_admin && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">Admin</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getSubscriptionBadge(user)}
                    {user.subscription_end && (
                      <div className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(user.subscription_end).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{user.total_questions_answered || 0} questions</div>
                      <div className="text-gray-500">{user.total_sessions || 0} sessions</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{user.ai_daily_uses || 0} / {user.ai_max_daily_uses || 0}</div>
                      <div className="text-gray-500">today</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria
            </div>
          )}
        </div>

        {/* User Management Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.full_name || 'User'}</h2>
                    <p className="text-gray-500">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{selectedUser.total_questions_answered || 0}</div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{selectedUser.qualifying_sessions || 0}/3</div>
                    <div className="text-sm text-gray-600">Qualifying Sessions</div>
                  </div>
                </div>

                {/* Grant Free Access */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Grant Free Access</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['weekly', 'monthly', 'quarterly', 'annual'].map(plan => (
                      <button
                        key={plan}
                        onClick={() => handleGrantFreeAccess(selectedUser.id, plan)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium capitalize disabled:opacity-50"
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revoke Access */}
                {selectedUser.subscription_status === 'active' || selectedUser.subscription_status === 'free_grant' ? (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Revoke Access</h3>
                    <button
                      onClick={() => handleRevokeAccess(selectedUser.id)}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium disabled:opacity-50"
                    >
                      Revoke Subscription
                    </button>
                  </div>
                ) : null}

                {/* Admin Toggle */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Admin Access</h3>
                  <button
                    onClick={() => handleToggleAdmin(selectedUser.id, !selectedUser.is_admin)}
                    disabled={actionLoading}
                    className={`w-full px-4 py-2 rounded font-medium disabled:opacity-50 ${
                      selectedUser.is_admin 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {selectedUser.is_admin ? 'Revoke Admin Access' : 'Grant Admin Access'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;
