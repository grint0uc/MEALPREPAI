'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function DashboardPage() {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[Dashboard] Auth state:', { loading, user: !!user });

    // Give a bit more time for the session to be established after email confirmation
    const timer = setTimeout(() => {
      if (!loading && !user) {
        console.log('[Dashboard] No user after timeout, redirecting to login');
        router.push('/login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Welcome back{dbUser?.full_name ? `, ${dbUser.full_name}` : ''}!
          </h2>
          <p className="text-secondary-600 mb-6">
            Ready to plan some delicious, fitness-focused meals?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-secondary-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide">
                Your Goal
              </h3>
              <p className="mt-2 text-lg font-semibold text-secondary-900">
                {dbUser?.goal_type === 'lose' && 'Lose Weight'}
                {dbUser?.goal_type === 'maintain' && 'Maintain Weight'}
                {dbUser?.goal_type === 'gain' && 'Build Muscle'}
                {!dbUser?.goal_type && 'Not set'}
              </p>
              {!dbUser?.goal_type && (
                <p className="text-sm text-primary-600 mt-1">Set your goal to get started</p>
              )}
            </div>

            <div className="bg-secondary-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide">
                Subscription
              </h3>
              <p className="mt-2 text-lg font-semibold text-secondary-900">
                {dbUser?.subscription_tier === 'premium' && 'Premium Plan'}
                {dbUser?.subscription_tier === 'pro' && 'Pro Plan'}
                {dbUser?.subscription_tier === 'starter' && 'Starter Plan'}
                {(!dbUser?.subscription_tier || dbUser?.subscription_tier === 'free') && 'Free Plan'}
              </p>
              {(!dbUser?.subscription_tier || dbUser?.subscription_tier === 'free') && (
                <Link
                  href="/dashboard/upgrade"
                  className="text-sm text-primary-600 hover:text-primary-700 mt-1 inline-block"
                >
                  Upgrade for more features →
                </Link>
              )}
            </div>

            <div className="bg-secondary-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-secondary-500 uppercase tracking-wide">
                Available Credits
              </h3>
              <p className="mt-2 text-lg font-semibold text-primary-600">
                {dbUser?.credits || 0} credits
              </p>
              <p className="text-sm text-secondary-600 mt-1">
                {dbUser?.subscription_tier === 'free' || !dbUser?.subscription_tier
                  ? '50 per AI generation'
                  : '50 AI / 100 Web search'}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/dashboard/fridge"
                className="flex items-center justify-center gap-2 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg border-2 border-dashed border-primary-200 transition-colors"
              >
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-primary-700 font-medium">Add Ingredients</span>
              </Link>

              <Link
                href="/dashboard/generate"
                className="flex items-center justify-center gap-2 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg border-2 border-dashed border-primary-200 transition-colors"
              >
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-primary-700 font-medium">Generate Meals</span>
              </Link>

              <Link
                href="/dashboard/favorites"
                className="flex items-center justify-center gap-2 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg border-2 border-dashed border-secondary-200 transition-colors"
              >
                <svg
                  className="h-6 w-6 text-secondary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-secondary-700 font-medium">Favorites</span>
              </Link>

              {(!dbUser?.subscription_tier || dbUser?.subscription_tier === 'free') ? (
                <Link
                  href="/dashboard/upgrade"
                  className="flex items-center justify-center gap-2 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg border-2 border-dashed border-secondary-200 transition-colors"
                >
                  <svg
                    className="h-6 w-6 text-secondary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  <span className="text-secondary-700 font-medium">Upgrade Plan</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard/nutrition"
                  className="flex items-center justify-center gap-2 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg border-2 border-dashed border-secondary-200 transition-colors"
                >
                  <svg
                    className="h-6 w-6 text-secondary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="text-secondary-700 font-medium">Nutrition Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-primary-800">Getting Started</h4>
                <p className="mt-1 text-sm text-primary-700">
                  Start by adding ingredients to your fridge, then generate personalized meal plans
                  optimized for your fitness goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
