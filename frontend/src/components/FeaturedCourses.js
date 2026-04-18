import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const FeaturedCourses = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/programs?limit=3');
      setPrograms(response.data.programs || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#E9EAEC]">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4B61A] mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (programs.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#E9EAEC]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E4B61A]/10 rounded-full mb-6">
            <span className="w-2 h-2 bg-[#E4B61A] rounded-full"></span>
            <span className="text-[#0F1A2E] font-bold text-sm uppercase tracking-wider">Featured Programs</span>
          </div>
          <h2 className="text-4xl font-black text-[#0F1A2E] mb-4">Training Programs</h2>
          <p className="text-[#0F1A2E]/60 text-lg max-w-2xl mx-auto">
            Industry-focused programs designed to level up your career
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <div
              key={program.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-[#0F1A2E]/5"
            >
              <div className="h-48 overflow-hidden relative">
                {program.thumbnail ? (
                  <img
                    src={program.thumbnail}
                    alt={program.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0F1A2E] to-[#E4B61A]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E]/60 to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#0F1A2E] mb-2 line-clamp-2 group-hover:text-[#E4B61A] transition-colors">{program.title}</h3>
                <p className="text-[#0F1A2E]/60 text-sm mb-4 line-clamp-3">
                  {program.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#0F1A2E]/50">{program.instructor}</span>
                  <span className="text-sm font-bold text-[#0F1A2E]">{program.duration}</span>
                </div>
                <Link
                  to="/programs"
                  className="block w-full bg-[#0F1A2E] text-white text-center py-3 rounded-xl font-bold hover:bg-[#E4B61A] hover:text-[#0F1A2E] transition-all duration-300"
                >
                  Explore Programs
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/programs"
            className="inline-block bg-[#E4B61A] text-[#0F1A2E] px-8 py-4 rounded-xl font-black hover:bg-[#d4a610] transition-all hover:shadow-lg hover:-translate-y-1"
          >
            View All Training Programs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
