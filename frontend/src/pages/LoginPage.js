import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Australian Universities
const AUSTRALIAN_UNIVERSITIES = [
  "Australian National University",
  "Bond University",
  "Charles Darwin University",
  "Charles Sturt University",
  "CQUniversity Australia",
  "Curtin University",
  "Deakin University",
  "Edith Cowan University",
  "Federation University Australia",
  "Flinders University",
  "Griffith University",
  "James Cook University",
  "La Trobe University",
  "Macquarie University",
  "Monash University",
  "Murdoch University",
  "Queensland University of Technology",
  "RMIT University",
  "Southern Cross University",
  "Swinburne University of Technology",
  "University of Adelaide",
  "University of Canberra",
  "University of Melbourne",
  "University of New England",
  "University of New South Wales",
  "University of Newcastle",
  "University of Notre Dame Australia",
  "University of Queensland",
  "University of South Australia",
  "University of Southern Queensland",
  "University of Sydney",
  "University of Tasmania",
  "University of Technology Sydney",
  "University of the Sunshine Coast",
  "University of Western Australia",
  "University of Wollongong",
  "Victoria University",
  "Western Sydney University",
  "Other"
];

// Countries
const COUNTRIES = [
  "Australia",
  "New Zealand",
  "United Kingdom",
  "United States",
  "Canada",
  "Ireland",
  "Singapore",
  "Malaysia",
  "India",
  "Other"
];

// Degree Types
const DEGREE_TYPES = [
  "Bachelor of Medicine / Bachelor of Surgery (MBBS)",
  "Doctor of Medicine (MD)",
  "Bachelor of Medical Science",
  "Graduate Entry Medicine",
  "Other Medical Degree"
];

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [customInstitution, setCustomInstitution] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [degreeType, setDegreeType] = useState('');
  const [country, setCountry] = useState('Australia');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        // Include additional registration fields
        const finalInstitution = institution === 'Other' ? customInstitution : institution;
        result = await register(email, password, fullName, {
          institution: finalInstitution,
          current_year: currentYear ? parseInt(currentYear) : null,
          degree_type: degreeType,
          country: country
        });
      }

      if (result.success) {
        navigate('/');
      } else {
        // Always show generic error message for login failures
        if (isLogin) {
          setError('Either the username and/or password are incorrect.');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      if (isLogin) {
        setError('Either the username and/or password are incorrect.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotLoading(true);
    
    if (!forgotEmail) {
      setForgotMessage('Please enter your email address.');
      setForgotLoading(false);
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, {
        email: forgotEmail
      });
      
      setForgotMessage('If an account exists with this email, you will receive password reset instructions shortly.');
    } catch (error) {
      // Still show success message for security (don't reveal if email exists)
      setForgotMessage('If an account exists with this email, you will receive password reset instructions shortly.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
            <p className="text-blue-100 mt-2">Enter your email to reset your password</p>
          </div>

          <div className="bg-white rounded-lg shadow-2xl p-8">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {forgotMessage && (
                <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail('');
                  setForgotMessage('');
                }}
                className="w-full text-gray-600 hover:text-gray-900 py-2 px-4 rounded-lg transition-colors font-medium"
              >
                ← Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">MedMCQ</h1>
          <p className="text-blue-100 mt-2">Medical Student Learning Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-6">
          <div className="mb-4">
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution/University *
                  </label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select your institution</option>
                    {AUSTRALIAN_UNIVERSITIES.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                {institution === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      value={customInstitution}
                      onChange={(e) => setCustomInstitution(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter your institution name"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree Type *
                  </label>
                  <select
                    value={degreeType}
                    onChange={(e) => setDegreeType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select degree type</option>
                    {DEGREE_TYPES.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Year of Study *
                  </label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                    <option value="6">Year 6</option>
                    <option value="7">Year 7+</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-blue-600 hover:text-blue-800 py-2 text-sm font-medium transition-colors"
              >
                Forgot Password?
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
