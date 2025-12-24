import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { getQuestions, submitAnswer } from '../api/endpoints';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockStatus, setUnlockStatus] = useState(null);
  
  // Initialize stats from localStorage to persist across navigation
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('sessionStats');
    if (savedStats) {
      try {
        return JSON.parse(savedStats);
      } catch (e) {
        return { correct: 0, total: 0, streak: 0 };
      }
    }
    return { correct: 0, total: 0, streak: 0 };
  });
  
  // Track if this is the first render to avoid overwriting localStorage
  const isFirstRender = useRef(true);
  
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // Filters
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [year, setYear] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Complexity tier labels
  const complexityLabels = {
    '1': 'Foundational',
    '2': 'Competent',
    '3': 'Proficient',
    '4': 'Advanced'
  };

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

  // Save stats to localStorage whenever they change (but not on first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('sessionStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    loadQuestions();
  }, [category, difficulty, year, sourceFilter]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentIndex]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      
      if (category !== 'all') params.category = category;
      if (difficulty !== 'all') params.difficulty = difficulty;
      if (year !== 'all') params.year = parseInt(year);
      if (sourceFilter !== 'all') params.source = sourceFilter;
      
      let response = await getQuestions(params);
      
      setQuestions(response.data);
      setCurrentIndex(0);
      setAnswered(false);
      setSelectedAnswer(null);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (index) => {
    if (answered) return;

    if (timerInterval) {
      clearInterval(timerInterval);
    }

    setSelectedAnswer(index);
    setAnswered(true);

    const question = questions[currentIndex];
    const isCorrect = index === question.correct_answer;
    const questionCategory = question.category;

    try {
      const response = await submitAnswer({
        question_id: question.id,
        selected_answer: index,
        is_correct: isCorrect,
        time_taken: timeElapsed,
      });

      // Update overall session stats
      setStats(prev => ({
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
        streak: response.data?.current_streak || (isCorrect ? prev.streak + 1 : 0),
      }));

      // Update session category stats in localStorage
      const savedCategoryStats = localStorage.getItem('sessionCategoryStats');
      let categoryStats = savedCategoryStats ? JSON.parse(savedCategoryStats) : {};
      
      if (!categoryStats[questionCategory]) {
        categoryStats[questionCategory] = { correct: 0, total: 0 };
      }
      categoryStats[questionCategory].total += 1;
      if (isCorrect) {
        categoryStats[questionCategory].correct += 1;
      }
      localStorage.setItem('sessionCategoryStats', JSON.stringify(categoryStats));

    } catch (error) {
      console.error('Error submitting answer:', error);
      setStats(prev => ({
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
        streak: isCorrect ? prev.streak + 1 : 0,
      }));

      // Still update session category stats even if API fails
      const savedCategoryStats = localStorage.getItem('sessionCategoryStats');
      let categoryStats = savedCategoryStats ? JSON.parse(savedCategoryStats) : {};
      
      if (!categoryStats[questionCategory]) {
        categoryStats[questionCategory] = { correct: 0, total: 0 };
      }
      categoryStats[questionCategory].total += 1;
      if (isCorrect) {
        categoryStats[questionCategory].correct += 1;
      }
      localStorage.setItem('sessionCategoryStats', JSON.stringify(categoryStats));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeElapsed(0);
    } else {
      loadQuestions();
      setCurrentIndex(0);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeElapsed(0);
    }
  };

  const handleReportIssue = async () => {
    const question = questions[currentIndex];
    const reason = prompt('What is the issue?\n1. Wrong answer\n2. Too ambiguous\n3. Correct answer not displayed\n\nEnter 1, 2, or 3:');
    
    const reasonMap = {
      '1': 'incorrect',
      '2': 'ambiguous',
      '3': 'missing_correct'
    };
    
    if (!reasonMap[reason]) return;
    
    const details = prompt('Please provide additional details (optional):') || '';
    
    try {
      // Save report to database
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/questions/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          question_id: question.id,
          user_id: '',
          reason: reasonMap[reason],
          details: details,
          timestamp: new Date().toISOString(),
          resolved: false
        })
      });
      
      const data = await response.json();
      
      // Open email client to send report
      const emailSubject = encodeURIComponent(`Question Report: ${question.id}`);
      const emailBody = encodeURIComponent(
        `Question ID: ${question.id}\n` +
        `Question: ${question.question}\n` +
        `Issue Type: ${reasonMap[reason]}\n` +
        `Details: ${details}\n` +
        `Reported At: ${new Date().toISOString()}`
      );
      window.open(`mailto:Report_Issue@MedMCQ.com.au?subject=${emailSubject}&body=${emailBody}`, '_blank');
      
      if (data.quarantined) {
        alert('Thank you! This question has been quarantined for review (4+ reports). An email has been opened for you to send.');
        const newQuestions = questions.filter((_, idx) => idx !== currentIndex);
        setQuestions(newQuestions);
        if (currentIndex >= newQuestions.length) {
          setCurrentIndex(Math.max(0, newQuestions.length - 1));
        }
      } else {
        alert(data.message + ' An email has been opened for you to send.');
      }
    } catch (error) {
      console.error('Error reporting question:', error);
      // Still open email even if API fails
      const emailSubject = encodeURIComponent(`Question Report: ${question.id}`);
      const emailBody = encodeURIComponent(
        `Question ID: ${question.id}\n` +
        `Question: ${question.question}\n` +
        `Issue Type: ${reasonMap[reason]}\n` +
        `Details: ${details}\n` +
        `Reported At: ${new Date().toISOString()}`
      );
      window.open(`mailto:Report_Issue@MedMCQ.com.au?subject=${emailSubject}&body=${emailBody}`, '_blank');
      alert('Report saved. An email has been opened for you to send.');
    }
  };

  const handleFinishSession = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/session/finish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = await response.json();
      
      // Clear local session stats and category stats
      localStorage.removeItem('sessionStats');
      localStorage.removeItem('sessionCategoryStats');
      setStats({ correct: 0, total: 0, streak: 0 });
      
      if (data.session_data) {
        const session = data.session_data;
        alert(`Session Complete!\n\nQuestions: ${session.questions_answered}\nCorrect: ${session.correct_answers} (${session.accuracy}%)\nStreak: ${session.current_streak}\nTime: ${Math.floor(session.time_spent / 60)}m ${session.time_spent % 60}s\n\nGreat work! Check Analytics for detailed insights.`);
      } else {
        alert(`Session Complete!\n\nQuestions: ${stats.total}\nCorrect: ${stats.correct} (${stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%)\nStreak: ${stats.streak}\n\nGreat work! Check Analytics for detailed insights.`);
      }
      
      window.location.href = '/analytics';
    } catch (error) {
      console.error('Error finishing session:', error);
      // Clear local session stats and category stats even if API fails
      const currentStats = { ...stats };
      localStorage.removeItem('sessionStats');
      localStorage.removeItem('sessionCategoryStats');
      setStats({ correct: 0, total: 0, streak: 0 });
      
      alert(`Session Complete!\n\nQuestions: ${currentStats.total}\nCorrect: ${currentStats.correct} (${currentStats.total > 0 ? Math.round((currentStats.correct / currentStats.total) * 100) : 0}%)\nStreak: ${currentStats.streak}\n\nGreat work! Check Analytics for detailed insights.`);
      window.location.href = '/analytics';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Questions Available</h2>
            <p className="text-gray-600 mb-6">
              No questions match your current filters. Try adjusting your filters or load sample questions.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Go to Home Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const question = questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Sidebar - Aligned to bottom */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-20 border-2 border-gray-100 flex flex-col" style={{ minHeight: '470px' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">Filters</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">SOURCE</label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full px-2 py-2 border-2 border-gray-300 rounded text-xs font-medium bg-gray-50"
                  >
                    <option value="all">All Questions</option>
                    <option value="shared">Shared Library</option>
                    <option value="sample">Sample Questions</option>
                    <option value="imported">My Imported</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">YEAR</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2 py-2 border-2 border-blue-300 rounded text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50"
                  >
                    <option value="all">All</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                    <option value="6">Year 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">SUBJECT</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2 py-2 border-2 border-green-300 rounded text-xs font-medium bg-green-50"
                  >
                    <option value="all">All Subjects</option>
                    <option value="anatomy">Anatomy</option>
                    <option value="biochemistry">Biochemistry</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="cardiovascular">Cardiovascular</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="endocrinology">Endocrinology</option>
                    <option value="ent">ENT</option>
                    <option value="gastroenterology">Gastroenterology</option>
                    <option value="gynecology">Gynecology</option>
                    <option value="hematology">Hematology</option>
                    <option value="immunology">Immunology</option>
                    <option value="medicine">Medicine</option>
                    <option value="microbiology">Microbiology</option>
                    <option value="neurology">Neurology</option>
                    <option value="neuroscience">Neuroscience</option>
                    <option value="obstetrics">Obstetrics</option>
                    <option value="ophthalmology">Ophthalmology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pathology">Pathology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="pharmacology">Pharmacology</option>
                    <option value="physiology">Physiology</option>
                    <option value="psychiatry">Psychiatry</option>
                    <option value="radiology">Radiology</option>
                    <option value="renal">Renal</option>
                    <option value="respiratory">Respiratory</option>
                    <option value="surgery">Surgery</option>
                    <option value="urology">Urology</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">COMPLEXITY</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-2 py-2 border-2 border-purple-300 rounded text-xs font-medium bg-purple-50"
                  >
                    <option value="all">All</option>
                    <option value="1">Foundational</option>
                    <option value="2">Competent</option>
                    <option value="3">Proficient</option>
                    <option value="4">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Session Stats - Pushed to bottom with flex-grow spacer */}
              <div className="flex-grow"></div>
              <div className="pt-3 border-t-2 border-gray-200 mt-3">
                <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Session Stats</h4>
                <div className="space-y-1.5">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-2 rounded-lg border-2 border-blue-300 shadow-md">
                    <div className="text-xs font-semibold text-blue-700">Answered</div>
                    <div className="text-xl font-bold text-blue-900">{stats.total}</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-2 rounded-lg border-2 border-green-300 shadow-md">
                    <div className="text-xs font-semibold text-green-700">Correct</div>
                    <div className="text-xl font-bold text-green-900">
                      {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-2 rounded-lg border-2 border-purple-300 shadow-md">
                    <div className="text-xs font-semibold text-purple-700">Streak</div>
                    <div className="text-xl font-bold text-purple-900">{stats.streak}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-4">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-md p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-semibold">Time: {timeElapsed}s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-lg shadow-md p-4">
              {/* Professional Headers - Year (Blue/Purple), Subject (Green), Complexity (Purple) */}
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-bold shadow-md">
                  Year {question.year}
                </span>
                <span className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md capitalize">
                  {question.category}
                </span>
                <span className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-md">
                  {complexityLabels[question.difficulty] || 'Competent'}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base font-semibold text-gray-900 mb-3 leading-tight">
                {question.question}
              </h3>

              {/* Options */}
              <div className="space-y-2 mb-3">
                {question.options.map((option, index) => {
                  const isCorrect = index === question.correct_answer;
                  const isSelected = index === selectedAnswer;
                  
                  let bgColor = 'bg-gray-50 hover:bg-gray-100';
                  let borderColor = 'border-gray-200';
                  
                  if (answered) {
                    if (isCorrect) {
                      bgColor = 'bg-green-100';
                      borderColor = 'border-green-500';
                    } else if (isSelected) {
                      bgColor = 'bg-red-100';
                      borderColor = 'border-red-500';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={answered}
                      className={`w-full text-left p-2 rounded-lg border-2 transition-all ${bgColor} ${borderColor} ${
                        answered ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs mr-2 flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 text-sm">{option}</span>
                        {answered && isCorrect && (
                          <span className="text-green-600 font-bold ml-2">✓</span>
                        )}
                        {answered && isSelected && !isCorrect && (
                          <span className="text-red-600 font-bold ml-2">✗</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {answered && (
                <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded mb-3">
                  <p className="text-sm text-blue-900 font-medium">
                    <span className="font-bold">Explanation: </span>
                    {question.explanation}
                  </p>
                </div>
              )}

              {/* Three-Button Layout */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t-2 border-gray-200">
                <button
                  onClick={handleNext}
                  className="flex-1 py-2.5 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                >
                  Next Question →
                </button>
                
                <button
                  onClick={handleFinishSession}
                  className="flex-1 py-2.5 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                >
                  ✓ Finish Session
                </button>
                
                <button
                  onClick={handleReportIssue}
                  className="flex-1 py-2.5 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionsPage;
