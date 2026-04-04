import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

/**
 * ============================================================================
 * AUTHENTICATION FLOW - Step by Step
 * ============================================================================
 *
 * STEP 1: User enters phone number (+918252188485)
 * STEP 2: RecaptchaVerifier is initialized (invisible, handled by Firebase)
 * STEP 3: signInWithPhoneNumber() is called - Firebase sends OTP via SMS
 * STEP 4: User receives OTP on their phone
 * STEP 5: User enters OTP, we verify it using confirmationResult.confirm(code)
 * STEP 6: After OTP verified → Show signup form
 * STEP 7: User enters Name, Email, Password
 * STEP 8: Create Firebase user with Email/Password using createUserWithEmailAndPassword()
 * STEP 9: Save user to backend database
 * STEP 10: User can now login with Email/Password in future
 *
 * IMPORTANT NOTES:
 * - Phone authentication is ONLY for verification (not for login)
 * - After verification, we create Email/Password account
 * - Future logins will use Email/Password (not phone)
 * - RecaptchaVerifier is required by Firebase for phone auth
 * - OTP is sent automatically by Firebase when signInWithPhoneNumber() is called
 * ============================================================================
 */

const AuthPage = () => {
  const navigate = useNavigate();

  const { signInWithPhoneNumber, signIn, clearRecaptcha } = useAuth();

  // Track which step user is on
  const [step, setStep] = useState('choice'); // choice → phone → otp → signup OR signin

  // Store phone number for later use in signup
  const [phoneNumber, setPhoneNumber] = useState('');

  // Store OTP entered by user
  const [otp, setOtp] = useState('');

  // Store Firebase confirmation result (returned by signInWithPhoneNumber)
  // This object has a .confirm() method to verify the OTP
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Error and loading states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Signup form data (collected after OTP verification)
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Signin form data (for existing users)
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
  });

  /**
   * ============================================================================
   * STEP 1-3: Send OTP to Phone Number
   * ============================================================================
   * This function:
   * 1. Formats phone number to E.164 format (+[country_code][number])
   * 2. Calls Firebase signInWithPhoneNumber()
   * 3. Firebase automatically initializes RecaptchaVerifier
   * 4. Firebase sends OTP via SMS
   * 5. Returns a confirmationResult object for verifying OTP later
   * ============================================================================
   */
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format phone number to E.164 format
      // If user enters: 8252188485 → converts to: +918252188485
      // If user enters: +918252188485 → keeps as is
      const cleaned = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
      const formattedPhone = cleaned.startsWith('+')
        ? cleaned
        : `+91${cleaned}`;

      console.log('📱 Sending OTP to:', formattedPhone);

      // Call Firebase signInWithPhoneNumber()
      // This will:
      // 1. Initialize invisible RecaptchaVerifier (automatic)
      // 2. Send OTP to the phone number via SMS
      // 3. Return a confirmationResult object
      const confirmation = await signInWithPhoneNumber(formattedPhone);

      console.log('✅ OTP sent successfully!');

      // Store confirmationResult to verify OTP in next step
      setConfirmationResult(confirmation);

      // Move to OTP verification step
      setStep('otp');
    } catch (err) {
      console.error('❌ Error sending OTP:', err);

      // Handle common errors with user-friendly messages
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Use format: +918252188485');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Contact support.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================================================================
   * STEP 4-5: Verify OTP Entered by User
   * ============================================================================
   * This function:
   * 1. Takes the OTP code entered by user (6 digits)
   * 2. Calls confirmationResult.confirm(code) to verify with Firebase
   * 3. If valid → moves to signup form
   * 4. If invalid → shows error message
   * ============================================================================
   */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Verifying OTP:', otp);

      // Verify OTP with Firebase
      // confirmationResult.confirm() returns a UserCredential if valid
      await confirmationResult.confirm(otp);

      console.log('✅ OTP verified successfully!');

      // OTP is valid - move to signup form
      setStep('signup');
    } catch (err) {
      console.error('❌ Error verifying OTP:', err);

      // Handle invalid OTP
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please request a new one.');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================================================================
   * STEP 6-9: Create Email/Password Account After OTP Verification
   * ============================================================================
   * This function:
   * 1. Takes Name, Email, Password from signup form
   * 2. Creates Firebase user with Email/Password (NOT phone)
   * 3. Updates user profile with display name
   * 4. Saves user to backend database with phone number
   * 5. User can now login with Email/Password in future
   *
   * IMPORTANT: Phone was ONLY used for verification, not for login!
   * ============================================================================
   */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📝 Creating user account...');

      // Create Firebase user with Email and Password
      // This creates a new user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupData.email,
        signupData.password
      );

      console.log('✅ Firebase user created:', userCredential.user.uid);

      // Update user's display name in Firebase
      await updateProfile(userCredential.user, {
        displayName: signupData.name,
      });

      console.log('✅ Display name updated');

      // Register user in backend database
      // This saves user details to PostgreSQL
      await api.post('/users/create', {
        firebaseUid: userCredential.user.uid,
        phone: phoneNumber, // Phone number we verified earlier
        name: signupData.name,
        email: signupData.email,
      });

      console.log('✅ User saved to database');
      console.log('🎉 Account created successfully!');

      // Redirect to my courses
      navigate('/my-courses');
    } catch (err) {
      console.error('❌ Error creating account:', err);

      // Handle common signup errors
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Try signing in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================================================================
   * STEP 10: Sign In with Email/Password (For Existing Users)
   * ============================================================================
   * This function:
   * 1. Takes Email and Password from signin form
   * 2. Signs in user using Firebase signInWithEmailAndPassword()
   * 3. Redirects to home page
   *
   * NOTE: This is for users who already created an account
   * They login with Email/Password, NOT phone number
   * ============================================================================
   */
  const handleSignin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔑 Signing in user...');

      // Sign in with Firebase
      await signIn(signinData.email, signinData.password);

      console.log('✅ Sign in successful!');

      // Redirect to my courses
      navigate('/my-courses');
    } catch (err) {
      console.error('❌ Error signing in:', err);

      // Handle signin errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Try again later.');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // UI RENDER
  // ============================================================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {step === 'choice' && 'Welcome to GradToPro'}
            {step === 'phone' && 'Verify Your Phone Number'}
            {step === 'otp' && 'Enter Verification Code'}
            {step === 'signup' && 'Complete Your Profile'}
            {step === 'signin' && 'Sign In to Your Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'choice' && 'Get started with your learning journey'}
            {step === 'phone' && 'Enter your phone number to receive OTP'}
            {step === 'otp' && 'Enter the 6-digit code sent to your phone'}
            {step === 'signup' && 'Set up your email and password for future logins'}
            {step === 'signin' && 'Use your email and password to sign in'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* ========== STEP 0: Choice Screen ========== */}
        {step === 'choice' && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('phone')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              📱 Create New Account
            </button>
            <button
              onClick={() => setStep('signin')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              🔑 Already Have an Account? Sign In
            </button>
          </div>
        )}

        {/* ========== STEP 1: Phone Number Entry ========== */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="mt-8 space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (with country code)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="+918252188485"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? ' Sending...' : ' Send OTP'}
              </button>
            </div>
          </form>
        )}

        {/* ========== STEP 2: OTP Verification ========== */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength="6"
                pattern="[0-9]{6}"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="appearance-none relative block w-full px-4 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-3xl tracking-widest font-bold"
                placeholder="000000"
                autoComplete="one-time-code"
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                📱 Check your phone for the 6-digit code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '🔐 Verifying...' : '🔐 Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                clearRecaptcha();
                setStep('phone');
                setOtp('');
                setError('');
              }}
              className="w-full text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              ← Didn't receive code? Try again
            </button>
          </form>
        )}

        {/* ========== STEP 3: Signup Form (After OTP Verified) ========== */}
        {step === 'signup' && (
          <form onSubmit={handleSignup} className="mt-8 space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-sm text-green-700">
                ✅ Phone verified! Now set up your account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="john@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  📧 Use this email to sign in later
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">
                  🔒 Minimum 6 characters
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '🚀 Creating Account...' : '🚀 Create Account'}
            </button>
          </form>
        )}

        {/* ========== STEP 4: Sign In Form (For Existing Users) ========== */}
        {step === 'signin' && (
          <form onSubmit={handleSignin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  required
                  value={signinData.email}
                  onChange={(e) => setSigninData({ ...signinData, email: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  required
                  value={signinData.password}
                  onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? '🔑 Signing In...' : '🔑 Sign In'}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
              >
                Create one now
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
