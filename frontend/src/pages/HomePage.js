import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { initSampleData } from '../api/endpoints';
import { useTenant } from '../contexts/TenantContext';
import api from '../api/axios';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const { tenant, getPrimaryColor } = useTenant();
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  const primaryColor = getPrimaryColor();
  const secondaryColor = tenant?.secondary_color || '#7c3aed';
  
  // Update page title
  useEffect(() => {
    document.title = `Home | ${tenantName}`;
  }, [tenantName]);

  // Subscription tier limits
  const tierLimits = {
    free: {
      questionsPerDay: '50',
      importsPerWeek: '0',
      storage: '0',
      aiPerDay: '0'
    },
    weekly: {
      questionsPerDay: '200',
      importsPerWeek: '200',
      storage: '0',
      aiPerDay: '0'
    },
    monthly: {
      questionsPerDay: '500',
      importsPerWeek: '500',
      storage: '250MB',
      aiPerDay: '5'
    },
    quarterly: {
      questionsPerDay: '∞',
      importsPerWeek: '1000',
      storage: '500MB',
      aiPerDay: '10'
    },
    annual: {
      questionsPerDay: '∞',
      importsPerWeek: '2500',
      storage: '1GB',
      aiPerDay: '10'
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await api.get('/user/subscription');
      setSubscription(response.data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      // Default to free tier if error
      setSubscription({ subscription_plan: 'free' });
    }
  };

  // Get current tier limits
  const getCurrentLimits = () => {
    const plan = subscription?.subscription_plan || 'free';
    return tierLimits[plan] || tierLimits.free;
  };

  const limits = getCurrentLimits();

  const handleGetStarted = () => {
    navigate('/questions');
  };

  const handleInitSampleData = async () => {
    setLoading(true);
    try {
      // Use the comprehensive sample data endpoint
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/init/comprehensive-sample-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      alert(data.message || 'Sample questions loaded successfully!');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      alert('Sample questions loaded!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section - Reduced top margin by 90% */}
      <div 
        className="rounded-2xl p-4 text-white mb-4 shadow-xl -mt-5 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            Master Medical Exams with Confidence
          </h1>
          {/* Hide description on mobile */}
          <p className="hidden sm:block text-base mb-3 text-blue-100">
            The ultimate platform for medical students to practice MCQ questions,
            track progress, and prepare for exams with intelligent analytics and
            AI-powered learning.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4 sm:mt-0">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-white px-5 py-3 sm:py-2 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg"
              style={{ color: primaryColor }}
            >
              Start Learning Now
            </button>
            <button
              onClick={handleInitSampleData}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-800 text-white px-5 py-3 sm:py-2 rounded-xl font-semibold text-sm hover:bg-blue-900 transition-colors shadow-xl disabled:opacity-50 border-2 border-blue-400"
            >
              {loading ? 'Loading...' : 'Load Sample Questions'}
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
          Why Choose {tenantName}?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Feature 1 - Adaptive Learning */}
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-blue-500">
            <div className="mb-2 sm:mb-3 flex justify-center sm:justify-start">
              <svg className="w-10 h-10 sm:w-16 sm:h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center sm:text-left">Adaptive Learning</h3>
            {/* Hide description on mobile */}
            <p className="hidden sm:block text-gray-600 text-sm leading-relaxed">
              Questions adapt to your performance using the 3-Up, 2-Down algorithm,
              focusing on weak areas to maximize learning efficiency.
            </p>
          </div>

          {/* Feature 2 - Analytics */}
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-green-500">
            <div className="mb-2 sm:mb-3 flex justify-center sm:justify-start">
              <svg className="w-10 h-10 sm:w-16 sm:h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center sm:text-left">Detailed Analytics</h3>
            {/* Hide description on mobile */}
            <p className="hidden sm:block text-gray-600 text-sm leading-relaxed">
              Track your progress with comprehensive analytics, performance charts,
              and personalized insights by category and difficulty.
            </p>
          </div>

          {/* Feature 3 - AI Assistant */}
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-purple-500">
            <div className="mb-2 sm:mb-3 flex justify-center sm:justify-start">
              <svg className="w-10 h-10 sm:w-16 sm:h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center sm:text-left">AI Assistant</h3>
            {/* Hide description on mobile */}
            <p className="hidden sm:block text-gray-600 text-sm leading-relaxed">
              Generate custom questions from your own materials with our AI system.
              Your data remains private and secure.
            </p>
          </div>

          {/* Feature 4 - Import */}
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-orange-500">
            <div className="mb-2 sm:mb-3 flex justify-center sm:justify-start">
              <svg className="w-10 h-10 sm:w-16 sm:h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center sm:text-left">Import Questions</h3>
            {/* Hide description on mobile */}
            <p className="hidden sm:block text-gray-600 text-sm leading-relaxed">
              Upload your own question banks from Excel or CSV files for
              personalized learning and study sessions.
            </p>
          </div>

          {/* Feature 5 - Exam Mode */}
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-red-500">
            <div className="mb-2 sm:mb-3 flex justify-center sm:justify-start">
              <svg className="w-10 h-10 sm:w-16 sm:h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center sm:text-left">Exam Mode</h3>
            {/* Hide description on mobile */}
            <p className="hidden sm:block text-gray-600 text-sm leading-relaxed">
              Simulate real exam conditions with timed tests and comprehensive
              performance reviews to prepare effectively.
            </p>
          </div>

          {/* Feature 6 - Study Tracking */}
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-indigo-500">
            <div className="mb-2 sm:mb-3 flex justify-center sm:justify-start">
              <svg className="w-10 h-10 sm:w-16 sm:h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center sm:text-left">Study Tracking</h3>
            {/* Hide description on mobile */}
            <p className="hidden sm:block text-gray-600 text-sm leading-relaxed">
              Monitor your study habits with our intelligent calendar and progress
              tracking system to maintain consistency.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section - Dynamic based on subscription */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Your Plan Features
          </h2>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              subscription?.subscription_plan === 'annual' ? 'bg-purple-100 text-purple-700' :
              subscription?.subscription_plan === 'quarterly' ? 'bg-blue-100 text-blue-700' :
              subscription?.subscription_plan === 'monthly' ? 'bg-green-100 text-green-700' :
              subscription?.subscription_plan === 'weekly' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {subscription?.subscription_plan 
                ? subscription.subscription_plan.charAt(0).toUpperCase() + subscription.subscription_plan.slice(1) + ' Plan'
                : 'Free Plan'}
            </span>
            {(!subscription?.subscription_plan || subscription?.subscription_plan === 'free') && (
              <button
                onClick={() => navigate('/subscription')}
                className="px-5 py-2 text-sm font-bold text-white rounded-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-yellow-400"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #dc2626 100%)' }}
              >
                ⭐ Upgrade Now
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">{limits.questionsPerDay}</div>
            <div className="text-sm text-gray-600">Questions/Day</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">{limits.importsPerWeek}</div>
            <div className="text-sm text-gray-600">Imports/Week</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">{limits.storage === '0' ? 'None' : limits.storage}</div>
            <div className="text-sm text-gray-600">Private Storage</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">{limits.aiPerDay}</div>
            <div className="text-sm text-gray-600">AI Uses/Day</div>
          </div>
        </div>
        {(!subscription?.subscription_plan || subscription?.subscription_plan === 'free') && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm mb-3">Upgrade your plan to unlock more features</p>
            <button
              onClick={() => navigate('/subscription')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              View Subscription Plans
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
