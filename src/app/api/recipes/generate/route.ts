import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUnitInstructions } from '@/lib/units';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
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

    // Get user's profile with credits and fitness goal
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

    // Credit cost for AI generation
    const GENERATION_COST = 50;

    // Check if user has enough credits
    if (currentCredits < GENERATION_COST) {
      return NextResponse.json({
        error: `Insufficient credits. You need ${GENERATION_COST} credits but have ${currentCredits}. Upgrade or purchase more credits!`,
        insufficientCredits: true,
        required: GENERATION_COST,
        current: currentCredits
      }, { status: 402 }); // 402 Payment Required
    }

    // Format ingredients for the prompt
    const ingredientsList = userIngredients
      .map(ui => {
        const ing = ui.ingredient as any;
        return `- ${ing.name} (${ui.quantity} ${ui.unit})`;
      })
      .join('\n');

    // Determine how many meals per day based on tier
    // Free: 1 meal/day, All paid tiers (starter/pro/premium): 3 meals/day
    const mealsPerDay = subscriptionTier === 'free' ? 1 : 3;
    const totalRecipes = 7 * mealsPerDay;

    // Create the prompt for Claude
    const unitInstructions = getUnitInstructions(unitSystem);

    const prompt = `You are a professional meal prep chef and nutritionist. Generate a complete weekly meal plan (7 days, ${mealsPerDay} meal${mealsPerDay > 1 ? 's' : ''} per day) based on the following:

AVAILABLE INGREDIENTS:
${ingredientsList}

FITNESS GOAL: ${fitnessGoal === 'lose' ? 'Lose Weight (calorie deficit, high protein)' : fitnessGoal === 'gain' ? 'Build Muscle (high protein, moderate carbs)' : 'Maintain Weight (balanced nutrition)'}

MEASUREMENT SYSTEM:
${unitInstructions}

IMPORTANT UNIT GUIDELINES:
- Be consistent with the measurement system throughout all recipes
- Use appropriate units for each ingredient type (weight for solids, volume for liquids)
- For US units, use fractions (1/2, 1/4, 3/4) instead of decimals
- For metric units, use whole numbers or simple decimals (250g, 1.5kg, 500ml)

REQUIREMENTS:
1. Create ${totalRecipes} unique recipes for meal prep${mealsPerDay > 1 ? ` (${mealsPerDay} meals per day for 7 days)` : ' (1 per day)'}
2. Each recipe should maximize use of available ingredients
3. ALL RECIPES MUST BE FOR 1 SERVING - this is critical for proper nutrition tracking
4. Include macro breakdown (protein, carbs, fats, calories) PER SINGLE SERVING
5. All ingredient amounts should be for 1 SERVING
6. Each recipe should be meal-prep friendly (keeps well for 3-5 days)
7. Include prep time, cook time
8. Provide detailed step-by-step instructions
9. Include storage tips for meal prepping
${mealsPerDay > 1 ? '10. For each day, create breakfast, lunch, and dinner recipes with appropriate portion sizes and macros for 1 serving each' : ''}

FORMAT YOUR RESPONSE AS A VALID JSON OBJECT with this exact structure:
{
  "recipes": [
    {
      "day": 1,
      "mealTime": "${mealsPerDay > 1 ? 'breakfast' : 'dinner'}",
      "name": "Recipe Name",
      "description": "Brief description",
      "prepTime": 15,
      "cookTime": 30,
      "servings": 1,
      "fridgeLife": 4,
      "ingredients": [
        {
          "name": "ingredient name",
          "amount": "1/2 cup",
          "fromFridge": true
        }
      ],
      "instructions": [
        "Step 1 instructions for making 1 serving",
        "Step 2 instructions"
      ],
      "nutrition": {
        "calories": 450,
        "protein": 35,
        "carbs": 40,
        "fats": 15
      },
      "storageTips": "Storage instructions"
    }
  ]
}

CRITICAL: servings MUST always be 1. All ingredient amounts and nutrition values must be for 1 serving.

${mealsPerDay > 1 ? 'IMPORTANT: For each day (1-7), include 3 recipes with mealTime set to "breakfast", "lunch", and "dinner".' : 'IMPORTANT: Set mealTime to "dinner" for all recipes.'}

Return ONLY the JSON object, no additional text or markdown formatting.`;

    console.log('Calling Claude API for recipe generation...');

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: mealsPerDay > 1 ? 16000 : 8000, // More tokens for 3 meals/day
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('Claude API response received');

    // Extract the response text
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse the JSON response
    let recipesData;
    try {
      // Clean response in case of markdown wrapping
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*\n/, '').replace(/\n```\s*$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*\n/, '').replace(/\n```\s*$/, '');
      }

      cleanedResponse = cleanedResponse.trim();
      console.log('Parsing response, first 200 chars:', cleanedResponse.substring(0, 200));

      recipesData = JSON.parse(cleanedResponse);

      if (!recipesData.recipes || !Array.isArray(recipesData.recipes)) {
        console.error('Response missing recipes array:', recipesData);
        return NextResponse.json({
          error: 'Invalid recipe data format. Please try again.'
        }, { status: 500 });
      }

      console.log(`Successfully parsed ${recipesData.recipes.length} recipes`);
    } catch (parseError: any) {
      console.error('Parse error:', parseError.message);
      console.error('Raw response:', responseText);
      return NextResponse.json({
        error: 'Failed to parse recipe data. Please try again.'
      }, { status: 500 });
    }

    // Delete old recipes and meal plan for this user to keep it clean
    console.log('Deleting old recipes and meal plan for user:', user.id);

    // Delete meal plan entries (will cascade delete is not set, so delete manually)
    const { error: deleteMealPlanError } = await supabase
      .from('meal_plan')
      .delete()
      .eq('user_id', user.id);

    if (deleteMealPlanError) {
      console.error('Error deleting old meal plan:', deleteMealPlanError);
    }

    // Delete old recipes
    const { error: deleteRecipesError } = await supabase
      .from('recipes')
      .delete()
      .eq('user_id', user.id);

    if (deleteRecipesError) {
      console.error('Error deleting old recipes:', deleteRecipesError);
    }

    console.log('Old recipes and meal plan deleted');

    // Save new recipes to database
    const recipesToSave = recipesData.recipes.map((recipe: any) => ({
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
      source: 'ai',
    }));

    const { data: savedRecipes, error: saveError } = await supabase
      .from('recipes')
      .insert(recipesToSave)
      .select();

    if (saveError) {
      console.error('Error saving recipes:', saveError);
      return NextResponse.json({
        error: 'Failed to save recipes'
      }, { status: 500 });
    }

    console.log('New recipes saved successfully');

    // Deduct credits using the database function
    const { data: deductResult, error: deductError } = await supabase
      .rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: GENERATION_COST,
        p_transaction_type: 'generation',
        p_description: `Generated ${recipesData.recipes.length} recipes`,
        p_metadata: { recipe_count: recipesData.recipes.length }
      });

    if (deductError) {
      console.error('Error deducting credits:', deductError);
      // Don't fail the request, but log the error
    }

    // Get updated credit balance
    const { data: updatedProfile } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      recipes: savedRecipes,
      message: 'Meal plan generated successfully!',
      creditsRemaining: updatedProfile?.credits || 0,
      creditsUsed: GENERATION_COST
    });

  } catch (error: any) {
    console.error('Recipe generation error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to generate recipes'
    }, { status: 500 });
  }
}
