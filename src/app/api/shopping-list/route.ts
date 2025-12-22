import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { parseAmount, normalizeUnit, detectIngredientType, UnitSystem } from '@/lib/units';

// Helper to convert an amount to a common base unit for comparison
function toBaseUnit(amount: number, unit: string, ingredientName: string): { value: number; baseUnit: string } {
  const normalizedUnit = normalizeUnit(unit);
  const ingredientType = detectIngredientType(ingredientName);

  // For weight units, convert to grams
  const weightToGrams: { [key: string]: number } = {
    'g': 1,
    'kg': 1000,
    'mg': 0.001,
    'oz': 28.35,
    'lb': 453.592,
  };

  // For volume units, convert to milliliters
  const volumeToMl: { [key: string]: number } = {
    'ml': 1,
    'l': 1000,
    'cup': 236.588,
    'tbsp': 14.787,
    'tsp': 4.929,
    'fl oz': 29.574,
  };

  if (weightToGrams[normalizedUnit]) {
    return { value: amount * weightToGrams[normalizedUnit], baseUnit: 'g' };
  }

  if (volumeToMl[normalizedUnit]) {
    // For solids measured in volume (cups of flour), convert to approximate grams
    if (ingredientType === 'solid') {
      // Approximate: 1 cup ≈ 120g for most solids
      const ml = amount * volumeToMl[normalizedUnit];
      const grams = ml * 0.5; // Rough density factor
      return { value: grams, baseUnit: 'g' };
    }
    return { value: amount * volumeToMl[normalizedUnit], baseUnit: 'ml' };
  }

  // For count-based units (pieces, cloves, etc.), keep as-is
  return { value: amount, baseUnit: normalizedUnit || 'pc' };
}

// Helper to format amount back to user-friendly display
function formatDisplayAmount(baseValue: number, baseUnit: string, targetUnit: string, unitSystem: UnitSystem): string {
  // If units match or can be directly compared
  if (baseUnit === 'g') {
    if (unitSystem === 'metric') {
      if (baseValue >= 1000) {
        return `${(baseValue / 1000).toFixed(1)} kg`;
      }
      return `${Math.round(baseValue)} g`;
    } else {
      // Convert to oz or lb for US system
      if (baseValue >= 453.592) {
        return `${(baseValue / 453.592).toFixed(1)} lb`;
      }
      return `${(baseValue / 28.35).toFixed(1)} oz`;
    }
  }

  if (baseUnit === 'ml') {
    if (unitSystem === 'metric') {
      if (baseValue >= 1000) {
        return `${(baseValue / 1000).toFixed(1)} l`;
      }
      return `${Math.round(baseValue)} ml`;
    } else {
      // Convert to cups for US system
      if (baseValue >= 236.588) {
        return `${(baseValue / 236.588).toFixed(1)} cups`;
      }
      return `${(baseValue / 14.787).toFixed(1)} tbsp`;
    }
  }

  // For count-based units, just return the number
  return `${Math.round(baseValue)} ${baseUnit}`;
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's unit preference
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('unit_system')
      .eq('user_id', user.id)
      .single();

    const unitSystem: UnitSystem = (userPrefs?.unit_system as UnitSystem) || 'us';

    // Get user's current fridge ingredients
    const { data: fridgeIngredients } = await supabase
      .from('user_ingredients')
      .select(`
        quantity,
        unit,
        ingredient:ingredients (
          name,
          category,
          fridge_life_days
        )
      `)
      .eq('user_id', user.id);

    // Get user's meal plan from calendar (only planned meals)
    const { data: mealPlan } = await supabase
      .from('meal_plan')
      .select(`
        servings,
        recipe:recipes (
          id,
          ingredients,
          servings
        )
      `)
      .eq('user_id', user.id);

    if (!mealPlan || mealPlan.length === 0) {
      return NextResponse.json({
        shoppingList: [],
        runningLow: [],
        message: 'No meals planned. Add meals to your calendar first.'
      });
    }

    // Aggregate ingredients needed from planned meals with adjusted servings
    const neededIngredients: { [key: string]: { totalBaseAmount: number; baseUnit: string; originalUnit: string; category: string } } = {};

    mealPlan.forEach((meal: any) => {
      if (!meal.recipe) return;

      const servingMultiplier = meal.servings / meal.recipe.servings;

      meal.recipe.ingredients.forEach((ing: any) => {
        const name = ing.name.toLowerCase().trim();

        // Parse amount and unit from the combined amount string (e.g., "150 g", "1 cup")
        const amountStr = ing.amount || '';
        const match = amountStr.match(/^([\d./\s]+)(.*)$/);

        const amount = match ? parseAmount(match[1]) : 0;
        const unit = match ? match[2].trim() : '';

        // Adjust for servings
        const adjustedAmount = amount * servingMultiplier;

        // Convert to base unit for proper aggregation
        const { value: baseValue, baseUnit } = toBaseUnit(adjustedAmount, unit, name);

        if (!neededIngredients[name]) {
          neededIngredients[name] = {
            totalBaseAmount: baseValue,
            baseUnit: baseUnit,
            originalUnit: unit,
            category: ing.category || 'other'
          };
        } else {
          // Only add if same base unit type
          if (neededIngredients[name].baseUnit === baseUnit) {
            neededIngredients[name].totalBaseAmount += baseValue;
          } else {
            // Different unit types - just add to the total
            neededIngredients[name].totalBaseAmount += baseValue;
          }
        }
      });
    });

    // Build fridge inventory lookup with fuzzy matching support
    const fridgeInventory: { [key: string]: { quantity: number; unit: string; baseValue: number; baseUnit: string; fridgeLife: number; originalName: string; category: string } } = {};
    const fridgeItems: any[] = [];

    if (fridgeIngredients) {
      fridgeIngredients.forEach((item: any) => {
        const name = item.ingredient.name.toLowerCase();
        const quantity = parseFloat(item.quantity) || 0;
        const unit = item.unit || '';
        const { value: baseValue, baseUnit } = toBaseUnit(quantity, unit, name);

        const fridgeItem = {
          quantity: quantity,
          unit: normalizeUnit(unit),
          baseValue: baseValue,
          baseUnit: baseUnit,
          fridgeLife: item.ingredient.fridge_life_days || 7,
          originalName: item.ingredient.name,
          category: item.ingredient.category || 'other'
        };
        fridgeInventory[name] = fridgeItem;
        fridgeItems.push({ name, ...fridgeItem });
      });
    }

    // Helper function to find matching fridge item with fuzzy matching
    const findFridgeItem = (searchName: string) => {
      const searchLower = searchName.toLowerCase().trim();

      // Exact match first
      if (fridgeInventory[searchLower]) {
        return fridgeInventory[searchLower];
      }

      // Fuzzy match: split search terms and find best match
      const searchTerms = searchLower.split(/[\s(),]+/).filter(t => t.length > 2);

      for (const fridgeItem of fridgeItems) {
        const ingName = fridgeItem.name;
        // Check if all major search terms are in ingredient name
        if (searchTerms.every((term: string) => ingName.includes(term))) {
          return fridgeItem;
        }
      }

      // Partial match - ingredient name contains main search term
      for (const fridgeItem of fridgeItems) {
        const ingName = fridgeItem.name;
        if (searchTerms.some((term: string) => term.length > 3 && ingName.includes(term))) {
          return fridgeItem;
        }
      }

      // Reverse check - search name contains fridge item name
      for (const fridgeItem of fridgeItems) {
        const ingName = fridgeItem.name;
        if (searchLower.includes(ingName) || ingName.includes(searchLower)) {
          return fridgeItem;
        }
      }

      return null;
    };

    // Determine shopping list (missing items) and running low items
    const shoppingList: any[] = [];
    const runningLow: any[] = [];
    const alreadyAddedToRunningLow = new Set<string>();

    Object.entries(neededIngredients).forEach(([name, details]) => {
      const fridgeItem = findFridgeItem(name);
      const neededBase = details.totalBaseAmount;

      if (!fridgeItem) {
        // Not in fridge at all - add to shopping list
        const displayAmount = formatDisplayAmount(neededBase, details.baseUnit, details.originalUnit, unitSystem);
        shoppingList.push({
          name,
          amount: displayAmount,
          category: details.category,
          status: 'missing'
        });
      } else {
        const availableBase = fridgeItem.baseValue;

        // Compare in same base units
        if (fridgeItem.baseUnit === details.baseUnit && availableBase < neededBase) {
          const shortageBase = neededBase - availableBase;
          const displayShortage = formatDisplayAmount(shortageBase, details.baseUnit, details.originalUnit, unitSystem);
          const displayAvailable = formatDisplayAmount(availableBase, fridgeItem.baseUnit, fridgeItem.unit, unitSystem);
          const displayNeeded = formatDisplayAmount(neededBase, details.baseUnit, details.originalUnit, unitSystem);

          shoppingList.push({
            name,
            amount: displayShortage,
            category: fridgeItem.category || details.category,
            status: 'insufficient',
            currentAmount: displayAvailable,
            neededAmount: displayNeeded
          });
        }

        // Check for expiring soon (within 2 days)
        if (fridgeItem.fridgeLife <= 2 && !alreadyAddedToRunningLow.has(name)) {
          alreadyAddedToRunningLow.add(name);
          runningLow.push({
            name: fridgeItem.originalName,
            currentAmount: `${fridgeItem.quantity} ${fridgeItem.unit}`,
            fridgeLife: fridgeItem.fridgeLife,
            status: 'expiring_soon'
          });
        }
      }
    });

    return NextResponse.json({
      shoppingList,
      runningLow,
      fridgeInventory: Object.entries(fridgeInventory).map(([name, data]) => ({
        name,
        quantity: data.quantity,
        unit: data.unit,
        fridgeLife: data.fridgeLife
      }))
    });

  } catch (error: any) {
    console.error('Shopping list error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to generate shopping list'
    }, { status: 500 });
  }
}
