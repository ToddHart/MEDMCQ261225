import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAnalytics, getStudySessions } from '../api/endpoints';
import { useTenant } from '../contexts/TenantContext';
import api from '../api/axios';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [subCategoryStats, setSubCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [expandedCategories, setExpandedCategories] = useState({});
  const { tenant } = useTenant();
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  
  // Session stats from localStorage
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [sessionCategoryStats, setSessionCategoryStats] = useState({});

  useEffect(() => {
    document.title = `Analytics | ${tenantName}`;
  }, [tenantName]);

  useEffect(() => {
    loadAnalytics();
    loadSessions();
    loadSubCategoryStats();
    loadSessionStats();
  }, []);

  const loadSessionStats = () => {
    // Load current session stats from localStorage
    const savedStats = localStorage.getItem('sessionStats');
    if (savedStats) {
      try {
        setSessionStats(JSON.parse(savedStats));
      } catch (e) {
        setSessionStats({ correct: 0, total: 0, streak: 0 });
      }
    }
    
    // Load session category stats from localStorage
    const savedCategoryStats = localStorage.getItem('sessionCategoryStats');
    if (savedCategoryStats) {
      try {
        setSessionCategoryStats(JSON.parse(savedCategoryStats));
      } catch (e) {
        setSessionCategoryStats({});
      }
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics({
        total_questions: 0,
        correct_rate: 0,
        average_time_per_question: 0,
        study_days: 0,
        current_streak: 0,
        highest_streak: 0,
        category_performance: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await getStudySessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    }
  };

  const loadSubCategoryStats = async () => {
    try {
      const response = await api.get('/analytics/subcategory');
      setSubCategoryStats(response.data);
    } catch (error) {
      console.error('Error loading sub-category stats:', error);
      setSubCategoryStats([]);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getSubCategoriesByCategory = () => {
    const grouped = {};
    subCategoryStats.forEach(stat => {
      if (!grouped[stat.category]) {
        grouped[stat.category] = [];
      }
      grouped[stat.category].push(stat);
    });
    return grouped;
  };

  // Calculate session correct rate
  const sessionCorrectRate = sessionStats.total > 0 
    ? ((sessionStats.correct / sessionStats.total) * 100).toFixed(1) 
    : 0;

  // Get session category accuracy
  const getSessionCategoryAccuracy = (category) => {
    const catStats = sessionCategoryStats[category];
    if (!catStats || catStats.total === 0) return null;
    return ((catStats.correct / catStats.total) * 100).toFixed(1);
  };

  // Determine trend (improving, declining, same)
  const getTrend = (sessionValue, cumulativeValue) => {
    if (sessionValue === null || sessionValue === undefined) return null;
    const diff = parseFloat(sessionValue) - parseFloat(cumulativeValue);
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'same';
  };

  const renderCalendar = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const today = new Date();
    const studyDates = new Set(sessions.map(s => s.date));
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = today.getDate() === day && 
                      today.getMonth() === currentMonth && 
                      today.getFullYear() === currentYear;
      const hasActivity = studyDates.has(dateStr);
      
      days.push(
        <div
          key={day}
          className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
            isToday 
              ? 'ring-2 ring-blue-500 bg-blue-100 text-blue-900' 
              : hasActivity 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {day}
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">Study Calendar</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                } else {
                  setCurrentMonth(currentMonth - 1);
                }
              }}
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ←
            </button>
            <span className="font-semibold text-lg">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                } else {
                  setCurrentMonth(currentMonth + 1);
                }
              }}
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              →
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayHeaders.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Study Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 ring-2 ring-blue-500 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">Your Analytics</h1>
        </div>
        
        {/* Stats Grid - Session vs Cumulative */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Questions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs font-semibold text-blue-500 uppercase mb-1">This Session</div>
                <div className="text-2xl font-bold text-blue-600">{sessionStats.total}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">All Time</div>
                <div className="text-2xl font-bold text-gray-800">{analytics?.total_questions || 0}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 border-t pt-2 mt-2">Total Questions</div>
          </div>

          {/* Correct Rate */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs font-semibold text-green-500 uppercase mb-1">This Session</div>
                <div className={`text-2xl font-bold ${
                  getTrend(sessionCorrectRate, analytics?.correct_rate) === 'improving' ? 'text-green-600' :
                  getTrend(sessionCorrectRate, analytics?.correct_rate) === 'declining' ? 'text-red-600' :
                  'text-green-600'
                }`}>
                  {sessionCorrectRate}%
                  {getTrend(sessionCorrectRate, analytics?.correct_rate) === 'improving' && <span className="text-sm ml-1">↑</span>}
                  {getTrend(sessionCorrectRate, analytics?.correct_rate) === 'declining' && <span className="text-sm ml-1">↓</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">All Time</div>
                <div className="text-2xl font-bold text-gray-800">{analytics?.correct_rate?.toFixed(1) || 0}%</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 border-t pt-2 mt-2">Correct Rate</div>
          </div>

          {/* Current Streak */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs font-semibold text-purple-500 uppercase mb-1">This Session</div>
                <div className="text-2xl font-bold text-purple-600">{sessionStats.streak}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">All Time</div>
                <div className="text-2xl font-bold text-gray-800">{analytics?.current_streak || 0}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 border-t pt-2 mt-2">Current Streak</div>
          </div>

          {/* Study Days */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs font-semibold text-orange-500 uppercase mb-1">Today</div>
                <div className="text-2xl font-bold text-orange-600">{sessionStats.total > 0 ? '✓' : '—'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">All Time</div>
                <div className="text-2xl font-bold text-gray-800">{analytics?.study_days || 0}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 border-t pt-2 mt-2">Study Days</div>
          </div>
        </div>

        {/* Additional Stats - Session vs Cumulative */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-semibold text-purple-500 uppercase mb-1">This Session Best</div>
                <div className="text-xl font-bold text-purple-600">{sessionStats.streak}</div>
              </div>
              <div className="text-center px-4">
                <div className="text-gray-400">vs</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">All Time Best</div>
                <div className="text-xl font-bold text-gray-800">{analytics?.highest_streak || 0}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 border-t pt-2 mt-2">Highest Streak - Best consecutive correct answers</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-xl font-bold text-gray-800 mb-2">
              Avg Time: {analytics?.average_time_per_question?.toFixed(1) || 0}s
            </div>
            <div className="text-sm text-gray-600">Per question (cumulative)</div>
          </div>
        </div>

        {/* Category Performance with Session vs Cumulative */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Performance by Category</h2>
          <p className="text-sm text-gray-500 mb-4">
            Compare your <span className="text-blue-600 font-semibold">current session</span> performance vs <span className="text-gray-600 font-semibold">all-time cumulative</span> stats. 
            Click on a category to see sub-category breakdown.
          </p>
          
          {/* Legend */}
          <div className="flex gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">This Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-gray-600">All Time (Cumulative)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">↑</span>
              <span className="text-gray-600">Improving</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold">↓</span>
              <span className="text-gray-600">Needs Work</span>
            </div>
          </div>

          {analytics?.category_performance && Object.keys(analytics.category_performance).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(analytics.category_performance).map(([category, data]) => {
                const subCategories = getSubCategoriesByCategory()[category] || [];
                const isExpanded = expandedCategories[category];
                const sessionAccuracy = getSessionCategoryAccuracy(category);
                const trend = getTrend(sessionAccuracy, data.accuracy);
                
                return (
                  <div key={category} className="border rounded-lg overflow-hidden">
                    {/* Category Header - Clickable */}
                    <div 
                      className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleCategory(category)}
                    >
                      {/* Session Stats Row */}
                      {sessionAccuracy !== null && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-blue-600 uppercase">This Session</span>
                              {trend === 'improving' && <span className="text-green-600 font-bold text-lg">↑</span>}
                              {trend === 'declining' && <span className="text-red-600 font-bold text-lg">↓</span>}
                              {trend === 'same' && <span className="text-gray-500 font-bold text-lg">→</span>}
                            </div>
                            <div className={`text-lg font-bold ${
                              trend === 'improving' ? 'text-green-600' :
                              trend === 'declining' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>
                              {sessionAccuracy}%
                              <span className="text-xs font-normal text-gray-500 ml-2">
                                ({sessionCategoryStats[category]?.correct || 0}/{sessionCategoryStats[category]?.total || 0})
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                trend === 'improving' ? 'bg-green-500' :
                                trend === 'declining' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${sessionAccuracy || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Cumulative Stats Row */}
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                          <span className="font-medium capitalize text-lg">{category}</span>
                          <span className="text-xs font-semibold text-gray-500 uppercase">Cumulative</span>
                          {subCategories.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {subCategories.length} sub-topics
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">{data.correct}/{data.total_answered}</span>
                          {' '}({data.accuracy?.toFixed(1)}%)
                          <span className="ml-4 text-xs bg-gray-200 px-2 py-1 rounded">
                            Level: {data.current_difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full transition-all"
                          style={{ width: `${data.accuracy || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Sub-Categories - Expandable */}
                    {isExpanded && subCategories.length > 0 && (
                      <div className="p-4 bg-white border-t">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub-Category Breakdown:</h4>
                        <div className="space-y-3 pl-4">
                          {subCategories.map((subCat, idx) => (
                            <div key={idx} className="border-l-2 border-blue-300 pl-3">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{subCat.sub_category}</span>
                                <span className="text-sm text-gray-600">
                                  {subCat.total_correct}/{subCat.total_answered} ({subCat.accuracy}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    subCat.accuracy >= 70 ? 'bg-green-500' : 
                                    subCat.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${subCat.accuracy || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* No sub-categories message */}
                    {isExpanded && subCategories.length === 0 && (
                      <div className="p-4 bg-white border-t text-center text-gray-500 text-sm">
                        No sub-category data available yet
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No category data yet. Start practicing to see your performance!</p>
            </div>
          )}
        </div>

        {/* Calendar */}
        {renderCalendar()}
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
