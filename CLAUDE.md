# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Meal Prep AI** is a Next.js application that generates personalized meal prep plans based on user-available ingredients and fitness goals. The app combines Anthropic's Claude API for recipe generation with Supabase for authentication and data management, and Stripe for subscription handling.

## Development Commands

- `npm run dev` - Start development server (runs on http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password, magic links)
- **AI**: Anthropic Claude API
- **Payment**: Stripe
- **Frontend state**: React Context (AuthContext)

## Architecture

### Core Layers

1. **Authentication & Authorization**
   - Handled by Supabase Auth in `src/contexts/AuthContext.tsx`
   - Server-side Supabase clients in `src/lib/supabase-server.ts` (for API routes)
   - Browser clients in `src/lib/supabase.ts` (for client components)
   - Auth pages: login, signup, password reset in `src/app/(auth pages)/`
   - Middleware pattern uses server-side clients to validate requests

2. **API Routes** (`src/app/api/`)
   - **Recipe endpoints**: `/recipes/generate`, `/recipes/regenerate`, `/recipes/search-web`, `/recipes/fetch-web-recipes`, `/recipes/mark-cooked`
     - Generate recipes using Claude API based on available ingredients and user fitness goals
     - Handle AI integration and prompt engineering
   - **Ingredient endpoints**: `/ingredients/search` - search ingredient database
   - **Fridge management**: `/fridge/add-purchased` - track user ingredients
   - **Shopping list**: `/shopping-list` - generate shopping lists from recipes
   - **Stripe endpoints**: `/stripe/create-checkout-session`, `/stripe/create-portal-session`, `/stripe/webhook`
     - Handle subscription management and billing

3. **Database Models** (`src/types/database.ts`)
   - `users` - User profiles with subscription tier, fitness goal, and Stripe customer ID
   - `ingredients` - Global ingredient database with nutrition data (calories, protein, carbs, fat, fiber) and cost/storage info
   - `user_ingredients` - User's fridge inventory (quantity, unit, expiration date)
   - `user_favorites` - Saved recipes
   - `usage_tracking` - Track AI token usage and feature usage per user
   - Custom SQL function: `get_daily_generation_count(p_user_id)` - enforce generation limits per subscription tier

4. **Dashboard Pages** (`src/app/dashboard/`)
   - `/` - Main dashboard overview
   - `/generate` - Recipe generation interface
   - `/fridge` - Ingredient inventory management
   - `/shopping` - Shopping list view
   - `/calendar` - Meal planning calendar
   - `/favorites` - Saved recipes
   - `/nutrition` - Nutrition tracking
   - `/settings` - User profile and preferences
   - `/upgrade` - Subscription tier selection

5. **Key Utilities**
   - `src/lib/units.ts` - Unit conversion logic for ingredients
   - `src/lib/recipe-costs.ts` - Calculate estimated meal costs based on ingredient pricing
   - `src/lib/stripe.ts` - Stripe client initialization
   - `src/components/` - Reusable UI components (RecipeCard, RecipeModal, RecipeDetail, etc.)
   - `src/components/layouts/DashboardLayout.tsx` - Shared dashboard layout

### Data Flow for Recipe Generation

1. User adds ingredients to their fridge (stored in `user_ingredients` table)
2. User requests recipe generation via `/api/recipes/generate`
3. API route queries user's ingredients and fitness goal from Supabase
4. Prompt is constructed with available ingredients, fitness goal, and unit conversion instructions
5. Claude API generates recipes with nutrition data and cost estimates
6. Recipes are returned to frontend, optionally saved to `user_favorites`
7. Usage tracked in `usage_tracking` table for limits and analytics

### Subscription Model

- `SubscriptionTier`: 'free', 'starter', 'pro', 'premium' (stored in `users.subscription_tier`)
- Daily generation limits enforced via `get_daily_generation_count()` SQL function
- Stripe integration handles billing and tier upgrades
- `users.stripe_customer_id` maps to Stripe customer for portal and checkout

## Important Implementation Notes

### Anthropic SDK Integration
- The `@anthropic-ai/sdk` is used for Claude API calls in recipe generation routes
- Prompts must include detailed instructions for nutrition calculations and ingredient matching
- See `/recipes/generate` route for prompt engineering pattern

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase operations
- `ANTHROPIC_API_KEY` - Claude API key
- `STRIPE_SECRET_KEY` - Stripe secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

### Database Queries Pattern
- Use Supabase SDK's `.select()` with joins when possible (e.g., `.select('*, ingredient:ingredients(*)')`)
- Always validate user authentication before returning personal data
- User ID comes from `supabase.auth.getUser()` in API routes

### TypeScript Path Aliases
- `@/*` resolves to `./src/*` (configured in tsconfig.json)
- Use `@/lib/`, `@/components/`, `@/contexts/`, `@/app/` for clean imports

## Common Patterns

**Fetching user data in API routes:**
```typescript
const supabase = await createServerSupabaseClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();
```

**Querying Supabase with relationships:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('column, related:related_table(*)')
  .eq('user_id', user.id);
```

**API response patterns:**
- Success: `NextResponse.json({ data })`
- Auth error: `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`
- Validation error: `NextResponse.json({ error: 'message' }, { status: 400 })`
- Server error: `NextResponse.json({ error: 'message' }, { status: 500 })`
