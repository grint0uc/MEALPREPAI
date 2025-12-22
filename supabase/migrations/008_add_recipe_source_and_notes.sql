-- Add source field to recipes table to track AI vs Web recipes
-- Add notes and rating fields for user feedback
-- Run this in Supabase SQL Editor

-- ============================================
-- ADD SOURCE FIELD TO RECIPES
-- ============================================
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'ai' CHECK (source IN ('ai', 'web'));

-- ============================================
-- ADD NOTES AND RATING FIELDS
-- ============================================
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS user_notes TEXT;

ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS source_url TEXT; -- For web recipes, store original URL

-- ============================================
-- CREATE INDEX FOR SOURCE FILTERING
-- ============================================
CREATE INDEX IF NOT EXISTS idx_recipes_source ON public.recipes(source);
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON public.recipes(rating);
