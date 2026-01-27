import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReportedIssuesPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, fixed, quarantined

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/reported-issues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (questionId, newStatus) => {
    setUpdating(questionId);
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${BACKEND_URL}/api/admin/reported-issues/${questionId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setReports(prev => prev.map(report => 
        report.question_id === questionId 
          ? { ...report, status: newStatus, resolved: newStatus !== 'pending' }
          : report
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      fixed: 'bg-green-100 text-green-800',
      quarantined: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.pending;
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  // Group reports by question_id
  const groupedReports = filteredReports.reduce((acc, report) => {
    const key = report.question_id;
    if (!acc[key]) {
      acc[key] = {
        question_id: key,
        question_text: report.question_text,
        question_category: report.question_category,
        status: report.status || 'pending',
        reports: []
      };
    }
    acc[key].reports.push(report);
    return acc;
  }, {});

  const groupedArray = Object.values(groupedReports);

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">⚠️ Reported Issues</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All ({reports.length})</option>
              <option value="pending">Pending ({reports.filter(r => r.status === 'pending' || !r.status).length})</option>
              <option value="fixed">Fixed ({reports.filter(r => r.status === 'fixed').length})</option>
              <option value="quarantined">Quarantined ({reports.filter(r => r.status === 'quarantined').length})</option>
            </select>
          </div>
        </div>

        {groupedArray.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-gray-100">
            <p className="text-gray-500 text-lg">No reported issues found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedArray.map((group) => (
              <div 
                key={group.question_id} 
                className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden"
              >
                {/* Question Header */}
                <div className="p-4 bg-gray-50 border-b flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                        {group.question_id}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {group.question_category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusBadge(group.status)}`}>
                        {group.status || 'pending'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {group.reports.length} report{group.reports.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {group.question_text || 'Question text not available'}
                    </p>
                  </div>
                  
                  {/* Status Buttons */}
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(group.question_id, 'fixed')}
                      disabled={updating === group.question_id || group.status === 'fixed'}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        group.status === 'fixed'
                          ? 'bg-green-200 text-green-800 cursor-default'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-50`}
                    >
                      {updating === group.question_id ? '...' : '✓ Fixed'}
                    </button>
                    <button
                      onClick={() => updateStatus(group.question_id, 'quarantined')}
                      disabled={updating === group.question_id || group.status === 'quarantined'}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        group.status === 'quarantined'
                          ? 'bg-red-200 text-red-800 cursor-default'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      } disabled:opacity-50`}
                    >
                      {updating === group.question_id ? '...' : '⚠ Quarantine'}
                    </button>
                    {group.status !== 'pending' && (
                      <button
                        onClick={() => updateStatus(group.question_id, 'pending')}
                        disabled={updating === group.question_id}
                        className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Individual Reports */}
                <div className="divide-y divide-gray-100">
                  {group.reports.map((report, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {report.reporter_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {report.reporter_email}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(report.timestamp).toLocaleDateString()} {new Date(report.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {report.reason}
                        </p>
                        {report.details && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Details:</strong> {report.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportedIssuesPage;
