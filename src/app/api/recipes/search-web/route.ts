import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's ingredients from fridge
    const { data: userIngredients, error: ingredientsError } = await supabase
      .from('user_ingredients')
      .select(`
        id,
        quantity,
        unit,
        ingredient:ingredients (
          id,
          name,
          category
        )
      `)
      .eq('user_id', user.id);

    if (ingredientsError) {
      console.error('Error fetching ingredients:', ingredientsError);
      return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
    }

    if (!userIngredients || userIngredients.length === 0) {
      return NextResponse.json({
        error: 'No ingredients found. Please add ingredients to your fridge first.'
      }, { status: 400 });
    }

    // Get user's profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('goal_type, credits, subscription_tier')
      .eq('id', user.id)
      .single();

    // Get user's unit preference
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('unit_system')
      .eq('user_id', user.id)
      .single();

    const unitSystem = userPrefs?.unit_system || 'us';
    const fitnessGoal = userProfile?.goal_type || 'maintain';
    const currentCredits = userProfile?.credits || 0;
    const subscriptionTier = userProfile?.subscription_tier || 'free';

    // Determine how many meals per day based on tier
    // Free: 1 meal/day, All paid tiers (starter/pro/premium): 3 meals/day
    const mealsPerDay = subscriptionTier === 'free' ? 1 : 3;

    // Credit cost for web recipe search (more expensive - verifying real recipes)
    const SEARCH_COST = 100;

    // Check if user has enough credits
    if (currentCredits < SEARCH_COST) {
      return NextResponse.json({
        error: `Insufficient credits. You need ${SEARCH_COST} credits but have ${currentCredits}.`,
        insufficientCredits: true,
        required: SEARCH_COST,
        current: currentCredits
      }, { status: 402 });
    }

    // Format ingredients for search query
    const mainIngredients = userIngredients
      .slice(0, 5) // Use top 5 ingredients
      .map(ui => (ui.ingredient as any).name)
      .join(' ');

    const goalContext = fitnessGoal === 'lose'
      ? 'healthy low calorie'
      : fitnessGoal === 'gain'
      ? 'high protein muscle building'
      : 'balanced healthy';

    // Construct search query
    const searchQuery = `${goalContext} recipes with ${mainIngredients}`;

    console.log('Searching for recipes with query:', searchQuery);

    // Call web search API endpoint
    const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/recipes/fetch-web-recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: searchQuery,
        userIngredients: userIngredients.map(ui => ({
          name: (ui.ingredient as any).name,
          quantity: ui.quantity,
          unit: ui.unit
        })),
        fitnessGoal,
        subscriptionTier,
        mealsPerDay,
        unitSystem
      })
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to fetch web recipes');
    }

    const { recipes } = await searchResponse.json();

    console.log(`Received ${recipes.length} web recipes`);

    // Delete old recipes and meal plan for this user
    console.log('Deleting old recipes and meal plan for user:', user.id);

    const { error: deleteMealPlanError } = await supabase
      .from('meal_plan')
      .delete()
      .eq('user_id', user.id);

    if (deleteMealPlanError) {
      console.error('Error deleting old meal plan:', deleteMealPlanError);
    }

    const { error: deleteRecipesError } = await supabase
      .from('recipes')
      .delete()
      .eq('user_id', user.id);

    if (deleteRecipesError) {
      console.error('Error deleting old recipes:', deleteRecipesError);
    }

    console.log('Old recipes and meal plan deleted');

    // Save new recipes to database
    const recipesToSave = recipes.map((recipe: any) => ({
      user_id: user.id,
      name: recipe.name,
      description: recipe.description,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      servings: recipe.servings,
      fridge_life: 4, // Default fridge life
      ingredients: recipe.ingredients.map((ing: any) => ({
        name: ing.name,
        amount: ing.amount,
        fromFridge: ing.inFridge
      })),
      instructions: recipe.instructions,
      nutrition: recipe.nutrition,
      storage_tips: 'Store in airtight containers in the refrigerator.',
      day_number: recipe.day,
      meal_time: recipe.mealTime || 'dinner',
      source: 'web',
      source_url: recipe.url || null,
    }));

    console.log('Attempting to save recipes:', recipesToSave.length);

    const { data: savedRecipes, error: saveError } = await supabase
      .from('recipes')
      .insert(recipesToSave)
      .select();

    if (saveError) {
      console.error('Error saving recipes:', saveError);
      console.error('Save error code:', saveError.code);
      console.error('Save error message:', saveError.message);
      console.error('Save error hint:', saveError.hint);
      console.error('Save error details:', saveError.details);

      // Check if it's a missing column error
      if (saveError.code === '42703') {
        return NextResponse.json({
          error: 'Database schema needs to be updated',
          details: 'Please run migration 008_add_recipe_source_and_notes.sql in your Supabase SQL Editor to add the required columns (source, source_url).',
          migration: 'supabase/migrations/008_add_recipe_source_and_notes.sql'
        }, { status: 500 });
      }

      return NextResponse.json({
        error: 'Failed to save recipes to database',
        details: saveError.message || saveError.hint || saveError.details || 'Unknown database error',
        code: saveError.code
      }, { status: 500 });
    }

    console.log('New recipes saved successfully');

    // Deduct credits using the database function
    console.log('Attempting to deduct credits:', SEARCH_COST, 'from user:', user.id);

    const { data: deductResult, error: deductError } = await supabase
      .rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: SEARCH_COST,
        p_transaction_type: 'generation', // Using 'generation' since 'web_search' isn't in the CHECK constraint
        p_description: `Searched web for ${recipes.length} recipes`,
        p_metadata: { query: searchQuery, recipe_count: recipes.length }
      });

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      console.error('Deduct error details:', JSON.stringify(deductError, null, 2));
    } else {
      console.log('Credits deducted successfully. Result:', deductResult);
    }

    // Get updated credit balance
    const { data: updatedProfile } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      recipes: savedRecipes,
      message: `Found ${recipes.length} recipes from the web!`,
      creditsRemaining: updatedProfile?.credits || 0,
      creditsUsed: SEARCH_COST
    });

  } catch (error: any) {
    console.error('Web recipe search error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to search for recipes'
    }, { status: 500 });
  }
}
