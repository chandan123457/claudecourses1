import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUserWithEmailAndPassword, updateProfile, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

// Phone → OTP → Profile → Payment enrollment flow for new users
const EnrollVerifyPhonePage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInWithPhoneNumber, clearRecaptcha, currentUser } = useAuth();
  const purchaseToken = searchParams.get('token');
  const freeEnrollment = searchParams.get('free') === '1';

  // If already logged in, skip to payment
  React.useEffect(() => {
    if (currentUser && !purchaseToken && !freeEnrollment) {
      navigate(`/enroll/${programId}/payment`, { replace: true });
    }
  }, [currentUser, freeEnrollment, programId, purchaseToken, navigate]);

  const [step, setStep] = useState('phone'); // phone | otp | profile
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [existingAccountSignInUrl, setExistingAccountSignInUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', password: '' });

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setExistingAccountSignInUrl('');
    setLoading(true);
    try {
      const cleaned = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
      const formatted = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;
      try {
        const check = await api.get(`/users/check-phone/${encodeURIComponent(formatted)}`);
        if (check.data.exists) {
          if (purchaseToken || freeEnrollment) {
            const params = new URLSearchParams({
              mode: 'signin',
              redirect: '/dashboard',
            });
            if (purchaseToken) params.set('claimToken', purchaseToken);
            if (freeEnrollment) params.set('enrollProgramId', programId);
            setExistingAccountSignInUrl(`/auth?${params.toString()}`);
            setError('Phone already registered. Please sign in to link this program to your account.');
          } else {
            setError('Phone already registered. Please sign in to enroll.');
          }
          setLoading(false);
          return;
        }
      } catch (_) {}
      setPhoneNumber(formatted);
      const confirmation = await signInWithPhoneNumber(formatted);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err) {
      if (err.code === 'auth/invalid-phone-number') setError('Invalid phone number format.');
      else if (err.code === 'auth/too-many-requests') setError('Too many attempts. Try again later.');
      else setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      try {
        await result.user.delete();
      } catch (_) {
        await firebaseSignOut(auth);
      }
      setStep('profile');
    } catch (err) {
      if (err.code === 'auth/invalid-verification-code') setError('Invalid OTP. Try again.');
      else if (err.code === 'auth/code-expired') setError('OTP expired. Request a new one.');
      else setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (auth.currentUser) await firebaseSignOut(auth);
      const userCredential = await createUserWithEmailAndPassword(auth, profileData.email, profileData.password);
      await updateProfile(userCredential.user, { displayName: profileData.name });
      await api.post('/users/create', {
        firebaseUid: userCredential.user.uid,
        phone: phoneNumber,
        name: profileData.name,
        email: profileData.email,
      });

      if (purchaseToken) {
        await api.post('/programs/payment/claim', { token: purchaseToken });
      } else if (freeEnrollment) {
        await api.post('/programs/enroll', { programId: parseInt(programId) });
      }

      if (purchaseToken || freeEnrollment) {
        await firebaseSignOut(auth);
        navigate('/auth?mode=signin&redirect=/dashboard', { replace: true });
        return;
      }

      navigate(`/enroll/${programId}/payment`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Email already registered. Please sign in.');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else setError(err.response?.data?.message || err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Recaptcha container (invisible) */}
      <div id="recaptcha-container" />

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
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {['phone', 'otp', 'profile'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${step === s || ['phone','otp','profile'].indexOf(step) > i ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    ['phone','otp','profile'].indexOf(step) > i
                      ? 'bg-green-500 text-white'
                      : step === s
                      ? 'bg-yellow-400 text-gray-900'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {['phone','otp','profile'].indexOf(step) > i ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s === 'phone' ? 'Phone' : s === 'otp' ? 'Verify' : 'Profile'}
                  </span>
                </div>
                {i < 2 && <div className={`flex-1 h-px ${['phone','otp','profile'].indexOf(step) > i ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            {/* STEP: Phone */}
            {step === 'phone' && (
              <>
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify Your Phone Number</h1>
                <p className="text-sm text-gray-500 mb-6">We'll send a one-time code to verify your number</p>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-semibold">+91</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                        className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">
                      <p>{error}</p>
                      {existingAccountSignInUrl && (
                        <button
                          type="button"
                          onClick={() => navigate(existingAccountSignInUrl)}
                          className="mt-2 font-semibold text-red-700 underline"
                        >
                          Sign in and continue
                        </button>
                      )}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 transition-all disabled:opacity-60"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                  Already have an account?{' '}
                  <button onClick={() => navigate(`/auth?mode=signin&redirect=/enroll/${programId}/payment`)} className="text-yellow-600 font-semibold hover:underline">
                    Sign In
                  </button>
                </p>
              </>
            )}

            {/* STEP: OTP */}
            {step === 'otp' && (
              <>
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Enter OTP</h1>
                <p className="text-sm text-gray-500 mb-6">
                  We sent a 6-digit code to <span className="font-semibold text-gray-800">{phoneNumber}</span>
                </p>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-center tracking-[0.3em] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 transition-all disabled:opacity-60"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>

                <button
                  onClick={() => { clearRecaptcha(); setStep('phone'); setOtp(''); setError(''); }}
                  className="w-full mt-3 py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700 transition-all"
                >
                  Change Phone Number
                </button>
              </>
            )}

            {/* STEP: Profile */}
            {step === 'profile' && (
              <>
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Complete Your Profile</h1>
                <p className="text-sm text-gray-500 mb-6">
                  {purchaseToken || freeEnrollment
                    ? 'Create your account to access your enrolled program'
                    : 'Create your account to continue to payment'}
                </p>

                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={profileData.password}
                      onChange={(e) => setProfileData(p => ({ ...p, password: e.target.value }))}
                      placeholder="Min. 6 characters"
                      minLength={6}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 transition-all disabled:opacity-60"
                  >
                    {loading
                      ? 'Creating Account...'
                      : purchaseToken || freeEnrollment
                      ? 'Create Account'
                      : 'Continue to Payment'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollVerifyPhonePage;
