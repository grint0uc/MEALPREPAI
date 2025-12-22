import { parseAmount } from './units';

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface IngredientPrice {
  name: string;
  avg_price_per_unit: number;
  unit: string;
}

/**
 * Calculate a relative cost score for a recipe (not shown to users, used for ranking)
 * Higher score = more expensive ingredients
 * Lower score = more budget-friendly ingredients
 */
export function calculateRecipeCostScore(
  ingredients: RecipeIngredient[],
  ingredientPrices: IngredientPrice[]
): number {
  let totalScore = 0;

  ingredients.forEach((ing) => {
    // Find matching price data
    const priceData = ingredientPrices.find((p) =>
      p.name.toLowerCase().includes(ing.name.toLowerCase()) ||
      ing.name.toLowerCase().includes(p.name.toLowerCase())
    );

    if (priceData) {
      // Parse the amount from the ingredient (e.g., "2 cups", "1.5 lbs")
      const match = ing.amount.match(/^([\d./\s]+)/);
      const amount = match ? parseAmount(match[1]) : 1;

      // Calculate score (internal only, not displayed)
      const score = amount * priceData.avg_price_per_unit;
      totalScore += score;
    } else {
      // Default medium cost for unknown ingredients
      totalScore += 3.0;
    }
  });

  return totalScore;
}

/**
 * Get a budget-friendliness indicator (internal use)
 * Returns: 'budget' | 'moderate' | 'premium'
 */
export function getBudgetCategory(costScore: number, ingredientCount: number): 'budget' | 'moderate' | 'premium' {
  const avgCostPerIngredient = costScore / ingredientCount;

  if (avgCostPerIngredient < 2.5) return 'budget';
  if (avgCostPerIngredient < 5.0) return 'moderate';
  return 'premium';
}
