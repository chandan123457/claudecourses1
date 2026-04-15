import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, dbUser, signOut } = useAuth();
  const isHomePage = location.pathname === '/';
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener for sticky nav style enhancements
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header 
      // Using sticky instead of fixed ensures it never breaks out of the flex/block formatting contexts or vanishes behind viewport layers
      className={`sticky top-0 w-full z-[100] transition-all duration-300 ease-in-out border-b ${
        scrolled ? 'bg-white/95 backdrop-blur-lg border-gray-200 shadow-sm' : 'bg-white border-transparent'
      }`}
    >
      {/* 
        Using layout max-width for ultra-wides, w-full for normal.
        Ensuring min-h-[64px] so there's never a layout collapse.
      */}
      <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between font-sans">
        
        {/* === BRAND / LOGO (Left) === */}
        <Link 
          to="/" 
          className="flex flex-shrink-0 items-center gap-2 sm:gap-3 relative z-[101]" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img src="/logo.png" alt="GradToPro Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight" data-purpose="logo">
            Grad<span className="text-primary">ToPro</span>
          </div>
        </Link>
        
        {/* === DESKTOP NAVIGATION (Center) === */}
        {/* lg breakpoint starts at 1024px. Hidden completely below it. */}
        <div className="hidden lg:flex flex-1 items-center justify-center space-x-8 font-medium text-[15px]">
          <a className="hover:text-primary transition-all duration-200 cursor-pointer" onClick={handleHomeClick}>
            Home
          </a>
          <Link to="/courses" className="hover:text-primary transition-all duration-200 cursor-pointer">
            Training Programs
          </Link>
          <Link to="/webinars" className="hover:text-primary transition-all duration-200 cursor-pointer">
            Webinars
          </Link>
        </div>

        {/* === USER ACTIONS (Right) === */}
        <div className="flex items-center gap-2 sm:gap-4 relative z-[101]">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#0F1A2E] hover:bg-[#1a2a45] px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 shadow-sm outline-none"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#E4B61A] rounded-full flex items-center justify-center text-[#0F1A2E] font-black text-xs sm:text-sm">
                  {(dbUser?.name || currentUser?.displayName || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">
                  {dbUser?.name || currentUser?.displayName || 'User'}
                </span>
                <svg className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div 
                className={`absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[102] origin-top-right transition-all duration-200 ${
                  showDropdown ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Signed in as</p>
                  <p className="text-sm font-bold text-[#0F1A2E] truncate">{dbUser?.email || currentUser?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setIsMobileMenuOpen(false);
                    navigate('/my-courses');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">📚</span>
                  <span className="font-semibold text-gray-700">My Courses</span>
                </button>
                <div className="h-[1px] w-full bg-gray-100 my-1" />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 group text-red-600"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                  <span className="font-semibold">Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/auth?mode=signin"
              className="bg-primary text-[#0F1A2E] px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
              Sign In
            </Link>
          )}

          {/* === HAMBURGER BUTTON (Mobile/Tablet Only) === */}
          <button
            className="lg:hidden ml-1 sm:ml-2 p-2 -mr-2 text-gray-700 hover:text-primary transition-colors focus:outline-none rounded-lg hover:bg-gray-100 active:bg-gray-200 flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* === MOBILE NAVIGATION MENU OVERLAY === */}
      <div 
        className={`lg:hidden absolute top-auto left-0 w-full bg-white shadow-2xl border-b border-gray-100 z-[90] overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[400px] opacity-100 flex flex-col' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-6 py-6 flex flex-col gap-5">
          <a
            className="flex items-center text-lg font-bold text-gray-800 hover:text-primary hover:translate-x-2 transition-all cursor-pointer"
            onClick={handleHomeClick}
          >
            Home
          </a>
          <div className="h-[1px] w-full bg-gray-100" />
          <Link 
            to="/courses" 
            className="flex items-center text-lg font-bold text-gray-800 hover:text-primary hover:translate-x-2 transition-all cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Training Programs
          </Link>
          <div className="h-[1px] w-full bg-gray-100" />
          <Link 
            to="/webinars" 
            className="flex items-center text-lg font-bold text-gray-800 hover:text-primary hover:translate-x-2 transition-all cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Webinars
          </Link>
        </div>
      </div>
      
      {/* Background Dimmer for Mobile Menu (Optional visual polish) */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 top-[100%] h-screen bg-black/20 backdrop-blur-sm z-[80]"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;
