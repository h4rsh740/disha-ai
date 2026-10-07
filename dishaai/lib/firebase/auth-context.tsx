'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | AuthUserProfile | null;
  loading: boolean;
  isSignedIn: boolean;
  isConfigured: boolean;
  error: string | null;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  demoSignIn: (name?: string, email?: string) => void;
  clearError: () => void;
}

const DEMO_USER_STORAGE_KEY = 'disha_demo_firebase_user';

function formatFirebaseAuthError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = String((err as { code: unknown }).code);
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Incorrect email or password. Please verify your credentials.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please allow popups for localhost.';
      case 'auth/cancelled-popup-request':
        return 'Another sign-in attempt is currently in progress.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled in Firebase Console. Go to Authentication -> Sign-in method and enable Google and Email/Password.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      default:
        break;
    }
  }
  return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | AuthUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = useMemo(() => isFirebaseConfigured(), []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const demoSignIn = useCallback((name = 'Ravi Sharma', email = 'ravi.sharma@disha.ai') => {
    const demoUser: AuthUserProfile = {
      uid: 'demo-user-' + Date.now(),
      displayName: name,
      email: email,
      photoURL: null,
      isDemo: true,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    }
    setUser(demoUser);
  }, []);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    setError(null);
    if (!auth) {
      demoSignIn('Ravi Sharma', email);
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [demoSignIn]);

  const signUpWithEmail = useCallback(async (email: string, pass: string, name?: string) => {
    setError(null);
    if (!auth) {
      demoSignIn(name || 'Ravi Sharma', email);
      return;
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
        setUser({ ...cred.user, displayName: name });
      }
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [demoSignIn]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (!auth || !googleProvider) {
      demoSignIn('Ravi Sharma (Google Demo)', 'ravi.sharma@example.com');
      return;
    }
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [demoSignIn]);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    if (!auth) return;
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const msg = formatFirebaseAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    }
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error('[Firebase SignOut Error]:', err);
      }
    }
    setUser(null);
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    if (!auth) {
      const timer = setTimeout(() => {
        try {
          const savedDemo = typeof window !== 'undefined' ? localStorage.getItem(DEMO_USER_STORAGE_KEY) : null;
          if (savedDemo) setUser(JSON.parse(savedDemo));
        } catch {}
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(DEMO_USER_STORAGE_KEY);
          }
        } else {
          // If no firebase user, check if user had a local demo user session
          const savedDemo = typeof window !== 'undefined' ? localStorage.getItem(DEMO_USER_STORAGE_KEY) : null;
          if (savedDemo) {
            try {
              setUser(JSON.parse(savedDemo));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      },
      (authErr) => {
        console.error('[Firebase Auth Error]:', authErr);
        setError(formatFirebaseAuthError(authErr));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isSignedIn: Boolean(user),
      isConfigured,
      error,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      resetPassword,
      demoSignIn,
      clearError,
    }),
    [
      user,
      loading,
      isConfigured,
      error,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      resetPassword,
      demoSignIn,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
