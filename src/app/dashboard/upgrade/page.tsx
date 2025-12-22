'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { createClient } from '@/lib/supabase';

// Subscription tier info (client-safe, no API keys)
const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    price: 4.99,
    features: [
      '3 meals per day (21 recipes/week)',
      '100 credits per generation',
      'Basic nutrition info',
      'Calendar meal planning',
      'Shopping list',
    ],
  },
  pro: {
    name: 'Pro',
    price: 7.99,
    features: [
      'Everything in Starter',
      'Advanced nutrition dashboard',
      'Daily nutrition breakdown',
      'Macro distribution analysis',
      'Calorie source tracking',
      'Unlimited favorites',
    ],
  },
  premium: {
    name: 'Premium',
    price: 12.99,
    features: [
      'Everything in Pro',
      'Priority feature requests',
      'Early access to new features',
      'Extended recipe generation',
      'Premium recipe database',
    ],
  },
} as const;

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    loadUserTier();

    if (searchParams.get('success')) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }

    if (searchParams.get('canceled')) {
      setShowCanceled(true);
      setTimeout(() => setShowCanceled(false), 5000);
    }
  }, [searchParams]);

  const loadUserTier = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (data) {
      setCurrentTier(data.subscription_tier || 'free');
    }
  };

  const handleUpgrade = async (tier: string) => {
    setLoading(tier);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
        setLoading(null);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('portal');

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to open billing portal');
        setLoading(null);
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
      setLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✅ Successfully subscribed! Your account has been upgraded.
          </div>
        )}

        {/* Canceled Message */}
        {showCanceled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            Payment canceled. You can upgrade anytime.
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-secondary-600">
            Unlock powerful features to optimize your meal planning
          </p>
        </div>

        {/* Current Plan Banner */}
        {currentTier !== 'free' && (
          <div className="mb-8 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-primary-900">
                Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
              </p>
              <p className="text-sm text-primary-700">
                Thank you for being a subscriber!
              </p>
            </div>
            <button
              onClick={handleManageSubscription}
              disabled={loading === 'portal'}
              className="px-4 py-2 bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 disabled:opacity-50"
            >
              {loading === 'portal' ? 'Loading...' : 'Manage Subscription'}
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Free Tier */}
          <div className="border-2 border-secondary-200 rounded-xl p-6 bg-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-secondary-900">$0</span>
                <span className="text-secondary-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-secondary-700">1 meal per day (7 recipes/week)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-secondary-700">100 credits per generation</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-secondary-700">Basic recipe generation</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-secondary-700">Fridge management</span>
              </li>
            </ul>

            <button
              disabled={currentTier === 'free'}
              className="w-full px-4 py-3 bg-secondary-100 text-secondary-700 rounded-lg font-medium disabled:opacity-50"
            >
              {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Starter Tier */}
          <div className="border-2 border-blue-500 rounded-xl p-6 bg-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-secondary-900">
                  ${SUBSCRIPTION_TIERS.starter.price}
                </span>
                <span className="text-secondary-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {SUBSCRIPTION_TIERS.starter.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-secondary-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade('starter')}
              disabled={loading === 'starter' || currentTier === 'starter'}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'starter' ? 'Loading...' : currentTier === 'starter' ? 'Current Plan' : 'Upgrade to Starter'}
            </button>
          </div>

          {/* Pro Tier */}
          <div className="border-2 border-purple-500 rounded-xl p-6 bg-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Best Value
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-secondary-900">
                  ${SUBSCRIPTION_TIERS.pro.price}
                </span>
                <span className="text-secondary-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {SUBSCRIPTION_TIERS.pro.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-secondary-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading === 'pro' || currentTier === 'pro'}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'pro' ? 'Loading...' : currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Premium Tier */}
          <div className="border-2 border-yellow-500 rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Premium
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">Premium</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-secondary-900">
                  ${SUBSCRIPTION_TIERS.premium.price}
                </span>
                <span className="text-secondary-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {SUBSCRIPTION_TIERS.premium.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-secondary-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade('premium')}
              disabled={loading === 'premium' || currentTier === 'premium'}
              className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'premium' ? 'Loading...' : currentTier === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-secondary-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-secondary-600">
                Yes! You can cancel your subscription at any time from the billing portal. You'll retain access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-secondary-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-secondary-600">
                We accept all major credit cards through our secure payment processor, Stripe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-secondary-900 mb-2">Can I upgrade or downgrade later?</h3>
              <p className="text-secondary-600">
                Absolutely! You can change your plan at any time. Upgrades take effect immediately, downgrades at the end of the billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-secondary-900 mb-2">Do you offer refunds?</h3>
              <p className="text-secondary-600">
                We offer a 7-day money-back guarantee. If you're not satisfied, contact support for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
