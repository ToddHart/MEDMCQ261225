import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { initSampleData } from '../api/endpoints';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

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
      {/* Hero Section - Shorter */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 whitespace-nowrap" style={{ fontSize: '2.88rem' }}>
            Master Medical Exams with Confidence
          </h1>
          <p className="text-lg mb-6 text-blue-100">
            The ultimate platform for medical students to practice MCQ questions,
            track progress, and prepare for exams with intelligent analytics and
            AI-powered learning.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-50 transition-colors shadow-lg"
            >
              Start Learning Now →
            </button>
            <button
              onClick={handleInitSampleData}
              disabled={loading}
              className="bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-900 transition-colors shadow-xl disabled:opacity-50 border-2 border-blue-400"
              style={{ boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.2)' }}
            >
              {loading ? 'Loading...' : 'Load Sample Questions'}
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Why Choose MedMCQ?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 - Adaptive Learning */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-blue-500">
            <div className="mb-4">
              <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Adaptive Learning
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Questions adapt to your performance using the 3-Up, 2-Down algorithm,
              focusing on weak areas to maximize learning efficiency.
            </p>
          </div>

          {/* Feature 2 - Analytics */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-green-500">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Detailed Analytics
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Track your progress with comprehensive analytics, performance charts,
              and personalized insights by category and difficulty.
            </p>
          </div>

          {/* Feature 3 - AI Assistant */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-purple-500">
            <div className="mb-4">
              <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              AI Assistant
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Generate custom questions from your own materials with our AI system.
              Your data remains private and secure.
            </p>
          </div>

          {/* Feature 4 - Import */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-orange-500">
            <div className="mb-4">
              <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Import Questions
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Upload your own question banks from Excel or CSV files for
              personalized learning and study sessions.
            </p>
          </div>

          {/* Feature 5 - Exam Mode */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-red-500">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Exam Mode
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Simulate real exam conditions with timed tests and comprehensive
              performance reviews to prepare effectively.
            </p>
          </div>

          {/* Feature 6 - Study Tracking */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border-t-4 border-indigo-500">
            <div className="mb-4">
              <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Study Tracking
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Monitor your study habits with our intelligent calendar and progress
              tracking system to maintain consistency.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Platform Features
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">5GB</div>
            <div className="text-sm text-gray-600">Private Storage</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">100</div>
            <div className="text-sm text-gray-600">AI Questions/Day</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
            <div className="text-sm text-gray-600">Question Banks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">4</div>
            <div className="text-sm text-gray-600">Difficulty Levels</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
