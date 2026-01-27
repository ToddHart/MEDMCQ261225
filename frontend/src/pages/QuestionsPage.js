import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { getQuestions, submitAnswer } from '../api/endpoints';
import { useTenant } from '../contexts/TenantContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Available categories sorted alphabetically
const CATEGORIES = [
  { value: 'anatomy', label: 'Anatomy', subcategories: ['Upper Limb', 'Lower Limb', 'Thorax', 'Abdomen', 'Head & Neck', 'Neuroanatomy'] },
  { value: 'biochemistry', label: 'Biochemistry', subcategories: ['Metabolism', 'Enzymes', 'Genetics', 'Molecular Biology'] },
  { value: 'cardiology', label: 'Cardiology', subcategories: ['Arrhythmias', 'Heart Failure', 'Valvular Disease', 'Coronary Disease', 'Hypertension'] },
  { value: 'cardiovascular', label: 'Cardiovascular', subcategories: ['Vascular Disease', 'Peripheral Arterial', 'Venous Disorders'] },
  { value: 'dermatology', label: 'Dermatology', subcategories: ['Inflammatory', 'Infectious', 'Neoplastic', 'Autoimmune'] },
  { value: 'endocrinology', label: 'Endocrinology', subcategories: ['Diabetes', 'Thyroid', 'Adrenal', 'Pituitary', 'Calcium Disorders'] },
  { value: 'ent', label: 'ENT', subcategories: ['Ear', 'Nose', 'Throat', 'Head & Neck'] },
  { value: 'gastroenterology', label: 'Gastroenterology', subcategories: ['Oesophagus', 'Stomach', 'Small Bowel', 'Large Bowel', 'Liver', 'Pancreas'] },
  { value: 'general', label: 'General', subcategories: [] },
  { value: 'general medicine', label: 'General Medicine', subcategories: ['Acute Medicine', 'Chronic Disease', 'Geriatrics'] },
  { value: 'gynecology', label: 'Gynaecology', subcategories: ['Menstrual Disorders', 'Fertility', 'Oncology', 'Infections'] },
  { value: 'hematology', label: 'Haematology', subcategories: ['Anaemia', 'Bleeding Disorders', 'Thrombosis', 'Malignancy'] },
  { value: 'immunology', label: 'Immunology', subcategories: ['Autoimmune', 'Immunodeficiency', 'Allergy', 'Transplant'] },
  { value: 'infectious disease', label: 'Infectious Disease', subcategories: ['Bacterial', 'Viral', 'Fungal', 'Parasitic', 'Tropical'] },
  { value: 'medicine', label: 'Medicine', subcategories: [] },
  { value: 'microbiology', label: 'Microbiology', subcategories: ['Bacteriology', 'Virology', 'Mycology', 'Parasitology'] },
  { value: 'nephrology', label: 'Nephrology', subcategories: ['Acute Kidney Injury', 'Chronic Kidney Disease', 'Glomerular Disease', 'Electrolytes'] },
  { value: 'neurology', label: 'Neurology', subcategories: ['Stroke', 'Epilepsy', 'Movement Disorders', 'Dementia', 'Headache', 'Neuropathy'] },
  { value: 'neuroscience', label: 'Neuroscience', subcategories: ['Neurophysiology', 'Neuropathology'] },
  { value: 'obstetrics', label: 'Obstetrics', subcategories: ['Antenatal', 'Labour', 'Postnatal', 'High Risk Pregnancy'] },
  { value: 'ophthalmology', label: 'Ophthalmology', subcategories: ['Anterior Segment', 'Posterior Segment', 'Neuro-ophthalmology', 'Paediatric'] },
  { value: 'orthopedics', label: 'Orthopaedics', subcategories: ['Trauma', 'Spine', 'Upper Limb', 'Lower Limb', 'Paediatric'] },
  { value: 'pathology', label: 'Pathology', subcategories: ['General Pathology', 'Systemic Pathology', 'Histopathology'] },
  { value: 'pediatrics', label: 'Paediatrics', subcategories: ['Neonatology', 'Growth & Development', 'Respiratory', 'Cardiology', 'Gastro'] },
  { value: 'pharmacology', label: 'Pharmacology', subcategories: ['Pharmacokinetics', 'Pharmacodynamics', 'Drug Classes', 'Toxicology'] },
  { value: 'physiology', label: 'Physiology', subcategories: ['Cardiovascular', 'Respiratory', 'Renal', 'Neurophysiology', 'Endocrine'] },
  { value: 'psychiatry', label: 'Psychiatry', subcategories: ['Mood Disorders', 'Psychosis', 'Anxiety', 'Personality', 'Substance Use'] },
  { value: 'radiology', label: 'Radiology', subcategories: ['X-Ray', 'CT', 'MRI', 'Ultrasound', 'Nuclear Medicine'] },
  { value: 'renal', label: 'Renal', subcategories: ['Acute Kidney Injury', 'Chronic Kidney Disease', 'Dialysis'] },
  { value: 'respiratory', label: 'Respiratory', subcategories: ['Asthma', 'COPD', 'Infections', 'Interstitial', 'Malignancy', 'Sleep'] },
  { value: 'rheumatology', label: 'Rheumatology', subcategories: ['Inflammatory Arthritis', 'Connective Tissue', 'Vasculitis', 'Osteoarthritis'] },
  { value: 'surgery', label: 'Surgery', subcategories: ['General', 'Vascular', 'Colorectal', 'Upper GI', 'Breast', 'Endocrine'] },
  { value: 'urology', label: 'Urology', subcategories: ['Prostate', 'Bladder', 'Kidney', 'Male Health', 'Paediatric'] },
].sort((a, b) => a.label.localeCompare(b.label));

const QuestionsPage = () => {
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockStatus, setUnlockStatus] = useState(null);
  const { tenant } = useTenant();
  
  // Mobile filter drawer state - check URL params
  const urlParams = new URLSearchParams(location.search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(urlParams.get('showFilters') === 'true');
  
  // Subscription status for source filter
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');
  
  // State for session stats modal
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  const supportEmail = tenant?.support_email || 'support@medmcq.com.au';
  const primaryColor = tenant?.primary_color || '#2563eb';
  const secondaryColor = tenant?.secondary_color || '#7c3aed';
  
  // Update page title
  useEffect(() => {
    document.title = `Questions | ${tenantName}`;
  }, [tenantName]);
  
  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        const response = await axios.get(`${BACKEND_URL}/api/user/subscription`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubscriptionPlan(response.data?.subscription_plan || 'free');
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscriptionPlan('free');
      }
    };
    fetchSubscription();
  }, []);
  
  // Check if user has paid subscription (not free)
  const hasPaidSubscription = subscriptionPlan && subscriptionPlan !== 'free';
  
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
  
  // Ref for auto-scroll on mobile
  const questionHeaderRef = useRef(null);
  
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // Filters - Multi-category and subcategory selection
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [difficulty, setDifficulty] = useState('all');
  const [year, setYear] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showComplexityDropdown, setShowComplexityDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Complexity tier labels - FULL names, not abbreviated
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
  
  // Auto-scroll to question header on mobile after 1.5 seconds
  useEffect(() => {
    if (questions.length > 0 && questionHeaderRef.current) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        const timer = setTimeout(() => {
          questionHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [questions.length, currentIndex]);

  // State for daily limit
  const [dailyLimitStatus, setDailyLimitStatus] = useState(null);
  const [dailyLimitError, setDailyLimitError] = useState(false);

  // Fetch daily limit status
  useEffect(() => {
    const fetchDailyLimit = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        const response = await axios.get(`${BACKEND_URL}/api/questions/daily-limit`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDailyLimitStatus(response.data);
      } catch (error) {
        console.error('Error fetching daily limit:', error);
      }
    };
    fetchDailyLimit();
  }, [stats.total]);

  // Save stats to localStorage whenever they change (but not on first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('sessionStats', JSON.stringify(stats));
  }, [stats]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setShowYearDropdown(false);
        setShowComplexityDropdown(false);
        setShowSourceDropdown(false);
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setDailyLimitError(false);
    try {
      const params = { limit: 100 };
      
      if (selectedCategories.length === 1) {
        params.category = selectedCategories[0];
      }
      if (difficulty !== 'all') params.difficulty = difficulty;
      if (year !== 'all') params.year = parseInt(year);
      if (sourceFilter !== 'all') params.source = sourceFilter;
      
      let response = await getQuestions(params);
      let questionsData = response.data;
      
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
      if (error.response?.status === 403) {
        setDailyLimitError(true);
      }
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
    setSelectedSubcategories([]);
    setExpandedCategory(null);
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

      setStats(prev => ({
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
        streak: response.data?.current_streak || (isCorrect ? prev.streak + 1 : 0),
      }));
      
      if (response.data?.questions_remaining !== undefined && response.data.questions_remaining >= 0) {
        setDailyLimitStatus(prev => ({
          ...prev,
          questions_remaining: response.data.questions_remaining
        }));
      }

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
      
      if (error.response?.status === 403) {
        setDailyLimitError(true);
        return;
      }
      
      setStats(prev => ({
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
        streak: isCorrect ? prev.streak + 1 : 0,
      }));

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
    window.scrollTo(0, 0);
    
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
      
      const emailSubject = encodeURIComponent(`Question Report: ${question.id}`);
      const emailBody = encodeURIComponent(
        `Question ID: ${question.id}\n` +
        `Question: ${question.question}\n` +
        `Issue Type: ${reasonMap[reason]}\n` +
        `Details: ${details}\n` +
        `Reported At: ${new Date().toISOString()}`
      );
      window.open(`mailto:${supportEmail}?subject=${emailSubject}&body=${emailBody}`, '_blank');
      
      if (data.quarantined) {
        alert('Thank you! This question has been quarantined for review.');
        const newQuestions = questions.filter((_, idx) => idx !== currentIndex);
        setQuestions(newQuestions);
        if (currentIndex >= newQuestions.length) {
          setCurrentIndex(Math.max(0, newQuestions.length - 1));
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error reporting question:', error);
      alert('Report saved.');
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
      
      localStorage.removeItem('sessionStats');
      localStorage.removeItem('sessionCategoryStats');
      setStats({ correct: 0, total: 0, streak: 0 });
      
      if (data.session_data) {
        const session = data.session_data;
        alert(`Session Complete!\n\nQuestions: ${session.questions_answered}\nCorrect: ${session.correct_answers} (${session.accuracy}%)\nStreak: ${session.current_streak}\nTime: ${Math.floor(session.time_spent / 60)}m ${session.time_spent % 60}s`);
      } else {
        alert(`Session Complete!\n\nQuestions: ${stats.total}\nCorrect: ${stats.correct} (${stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%)\nStreak: ${stats.streak}`);
      }
      
      window.location.href = '/analytics';
    } catch (error) {
      console.error('Error finishing session:', error);
      const currentStats = { ...stats };
      localStorage.removeItem('sessionStats');
      localStorage.removeItem('sessionCategoryStats');
      setStats({ correct: 0, total: 0, streak: 0 });
      
      alert(`Session Complete!\n\nQuestions: ${currentStats.total}\nCorrect: ${currentStats.correct}`);
      window.location.href = '/analytics';
    }
  };

  // Filter Panel Component
  const FilterPanel = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'p-4' : 'bg-white rounded-xl shadow-lg p-3 border-2 border-gray-100'} flex flex-col`}>
      {!isMobile && <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-500">Filters</h3>}
      
      <div className="mb-2 space-y-1">
        {dailyLimitStatus && dailyLimitStatus.daily_limit !== -1 && (
          <div className="flex items-center justify-between text-sm bg-orange-100 border-2 border-orange-700 rounded-xl px-3 py-3">
            <span className="text-orange-800 font-bold">
              {dailyLimitStatus.questions_remaining}/{dailyLimitStatus.daily_limit} today
            </span>
            <a href="/subscription" className="text-orange-700 font-black hover:underline bg-orange-200 px-2 py-1 rounded-xl border-2 border-orange-700">UNLOCK</a>
          </div>
        )}
        
        {unlockStatus && !unlockStatus.full_bank_unlocked && (
          <div className="flex items-center justify-between text-xs bg-blue-50 rounded-xl px-2 py-2">
            <span className="text-blue-700 font-medium">
              {unlockStatus.qualifying_sessions_completed}/3 sessions
            </span>
            <a href="/exam" className="text-blue-600 hover:underline font-semibold">Qualify →</a>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Source Filter - Checkbox style dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">SOURCE</label>
          <div className="relative filter-dropdown">
            <button
              onClick={() => hasPaidSubscription && setShowSourceDropdown(!showSourceDropdown)}
              className={`w-full px-3 py-3 border-2 rounded-xl text-sm font-medium text-left flex justify-between items-center ${
                hasPaidSubscription 
                  ? 'border-gray-300 bg-gray-50 cursor-pointer' 
                  : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
              }`}
              disabled={!hasPaidSubscription}
            >
              <span>
                {sourceFilter === 'all' ? 'All Questions' : 
                 sourceFilter === 'une_priority' ? 'Priority Bank' :
                 sourceFilter === 'imported' ? 'My Uploaded' :
                 sourceFilter === 'shared' ? 'Shared Library' :
                 sourceFilter === 'sample' ? 'Sample Questions' : 'All Questions'}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSourceDropdown && hasPaidSubscription && (
              <div className="absolute z-50 mt-1 w-full bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {[
                  { value: 'all', label: 'All Questions' },
                  { value: 'une_priority', label: 'Priority Bank' },
                  { value: 'imported', label: 'My Uploaded' },
                  { value: 'shared', label: 'Shared Library' },
                  { value: 'sample', label: 'Sample Questions' }
                ].map(option => (
                  <div 
                    key={option.value}
                    className="flex items-center px-3 py-3 hover:bg-gray-50 cursor-pointer active:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    onClick={() => { setSourceFilter(option.value); setShowSourceDropdown(false); }}
                  >
                    <input
                      type="radio"
                      checked={sourceFilter === option.value}
                      onChange={() => {}}
                      className="mr-3 w-5 h-5"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!hasPaidSubscription && (
            <p className="text-xs text-gray-500 mt-1">
              <a href="/subscription" className="text-blue-600 hover:underline">Upgrade</a> to filter by source
            </p>
          )}
        </div>

        {/* Year Filter - Checkbox style dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">YEAR</label>
          <div className="relative filter-dropdown">
            <button
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="w-full px-3 py-3 border-2 border-blue-300 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-left flex justify-between items-center"
            >
              <span>
                {year === 'all' ? 'All Years' : `Year ${year}`}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showYearDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-white border-2 border-blue-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {[
                  { value: 'all', label: 'All Years' },
                  { value: '1', label: 'Year 1' },
                  { value: '2', label: 'Year 2' },
                  { value: '3', label: 'Year 3' },
                  { value: '4', label: 'Year 4' },
                  { value: '5', label: 'Year 5' },
                  { value: '6', label: 'Year 6' }
                ].map(option => (
                  <div 
                    key={option.value}
                    className="flex items-center px-3 py-3 hover:bg-blue-50 cursor-pointer active:bg-blue-100 border-b border-gray-100 last:border-b-0"
                    onClick={() => { setYear(option.value); setShowYearDropdown(false); }}
                  >
                    <input
                      type="radio"
                      checked={year === option.value}
                      onChange={() => {}}
                      className="mr-3 w-5 h-5 accent-blue-500"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">
            CATEGORIES {selectedCategories.length > 0 && `(${selectedCategories.length})`}
          </label>
          <div className="relative filter-dropdown">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full px-3 py-3 border-2 border-green-300 rounded-xl text-sm font-medium bg-green-50 text-left flex justify-between items-center"
            >
              <span>
                {selectedCategories.length === 0 
                  ? 'All Categories' 
                  : `${selectedCategories.length} selected`}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCategoryDropdown && (
              <div className={`absolute z-50 mt-1 w-full bg-white border-2 border-green-300 rounded-xl shadow-lg ${isMobile ? 'max-h-60' : 'max-h-72'} overflow-y-auto`}>
                <div className="p-2 border-b sticky top-0 bg-white flex justify-between items-center">
                  <button onClick={handleClearCategories} className="text-xs text-blue-600 hover:underline font-semibold">
                    Clear All
                  </button>
                </div>
                {CATEGORIES.map(cat => (
                  <div key={cat.value} className="border-b border-gray-100 last:border-b-0">
                    <div 
                      className="flex items-center px-3 py-3 hover:bg-green-50 cursor-pointer active:bg-green-100"
                      onClick={() => handleCategoryToggle(cat.value)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.value)}
                        onChange={() => {}}
                        className="mr-3 w-5 h-5 accent-green-500"
                      />
                      <span className="text-sm font-medium flex-1">{cat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Complexity Filter - Checkbox style dropdown */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1">COMPLEXITY</label>
          <div className="relative filter-dropdown">
            <button
              onClick={() => setShowComplexityDropdown(!showComplexityDropdown)}
              className="w-full px-3 py-3 border-2 border-purple-300 rounded-xl text-sm font-medium bg-purple-50 text-left flex justify-between items-center"
            >
              <span>
                {difficulty === 'all' ? 'All Levels' : `${difficulty} - ${complexityLabels[difficulty]}`}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showComplexityDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showComplexityDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-white border-2 border-purple-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {[
                  { value: 'all', label: 'All Levels' },
                  { value: '1', label: '1 - Foundational' },
                  { value: '2', label: '2 - Competent' },
                  { value: '3', label: '3 - Proficient' },
                  { value: '4', label: '4 - Advanced' }
                ].map(option => (
                  <div 
                    key={option.value}
                    className="flex items-center px-3 py-3 hover:bg-purple-50 cursor-pointer active:bg-purple-100 border-b border-gray-100 last:border-b-0"
                    onClick={() => { setDifficulty(option.value); setShowComplexityDropdown(false); }}
                  >
                    <input
                      type="radio"
                      checked={difficulty === option.value}
                      onChange={() => {}}
                      className="mr-3 w-5 h-5 accent-purple-500"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Session Stats - positioned higher with reduced spacing */}
      <div className="mt-1 pt-1 border-t-2 border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3">
          <h4 className="text-xs font-bold text-gray-700 mb-2">SESSION STATS</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">{stats.streak}</div>
              <div className="text-xs text-gray-500">Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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

  if (dailyLimitError) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Daily Limit Reached</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Upgrade your subscription to get unlimited access!
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = '/subscription'}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold"
              >
                Upgrade Plan
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
              >
                ← Go to Home Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">No Questions Available</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Try adjusting your filters or load sample questions.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setSelectedCategories([]); setYear('all'); setDifficulty('all'); }}
                className="w-full px-6 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
  
  // Modified finish session to show stats first on mobile
  const handleFinishSessionClick = () => {
    // On mobile, show stats modal first
    if (window.innerWidth < 1024) {
      setShowStatsModal(true);
    } else {
      // On desktop, proceed directly
      handleFinishSession();
    }
  };
  
  const confirmFinishSession = () => {
    setShowStatsModal(false);
    handleFinishSession();
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto -mt-4 overflow-x-hidden" style={{ maxWidth: '100vw' }}>
        {/* Session Stats Modal for Mobile */}
        {showStatsModal && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowStatsModal(false)}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-80 p-6">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-4">Session Stats</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-500">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.streak}</div>
                  <div className="text-sm text-gray-500">Streak</div>
                </div>
              </div>
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm">Correct: {stats.correct} / {stats.total}</p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmFinishSession}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                >
                  Finish & View Analytics
                </button>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
                >
                  Continue Practice
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white pt-3 pb-2 border-b border-gray-200 z-10">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <FilterPanel isMobile={true} />
              
              <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg active:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 w-full overflow-x-hidden items-start">
          {/* Desktop Sidebar - Fixed position relative to viewport */}
          <div className="hidden lg:block lg:col-span-1 self-start">
            <div className="sticky top-16">
              <FilterPanel />
            </div>
          </div>

          {/* Main Content - Question Card */}
          <div className="lg:col-span-4 w-full overflow-x-hidden">
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 w-full overflow-hidden">
              {/* Question Header - Compact single row for PC, stacked for mobile */}
              <div
                ref={questionHeaderRef}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4"
                style={{ paddingTop: '36px', paddingBottom: '24px' }}
              >
                {/* Mobile: Two rows layout */}
                <div className="flex flex-col gap-2 lg:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold bg-white/20 px-3 py-1 rounded whitespace-nowrap">Q{currentIndex + 1}/{questions.length}</span>
                    <div className="text-base font-bold bg-white/20 px-3 py-1 rounded whitespace-nowrap">
                      {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold capitalize bg-green-400 text-green-900 px-2 py-0.5 rounded whitespace-nowrap">{question.category}</span>
                    <span className="text-sm font-semibold bg-blue-400 text-blue-900 px-2 py-0.5 rounded whitespace-nowrap">Year {question.year}</span>
                    <span className="text-sm font-semibold bg-purple-400 text-purple-900 px-2 py-0.5 rounded whitespace-nowrap">{complexityLabels[question.difficulty] || `Level ${question.difficulty}`}</span>
                  </div>
                </div>
                {/* PC: Single row layout - all items evenly spaced */}
                <div className="hidden lg:flex items-center justify-between">
                  <span className="text-base font-bold bg-white/20 px-3 py-1 rounded whitespace-nowrap">Q{currentIndex + 1}/{questions.length}</span>
                  <span className="text-base font-bold capitalize bg-green-400 text-green-900 px-3 py-1 rounded whitespace-nowrap">{question.category}</span>
                  <span className="text-base font-bold bg-blue-400 text-blue-900 px-3 py-1 rounded whitespace-nowrap">Year {question.year}</span>
                  <span className="text-base font-bold bg-purple-400 text-purple-900 px-3 py-1 rounded whitespace-nowrap">{complexityLabels[question.difficulty] || `Level ${question.difficulty}`}</span>
                  <div className="text-base font-bold bg-white/20 px-3 py-1 rounded whitespace-nowrap">
                    {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Question Body */}
              <div className="p-3 sm:p-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
                  {question.question}
                </h2>

                {/* Answer Options */}
                <div className="space-y-3 mb-4">
                  {(() => {
                    const validOptions = question.options
                      ?.map((option, originalIndex) => ({ option, originalIndex }))
                      .filter(({ option }) => option && option.trim() && option.toLowerCase() !== 'nan') || [];
                    
                    return validOptions.map(({ option, originalIndex }, displayIndex) => {
                      const isSelected = selectedAnswer === originalIndex;
                      const isCorrect = originalIndex === question.correct_answer;
                      const showResult = answered;

                      let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ';
                      
                      if (!showResult) {
                        buttonClass += isSelected
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-gray-600 active:bg-blue-100 active:border-blue-500';
                      } else {
                        if (isCorrect) {
                          buttonClass += 'bg-green-100 border-green-500';
                        } else if (isSelected && !isCorrect) {
                          buttonClass += 'bg-red-100 border-red-500';
                        } else {
                          buttonClass += 'bg-gray-50 border-gray-200';
                        }
                      }

                      let circleClass = 'w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0 text-sm border-2 transition-all duration-200 ';
                      if (showResult && isCorrect) {
                        circleClass += 'bg-green-500 text-white border-green-500';
                      } else if (showResult && isSelected && !isCorrect) {
                        circleClass += 'bg-red-500 text-white border-red-500';
                      } else if (isSelected) {
                        circleClass += 'bg-blue-500 text-white border-blue-500';
                      } else {
                        circleClass += 'bg-gray-200 text-gray-700 border-gray-300 group-hover:border-gray-600';
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
                            <span className={circleClass}>
                              {String.fromCharCode(65 + displayIndex)}
                            </span>
                            <span className="flex-1 text-gray-800 text-sm sm:text-base font-medium leading-relaxed">{option}</span>
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

                {/* Action Buttons - Next Question, Finish Session, Report Issue */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
                  {/* Next Question Button - Same width as filter dropdowns on PC */}
                  <button
                    onClick={handleNext}
                    disabled={!answered}
                    className={`w-full lg:w-48 px-3 py-3 rounded-xl transition-all font-bold flex items-center justify-center text-sm shadow-md hover:shadow-lg border-2 ${
                      answered 
                        ? 'text-white border-white' 
                        : 'text-gray-500 bg-gray-300 border-gray-500 cursor-not-allowed'
                    }`}
                    style={answered ? { 
                      background: 'linear-gradient(90deg, #2563eb, #7c3aed)'
                    } : {}}
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question →' : 'Load More →'}
                  </button>

                  {/* Finish Session Button - Same width as filter dropdowns on PC */}
                  <button
                    onClick={handleFinishSessionClick}
                    className="w-full lg:w-48 px-3 py-3 bg-purple-100 border-2 border-purple-500 text-purple-700 hover:bg-purple-200 active:bg-purple-300 rounded-xl font-bold text-sm"
                  >
                    Finish Session
                  </button>

                  {/* Report Issue Button - Same width as filter dropdowns on PC */}
                  <button
                    onClick={handleReportIssue}
                    className="w-full lg:w-48 px-3 py-3 bg-red-100 border-2 border-red-500 text-red-700 hover:bg-red-200 active:bg-red-300 rounded-xl font-medium text-sm"
                  >
                    🚩 Report Issue
                  </button>
                </div>

                {/* Explanation - BELOW Action Buttons */}
                {answered && question.explanation && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-r-xl mt-4">
                    <h4 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">Explanation:</h4>
                    <p className="text-blue-800 text-sm sm:text-base">{question.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionsPage;
