import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/questions', label: 'Questions' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/exam', label: 'Exam Mode' },
    { path: '/ai', label: 'AI Assistant' },
    { path: '/import', label: 'Import' },
    { path: '/subscription', label: 'Subscription' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              {/* Stethoscope Icon */}
              <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                <circle cx="20" cy="10" r="2"/>
              </svg>
              <span className="text-3xl font-bold text-gray-800">MedMCQ</span>
            </Link>

            {/* Navigation - Added more spacing from logo */}
            <nav className="hidden md:flex space-x-1 ml-12">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-3 text-base font-bold rounded-lg transition-all flex items-center justify-center ${
                    location.pathname === link.path
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-3 text-base font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all flex items-center justify-center"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">MedMCQ © 2025 - Medical Student Learning Platform</p>
          <p className="text-xs text-gray-400 mt-1">
            For educational purposes only. Not for actual medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;