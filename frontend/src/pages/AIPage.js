import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { generateAIQuestions, getAIUsage } from '../api/endpoints';
import { useTenant } from '../contexts/TenantContext';

const AIPage = () => {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { tenant } = useTenant();
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  
  // Update page title
  useEffect(() => {
    document.title = `AI Assistant | ${tenantName}`;
  }, [tenantName]);

  const handleGenerate = async () => {
    if (!topic || !context) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await generateAIQuestions({
        topic,
        context,
        question_count: 10,
        difficulty: '2',
        category: 'general',
      });
      setResult(response.data);
      alert(`Generated ${response.data.questions.length} questions successfully!`);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <svg className="w-8 h-8 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">AI Question Generator</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Cardiology, Respiratory System"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Study Materials</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your study notes, textbook excerpts, or lecture materials here..."
            />
            <p className="text-sm text-gray-500 mt-2">
              AI will generate questions based only on this content. Your data remains private.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-green-900 mb-2">Success!</h2>
            <p className="text-green-800">
              Generated {result.questions.length} questions. 
              Remaining daily uses: {result.remaining_daily_uses}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AIPage;
