import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

/**
 * ============================================================================
 * AUTHENTICATION CONTEXT - Manages Firebase Authentication
 * ============================================================================
 *
 * This context provides authentication methods and state to the entire app.
 *
 * PHONE AUTHENTICATION FLOW:
 * --------------------------
 * 1. setupRecaptcha() - Creates invisible RecaptchaVerifier
 * 2. signInWithPhoneNumber() - Sends OTP to phone number
 * 3. User receives OTP on their phone
 * 4. confirmationResult.confirm(code) - Verifies OTP
 * 5. After verification, create Email/Password account
 *
 * IMPORTANT NOTES:
 * ---------------
 * - RecaptchaVerifier is REQUIRED by Firebase for phone auth (security measure)
 * - RecaptchaVerifier is invisible to user (runs in background)
 * - Phone authentication is ONLY for verification, not for login
 * - After phone verification, users login with Email/Password
 * - Firebase handles all OTP sending/verification internally
 * ============================================================================
 */

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const response = await api.get('/users/profile');
          setDbUser(response.data.data);
        } catch (error) {
          console.error('❌ Error fetching user profile:', error);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearRecaptcha();
    };
  }, []);

  const clearRecaptcha = () => {
    // 1. Clear Firebase's RecaptchaVerifier wrapper
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (_) {}
      recaptchaVerifierRef.current = null;
    }

    // 2. Reset Google's own reCAPTCHA widget registry —
    //    this is what actually prevents the "already rendered" error
    if (window.grecaptcha) {
      try {
        window.grecaptcha.reset();
      } catch (_) {}
    }

    // 3. Replace the container DOM element entirely so Google's reCAPTCHA
    //    cannot match it to any previously registered widget by reference
    const container = document.getElementById('recaptcha-container');
    if (container) {
      const fresh = document.createElement('div');
      fresh.id = 'recaptcha-container';
      container.parentNode.replaceChild(fresh, container);
    }
  };

  const setupRecaptcha = (containerId) => {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      'expired-callback': () => {
        clearRecaptcha();
      },
    });

    return recaptchaVerifierRef.current;
  };

  const signInWithPhoneNumber = async (phoneNumber) => {
    try {
      // Always clear previous recaptcha to avoid reusing a consumed verifier
      clearRecaptcha();
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const confirmationResult = await firebaseSignInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('❌ Error sending OTP:', error.code, error.message);
      clearRecaptcha();
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('❌ Error signing in:', error.code);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    dbUser,
    loading,
    signInWithPhoneNumber,
    signIn,
    signOut,
    setupRecaptcha,
    clearRecaptcha,
  };

  // Don't render children until we know if user is logged in
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
