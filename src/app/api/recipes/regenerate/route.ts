import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    const { recipeId } = body; // if provided, regenerate single recipe; otherwise regenerate all

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('goal_type, credits, subscription_tier')
      .eq('id', user.id)
      .single();

    const currentCredits = userProfile?.credits || 0;
    const subscriptionTier = userProfile?.subscription_tier || 'free';
    const fitnessGoal = userProfile?.goal_type || 'maintain';

    // Determine credit cost
    const FULL_REGEN_COST = 50;
    const SINGLE_REGEN_COST = 20;
    const creditCost = recipeId ? SINGLE_REGEN_COST : FULL_REGEN_COST;

    // Check if user has enough credits
    if (currentCredits < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. You need ${creditCost} credits but have ${currentCredits}.`,
        insufficientCredits: true,
        required: creditCost,
        current: currentCredits
      }, { status: 402 });
    }

    // Get user's ingredients
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

    if (ingredientsError || !userIngredients || userIngredients.length === 0) {
      return NextResponse.json({
        error: 'No ingredients found in your fridge.'
      }, { status: 400 });
    }

    const ingredientsList = userIngredients
      .map(ui => {
        const ing = ui.ingredient as any;
        return `- ${ing.name} (${ui.quantity} ${ui.unit})`;
      })
      .join('\n');

    // Determine how many meals per day based on tier
    // Free: 1 meal/day, All paid tiers (starter/pro/premium): 3 meals/day
    const mealsPerDay = subscriptionTier === 'free' ? 1 : 3;
    const totalRecipes = recipeId ? 1 : (7 * mealsPerDay);

    let prompt = '';

    if (recipeId) {
      // Single recipe regeneration
      const { data: oldRecipe } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .eq('user_id', user.id)
        .single();

      if (!oldRecipe) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
      }

      prompt = `You are a professional meal prep chef. Generate ONE new recipe to replace an existing one.

AVAILABLE INGREDIENTS:
${ingredientsList}

FITNESS GOAL: ${fitnessGoal === 'lose' ? 'Lose Weight' : fitnessGoal === 'gain' ? 'Build Muscle' : 'Maintain Weight'}

REQUIREMENTS:
- Create a DIFFERENT recipe than "${oldRecipe.name}"
- Should be meal-prep friendly (keeps well for 3-5 days)
- Maximize use of available ingredients
- MUST BE FOR 1 SERVING ONLY - this is critical
- Include nutrition info (protein, carbs, fats, calories) PER SINGLE SERVING
- All ingredient amounts must be for 1 SERVING

FORMAT AS JSON:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 1,
  "fridgeLife": 4,
  "ingredients": [{"name": "ingredient", "amount": "1/2 cup", "fromFridge": true}],
  "instructions": ["Step 1 for making 1 serving", "Step 2"],
  "nutrition": {"calories": 450, "protein": 35, "carbs": 40, "fats": 15},
  "storageTips": "Storage instructions"
}

CRITICAL: servings MUST be 1. All ingredient amounts and nutrition values must be for 1 serving.

Return ONLY the JSON object.`;

    } else {
      // Full week regeneration
      prompt = `You are a professional meal prep chef. Generate a complete weekly meal plan (7 days, ${mealsPerDay} meal${mealsPerDay > 1 ? 's' : ''} per day).

AVAILABLE INGREDIENTS:
${ingredientsList}

FITNESS GOAL: ${fitnessGoal === 'lose' ? 'Lose Weight (calorie deficit, high protein)' : fitnessGoal === 'gain' ? 'Build Muscle (high protein, moderate carbs)' : 'Maintain Weight (balanced nutrition)'}

REQUIREMENTS:
1. Create ${totalRecipes} unique recipes${mealsPerDay > 1 ? ` (${mealsPerDay} meals per day for 7 days)` : ' (1 per day)'}
2. Each recipe should maximize use of available ingredients
3. ALL RECIPES MUST BE FOR 1 SERVING - this is critical for proper nutrition tracking
4. Include macro breakdown (protein, carbs, fats, calories) PER SINGLE SERVING
5. All ingredient amounts should be for 1 SERVING
6. Meal-prep friendly (keeps 3-5 days)
7. Include prep/cook time, detailed instructions, storage tips

FORMAT AS JSON:
{
  "recipes": [
    {
      "day": 1,
      "mealTime": "breakfast",
      "name": "Recipe Name",
      "description": "Brief description",
      "prepTime": 15,
      "cookTime": 30,
      "servings": 1,
      "fridgeLife": 4,
      "ingredients": [{"name": "ingredient", "amount": "1/2 cup", "fromFridge": true}],
      "instructions": ["Step 1 for making 1 serving"],
      "nutrition": {"calories": 450, "protein": 35, "carbs": 40, "fats": 15},
      "storageTips": "Storage instructions"
    }
  ]
}

CRITICAL: servings MUST always be 1. All ingredient amounts and nutrition values must be for 1 serving.

${mealsPerDay > 1 ? 'For each day, include breakfast, lunch, and dinner. Set mealTime to "breakfast", "lunch", or "dinner".' : 'Set mealTime to "dinner" for all recipes.'}

Return ONLY the JSON object.`;
    }

    console.log(`Calling Claude API for ${recipeId ? 'single' : 'full'} regeneration...`);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: recipeId ? 2000 : 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    let parsedData;
    try {
      // Clean response in case of markdown wrapping
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json({
        error: 'Failed to parse recipe data. Please try again.'
      }, { status: 500 });
    }

    if (recipeId) {
      // Single recipe regeneration - parsedData is the recipe object directly
      const { data: updatedRecipe, error: updateError } = await supabase
        .from('recipes')
        .update({
          name: parsedData.name,
          description: parsedData.description,
          prep_time: parsedData.prepTime,
          cook_time: parsedData.cookTime,
          servings: parsedData.servings,
          fridge_life: parsedData.fridgeLife,
          ingredients: parsedData.ingredients,
          instructions: parsedData.instructions,
          nutrition: parsedData.nutrition,
          storage_tips: parsedData.storageTips,
        })
        .eq('id', recipeId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating recipe:', updateError);
        return NextResponse.json({ error: 'Failed to save recipe' }, { status: 500 });
      }

      // Deduct credits
      await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_transaction_type: 'single_recipe_regen',
        p_description: `Regenerated recipe: ${parsedData.name}`,
        p_metadata: { recipe_id: recipeId }
      });

      const { data: updatedProfile } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      return NextResponse.json({
        recipe: updatedRecipe,
        message: 'Recipe regenerated successfully!',
        creditsRemaining: updatedProfile?.credits || 0,
        creditsUsed: creditCost
      });

    } else {
      // Full week regeneration - delete old recipes and insert new ones
      await supabase
        .from('recipes')
        .delete()
        .eq('user_id', user.id);

      const recipesToSave = parsedData.recipes.map((recipe: any) => ({
        user_id: user.id,
        name: recipe.name,
        description: recipe.description,
        prep_time: recipe.prepTime,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        fridge_life: recipe.fridgeLife,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        nutrition: recipe.nutrition,
        storage_tips: recipe.storageTips,
        day_number: recipe.day,
        meal_time: recipe.mealTime || 'dinner',
      }));

      const { data: savedRecipes, error: saveError } = await supabase
        .from('recipes')
        .insert(recipesToSave)
        .select();

      if (saveError) {
        console.error('Error saving recipes:', saveError);
        return NextResponse.json({ error: 'Failed to save recipes' }, { status: 500 });
      }

      // Deduct credits
      await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_transaction_type: 'regeneration',
        p_description: `Regenerated ${parsedData.recipes.length} recipes`,
        p_metadata: { recipe_count: parsedData.recipes.length }
      });

      const { data: updatedProfile } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      return NextResponse.json({
        recipes: savedRecipes,
        message: 'Meal plan regenerated successfully!',
        creditsRemaining: updatedProfile?.credits || 0,
        creditsUsed: creditCost
      });
    }

  } catch (error: any) {
    console.error('Regeneration error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to regenerate recipes'
    }, { status: 500 });
  }
}
