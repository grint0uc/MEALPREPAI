-- Add credits system for tiered pricing
-- Run this in Supabase SQL Editor

-- ============================================
-- UPDATE USERS TABLE - Add credits and subscription fields
-- ============================================

-- Add new columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS credits_reset_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('free', 'starter', 'pro', 'premium')) DEFAULT 'free';

-- Update existing subscription_tier column to match new tiers
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE public.users
ADD CONSTRAINT users_subscription_tier_check
CHECK (subscription_tier IN ('free', 'starter', 'pro', 'premium'));

-- Set initial credits_reset_at for existing users (weekly reset for free tier)
UPDATE public.users
SET credits_reset_at = NOW() + INTERVAL '7 days'
WHERE credits_reset_at IS NULL AND subscription_tier = 'free';

-- Set initial credits_reset_at for paid tiers (monthly reset)
UPDATE public.users
SET credits_reset_at = NOW() + INTERVAL '30 days'
WHERE credits_reset_at IS NULL AND subscription_tier IN ('starter', 'pro', 'premium');

-- ============================================
-- CREDIT_TRANSACTIONS TABLE (track all credit usage)
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for additions, negative for deductions
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'generation',
    'regeneration',
    'single_recipe_regen',
    'weekly_reset',
    'monthly_reset',
    'purchase',
    'subscription_renewal',
    'admin_adjustment'
  )),
  description TEXT,
  metadata JSONB, -- store additional info like recipe_id, purchase_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for credit_transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(transaction_type);

-- ============================================
-- CREDIT_PURCHASES TABLE (one-time credit purchases)
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  credits_amount INTEGER NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for credit_purchases
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON public.credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON public.credit_purchases(status);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- CREDIT_TRANSACTIONS policies
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CREDIT_PURCHASES policies
CREATE POLICY "Users can view own credit purchases" ON public.credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit purchases" ON public.credit_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit purchases" ON public.credit_purchases
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS FOR CREDIT MANAGEMENT
-- ============================================

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM public.users
  WHERE id = p_user_id;

  -- Check if user has enough credits
  IF v_current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE public.users
  SET credits = credits - p_amount
  WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, metadata)
  VALUES (p_user_id, -p_amount, p_transaction_type, p_description, p_metadata);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Add credits
  UPDATE public.users
  SET credits = credits + p_amount
  WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description, metadata)
  VALUES (p_user_id, p_amount, p_transaction_type, p_description, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset credits based on subscription tier (called by cron job)
CREATE OR REPLACE FUNCTION public.reset_user_credits()
RETURNS void AS $$
BEGIN
  -- Reset free tier users (weekly reset to 100 credits)
  UPDATE public.users
  SET
    credits = 100,
    credits_reset_at = NOW() + INTERVAL '7 days'
  WHERE
    subscription_tier = 'free'
    AND credits_reset_at <= NOW();

  -- Reset starter tier users (monthly reset to 400 credits)
  UPDATE public.users
  SET
    credits = 400,
    credits_reset_at = NOW() + INTERVAL '30 days'
  WHERE
    subscription_tier = 'starter'
    AND credits_reset_at <= NOW();

  -- Reset pro tier users (monthly reset to 1000 credits)
  UPDATE public.users
  SET
    credits = 1000,
    credits_reset_at = NOW() + INTERVAL '30 days'
  WHERE
    subscription_tier = 'pro'
    AND credits_reset_at <= NOW();

  -- Reset premium tier users (monthly reset to 2500 credits)
  UPDATE public.users
  SET
    credits = 2500,
    credits_reset_at = NOW() + INTERVAL '30 days'
  WHERE
    subscription_tier = 'premium'
    AND credits_reset_at <= NOW();

  -- Log reset transactions
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  SELECT
    id,
    CASE subscription_tier
      WHEN 'free' THEN 100
      WHEN 'starter' THEN 400
      WHEN 'pro' THEN 1000
      WHEN 'premium' THEN 2500
    END,
    CASE
      WHEN subscription_tier = 'free' THEN 'weekly_reset'
      ELSE 'monthly_reset'
    END,
    'Automatic credit reset'
  FROM public.users
  WHERE credits_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREDIT COST CONSTANTS
-- ============================================
-- These can be referenced in your application code:
-- FULL_GENERATION: 100 credits
-- FULL_REGENERATION: 50 credits
-- SINGLE_RECIPE_REGEN: 20 credits
