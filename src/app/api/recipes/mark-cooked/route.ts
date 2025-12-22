import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { parseAmount } from '@/lib/units';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId, servings } = await request.json();

    if (!recipeId || !servings) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Marking recipe as cooked:', { recipeId, servings });

    // Get recipe with ingredients
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id, name, ingredients, servings')
      .eq('id', recipeId)
      .eq('user_id', user.id)
      .single();

    if (recipeError || !recipe) {
      console.error('Recipe not found:', recipeError);
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Get all ingredients from database for fuzzy matching
    const { data: allIngredients } = await supabase
      .from('ingredients')
      .select('id, name');

    if (!allIngredients) {
      return NextResponse.json({ error: 'Failed to load ingredients' }, { status: 500 });
    }

    // Helper function to find matching ingredient
    const findIngredient = (searchName: string) => {
      const searchLower = searchName.toLowerCase();
      const searchTerms = searchLower.split(/[\s(),]+/).filter(t => t.length > 2);

      // Exact match
      let match = allIngredients.find(ing => ing.name.toLowerCase() === searchLower);
      if (match) return match;

      // All terms match
      match = allIngredients.find(ing => {
        const ingName = ing.name.toLowerCase();
        return searchTerms.every(term => ingName.includes(term));
      });
      if (match) return match;

      // Partial match
      match = allIngredients.find(ing => {
        const ingName = ing.name.toLowerCase();
        return searchTerms.some(term => term.length > 3 && ingName.includes(term));
      });

      return match;
    };

    // Calculate serving multiplier
    const servingMultiplier = servings / recipe.servings;

    // Get user's current fridge inventory
    const { data: userIngredients } = await supabase
      .from('user_ingredients')
      .select('id, ingredient_id, quantity, unit')
      .eq('user_id', user.id);

    const fridgeInventory: { [key: number]: any } = {};
    if (userIngredients) {
      userIngredients.forEach((item: any) => {
        fridgeInventory[item.ingredient_id] = item;
      });
    }

    // Process each ingredient in the recipe
    const updates: any[] = [];
    const missing: string[] = [];

    recipe.ingredients.forEach((ing: any) => {
      const ingredient = findIngredient(ing.name);

      if (!ingredient) {
        console.warn('Ingredient not found in database:', ing.name);
        missing.push(ing.name);
        return;
      }

      const userIng = fridgeInventory[ingredient.id];

      if (!userIng) {
        console.warn('Ingredient not in user fridge:', ing.name);
        missing.push(ing.name);
        return;
      }

      // Parse the amount needed using centralized function
      const amountNeeded = parseAmount(ing.amount) * servingMultiplier;

      // Calculate new quantity
      const currentQty = parseFloat(userIng.quantity) || 0;
      const newQty = Math.max(0, currentQty - amountNeeded);

      console.log(`Deducting ${ing.name}: ${currentQty} - ${amountNeeded} = ${newQty}`);

      updates.push({
        id: userIng.id,
        quantity: newQty.toString(),
      });
    });

    // Apply all updates
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('user_ingredients')
        .update({ quantity: update.quantity })
        .eq('id', update.id);

      if (updateError) {
        console.error('Failed to update ingredient:', updateError);
      }
    }

    console.log(`Successfully marked recipe as cooked. Updated ${updates.length} ingredients.`);

    return NextResponse.json({
      success: true,
      updated: updates.length,
      missing: missing.length > 0 ? missing : undefined,
      message: missing.length > 0
        ? `Updated ${updates.length} ingredients. ${missing.length} ingredients were not found in your fridge.`
        : `Successfully updated ${updates.length} ingredients!`
    });

  } catch (error: any) {
    console.error('Mark as cooked error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to mark recipe as cooked'
    }, { status: 500 });
  }
}
