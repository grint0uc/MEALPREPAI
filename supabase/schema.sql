-- Meal Prep AI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  goal_type TEXT CHECK (goal_type IN ('lose', 'maintain', 'gain')) DEFAULT 'maintain',
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'pro')) DEFAULT 'free',
  stripe_customer_id TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INGREDIENTS TABLE (500 items will be seeded)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'proteins',
    'vegetables',
    'fruits',
    'grains',
    'dairy',
    'fats_oils',
    'spices_herbs',
    'condiments',
    'legumes',
    'nuts_seeds',
    'beverages',
    'other'
  )),
  subcategory TEXT,
  unit TEXT NOT NULL DEFAULT 'g',
  calories_per_100g DECIMAL(8,2),
  protein_per_100g DECIMAL(8,2),
  carbs_per_100g DECIMAL(8,2),
  fat_per_100g DECIMAL(8,2),
  fiber_per_100g DECIMAL(8,2),
  avg_price_per_unit DECIMAL(8,2),
  fridge_life_days INTEGER,
  is_common BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster ingredient search
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON public.ingredients USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON public.ingredients(category);

-- ============================================
-- USER_INGREDIENTS (user's fridge contents)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, ingredient_id)
);

-- Create index for faster user ingredient lookups
CREATE INDEX IF NOT EXISTS idx_user_ingredients_user_id ON public.user_ingredients(user_id);

-- ============================================
-- USER_FAVORITES (saved recipes - paid feature)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipe_data JSONB NOT NULL,
  recipe_name TEXT NOT NULL,
  cuisine_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);

-- ============================================
-- USAGE_TRACKING (rate limiting & analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('recipe_generation', 'favorite_saved', 'shopping_list_created')),
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON public.usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_action_type ON public.usage_tracking(action_type);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- INGREDIENTS policies (public read access)
CREATE POLICY "Anyone can view ingredients" ON public.ingredients
  FOR SELECT TO authenticated USING (true);

-- USER_INGREDIENTS policies
CREATE POLICY "Users can view own ingredients" ON public.user_ingredients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredients" ON public.user_ingredients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ingredients" ON public.user_ingredients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredients" ON public.user_ingredients
  FOR DELETE USING (auth.uid() = user_id);

-- USER_FAVORITES policies
CREATE POLICY "Users can view own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- USAGE_TRACKING policies
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to count daily generations for rate limiting
CREATE OR REPLACE FUNCTION public.get_daily_generation_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.usage_tracking
    WHERE user_id = p_user_id
      AND action_type = 'recipe_generation'
      AND created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
