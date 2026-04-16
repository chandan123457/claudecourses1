import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin, createAdminApi } from '../contexts/AdminContext';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, active: true },
  { label: 'Courses', path: '/admin/courses', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
  { label: 'Programs', path: '/admin/programs', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
  { label: 'Webinars', path: '/admin/webinars', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
  { label: 'Users', path: '/admin/users', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
  { label: 'Interviews', path: '/admin/interviews', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg> },
  { label: 'Certifications', path: '/admin/certifications', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminUser, adminLogout } = useAdmin();
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalWebinars: 0,
    activeWebinars: 0,
    totalPrograms: 0,
    totalUsers: 0,
    totalCertifications: 0,
    totalInterviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const adminApi = createAdminApi();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.get('/admin/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1A2E]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4B61A] mx-auto mb-4"></div>
          <p className="text-white/60 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1220] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0F1A2E] border-r border-white/5 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4B61A] flex items-center justify-center flex-shrink-0">
              <span className="text-[#0F1A2E] font-black text-lg">G</span>
            </div>
            {sidebarOpen && (
              <span className="text-xl font-black text-white">
                Grad<span className="text-[#E4B61A]">ToPro</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                item.active
                  ? 'bg-[#E4B61A]/10 text-[#E4B61A]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/5 mt-4">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {sidebarOpen && <span>View Website</span>}
            </Link>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#E4B61A] rounded-full flex items-center justify-center">
              <span className="text-[#0F1A2E] font-black">
                {adminUser?.username?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-white font-medium text-sm">{adminUser?.username || 'Admin'}</p>
                <p className="text-white/40 text-xs">Administrator</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all font-medium text-sm`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="bg-[#0F1A2E]/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Dashboard Overview</h1>
              <p className="text-white/40 text-sm">Welcome back, {adminUser?.username || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Today</p>
                <p className="text-white font-medium text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Courses */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-blue-400 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-full">TOTAL</span>
              </div>
              <p className="text-4xl font-black text-white mb-1">{stats.totalCourses}</p>
              <p className="text-white/40 font-medium">Total Courses</p>
            </div>

            {/* Active Courses */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full">ACTIVE</span>
              </div>
              <p className="text-4xl font-black text-white mb-1">{stats.activeCourses}</p>
              <p className="text-white/40 font-medium">Active Courses</p>
            </div>

            {/* Total Webinars */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-purple-400 text-xs font-bold bg-purple-500/10 px-2 py-1 rounded-full">TOTAL</span>
              </div>
              <p className="text-4xl font-black text-white mb-1">{stats.totalWebinars}</p>
              <p className="text-white/40 font-medium">Total Webinars</p>
            </div>

            {/* Live Webinars */}
            <div className="bg-gradient-to-br from-[#E4B61A]/10 to-[#E4B61A]/5 border border-[#E4B61A]/20 rounded-2xl p-6 hover:border-[#E4B61A]/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#E4B61A]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-[#E4B61A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </div>
                <span className="text-[#E4B61A] text-xs font-bold bg-[#E4B61A]/10 px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#E4B61A] rounded-full animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <p className="text-4xl font-black text-white mb-1">{stats.activeWebinars}</p>
              <p className="text-white/40 font-medium">Live Webinars</p>
            </div>
          </div>

          {/* Extended Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Programs', value: stats.totalPrograms, color: 'from-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400' },
              { label: 'Total Users', value: stats.totalUsers, color: 'from-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' },
              { label: 'Certifications Issued', value: stats.totalCertifications, color: 'from-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
              { label: 'Interview Sessions', value: stats.totalInterviews, color: 'from-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
            ].map(item => (
              <div key={item.label} className={`bg-gradient-to-br ${item.color} to-transparent border ${item.border} rounded-2xl p-5`}>
                <p className={`text-3xl font-black ${item.text} mb-1`}>{item.value}</p>
                <p className="text-white/40 text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Course Management */}
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Course Management</h3>
                    <p className="text-white/40 text-sm">Create and manage training programs</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-white/60 text-sm mb-6">
                  Build premium courses, set pricing, upload content, and manage student enrollments from one place.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/admin/courses"
                    className="flex items-center justify-between w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                  >
                    <span className="text-white font-medium">View All Courses</span>
                    <svg className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="/admin/courses/create"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all font-bold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Course
                  </Link>
                </div>
              </div>
            </div>

            {/* Webinar Management */}
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Webinar Management</h3>
                    <p className="text-white/40 text-sm">Schedule and manage live sessions</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-white/60 text-sm mb-6">
                  Schedule free webinars, manage registrations, and engage with your audience through live sessions.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/admin/webinars"
                    className="flex items-center justify-between w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                  >
                    <span className="text-white font-medium">View All Webinars</span>
                    <svg className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="/admin/webinars/create"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all font-bold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Schedule New Webinar
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin/courses/create"
                className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all group"
              >
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📚</span>
                </div>
                <span className="text-white font-medium text-sm text-center">Add Course</span>
              </Link>

              <Link
                to="/admin/webinars/create"
                className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 rounded-2xl transition-all group"
              >
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎥</span>
                </div>
                <span className="text-white font-medium text-sm text-center">Schedule Webinar</span>
              </Link>

              <Link
                to="/"
                className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/30 rounded-2xl transition-all group"
              >
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌐</span>
                </div>
                <span className="text-white font-medium text-sm text-center">View Website</span>
              </Link>

              <div className="flex flex-col items-center gap-3 p-6 bg-white/5 hover:bg-[#E4B61A]/10 border border-white/5 hover:border-[#E4B61A]/30 rounded-2xl transition-all group cursor-pointer">
                <div className="w-14 h-14 bg-[#E4B61A]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="text-white font-medium text-sm text-center">Analytics</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { label: 'Manage Programs', path: '/admin/programs', emoji: '🎓', color: 'hover:bg-teal-500/10 hover:border-teal-500/30' },
                { label: 'Manage Users', path: '/admin/users', emoji: '👥', color: 'hover:bg-pink-500/10 hover:border-pink-500/30' },
                { label: 'Manage Interviews', path: '/admin/interviews', emoji: '💼', color: 'hover:bg-blue-500/10 hover:border-blue-500/30' },
                { label: 'Certifications', path: '/admin/certifications', emoji: '🏆', color: 'hover:bg-indigo-500/10 hover:border-indigo-500/30' },
              ].map(item => (
                <Link key={item.path} to={item.path}
                  className={`flex flex-col items-center gap-3 p-6 bg-white/5 ${item.color} border border-white/5 rounded-2xl transition-all group`}>
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{item.emoji}</span>
                  </div>
                  <span className="text-white font-medium text-sm text-center">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;