import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useTenant } from '../contexts/TenantContext';
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
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { tenant } = useTenant();
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';

  useEffect(() => {
    document.title = `Admin | ${tenantName}`;
  }, [tenantName]);

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

  const fetchSubscriptionHistory = async (userId) => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/user/${userId}/subscription-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptionHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      setSubscriptionHistory([]);
    } finally {
      setLoadingHistory(false);
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
      fetchSubscriptionHistory(userId);
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
      fetchSubscriptionHistory(userId);
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

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    fetchSubscriptionHistory(user.id);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterSubscription === 'all') return matchesSearch;
    if (filterSubscription === 'admin') return matchesSearch && user.is_admin;
    if (filterSubscription === 'free') return matchesSearch && (!user.subscription_plan || user.subscription_plan === 'free' || user.subscription_status === 'free');
    if (filterSubscription === 'weekly') return matchesSearch && user.subscription_plan === 'weekly';
    if (filterSubscription === 'monthly') return matchesSearch && user.subscription_plan === 'monthly';
    if (filterSubscription === 'quarterly') return matchesSearch && user.subscription_plan === 'quarterly';
    if (filterSubscription === 'annual') return matchesSearch && user.subscription_plan === 'annual';
    if (filterSubscription === 'free_grant') return matchesSearch && user.subscription_status === 'free_grant';
    if (filterSubscription === 'active') return matchesSearch && user.subscription_status === 'active';
    
    return matchesSearch;
  });

  const getSubscriptionBadge = (user) => {
    const plan = user.subscription_plan || 'free';
    const status = user.subscription_status || 'free';
    
    const badgeColors = {
      'annual': 'bg-purple-100 text-purple-800 border-purple-300',
      'quarterly': 'bg-blue-100 text-blue-800 border-blue-300',
      'monthly': 'bg-green-100 text-green-800 border-green-300',
      'weekly': 'bg-orange-100 text-orange-800 border-orange-300',
      'free': 'bg-gray-100 text-gray-600 border-gray-300'
    };
    
    const planLabels = {
      'annual': 'Annual',
      'quarterly': 'Quarterly',
      'monthly': 'Monthly',
      'weekly': 'Weekly',
      'free': 'Free'
    };
    
    const color = badgeColors[plan] || badgeColors.free;
    const label = planLabels[plan] || 'Free';
    
    return (
      <div className="flex flex-col gap-1">
        <span className={`px-2 py-1 ${color} border rounded-full text-xs font-bold`}>
          {label}
        </span>
        {status === 'free_grant' && (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Granted</span>
        )}
        {status === 'active' && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Paid</span>
        )}
      </div>
    );
  };

  const formatHistoryAction = (item) => {
    const date = new Date(item.timestamp).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    if (item.action === 'registration') {
      return { text: 'Registered as free user', date, color: 'bg-blue-100 text-blue-700' };
    }
    if (item.action === 'upgrade') {
      return { 
        text: `Upgraded from ${item.from_plan || 'free'} to ${item.to_plan}`, 
        date, 
        color: 'bg-green-100 text-green-700',
        extra: item.grant_type === 'free_grant' ? '(Free Grant)' : ''
      };
    }
    if (item.action === 'revoke') {
      return { text: `Revoked ${item.from_plan} subscription`, date, color: 'bg-red-100 text-red-700' };
    }
    return { text: item.action, date, color: 'bg-gray-100 text-gray-700' };
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-600">{stats.total_users}</div>
              <div className="text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-gray-600">
                {users.filter(u => !u.subscription_plan || u.subscription_plan === 'free' || u.subscription_status === 'free').length}
              </div>
              <div className="text-gray-600">Free Users</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-600">{stats.active_subscriptions}</div>
              <div className="text-gray-600">Paid Subscriptions</div>
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
              <option value="free">Free Users</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="free_grant">Free Grants</option>
              <option value="active">Paid Active</option>
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Subscription Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleUserClick(user)}>
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
                        Expires: {new Date(user.subscription_end).toLocaleDateString('en-AU')}
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
                    {user.email_verified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-orange-500">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('en-AU')}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUserClick(user)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      View Details
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

        {/* User Management Modal with Subscription History */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.full_name || 'User'}</h2>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      {getSubscriptionBadge(selectedUser)}
                      {selectedUser.email_verified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Email Verified</span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Email Not Verified</span>
                      )}
                      {selectedUser.marketing_consent && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Marketing Consent</span>
                      )}
                    </div>
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
                {/* User Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Country:</span>
                    <span className="ml-2 font-medium">{selectedUser.country || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Institution:</span>
                    <span className="ml-2 font-medium">{selectedUser.institution || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Degree:</span>
                    <span className="ml-2 font-medium">{selectedUser.degree_type || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Year:</span>
                    <span className="ml-2 font-medium">{selectedUser.current_year || 'Not set'}</span>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{selectedUser.total_questions_answered || 0}</div>
                    <div className="text-sm text-gray-600">Questions Answered</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{selectedUser.qualifying_sessions || 0}/3</div>
                    <div className="text-sm text-gray-600">Qualifying Sessions</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{selectedUser.ai_daily_uses || 0}/{selectedUser.ai_max_daily_uses || 0}</div>
                    <div className="text-sm text-gray-600">AI Uses Today</div>
                  </div>
                </div>

                {/* Subscription History */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Subscription History</h3>
                  {loadingHistory ? (
                    <div className="text-center py-4 text-gray-500">Loading history...</div>
                  ) : subscriptionHistory.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {subscriptionHistory.map((item, index) => {
                        const formatted = formatHistoryAction(item);
                        return (
                          <div key={index} className={`p-3 rounded-lg ${formatted.color}`}>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {formatted.text} {formatted.extra && <span className="text-xs">{formatted.extra}</span>}
                              </span>
                              <span className="text-xs">{formatted.date}</span>
                            </div>
                            {item.end_date && (
                              <div className="text-xs mt-1 opacity-75">
                                Valid until: {new Date(item.end_date).toLocaleDateString('en-AU')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm bg-gray-50 rounded-lg p-3">
                      No subscription history available
                    </div>
                  )}
                </div>

                {/* Grant Free Access */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Grant Free Access</h3>
                  <div className="grid grid-cols-4 gap-2">
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
