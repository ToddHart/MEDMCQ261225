import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { getQuestions, submitAnswer } from '../api/endpoints';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Available categories
const CATEGORIES = [
  { value: 'anatomy', label: 'Anatomy' },
  { value: 'biochemistry', label: 'Biochemistry' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'cardiovascular', label: 'Cardiovascular' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'ent', label: 'ENT' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'general medicine', label: 'General Medicine' },
  { value: 'gynecology', label: 'Gynecology' },
  { value: 'hematology', label: 'Hematology' },
  { value: 'immunology', label: 'Immunology' },
  { value: 'infectious disease', label: 'Infectious Disease' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'microbiology', label: 'Microbiology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'neuroscience', label: 'Neuroscience' },
  { value: 'obstetrics', label: 'Obstetrics' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'pharmacology', label: 'Pharmacology' },
  { value: 'physiology', label: 'Physiology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'renal', label: 'Renal' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'rheumatology', label: 'Rheumatology' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'urology', label: 'Urology' },
  { value: 'general', label: 'General' },
];

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
  
  // Filters - Multi-category selection
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [difficulty, setDifficulty] = useState('all');
  const [year, setYear] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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
  }, [selectedCategories, difficulty, year, sourceFilter]);

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
      
      // For single category (backend accepts one at a time for now)
      // If multiple selected, we fetch more and filter client-side
      if (selectedCategories.length === 1) {
        params.category = selectedCategories[0];
      }
      if (difficulty !== 'all') params.difficulty = difficulty;
      if (year !== 'all') params.year = parseInt(year);
      if (sourceFilter !== 'all') params.source = sourceFilter;
      
      let response = await getQuestions(params);
      let questionsData = response.data;
      
      // Client-side filter for multiple categories
      if (selectedCategories.length > 1) {
        questionsData = questionsData.filter(q => 
          selectedCategories.includes(q.category?.toLowerCase())
        );
      }
      
      setQuestions(questionsData);
      setCurrentIndex(0);
      setAnswered(false);
      setSelectedAnswer(null);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryValue) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryValue)) {
        return prev.filter(c => c !== categoryValue);
      } else {
        return [...prev, categoryValue];
      }
    });
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
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
                onClick={() => { setSelectedCategories([]); setYear('all'); setDifficulty('all'); }}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
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
        {/* Unlock Status Banner */}
        {unlockStatus && (
          <div className={`rounded-lg p-3 mb-4 ${
            unlockStatus.full_bank_unlocked 
              ? 'bg-green-100 border border-green-300' 
              : 'bg-blue-100 border border-blue-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`font-semibold ${unlockStatus.full_bank_unlocked ? 'text-green-800' : 'text-blue-800'}`}>
                  {unlockStatus.full_bank_unlocked 
                    ? '🎉 Full Question Bank Unlocked!' 
                    : `🔒 Priority Questions Only - ${unlockStatus.qualifying_sessions_completed}/3 qualifying sessions completed`}
                </span>
              </div>
              {!unlockStatus.full_bank_unlocked && (
                <a href="/exam" className="text-sm text-blue-600 hover:underline font-medium">
                  Take Exam to Qualify →
                </a>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-20 border-2 border-gray-100 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">Filters</h3>
              
              <div className="space-y-3">
                {/* Source Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">SOURCE</label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full px-2 py-2 border-2 border-gray-300 rounded text-xs font-medium bg-gray-50"
                    disabled={!unlockStatus?.full_bank_unlocked}
                  >
                    <option value="all">All Questions</option>
                    <option value="une_priority">Priority Bank</option>
                    {unlockStatus?.full_bank_unlocked && (
                      <>
                        <option value="shared">Shared Library</option>
                        <option value="sample">Sample Questions</option>
                        <option value="imported">My Imported</option>
                      </>
                    )}
                  </select>
                  {!unlockStatus?.full_bank_unlocked && (
                    <p className="text-xs text-gray-500 mt-1">Unlock to access more sources</p>
                  )}
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">YEAR</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2 py-2 border-2 border-blue-300 rounded text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50"
                  >
                    <option value="all">All Years</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                    <option value="6">Year 6</option>
                  </select>
                </div>

                {/* Multi-Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    SUBJECTS {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full px-2 py-2 border-2 border-green-300 rounded text-xs font-medium bg-green-50 text-left flex justify-between items-center"
                    >
                      <span>
                        {selectedCategories.length === 0 
                          ? 'All Subjects' 
                          : `${selectedCategories.length} selected`}
                      </span>
                      <svg className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showCategoryDropdown && (
                      <div className="absolute z-50 mt-1 w-full bg-white border-2 border-green-300 rounded shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 border-b sticky top-0 bg-white">
                          <button
                            onClick={handleClearCategories}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Clear All
                          </button>
                        </div>
                        {CATEGORIES.map(cat => (
                          <label
                            key={cat.value}
                            className="flex items-center px-2 py-1 hover:bg-green-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat.value)}
                              onChange={() => handleCategoryToggle(cat.value)}
                              className="mr-2"
                            />
                            <span className="text-xs">{cat.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected categories tags */}
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedCategories.slice(0, 3).map(cat => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs flex items-center"
                        >
                          {CATEGORIES.find(c => c.value === cat)?.label || cat}
                          <button
                            onClick={() => handleCategoryToggle(cat)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {selectedCategories.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                          +{selectedCategories.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Complexity Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">COMPLEXITY</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-2 py-2 border-2 border-purple-300 rounded text-xs font-medium bg-purple-50"
                  >
                    <option value="all">All Levels</option>
                    <option value="1">1 - Foundational</option>
                    <option value="2">2 - Competent</option>
                    <option value="3">3 - Proficient</option>
                    <option value="4">4 - Advanced</option>
                  </select>
                </div>
              </div>
              
              {/* Session Stats */}
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-gray-700 mb-2">SESSION STATS</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{stats.streak}</div>
                      <div className="text-xs text-gray-500">Streak</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinishSession}
                className="mt-4 w-full py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
              >
                Finish Session
              </button>
            </div>
          </div>

          {/* Main Content - Question Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-100">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold">Q{currentIndex + 1}/{questions.length}</span>
                    <span className="px-3 py-1 bg-green-500 rounded-full text-sm capitalize">
                      {question.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-400 rounded-full text-sm">
                      Year {question.year}
                    </span>
                    <span className="px-3 py-1 bg-purple-400 rounded-full text-sm">
                      {complexityLabels[question.difficulty] || `Level ${question.difficulty}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
                    <div className="text-sm opacity-80">Time</div>
                  </div>
                </div>
              </div>

              {/* Question Body */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                  {question.question}
                </h2>

                {/* Answer Options */}
                <div className="space-y-3 mb-6">
                  {(() => {
                    // Filter out empty/nan options first, then map with sequential labels
                    const validOptions = question.options
                      ?.map((option, originalIndex) => ({ option, originalIndex }))
                      .filter(({ option }) => option && option.trim() && option.toLowerCase() !== 'nan') || [];
                    
                    return validOptions.map(({ option, originalIndex }, displayIndex) => {
                      const isSelected = selectedAnswer === originalIndex;
                      const isCorrect = originalIndex === question.correct_answer;
                      const showResult = answered;

                      let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-all ';
                      
                      if (!showResult) {
                        buttonClass += isSelected
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300';
                      } else {
                        if (isCorrect) {
                          buttonClass += 'bg-green-100 border-green-500';
                        } else if (isSelected && !isCorrect) {
                          buttonClass += 'bg-red-100 border-red-500';
                        } else {
                          buttonClass += 'bg-gray-50 border-gray-200';
                        }
                      }

                      return (
                        <button
                          key={originalIndex}
                          onClick={() => handleAnswerSelect(originalIndex)}
                          disabled={answered}
                          className={buttonClass}
                          data-testid={`answer-option-${originalIndex}`}
                        >
                          <div className="flex items-start">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0 ${
                              showResult && isCorrect
                                ? 'bg-green-500 text-white'
                                : showResult && isSelected && !isCorrect
                                  ? 'bg-red-500 text-white'
                                  : isSelected
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + displayIndex)}
                            </span>
                            <span className="flex-1 text-gray-800">{option}</span>
                            {showResult && isCorrect && (
                              <span className="text-green-600 text-xl ml-2">✓</span>
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <span className="text-red-600 text-xl ml-2">✗</span>
                            )}
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Explanation (shown after answer) */}
                {answered && question.explanation && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                    <h4 className="font-bold text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-blue-800">{question.explanation}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  {answered && (
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold flex items-center"
                    >
                      {currentIndex < questions.length - 1 ? 'Next Question' : 'Load More'}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  
                  {!answered && <div></div>}

                  <button
                    onClick={handleReportIssue}
                    className="px-4 py-2 bg-orange-100 border-2 border-orange-400 text-orange-700 hover:bg-orange-200 rounded-lg font-medium flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionsPage;
