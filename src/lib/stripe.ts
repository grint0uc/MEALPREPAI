import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Subscription tier pricing
export const SUBSCRIPTION_TIERS = {
  starter: {
    name: 'Starter',
    price: 4.99,
    priceId: process.env.STRIPE_PRICE_ID_STARTER || '',
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
    priceId: process.env.STRIPE_PRICE_ID_PRO || '',
    features: [
      'Everything in Starter',
      'Advanced nutrition dashboard',
      'Unlimited favorites',
      'Recipe history',
      'Dietary filters',
      'Priority support',
    ],
  },
  premium: {
    name: 'Premium',
    price: 12.99,
    priceId: process.env.STRIPE_PRICE_ID_PREMIUM || '',
    features: [
      'Everything in Pro',
      'Custom meal plans',
      'Grocery delivery integration',
      'Family meal planning',
      'Dedicated support',
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
