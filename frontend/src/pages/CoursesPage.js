import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
    <div className="min-h-screen bg-[#E9EAEC] py-16">
      <div className="container mx-auto px-6">
        {/* Page Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4B61A]/10 rounded-full mb-6">
            <span className="w-2 h-2 bg-[#E4B61A] rounded-full"></span>
            <span className="text-[#0F1A2E] font-bold text-sm uppercase tracking-wider">Industry-Ready Programs</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-6 text-[#0F1A2E] tracking-tight">
            Training <span className="text-[#E4B61A]">Programs</span>
          </h1>
          <p className="text-[#0F1A2E]/70 text-lg max-w-3xl mx-auto leading-relaxed">
            Transform your career with industry-leading programs designed by experts.
            Get hands-on experience and land your dream job.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-[#E4B61A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-[#0F1A2E] mb-3">No programs available</h3>
            <p className="text-[#0F1A2E]/60 text-lg">New training programs coming soon. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-[#0F1A2E]/5"
              >
                {/* Image Container */}
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E]/60 to-transparent"></div>
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                    <span className="text-2xl font-black text-[#0F1A2E]">₹{course.price}</span>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-[#E4B61A] text-[#0F1A2E] text-xs font-black uppercase rounded-full">
                      {course.isActive ? 'Enrolling Now' : 'Coming Soon'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-[#0F1A2E] line-clamp-2 group-hover:text-[#E4B61A] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[#0F1A2E]/60 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  {/* Course Meta */}
                  <div className="border-t border-[#0F1A2E]/10 pt-4 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0F1A2E]/50 font-medium">Instructor</span>
                      <span className="font-bold text-[#0F1A2E]">{course.teacher}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0F1A2E]/50 font-medium">Start Date</span>
                      <span className="font-semibold text-[#0F1A2E]">
                        {course.startDate ? formatDate(course.startDate) : 'TBA'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0F1A2E]/50 font-medium">End Date</span>
                      <span className="font-semibold text-[#0F1A2E]">
                        {course.endDate ? formatDate(course.endDate) : 'TBA'}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={`/courses/${course.id}`}
                    className="block w-full bg-[#0F1A2E] text-white text-center py-4 rounded-xl font-bold hover:bg-[#E4B61A] hover:text-[#0F1A2E] transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {currentUser ? "View Program Details" : "Enroll Now"}
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
