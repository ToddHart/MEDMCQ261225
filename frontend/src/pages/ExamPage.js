import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { startExam, submitExamAnswer, completeExam } from '../api/endpoints';
import { useTenant } from '../contexts/TenantContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ExamPage = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [examSession, setExamSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [examComplete, setExamComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [unlockStatus, setUnlockStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { tenant } = useTenant();
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  
  // Exam settings
  const [questionCount, setQuestionCount] = useState(50);
  const [timeLimit, setTimeLimit] = useState(60);
  const [category, setCategory] = useState('');

  // Update page title
  useEffect(() => {
    document.title = `Exam Mode | ${tenantName}`;
  }, [tenantName]);

  // Fetch unlock status on mount
  useEffect(() => {
    const fetchUnlockStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        const response = await axios.get(`${BACKEND_URL}/api/unlock-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnlockStatus(response.data);
      } catch (error) {
        console.error('Error fetching unlock status:', error);
      }
    };
    fetchUnlockStatus();
  }, []);

  const handleCompleteExamCallback = useCallback(async () => {
    if (!examSession) return;
    try {
      const response = await completeExam(examSession.id);
      setResults(response.data);
      setExamComplete(true);
      
      // Refresh unlock status after exam completion
      const token = localStorage.getItem('access_token');
      const statusResponse = await axios.get(`${BACKEND_URL}/api/unlock-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnlockStatus(statusResponse.data);
    } catch (error) {
      console.error('Error completing exam:', error);
    }
  }, [examSession]);

  useEffect(() => {
    let timer;
    if (examStarted && !examComplete && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCompleteExamCallback();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examComplete, timeLeft, handleCompleteExamCallback]);

  const handleStartExam = async () => {
    setLoading(true);
    try {
      const params = {
        question_count: questionCount,
        time_limit: timeLimit,
      };
      
      if (category) params.category = category;
      
      const response = await startExam(params);
      setExamSession(response.data);
      
      // Fetch questions for this exam session
      const token = localStorage.getItem('access_token');
      const questionsResponse = await axios.get(
        `${BACKEND_URL}/api/exam/${response.data.id}/questions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setQuestions(questionsResponse.data);
      
      setExamStarted(true);
      setTimeLeft(timeLimit * 60);
      setAnswers({});
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Error starting exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (questionIndex, answerIndex) => {
    const question = questions[questionIndex];
    const newAnswers = { ...answers, [question.id]: answerIndex };
    setAnswers(newAnswers);
    
    // Submit answer to backend
    try {
      await submitExamAnswer(examSession.id, {
        question_id: question.id,
        answer: answerIndex
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleCompleteExam = async () => {
    await handleCompleteExamCallback();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Exam Setup Screen
  if (!examStarted) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          {/* Unlock Status Banner */}
          {unlockStatus && (
            <div className={`rounded-lg p-4 mb-6 ${
              unlockStatus.full_bank_unlocked 
                ? 'bg-green-100 border border-green-300' 
                : 'bg-blue-100 border border-blue-300'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold ${unlockStatus.full_bank_unlocked ? 'text-green-800' : 'text-blue-800'}`}>
                    {unlockStatus.full_bank_unlocked 
                      ? 'Full Question Bank Unlocked' 
                      : 'Priority Question Bank Active'}
                  </h3>
                  <p className={`text-sm ${unlockStatus.full_bank_unlocked ? 'text-green-700' : 'text-blue-700'}`}>
                    {unlockStatus.full_bank_unlocked 
                      ? 'You have access to all 60,000+ questions.'
                      : `Complete ${unlockStatus.sessions_remaining} more qualifying session(s) to unlock the full bank.`}
                  </p>
                </div>
                {!unlockStatus.full_bank_unlocked && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-800">
                      {unlockStatus.qualifying_sessions_completed}/3
                    </div>
                    <div className="text-xs text-blue-600">Sessions</div>
                  </div>
                )}
              </div>
              {!unlockStatus.full_bank_unlocked && (
                <div className="mt-3 bg-white/50 rounded p-2 text-xs text-blue-800">
                  <strong>Requirement:</strong> Score 85% or higher on 50+ questions to count as a qualifying session.
                </div>
              )}
            </div>
          )}

          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-6 mb-6">
            <div className="flex items-center mb-2">
              <svg className="w-8 h-8 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-3xl font-bold">Exam Mode</h1>
            </div>
            <p className="text-base">
              Simulate real exam conditions with timed tests. Questions and answer options are randomized to ensure authentic learning.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Exam Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  data-testid="question-count-select"
                >
                  <option value="50">50 Questions (Qualifying)</option>
                  <option value="75">75 Questions</option>
                  <option value="100">100 Questions</option>
                  <option value="150">150 Questions</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 50 questions required for qualifying sessions
                </p>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  data-testid="time-limit-select"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                  <option value="180">180 minutes</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (Optional)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  data-testid="category-select"
                >
                  <option value="">All Categories</option>
                  <option value="anatomy">Anatomy</option>
                  <option value="general medicine">General Medicine</option>
                  <option value="pharmacology">Pharmacology</option>
                  <option value="microbiology">Microbiology</option>
                  <option value="pathology">Pathology</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="respiratory">Respiratory</option>
                  <option value="neurology">Neurology</option>
                  <option value="endocrinology">Endocrinology</option>
                  <option value="gastroenterology">Gastroenterology</option>
                  <option value="surgery">Surgery</option>
                  <option value="psychiatry">Psychiatry</option>
                </select>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-yellow-900 mb-2">Exam Rules:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Questions and answer options are randomized for each exam</li>
                <li>• Once started, the timer cannot be paused</li>
                <li>• You can navigate between questions freely</li>
                <li>• Answers are auto-saved</li>
                <li>• Score 85%+ on 50+ questions to count as a qualifying session</li>
              </ul>
            </div>

            <button
              onClick={handleStartExam}
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-lg disabled:opacity-50"
              data-testid="start-exam-btn"
            >
              {loading ? 'Starting Exam...' : 'Start Exam'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Exam Results Screen
  if (examComplete && results) {
    const isQualifying = results.is_qualifying_session;
    
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Exam Results</h1>
            
            {/* Qualifying Session Message */}
            {results.qualifying_message && (
              <div className={`p-4 rounded-lg mb-6 text-center ${
                isQualifying ? 'bg-green-100 border border-green-300' : 'bg-orange-100 border border-orange-300'
              }`}>
                <p className={`text-lg font-semibold ${isQualifying ? 'text-green-800' : 'text-orange-800'}`}>
                  {results.qualifying_message}
                </p>
              </div>
            )}
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold mb-4" style={{
                color: results.score >= 85 ? '#10b981' : results.score >= 70 ? '#f59e0b' : '#ef4444'
              }}>
                {results.score}%
              </div>
              <p className="text-xl text-gray-600">
                {results.correct} out of {results.total} questions correct
              </p>
              {results.total >= 50 && results.score < 85 && (
                <p className="text-sm text-orange-600 mt-2">
                  Score 85% or higher to count as a qualifying session
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
              {results.detailed_results?.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.is_correct ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">Question {index + 1}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      result.is_correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {result.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.question?.substring(0, 150)}...</p>
                  {!result.is_correct && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Explanation: </span>
                      {result.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setExamStarted(false);
                  setExamComplete(false);
                  setResults(null);
                  setQuestions([]);
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                data-testid="take-another-exam-btn"
              >
                Take Another Exam
              </button>
              <button
                onClick={() => window.location.href = '/analytics'}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Exam In Progress
  if (questions.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam questions...</p>
        </div>
      </Layout>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Exam Header */}
        <div className="bg-red-600 text-white rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Exam Mode</h2>
            <p className="text-sm">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
            <p className="text-sm">Time Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm capitalize">
                {currentQuestion.category}
              </span>
              <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm">
                Level: {currentQuestion.difficulty}
              </span>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
                Year {currentQuestion.year}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options?.map((option, index) => {
              // Skip empty/nan options
              if (!option || !option.trim() || option.toLowerCase() === 'nan') {
                return null;
              }
              
              const isSelected = answers[currentQuestion.id] === index;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentIndex, index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  data-testid={`answer-option-${index}`}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isSelected && <span className="text-blue-600 text-xl">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="text-sm text-gray-600">
            Answered: {Object.keys(answers).length}/{questions.length}
          </div>
          
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleCompleteExam}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
              data-testid="complete-exam-btn"
            >
              Complete Exam
            </button>
          )}
        </div>

        {/* Question Navigation Grid */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Question Navigator</h4>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded text-sm font-medium ${
                  idx === currentIndex
                    ? 'bg-red-600 text-white'
                    : answers[questions[idx]?.id] !== undefined
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExamPage;
