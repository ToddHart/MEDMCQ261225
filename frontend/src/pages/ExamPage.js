import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { startExam, submitExamAnswer, completeExam } from '../api/endpoints';

const ExamPage = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [examSession, setExamSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [examComplete, setExamComplete] = useState(false);
  const [results, setResults] = useState(null);
  
  // Exam settings
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(60);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    let timer;
    if (examStarted && !examComplete && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCompleteExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examComplete, timeLeft]);

  const handleStartExam = async () => {
    try {
      const params = {
        question_count: questionCount,
        time_limit: timeLimit,
      };
      
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      if (year) params.year = parseInt(year);
      
      const response = await startExam(params);
      setExamSession(response.data);
      
      // Fetch questions (simulating - in real app would come from backend)
      // For now using the question_ids from session
      setExamStarted(true);
      setTimeLeft(timeLimit * 60);
      setAnswers({});
      setCurrentIndex(0);
      
      // In a real implementation, you'd fetch the actual questions here
      // For demo purposes, we'll load them from the regular endpoint
      const questionsResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/questions?limit=${questionCount}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Error starting exam. Please try again.');
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
    try {
      const response = await completeExam(examSession.id);
      setResults(response.data);
      setExamComplete(true);
    } catch (error) {
      console.error('Error completing exam:', error);
    }
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
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-8 mb-8">
            <h1 className="text-4xl font-bold mb-4">Exam Mode</h1>
            <p className="text-lg">
              Simulate real exam conditions with timed tests and comprehensive performance reviews.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Exam Settings</h2>
            
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
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="20">20 Questions</option>
                  <option value="30">30 Questions</option>
                  <option value="50">50 Questions</option>
                </select>
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
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
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
                >
                  <option value="">All Categories</option>
                  <option value="respiratory">Respiratory</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="endocrinology">Endocrinology</option>
                  <option value="urology">Urology</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty (Optional)
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Difficulties</option>
                  <option value="1">Easy (1)</option>
                  <option value="2">Medium (2)</option>
                  <option value="3">Hard (3)</option>
                  <option value="4">Extreme (4)</option>
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year (Optional)
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                  <option value="6">Year 6</option>
                </select>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-yellow-900 mb-2">Exam Rules:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Once started, the timer cannot be paused</li>
                <li>• You can navigate between questions freely</li>
                <li>• Answers are auto-saved</li>
                <li>• Exam ends when time runs out or you click "Complete Exam"</li>
              </ul>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-lg"
            >
              Start Exam
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Exam Results Screen
  if (examComplete && results) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Exam Results</h1>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold mb-4" style={{
                color: results.score >= 70 ? '#10b981' : results.score >= 50 ? '#f59e0b' : '#ef4444'
              }}>
                {results.score}%
              </div>
              <p className="text-xl text-gray-600">
                {results.correct} out of {results.total} questions correct
              </p>
            </div>

            <div className="space-y-4 mb-8">
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
                  <p className="text-sm text-gray-600 mb-2">{result.question?.substring(0, 100)}...</p>
                  {!result.is_correct && (
                    <p className="text-sm">
                      <span className="font-semibold">Correct answer: </span>
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

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                {currentQuestion.category}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Difficulty: {currentQuestion.difficulty}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Year {currentQuestion.year}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options?.map((option, index) => {
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
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isSelected && <span className="text-blue-600">✓</span>}
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
            >
              Complete Exam
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExamPage;
