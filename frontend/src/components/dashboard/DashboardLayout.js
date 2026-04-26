import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Programs', path: '/programs' },
  { label: 'Interviews', path: '/interviews' },
  { label: 'Certification', path: '/certification' },
];

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dbUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const initials = dbUser?.name
    ? dbUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-[#F5F4EF]">
      <header className="sticky top-0 z-40 border-b border-[#E7E5E4] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
          <div className="grid h-[68px] grid-cols-[auto_1fr_auto] items-center gap-4">
            <Link to="/" className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#E7E5E4] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                {logoFailed ? (
                  <span className="text-sm font-black text-[#E4B61A]">G</span>
                ) : (
                  <img
                    src="/logo.png"
                    alt="GradToPro"
                    onError={() => setLogoFailed(true)}
                    className="h-10 w-10 scale-[2.45] object-contain"
                  />
                )}
              </div>
              <span className="hidden sm:block text-[1.05rem] font-black tracking-tight text-[#111827]">
                Grad<span className="text-[#E4B61A]">ToPro</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8">
              {NAV_ITEMS.map((item) => {
                const active = item.path === '/certification'
                  ? location.pathname.startsWith('/certification')
                  : location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-2 py-2 text-[0.98rem] font-medium transition-colors ${
                      active
                        ? 'text-[#E4B61A]'
                        : 'text-[#334155] hover:text-[#111827]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-3">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4C20D] text-sm font-black text-[#111827] shadow-[0_6px_20px_rgba(228,182,26,0.28)] transition-all focus:outline-none"
                >
                  {dbUser?.photoURL ? (
                    <img
                      src={dbUser.photoURL}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials.slice(0, 1)}</span>
                  )}
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-[#E7E5E4] bg-white py-2 shadow-[0_20px_60px_rgba(15,23,42,0.15)] z-20">
                      <div className="border-b border-[#F1F5F9] px-4 py-3">
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {dbUser?.name || 'User'}
                        </p>
                        <p className="truncate text-xs text-[#94A3B8]">{dbUser?.email || ''}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#334155] hover:bg-[#F8FAFC] transition-all"
                      >
                        <svg className="w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-[#64748B] transition-all hover:bg-[#F8FAFC] hover:text-[#111827] md:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="px-6 py-5 border-b border-[#E7E5E4] flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#E7E5E4] bg-white shadow-sm">
                  {logoFailed ? (
                    <span className="text-sm font-black text-[#E4B61A]">G</span>
                  ) : (
                    <img
                      src="/logo.png"
                      alt="GradToPro"
                      onError={() => setLogoFailed(true)}
                      className="h-9 w-9 scale-[2.45] object-contain"
                    />
                  )}
                </div>
                <span className="text-lg font-black tracking-tight text-[#111827]">
                  Grad<span className="text-[#E4B61A]">ToPro</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-[#94A3B8] hover:text-[#111827]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = item.path === '/certification'
                  ? location.pathname.startsWith('/certification')
                  : location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      active
                        ? 'bg-[#FFF4D1] text-[#111827] font-semibold'
                        : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-4 py-4 border-t border-[#E7E5E4]">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4C20D] text-sm font-black text-[#111827]">
                  <span>{initials.slice(0, 1)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{dbUser?.name || 'User'}</p>
                  <p className="text-xs text-[#94A3B8] truncate">{dbUser?.email || ''}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
