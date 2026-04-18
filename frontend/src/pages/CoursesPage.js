import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const CoursesPage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/programs?limit=12');
      setPrograms(response.data.programs || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EAEC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4B61A] mx-auto mb-4"></div>
          <p className="text-[#0F1A2E] font-medium">Loading training programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3]">

      {/* Page Header */}
      <div className="container mx-auto px-6 pt-10 pb-6 text-center">
        <span className="inline-flex items-center gap-2 bg-[#E4B61A]/10 text-[#0F1A2E] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-[#E4B61A] rounded-full"></span>
          Industry-Ready Programs
        </span>
        <h1 className="text-3xl lg:text-4xl font-black text-[#0F1A2E] mb-3 tracking-tight">
          Training <span className="text-[#E4B61A]">Programs</span>
        </h1>
        <p className="text-[#0F1A2E]/55 text-sm max-w-xl mx-auto leading-relaxed">
          Transform your career with industry-leading programs designed by experts.
          Get hands-on experience and land your dream job.
        </p>
      </div>

      <div className="container mx-auto px-6 pb-10">
        {programs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#E4B61A]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-[#0F1A2E] mb-2">No programs available yet</h3>
            <p className="text-[#0F1A2E]/50">New training programs coming soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {programs.map((program) => (
              <div
                key={program.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden flex-shrink-0">
                  {program.thumbnail ? (
                    <img
                      src={program.thumbnail}
                      alt={program.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0F1A2E] to-[#E4B61A]" />
                  )}
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0F1A2E] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {program.isActive ? 'Enrolling Now' : 'Coming Soon'}
                  </span>
                  {/* Bookmark */}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <svg className="w-4 h-4 text-[#0F1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-[#0F1A2E] font-bold text-[15px] leading-snug mb-1 line-clamp-2">
                    {program.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">
                    {program.description}
                  </p>

                  {/* Meta */}
                  <div className="space-y-2 mb-4 mt-auto">
                    {program.duration && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{program.duration}</span>
                      </div>
                    )}
                    {program.level && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>{program.level}</span>
                      </div>
                    )}
                    {program.instructor && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{program.instructor}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to="/programs"
                    className="block w-full bg-[#E4B61A] text-[#0F1A2E] text-center py-2.5 rounded-xl font-bold text-sm hover:bg-[#d4a610] transition-colors"
                  >
                    {currentUser ? 'Browse Programs' : 'Enroll Now'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
