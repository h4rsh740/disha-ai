'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 11.3 0 14s.7 5.3 1.9 7.7l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
      />
    </svg>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  const {
    isSignedIn,
    isConfigured,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    demoSignIn,
    error,
    clearError,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  // If already signed in, redirect
  useEffect(() => {
    if (isSignedIn) {
      router.replace(redirectUrl);
    }
  }, [isSignedIn, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await signInWithEmail(email, password);
      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setLocalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setLocalError(null);
    try {
      setSubmitting(true);
      await signInWithGoogle();
      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      setLocalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    demoSignIn('Ravi Sharma', 'ravi.sharma@disha.ai');
    router.push(redirectUrl);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setLocalError('Enter your email to receive a password reset link.');
      return;
    }
    try {
      setSubmitting(true);
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link';
      setLocalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card w-full max-w-md bg-[#15110e] border border-[rgba(246,239,229,0.14)] rounded-md shadow-2xl p-6 md:p-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-medium text-[#f6efe5] tracking-wide">
          Sign In to Disha AI
        </h1>
        <p className="text-xs text-[#b2a69a] mt-1.5">
          Resume your vocational exploration and career roadmap
        </p>
      </div>

      {/* Demo / Unconfigured alert */}
      {!isConfigured && (
        <div className="mb-5 p-3 rounded bg-[rgba(230,155,83,0.08)] border border-[rgba(230,155,83,0.25)] text-xs text-[#e69b53]">
          <div className="flex items-start gap-2">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-[#f6efe5]">Firebase keys not yet set</p>
              <p className="text-[11px] text-[#b2a69a] mt-0.5">
                Add keys to <code className="text-[#e69b53]">.env.local</code> to enable live Firebase Auth, or continue with 1-click Demo Mode.
              </p>
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e69b53] text-[#0a0806] font-semibold text-[11px] hover:bg-[#f5af69] transition-colors"
              >
                Continue in Demo Mode (Ravi Sharma)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error alert */}
      {(localError || error) && (
        <div className="mb-4 p-3 rounded bg-[#963c2f]/20 border border-[#963c2f]/50 text-xs text-[#f6efe5] flex items-center gap-2">
          <AlertCircle size={15} className="text-[#e06c53] flex-shrink-0" />
          <span className="min-w-0 break-words">{localError || error}</span>
        </div>
      )}

      {/* Reset confirmation */}
      {resetSent && (
        <div className="mb-4 p-3 rounded bg-[rgba(120,163,109,0.15)] border border-[rgba(120,163,109,0.3)] text-xs text-[#78a36d] flex items-center gap-2">
          <CheckCircle size={15} className="flex-shrink-0" />
          <span>Password reset email sent! Check your inbox.</span>
        </div>
      )}

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-sm border border-[rgba(246,239,229,0.18)] bg-[#1c1712] hover:bg-[#241c14] text-[#f6efe5] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="flex items-center my-5">
        <div className="flex-1 h-px bg-[rgba(246,239,229,0.1)]" />
        <span className="px-3 text-[11px] uppercase tracking-wider text-[#8a7e72]">
          or continue with email
        </span>
        <div className="flex-1 h-px bg-[rgba(246,239,229,0.1)]" />
      </div>

      {/* Email / Password Form */}
      {!showForgot ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#b2a69a] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-[#8a7e72]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-[#1c1712] border border-[rgba(246,239,229,0.14)] focus:border-[#e69b53] focus:ring-1 focus:ring-[#e69b53] rounded-sm text-xs text-[#f6efe5] placeholder-[#8a7e72] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#b2a69a]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[11px] text-[#e69b53] hover:text-[#f5af69] transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-[#8a7e72]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 bg-[#1c1712] border border-[rgba(246,239,229,0.14)] focus:border-[#e69b53] focus:ring-1 focus:ring-[#e69b53] rounded-sm text-xs text-[#f6efe5] placeholder-[#8a7e72] outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-sm bg-[#e69b53] hover:bg-[#f5af69] text-[#0a0806] font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#b2a69a] mb-1.5">
              Email for Password Reset
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-[#8a7e72]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-[#1c1712] border border-[rgba(246,239,229,0.14)] focus:border-[#e69b53] focus:ring-1 focus:ring-[#e69b53] rounded-sm text-xs text-[#f6efe5] placeholder-[#8a7e72] outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-sm bg-[#e69b53] hover:bg-[#f5af69] text-[#0a0806] font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Send Reset Email</span>}
          </button>

          <button
            type="button"
            onClick={() => setShowForgot(false)}
            className="w-full text-center text-xs text-[#b2a69a] hover:text-[#f6efe5] transition-colors"
          >
            Back to Sign In
          </button>
        </form>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-[rgba(246,239,229,0.1)] text-center text-xs text-[#b2a69a]">
        Don&apos;t have an account?{' '}
        <Link
          href={`/sign-up${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ''}`}
          className="text-[#e69b53] hover:text-[#f5af69] font-medium transition-colors"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="auth-page min-h-screen bg-[#0a0806] text-[#f6efe5] flex flex-col items-center justify-center p-4 relative">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(230, 155, 83, 0.15), transparent 60%)',
        }}
      />

      {/* Brand Header */}
      <div className="relative z-10 mb-6 flex flex-col items-center text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <span className="flex items-center justify-center w-8 h-8 rounded-sm bg-[#963c2f] border border-[rgba(230,155,83,0.3)] text-[#f6efe5] text-lg font-serif">
            दि
          </span>
          <span className="font-serif text-2xl font-normal tracking-[0.14em] text-[var(--ui-text)]">
            DISHA<span className="text-[10px] ml-1 tracking-wider text-[#e69b53]">AI</span>
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#b2a69a] hover:text-[#f6efe5] transition-colors"
        >
          <ArrowLeft size={13} /> Back to explore
        </Link>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <Suspense
          fallback={
            <div className="auth-card w-full max-w-md bg-[#15110e] border border-[rgba(246,239,229,0.14)] rounded-md p-8 text-center text-xs text-[#b2a69a]">
              Loading sign-in...
            </div>
          }
        >
          <SignInContent />
        </Suspense>
      </div>
    </div>
  );
}
