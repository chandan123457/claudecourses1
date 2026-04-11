import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import useRazorpay from '../hooks/useRazorpay';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoaded: razorpayLoaded, isLoading: razorpayLoading, error: razorpayError } = useRazorpay();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [telegramLink, setTelegramLink] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const [courseResponse, enrollmentResponse] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/users/courses/${id}/enrollment`).catch(() => ({ data: { data: { enrolled: false } } }))
        ]);
        
        const courseData = courseResponse.data.data;
        setCourse(courseData);
        
        const isEnrolled = enrollmentResponse.data?.data?.enrolled || false;
        setEnrolled(isEnrolled);
        if (isEnrolled && courseData?.telegramLink) {
          setTelegramLink(courseData.telegramLink);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    if (!razorpayLoaded) {
      alert('Payment system is loading. Please wait a moment and try again.');
      return;
    }

    if (razorpayError) {
      alert('Payment system failed to load. Please refresh the page and try again.');
      return;
    }

    setEnrolling(true);

    try {
      const orderResponse = await api.post('/payments/create-order', {
        courseId: parseInt(id),
      });

      const { orderId, amount, currency, keyId } = orderResponse.data.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'GradToPro',
        description: course.title,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setEnrolled(true);
            if (course?.telegramLink) {
              setTelegramLink(course.telegramLink);
            }
            alert('Payment successful! You are now enrolled in the program.');
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setEnrolling(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#0F1A2E',
        },
        modal: {
          // Reset button state when user closes/cancels the payment modal
          ondismiss: () => {
            setEnrolling(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert('Payment failed. Please try again.');
        setEnrolling(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to initialize payment. Please try again.');
      setEnrolling(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EAEC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E4B61A] mx-auto mb-4"></div>
          <p className="text-[#0F1A2E] font-medium">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9EAEC]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F1A2E] mb-4">Program not found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-[#E4B61A] font-bold hover:underline"
          >
            ← Back to Training Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9EAEC] py-12">
      <div className="container mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="mb-8 inline-flex items-center gap-2 text-[#0F1A2E] font-bold hover:text-[#E4B61A] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Training Programs
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#0F1A2E]/5">
              {/* Hero Image */}
              <div className="h-80 lg:h-96 overflow-hidden relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A2E]/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 bg-[#E4B61A] text-[#0F1A2E] text-xs font-black uppercase rounded-full">
                    Training Program
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <h1 className="text-3xl lg:text-4xl font-black text-[#0F1A2E] mb-4">{course.title}</h1>
                <p className="text-[#0F1A2E]/70 text-lg mb-8 leading-relaxed">{course.description}</p>

                {/* Syllabus Section */}
                <div className="border-t border-[#0F1A2E]/10 pt-8 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#E4B61A]/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📋</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F1A2E]">Program Syllabus</h3>
                  </div>
                  <div className="bg-[#E9EAEC] rounded-xl p-6">
                    <p className="whitespace-pre-wrap text-[#0F1A2E]/80 leading-relaxed">{course.syllabus}</p>
                  </div>
                </div>

                {/* Instructor Section */}
                <div className="border-t border-[#0F1A2E]/10 pt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#E4B61A]/10 rounded-xl flex items-center justify-center">
                      <span className="text-xl">👨‍🏫</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F1A2E]">Instructor</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#0F1A2E] rounded-full flex items-center justify-center">
                      <span className="text-2xl text-[#E4B61A] font-black">
                        {course.teacher?.charAt(0) || 'T'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#0F1A2E]">{course.teacher}</p>
                      <p className="text-[#0F1A2E]/60">Industry Expert</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24 border border-[#0F1A2E]/5">
              {/* Price */}
              <div className="mb-6">
                <div className="text-4xl font-black text-[#0F1A2E] mb-1">
                  ₹{course.price}
                </div>
                <p className="text-[#0F1A2E]/50 text-sm font-medium">One-time payment</p>
              </div>

              {/* Course Meta */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-3 border-b border-[#0F1A2E]/10">
                  <span className="text-[#0F1A2E]/60 font-medium">Start Date</span>
                  <span className="font-bold text-[#0F1A2E]">{formatDate(course.startDate)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#0F1A2E]/10">
                  <span className="text-[#0F1A2E]/60 font-medium">End Date</span>
                  <span className="font-bold text-[#0F1A2E]">{formatDate(course.endDate)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#0F1A2E]/60 font-medium">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    course.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {course.isActive ? 'Enrolling Now' : 'Coming Soon'}
                  </span>
                </div>
              </div>

              {/* CTA Section */}
              {enrolled ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <span className="text-lg">✓</span>
                    <span className="font-bold">You are enrolled in this program</span>
                  </div>
                  <button
                    onClick={() => navigate('/my-courses')}
                    className="w-full bg-[#0F1A2E] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#E4B61A] hover:text-[#0F1A2E] transition-all duration-300 shadow-lg"
                  >
                    Access Program →
                  </button>
                  {telegramLink && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                      <h4 className="font-bold text-[#0F1A2E] mb-3">Join Community:</h4>
                      <a
                        href={telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.015.136.033.393.019.598z"/>
                        </svg>
                        Join Telegram Group
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || razorpayLoading || !razorpayLoaded}
                  className="w-full bg-[#E4B61A] text-[#0F1A2E] py-4 rounded-xl font-black text-lg hover:bg-[#d4a610] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling
                    ? 'Processing...'
                    : razorpayLoading
                    ? 'Loading Payment...'
                    : 'Enroll Now'}
                </button>
              )}

              {/* Benefits Section */}
              <div className="mt-8 pt-8 border-t border-[#0F1A2E]/10">
                <h4 className="font-bold text-[#0F1A2E] mb-4">What you'll get:</h4>
                <ul className="space-y-3">
                  {[
                    'Lifetime access to program materials',
                    'Live sessions and webinars',
                    'Industry-recognized certification',
                    'Dedicated Telegram community',
                    'Career guidance and support'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </span>
                      <span className="text-[#0F1A2E]/70 text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
