'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCookieWarning, setShowCookieWarning] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');

  useEffect(() => {
    if (verified === 'true') {
      // Auto-hide the success message after 5 seconds
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [verified, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setShowCookieWarning(false);

    // Show cookie warning if login takes more than 5 seconds
    const cookieWarningTimer = setTimeout(() => {
      setShowCookieWarning(true);
    }, 5000);

    console.log('[Login] Attempting sign in...');
    const { error } = await signIn(email, password);

    clearTimeout(cookieWarningTimer);

    if (error) {
      console.error('[Login] Sign in error:', error);
      setError(error.message);
      setLoading(false);
      setShowCookieWarning(false);
      return;
    }

    console.log('[Login] Sign in successful, redirecting...');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-secondary-900">Meal Prep AI</h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-secondary-700">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-500">
            Or{' '}
            <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {verified === 'true' && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
              ✓ Email verified successfully! You can now sign in with your credentials.
            </div>
          )}

          {showCookieWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium mb-1">Taking longer than usual?</p>
                  <p className="text-sm">If you&apos;re using Brave browser or have strict cookie blocking enabled, try:</p>
                  <ul className="text-sm mt-2 list-disc list-inside space-y-1">
                    <li>Disable Shields for this site (click the lion icon)</li>
                    <li>Use Chrome, Safari, or Firefox</li>
                    <li>Allow third-party cookies in browser settings</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 text-secondary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm placeholder-secondary-400 text-secondary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/reset-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
