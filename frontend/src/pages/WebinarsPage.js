import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const WebinarsPage = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const response = await api.get('/webinars');
      setWebinars(response.data.data || []);
    } catch (error) {
      console.error('Error fetching webinars:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Loading webinars...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Free Webinars
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Join our expert-led webinars and stay ahead in your career.
            Learn from industry professionals and get your questions answered live.
          </p>
        </div>

        {webinars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No webinars available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar) => (
              <div
                key={webinar.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={webinar.image}
                    alt={webinar.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
                    <span className="font-bold">FREE</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 line-clamp-2">{webinar.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {webinar.description}
                  </p>
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm font-semibold text-[#E4B61A] mb-3 text-center bg-yellow-50 p-2 rounded">
                      1 student will be selected as a teaching assistant based on performance
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Instructor</span>
                      <span className="text-sm font-semibold text-gray-800">{webinar.teacher}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Date</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {formatDate(webinar.date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Time</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {formatTime(webinar.time)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/webinars/${webinar.id}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Register Free
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

export default WebinarsPage;
