import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

/**
 * ============================================================================
 * MY COURSES PAGE - User Dashboard for Signed In Users
 * ============================================================================
 */

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const { currentUser, dbUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [coursesResponse, enrolledResponse] = await Promise.all([
        api.get('/courses'),
        api.get('/users/courses/enrolled')
      ]);
      setAllCourses(coursesResponse.data.data || []);
      setEnrolledCourses(enrolledResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleBrowseCourses = () => {
    navigate('/courses');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EAEC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4B61A] mx-auto mb-4"></div>
          <p className="text-[#0F1A2E] font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9EAEC]">
      {/* Hero Header */}
      <div className="bg-[#0F1A2E] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#E4B61A] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#E4B61A] rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E4B61A]/20 rounded-full mb-4">
                <span className="w-2 h-2 bg-[#E4B61A] rounded-full animate-pulse"></span>
                <span className="text-[#E4B61A] font-bold text-xs uppercase tracking-wider">My Courses</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white mb-2">
                Welcome back, {currentUser?.displayName || 'Student'}! 👋
              </h1>
              <p className="text-white/60 text-lg">
                Ready to continue your learning journey?
              </p>
            </div>
            <button
              onClick={handleBrowseCourses}
              className="bg-[#E4B61A] text-[#0F1A2E] px-6 py-3 rounded-xl font-bold hover:bg-[#d4a610] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Browse More Courses
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 -mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#0F1A2E]/5 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#E4B61A]/10 rounded-xl flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
              <div>
                <p className="text-3xl font-black text-[#0F1A2E]">{enrolledCourses.length}</p>
                <p className="text-[#0F1A2E]/50 font-medium">Enrolled Courses</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#0F1A2E]/5 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <p className="text-3xl font-black text-[#0F1A2E]">0</p>
                <p className="text-[#0F1A2E]/50 font-medium">Certificates Earned</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#0F1A2E]/5 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">⚡</span>
              </div>
              <div>
                <p className="text-3xl font-black text-[#0F1A2E]">0</p>
                <p className="text-[#0F1A2E]/50 font-medium">Learning Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#0F1A2E]">My Courses</h2>
            </div>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCourses.map((item) => {
                  const course = item.course || item;
                  return (
                  <div key={course.id || Math.random()} className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-[#0F1A2E]/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E]/70 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-[#0F1A2E] mb-2 group-hover:text-[#E4B61A] transition-colors">{course.title}</h3>
                      <p className="text-[#0F1A2E]/60 text-sm mb-4">{course.teacher}</p>
                    </div>
                  </div>
                );
                })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-[#0F1A2E]/5">
              <div className="w-24 h-24 bg-[#E4B61A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0F1A2E] mb-3">No courses enrolled yet</h3>
              <p className="text-[#0F1A2E]/60 mb-8 max-w-md mx-auto">Start your learning journey by enrolling in a course</p>
              <button
                onClick={handleBrowseCourses}
                className="bg-[#E4B61A] text-[#0F1A2E] px-8 py-4 rounded-xl font-bold hover:bg-[#d4a610] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Explore Courses
              </button>
            </div>
          )}
        </div>

        {/* Recommended Programs */}
        {allCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-[#0F1A2E] mb-8">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-[#0F1A2E]/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E]/70 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                      <span className="text-lg font-black text-[#0F1A2E]">₹{course.price}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#0F1A2E] mb-2 group-hover:text-[#E4B61A] transition-colors">{course.title}</h3>
                    <p className="text-[#0F1A2E]/60 text-sm mb-4">{course.teacher}</p>
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="w-full bg-[#E9EAEC] text-[#0F1A2E] py-3 px-4 rounded-xl font-bold hover:bg-[#0F1A2E] hover:text-white transition-all duration-300"
                    >
                      View Program
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;