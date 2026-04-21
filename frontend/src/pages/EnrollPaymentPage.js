import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const EnrollPaymentPage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { currentUser, dbUser } = useAuth();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  // Redirect to sign-in if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate(`/enroll/${programId}/phone`, { replace: true });
    }
  }, [currentUser, programId, navigate]);

  useEffect(() => {
    if (!programId) return;
    api.get(`/programs/${programId}`)
      .then(res => setProgram(res.data.data))
      .catch(() => setError('Could not load program details.'))
      .finally(() => setLoading(false));
  }, [programId]);

  const handleFreeEnroll = async () => {
    setPaying(true);
    setError('');
    try {
      await api.post('/programs/enroll', { programId: parseInt(programId) });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handlePaidEnroll = async () => {
    setPaying(true);
    setError('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { setError('Payment service unavailable. Try again.'); setPaying(false); return; }

      const orderRes = await api.post('/programs/payment/create-order', { programId: parseInt(programId) });
      const { orderId, amount, currency, keyId } = orderRes.data.data;

      const options = {
        key: keyId,
        amount: amount * 100,
        currency,
        name: 'GradToPro',
        description: program?.title,
        order_id: orderId,
        prefill: {
          name: dbUser?.name || '',
          email: dbUser?.email || '',
        },
        theme: { color: '#FCD34D' },
        handler: async (response) => {
          try {
            await api.post('/programs/payment/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            navigate('/dashboard', { state: { enrolled: true, programTitle: program?.title } });
          } catch (err) {
            setError('Payment verification failed. Contact support.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate payment. Please try again.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error && !program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-xl text-sm">Go Back</button>
        </div>
      </div>
    );
  }

  const isFree = !program?.price || program.price === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center">
          <span className="text-sm font-black text-gray-900">G</span>
        </div>
        <span className="font-bold text-gray-900">GradToPro</span>
        <div className="ml-auto flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-gray-500 font-medium">Secure Checkout</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Enrollment</h1>
          <p className="text-sm text-gray-500 mb-6">Review your program details and complete payment</p>

          {/* Program Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-4">
            <div className="flex gap-4">
              {program?.thumbnail ? (
                <img src={program.thumbnail} alt={program.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 text-base leading-snug mb-1">{program?.title}</h2>
                <p className="text-xs text-gray-500 mb-2">{program?.domain} · {program?.level}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {program?.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {program?.instructor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-4">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Order Summary</h3>
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Program Fee</span>
                <span className="font-semibold text-gray-900">
                  {isFree ? 'Free' : `₹${program?.price?.toLocaleString('en-IN')}`}
                </span>
              </div>
              {!isFree && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="text-gray-500">Included</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-black text-gray-900">
                {isFree ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  `₹${program?.price?.toLocaleString('en-IN')}`
                )}
              </span>
            </div>
          </div>

          {/* User Info */}
          {dbUser && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 mb-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold text-sm">{dbUser.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{dbUser.name}</p>
                <p className="text-xs text-gray-500">{dbUser.email}</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">Enrolling</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={isFree ? handleFreeEnroll : handlePaidEnroll}
            disabled={paying}
            className="w-full py-4 bg-yellow-400 text-gray-900 font-black rounded-2xl text-base hover:bg-yellow-500 transition-all disabled:opacity-60 shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <div className="w-5 h-5 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : isFree ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enroll for Free
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Enroll Now & Pay ₹{program?.price?.toLocaleString('en-IN')}
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secured by Razorpay · 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnrollPaymentPage;
