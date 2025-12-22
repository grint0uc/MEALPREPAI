-- Add meal_time field and favorites functionality
-- Run this in Supabase SQL Editor

-- ============================================
-- UPDATE RECIPES TABLE - Add meal_time field
-- ============================================
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS meal_time TEXT DEFAULT 'dinner';

-- Add is_favorite flag to recipes for quick filtering
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- ============================================
-- FAVORITE INGREDIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorite_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_ingredients_user_id ON public.favorite_ingredients(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
DO $$
BEGIN
  ALTER TABLE public.favorite_ingredients ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own favorite ingredients" ON public.favorite_ingredients;
DROP POLICY IF EXISTS "Users can insert own favorite ingredients" ON public.favorite_ingredients;
DROP POLICY IF EXISTS "Users can delete own favorite ingredients" ON public.favorite_ingredients;

-- Create policies
CREATE POLICY "Users can view own favorite ingredients" ON public.favorite_ingredients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite ingredients" ON public.favorite_ingredients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite ingredients" ON public.favorite_ingredients
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- UPDATE USER_FAVORITES TABLE
-- ============================================
-- Update user_favorites to reference recipe_id instead of storing recipe_data
-- This is for paid users only
ALTER TABLE public.user_favorites
ADD COLUMN IF NOT EXISTS recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_favorites_recipe_id ON public.user_favorites(recipe_id);

-- Add constraint to meal_time if it doesn't exist
DO $$
BEGIN
  ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_meal_time_check
  CHECK (meal_time IN ('breakfast', 'lunch', 'dinner'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
