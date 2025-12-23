# Database Setup Guide

This guide will help you set up and update your Supabase database schema for Meal Prep AI.

## Initial Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Set Environment Variables**
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Running Migrations

All migrations are located in `supabase/migrations/`. They must be run **in order** in your Supabase SQL Editor.

### Step-by-Step Migration Process

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in the following order:

#### Required Migrations (Run in Order)

1. **Main Schema** (`supabase/schema.sql`)
   - Creates base tables: users, ingredients, user_ingredients, user_favorites, usage_tracking
   - Run this first if starting fresh

2. **001 - Recipes Tables** (`001_add_recipes_tables.sql`)
   - Adds recipes and recipe_generations tables
   - Required for AI-generated meal plans

3. **002 - Credits System** (`002_add_credits_system.sql`)
   - Adds credits column to users table
   - Adds credit_transactions table
   - Adds deduct_credits() function
   - Required for pay-per-use model

4. **003 - Meal Time & Favorites** (`003_add_meal_time_and_favorites.sql`)
   - Adds meal_time field to recipes
   - Adds is_favorite flag
   - Adds favorite_ingredients table

5. **004 - Meal Plan Calendar** (`004_add_meal_plan_calendar.sql`)
   - Adds meal_plan table for calendar view
   - Links recipes to specific dates

6. **005 - User Preferences** (`005_add_user_preferences.sql`)
   - Adds user_preferences table
   - Stores unit system (US/metric) preference

7. **006 - Ingredient Pricing** (`006_add_ingredient_pricing.sql`)
   - Updates ingredients table with pricing data
   - Required for cost calculations

8. **007 - Stripe Columns** (`007_add_stripe_columns.sql`)
   - Adds Stripe-related columns to users table
   - Updates subscription_tier constraint

9. **008 - Recipe Source & Notes** (`008_add_recipe_source_and_notes.sql`)
   - ⚠️ **CRITICAL for web recipe search**
   - Adds source, source_url, user_notes, rating columns
   - **Must be run before using web recipe search feature**

### How to Run a Migration

1. Open the migration file in your code editor
2. Copy the entire SQL content
3. Paste it into Supabase SQL Editor
4. Click "Run" or press `Ctrl/Cmd + Enter`
5. Verify there are no errors

### Checking if Migrations are Applied

You can verify migrations by checking if columns exist:

```sql
-- Check if recipes table has 'source' column (migration 008)
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'recipes' AND column_name = 'source';

-- Should return: source

-- Check if users table has 'credits' column (migration 002)
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'credits';

-- Should return: credits
```

## Common Issues

### "Failed to save recipes" Error

**Cause:** Migration 008 hasn't been run
**Solution:** Run `supabase/migrations/008_add_recipe_source_and_notes.sql` in SQL Editor

### "Insufficient credits" Error

**Cause:** Migration 002 hasn't been run or credits column is null
**Solution:**
1. Run `supabase/migrations/002_add_credits_system.sql`
2. Grant yourself credits:
   ```sql
   UPDATE users
   SET credits = 1000
   WHERE email = 'your@email.com';
   ```

### "Function deduct_credits does not exist"

**Cause:** Migration 002 hasn't been run
**Solution:** Run `supabase/migrations/002_add_credits_system.sql`

### RLS Policy Errors

**Cause:** Row Level Security (RLS) policies blocking access
**Solution:** Policies are defined in each migration. Make sure you're authenticated when accessing data.

## Seeding Data

### Seed Ingredients

Run `supabase/seed-ingredients.sql` to populate the ingredients table with 500+ common ingredients:

```bash
# In Supabase SQL Editor, copy and run:
cat supabase/seed-ingredients.sql
```

This will add ingredients with:
- Names and categories
- Nutrition data (calories, protein, carbs, fats)
- Average prices
- Fridge life estimates

## Development Workflow

1. Make schema changes in new migration files (e.g., `009_my_feature.sql`)
2. Test migrations in your development Supabase project
3. Once verified, commit migration files to git
4. Run migrations in production Supabase project

## Troubleshooting

### Check Current Schema

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- List columns for recipes table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'recipes'
ORDER BY ordinal_position;
```

### Reset Everything (⚠️ DANGER - Deletes all data)

```sql
-- Only use in development!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
```

Then re-run all migrations from the beginning.

## Support

If you encounter issues:
1. Check the console logs in your browser dev tools
2. Check Supabase logs in the Supabase dashboard
3. Verify migrations are applied using the SQL queries above
4. Ensure environment variables are correctly set
