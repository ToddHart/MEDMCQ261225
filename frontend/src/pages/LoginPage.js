import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Institutions by Country
const INSTITUTIONS_BY_COUNTRY = {
  "Australia": [
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
    "Western Sydney University"
  ],
  "New Zealand": [
    "University of Auckland",
    "University of Otago",
    "Auckland University of Technology",
    "Victoria University of Wellington",
    "University of Canterbury",
    "Massey University",
    "University of Waikato",
    "Lincoln University"
  ],
  "United Kingdom": [
    "University of Oxford",
    "University of Cambridge",
    "Imperial College London",
    "University College London",
    "King's College London",
    "University of Edinburgh",
    "University of Manchester",
    "University of Bristol",
    "University of Glasgow",
    "University of Birmingham",
    "University of Leeds",
    "University of Sheffield",
    "University of Southampton",
    "University of Liverpool",
    "University of Nottingham",
    "Newcastle University",
    "Cardiff University",
    "Queen's University Belfast",
    "University of Leicester",
    "University of Dundee",
    "University of Aberdeen",
    "St George's University of London",
    "Brighton and Sussex Medical School",
    "Hull York Medical School",
    "Keele University",
    "Lancaster University",
    "Plymouth University",
    "University of Exeter",
    "University of Warwick",
    "Queen Mary University of London"
  ],
  "United States": [
    "Harvard Medical School",
    "Johns Hopkins University",
    "Stanford University",
    "University of California, San Francisco",
    "University of Pennsylvania",
    "Columbia University",
    "Duke University",
    "Yale University",
    "University of Michigan",
    "University of Washington",
    "Northwestern University",
    "University of Chicago",
    "Cornell University",
    "University of Pittsburgh",
    "Vanderbilt University",
    "University of California, Los Angeles",
    "University of California, San Diego",
    "New York University",
    "Emory University",
    "University of North Carolina",
    "Washington University in St. Louis",
    "Baylor College of Medicine",
    "University of Virginia",
    "University of Wisconsin",
    "Ohio State University",
    "University of Texas Southwestern",
    "University of Colorado",
    "University of Minnesota",
    "University of Florida",
    "Boston University"
  ],
  "Canada": [
    "University of Toronto",
    "McGill University",
    "University of British Columbia",
    "McMaster University",
    "University of Alberta",
    "University of Ottawa",
    "Queen's University",
    "Western University",
    "University of Calgary",
    "Dalhousie University",
    "University of Manitoba",
    "University of Saskatchewan",
    "Memorial University of Newfoundland",
    "Northern Ontario School of Medicine",
    "University of Montreal",
    "Laval University",
    "University of Sherbrooke"
  ],
  "Ireland": [
    "Trinity College Dublin",
    "University College Dublin",
    "Royal College of Surgeons in Ireland",
    "University College Cork",
    "National University of Ireland, Galway",
    "University of Limerick"
  ],
  "Singapore": [
    "National University of Singapore",
    "Duke-NUS Medical School",
    "Nanyang Technological University",
    "Lee Kong Chian School of Medicine"
  ],
  "Malaysia": [
    "University of Malaya",
    "Universiti Kebangsaan Malaysia",
    "Universiti Putra Malaysia",
    "Universiti Sains Malaysia",
    "International Medical University",
    "Monash University Malaysia",
    "Taylor's University",
    "UCSI University",
    "Management and Science University",
    "Perdana University"
  ],
  "India": [
    "All India Institute of Medical Sciences (AIIMS), New Delhi",
    "Christian Medical College, Vellore",
    "Armed Forces Medical College, Pune",
    "Maulana Azad Medical College, Delhi",
    "King George's Medical University, Lucknow",
    "Jawaharlal Institute of Postgraduate Medical Education & Research",
    "Grant Medical College, Mumbai",
    "Seth GS Medical College, Mumbai",
    "Kasturba Medical College, Manipal",
    "St. John's Medical College, Bangalore",
    "Lady Hardinge Medical College, Delhi",
    "Madras Medical College, Chennai",
    "BJ Medical College, Ahmedabad",
    "Institute of Medical Sciences, BHU",
    "Government Medical College, Chandigarh"
  ],
  "Other": []
};

// Degree Types by Country
const DEGREE_TYPES_BY_COUNTRY = {
  "Australia": [
    "Bachelor of Medicine / Bachelor of Surgery (MBBS)",
    "Doctor of Medicine (MD)",
    "Bachelor of Medical Science",
    "Graduate Entry Medicine",
    "Bachelor of Clinical Sciences",
    "Other Medical Degree"
  ],
  "New Zealand": [
    "Bachelor of Medicine and Bachelor of Surgery (MBChB)",
    "Bachelor of Medical Science",
    "Graduate Entry Medicine",
    "Other Medical Degree"
  ],
  "United Kingdom": [
    "Bachelor of Medicine, Bachelor of Surgery (MBBS/MBChB)",
    "Bachelor of Medicine (BM)",
    "Graduate Entry Medicine (GEM)",
    "Bachelor of Medical Sciences (BMedSci)",
    "Other Medical Degree"
  ],
  "United States": [
    "Doctor of Medicine (MD)",
    "Doctor of Osteopathic Medicine (DO)",
    "Bachelor of Science in Medicine",
    "Pre-Medical Studies",
    "Other Medical Degree"
  ],
  "Canada": [
    "Doctor of Medicine (MD)",
    "Doctor of Medicine and Master of Surgery (MDCM)",
    "Bachelor of Medical Sciences",
    "Other Medical Degree"
  ],
  "Ireland": [
    "Bachelor of Medicine, Bachelor of Surgery (MB BCh BAO)",
    "Graduate Entry Medicine",
    "Bachelor of Medical Science",
    "Other Medical Degree"
  ],
  "Singapore": [
    "Bachelor of Medicine and Bachelor of Surgery (MBBS)",
    "Doctor of Medicine (MD)",
    "Graduate Entry Medicine",
    "Other Medical Degree"
  ],
  "Malaysia": [
    "Bachelor of Medicine and Bachelor of Surgery (MBBS)",
    "Doctor of Medicine (MD)",
    "Bachelor of Medical Science",
    "Other Medical Degree"
  ],
  "India": [
    "Bachelor of Medicine and Bachelor of Surgery (MBBS)",
    "Bachelor of Dental Surgery (BDS)",
    "Bachelor of Ayurvedic Medicine and Surgery (BAMS)",
    "Bachelor of Homeopathic Medicine and Surgery (BHMS)",
    "Other Medical Degree"
  ],
  "Other": [
    "Bachelor of Medicine / Bachelor of Surgery (MBBS)",
    "Doctor of Medicine (MD)",
    "Graduate Entry Medicine",
    "Other Medical Degree"
  ]
};

// Countries list
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
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  
  // Get institutions and degree types based on selected country
  const [availableInstitutions, setAvailableInstitutions] = useState(INSTITUTIONS_BY_COUNTRY["Australia"]);
  const [availableDegreeTypes, setAvailableDegreeTypes] = useState(DEGREE_TYPES_BY_COUNTRY["Australia"]);
  
  const { login, register } = useAuth();
  const { tenant, getPrimaryColor } = useTenant();
  const navigate = useNavigate();
  
  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  const tenantTagline = tenant?.tagline || 'Medical Student Learning Platform';
  const primaryColor = getPrimaryColor();
  const secondaryColor = tenant?.secondary_color || '#7c3aed';
  
  // Update page title
  useEffect(() => {
    document.title = `Login | ${tenantName}`;
  }, [tenantName]);

  // Update institutions and degree types when country changes
  useEffect(() => {
    const institutions = INSTITUTIONS_BY_COUNTRY[country] || [];
    const degreeTypes = DEGREE_TYPES_BY_COUNTRY[country] || DEGREE_TYPES_BY_COUNTRY["Other"];
    
    setAvailableInstitutions(institutions);
    setAvailableDegreeTypes(degreeTypes);
    
    // Reset selections when country changes
    setInstitution('');
    setDegreeType('');
    setCustomInstitution('');
  }, [country]);

  // Clear error when user starts typing or clicks on form fields
  const clearError = () => {
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        // Validate marketing consent for registration
        if (!marketingConsent) {
          setError('You must accept the marketing communications disclaimer to create a free account.');
          setLoading(false);
          return;
        }
        
        // Include additional registration fields
        const finalInstitution = institution === 'Other' ? customInstitution : institution;
        result = await register(email, password, fullName, {
          institution: finalInstitution,
          current_year: currentYear ? parseInt(currentYear) : null,
          degree_type: degreeType,
          country: country,
          marketing_consent: marketingConsent
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
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
      >
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <svg className="w-10 h-10" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': primaryColor }}
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
                className="w-full text-white py-2 px-4 rounded-lg transition-colors font-medium disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
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
    <div 
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
    >
      {/* Main content area - 90% */}
      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden" style={{ height: '90%' }}>
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full mb-3 sm:mb-4">
              {tenant?.logo_url ? (
                <img src={tenant.logo_url} alt={tenantName} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              ) : (
                <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: primaryColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                  <circle cx="20" cy="10" r="2"/>
                </svg>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{tenantName}</h1>
            <p className="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">{tenantTagline}</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          <div className="mb-4">
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={isLogin ? { color: primaryColor } : {}}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={!isLogin ? { color: primaryColor } : {}}
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
                  {availableInstitutions.length > 0 ? (
                    <select
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                    >
                      <option value="">Select your institution</option>
                      {availableInstitutions.map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customInstitution}
                      onChange={(e) => setCustomInstitution(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Enter your institution name"
                      required
                    />
                  )}
                </div>

                {institution === 'Other' && availableInstitutions.length > 0 && (
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
                    {availableDegreeTypes.map(degree => (
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
                onFocus={clearError}
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
                onFocus={clearError}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              )}
            </div>

            {/* Marketing Consent - Required for registration */}
            {!isLogin && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 border-gray-300 rounded"
                    style={{ accentColor: primaryColor }}
                    required
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold">Marketing Communications Disclaimer *</span>
                    <br />
                    <span className="text-xs text-gray-600">
                      By creating a free account, I consent to receive promotional emails, newsletters, 
                      and marketing communications from {tenantName}. I understand that I can unsubscribe at any time.
                    </span>
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && !marketingConsent)}
              className="w-full text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full py-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: primaryColor }}
              >
                Forgot Password?
              </button>
            )}
          </form>
        </div>
      </div>
      </div>
      
      {/* Purple bottom section - 10% */}
      <div 
        className="w-full"
        style={{ 
          height: '10%', 
          background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` 
        }}
      />
    </div>
  );
};

export default LoginPage;
