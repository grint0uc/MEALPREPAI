-- Add recipes and recipe_generations tables for Phase 3
-- Run this in Supabase SQL Editor

-- ============================================
-- RECIPES TABLE (AI-generated meal plans)
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  day_number INTEGER, -- 1-7 for weekly meal plan
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 1,
  fridge_life INTEGER, -- days the meal keeps in fridge
  ingredients JSONB NOT NULL, -- array of {name, amount, fromFridge}
  instructions JSONB NOT NULL, -- array of step strings
  nutrition JSONB, -- {calories, protein, carbs, fats}
  storage_tips TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for recipes
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at);

-- ============================================
-- RECIPE_GENERATIONS TABLE (rate limiting)
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipe_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for recipe_generations
CREATE INDEX IF NOT EXISTS idx_recipe_generations_user_id ON public.recipe_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_generations_created_at ON public.recipe_generations(created_at);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_generations ENABLE ROW LEVEL SECURITY;

-- RECIPES policies
CREATE POLICY "Users can view own recipes" ON public.recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- RECIPE_GENERATIONS policies
CREATE POLICY "Users can view own generations" ON public.recipe_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON public.recipe_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
