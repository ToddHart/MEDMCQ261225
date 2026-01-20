import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { tenant, getPrimaryColor } = useTenant();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef(null);

  // Lock horizontal scroll globally
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
    };
  }, []);

  // Close admin dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if user is admin
  const isAdmin = user?.is_admin === true;

  // Get tenant branding
  const tenantName = tenant?.name || 'MedMCQ';
  const tenantTagline = tenant?.tagline || 'Medical Student Learning Platform';
  const primaryColor = getPrimaryColor();
  const footerCompany = tenant?.footer_company || 'ABUNDITA INVESTMENTS PTY LTD';
  const footerAbn = tenant?.footer_abn || '55 100 379 299';
  const footerAddress = tenant?.footer_address || '2/24 Edgar St, Coffs Harbour NSW 2450, Australia';

  // Desktop navigation links (all pages)
  const desktopNavLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/questions', label: 'Questions', icon: '📝' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/exam', label: 'Exam Mode', icon: '🎯' },
    { path: '/ai', label: 'AI Assistant', icon: '🤖' },
    { path: '/import', label: 'Import', icon: '📤' },
    { path: '/subscription', label: 'Subscription', icon: '💳' },
    { path: '/contact', label: 'Contact', icon: '📧' },
  ];

  // Mobile navigation links (hide AI Assistant and Import, add Filters for questions)
  const mobileNavLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/questions', label: 'Questions', icon: '📝' },
    { path: '/questions?showFilters=true', label: 'Question Filters', icon: '🔍' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/exam', label: 'Exam Mode', icon: '🎯' },
    { path: '/subscription', label: 'Subscription', icon: '💳' },
    { path: '/contact', label: 'Contact', icon: '📧' },
  ];

  const navLinks = desktopNavLinks;

  // Add admin links if user is admin (for mobile only - desktop uses dropdown)
  if (isAdmin) {
    mobileNavLinks.push({ path: '/admin', label: 'Admin Dashboard', icon: '⚙️' });
    mobileNavLinks.push({ path: '/crm', label: 'CRM', icon: '👥' });
    mobileNavLinks.push({ path: '/admin/email', label: 'Email Users', icon: '📧' });
    mobileNavLinks.push({ path: '/admin/reported-issues', label: 'Reported Issues', icon: '⚠️' });
  }

  // Admin dropdown items
  const adminDropdownItems = [
    { path: '/crm', label: 'CRM', icon: '👥' },
    { path: '/admin/email', label: 'Email Users', icon: '📧' },
    { path: '/admin', label: 'Admin Dashboard', icon: '⚙️' },
    { path: '/admin/reported-issues', label: 'Reported Issues', icon: '⚠️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden max-w-full w-full">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-50 overflow-visible">
        <div className="container mx-auto px-4 overflow-visible">
          <div className="flex items-center justify-between h-16 overflow-visible">
            {/* Mobile Hamburger Button - LEFT SIDE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Stethoscope Icon or Tenant Logo */}
              {tenant?.logo_url ? (
                <img 
                  src={tenant.logo_url} 
                  alt={tenantName} 
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
              ) : (
                <svg 
                  className="w-8 h-8 sm:w-10 sm:h-10" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={primaryColor} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                  <circle cx="20" cy="10" r="2"/>
                </svg>
              )}
              <span className="text-xl sm:text-3xl font-bold text-gray-800">{tenantName}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1 ml-8 flex-shrink-0 items-center overflow-visible">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-4 text-sm font-bold rounded-lg transition-all flex items-center justify-center whitespace-nowrap ${
                    location.pathname === link.path
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={location.pathname === link.path ? { backgroundColor: primaryColor } : {}}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Admin Dropdown */}
              {isAdmin && (
                <div className="relative" ref={adminDropdownRef}>
                  <button
                    onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                    className={`px-3 py-4 text-sm font-bold rounded-lg transition-all flex items-center justify-center whitespace-nowrap ${
                      location.pathname.startsWith('/admin') || location.pathname === '/crm'
                        ? 'text-white shadow-md bg-red-600'
                        : 'text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Admin
                    <svg className={`ml-1 w-4 h-4 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {adminDropdownOpen && (
                    <div 
                      className="fixed w-48 bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden"
                      style={{ 
                        zIndex: 99999,
                        top: '60px',
                        right: '150px'
                      }}
                    >
                      {adminDropdownItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setAdminDropdownOpen(false)}
                          className={`block px-4 py-3 text-sm font-medium transition-colors ${
                            location.pathname === item.path
                              ? 'bg-red-100 text-red-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Right side: User */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${tenant?.secondary_color || '#7c3aed'})` }}
                >
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {(user?.full_name || user?.email || '').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-gray-700">
                    {(() => {
                      const name = user?.full_name || user?.email?.split('@')[0] || '';
                      const firstName = name.split(' ')[0];
                      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
                    })()}
                  </span>
                  {isAdmin && (
                    <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              
              {/* Desktop Logout */}
              <button
                onClick={handleLogout}
                className="hidden lg:block px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Slide-out - FROM LEFT SIDE */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Slide-out Menu - LEFT SIDE */}
            <div className="lg:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
              {/* Menu Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: primaryColor }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color: primaryColor }}>
                      {(user?.full_name || user?.email || '').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-white">
                    <div className="font-bold text-sm">
                      {(() => {
                        const name = user?.full_name || user?.email?.split('@')[0] || '';
                        return name.split(' ')[0];
                      })()}
                    </div>
                    {isAdmin && (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation Links - Use mobileNavLinks for mobile */}
              <nav className="p-4 space-y-1">
                {mobileNavLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-left transition-all ${
                      location.pathname === link.path
                        ? 'text-white shadow-md'
                        : link.path === '/admin'
                          ? 'text-red-700 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={location.pathname === link.path ? { backgroundColor: primaryColor } : {}}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="font-semibold">{link.label}</span>
                    {location.pathname === link.path && (
                      <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </nav>
              
              {/* Logout Button */}
              <div className="p-4 border-t border-gray-200 mt-auto">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-bold text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-2 sm:px-4 py-2 relative overflow-x-hidden max-w-full" style={{ maxWidth: '100vw', zIndex: 1 }}>
        <div className="max-w-7xl mx-auto w-full overflow-x-hidden max-w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">{tenantName} © 2025 - {tenantTagline}</p>
          <p className="text-xs text-gray-400 mt-1">
            A product of {footerCompany} {footerAbn && `• ABN: ${footerAbn}`}
          </p>
          {footerAddress && (
            <p className="text-xs text-gray-400 mt-1">
              {footerAddress}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            For educational purposes only. Not for actual medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
