import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ============================================================================
 * WELCOME PAGE - Post-Signup Experience
 * ============================================================================
 *
 * This page shows after successful account creation to:
 * 1. Welcome new users
 * 2. Explain next steps
 * 3. Guide them to explore the platform
 * 4. Collect additional profile info (optional)
 * ============================================================================
 */

const WelcomePage = () => {
  const navigate = useNavigate();
  const { currentUser, dbUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  // Auto-advance welcome steps
  useEffect(() => {
    if (currentStep < 3) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleGetStarted = () => {
    navigate('/programs');
  };

  const handleExplore = () => {
    navigate('/');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-20">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="mb-8">
            {currentStep >= 1 && (
              <div className="animate-fade-in">
                <h1 className="text-6xl mb-4">🎉</h1>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                  Welcome to GradToPro!
                </h1>
              </div>
            )}

            {currentStep >= 2 && (
              <div className="animate-fade-in animation-delay-200">
                <p className="text-xl md:text-2xl text-gray-600 mb-6">
                  Hi {currentUser.displayName || 'there'}! 👋
                </p>
                <p className="text-lg text-gray-600">
                  Your account has been created successfully
                </p>
              </div>
            )}
          </div>

          {currentStep >= 3 && (
            <div className="animate-fade-in animation-delay-400">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">
                  What's Next? 🚀
                </h2>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-2">Explore Programs</h3>
                    <p className="text-blue-100">
                      Discover admin-curated training programs designed to accelerate your career
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold mb-2">Join Webinars</h3>
                    <p className="text-purple-100">
                      Attend free webinars and connect with industry experts
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl">
                    <div className="text-4xl mb-4">🏆</div>
                    <h3 className="text-xl font-semibold mb-2">Get Certified</h3>
                    <p className="text-green-100">
                      Earn industry-recognized certificates and boost your profile
                    </p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    Your Account Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="ml-2 text-gray-900">
                        {currentUser.displayName || 'Not provided'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{currentUser.email}</span>
                    </div>
                    {dbUser?.phone && (
                      <div>
                        <span className="font-medium text-gray-600">Phone:</span>
                        <span className="ml-2 text-gray-900">{dbUser.phone}</span>
                        <span className="ml-2 text-green-600 text-sm">✓ Verified</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className="ml-2 text-green-600 font-medium">✓ Active</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                  >
                    🚀 Explore Programs
                  </button>
                  <button
                    onClick={handleExplore}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    🏠 Go to Homepage
                  </button>
                </div>

                {/* Tips */}
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Complete your profile to get personalized program recommendations</li>
                    <li>• Join our free webinars to network with peers</li>
                    <li>• Enable notifications to stay updated with new programs</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-in-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
