-- Create meal_plan table to store calendar planning
CREATE TABLE IF NOT EXISTS public.meal_plan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  meal_time TEXT NOT NULL CHECK (meal_time IN ('breakfast', 'lunch', 'dinner')),
  servings INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, day_of_week, meal_time)
);

-- Create indexes for performance
CREATE INDEX idx_meal_plan_user_id ON public.meal_plan(user_id);
CREATE INDEX idx_meal_plan_recipe_id ON public.meal_plan(recipe_id);

-- Enable RLS
ALTER TABLE public.meal_plan ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own meal plan" ON public.meal_plan;
DROP POLICY IF EXISTS "Users can insert own meal plan" ON public.meal_plan;
DROP POLICY IF EXISTS "Users can update own meal plan" ON public.meal_plan;
DROP POLICY IF EXISTS "Users can delete own meal plan" ON public.meal_plan;

-- Create RLS policies
CREATE POLICY "Users can view own meal plan" ON public.meal_plan
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plan" ON public.meal_plan
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plan" ON public.meal_plan
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plan" ON public.meal_plan
  FOR DELETE USING (auth.uid() = user_id);
