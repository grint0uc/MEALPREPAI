export type GoalType = 'lose' | 'maintain' | 'gain';
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'premium';
export type IngredientCategory =
  | 'proteins'
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'dairy'
  | 'fats_oils'
  | 'spices_herbs'
  | 'condiments'
  | 'legumes'
  | 'nuts_seeds'
  | 'beverages'
  | 'other';

export type ActionType = 'recipe_generation' | 'favorite_saved' | 'shopping_list_created';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  goal_type: GoalType;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  subcategory: string | null;
  unit: string;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  fiber_per_100g: number | null;
  avg_price_per_unit: number | null;
  fridge_life_days: number | null;
  is_common: boolean;
  created_at: string;
}

export interface UserIngredient {
  id: string;
  user_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  added_at: string;
  expires_at: string | null;
  // Joined data
  ingredient?: Ingredient;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  recipe_data: Recipe;
  recipe_name: string;
  cuisine_type: string | null;
  created_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  action_type: ActionType;
  tokens_used: number | null;
  created_at: string;
}

// Recipe type for AI-generated recipes
export interface Recipe {
  id?: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  fridge_life_days: number;
  cuisine_type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  ingredient_match_percentage?: number;
  missing_ingredients?: RecipeIngredient[];
  estimated_cost?: number;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  is_available?: boolean;
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      ingredients: {
        Row: Ingredient;
        Insert: Omit<Ingredient, 'id' | 'created_at'>;
        Update: Partial<Omit<Ingredient, 'id' | 'created_at'>>;
      };
      user_ingredients: {
        Row: UserIngredient;
        Insert: Omit<UserIngredient, 'id' | 'added_at' | 'ingredient'>;
        Update: Partial<Omit<UserIngredient, 'id' | 'user_id' | 'added_at' | 'ingredient'>>;
      };
      user_favorites: {
        Row: UserFavorite;
        Insert: Omit<UserFavorite, 'id' | 'created_at'>;
        Update: Partial<Omit<UserFavorite, 'id' | 'user_id' | 'created_at'>>;
      };
      usage_tracking: {
        Row: UsageTracking;
        Insert: Omit<UsageTracking, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Functions: {
      get_daily_generation_count: {
        Args: { p_user_id: string };
        Returns: number;
      };
    };
  };
}
