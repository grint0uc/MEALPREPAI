/**
 * Comprehensive unit system for ingredient measurements
 * Handles US and Metric units with intelligent conversion based on ingredient type
 */

export type UnitSystem = 'us' | 'metric';

export type IngredientType =
  | 'solid' // Rice, flour, sugar, etc. - use weight
  | 'liquid' // Milk, water, oil, etc. - use volume
  | 'produce' // Fruits, vegetables - use count or weight
  | 'protein' // Meat, fish - use weight
  | 'spice' // Spices, herbs - use volume or weight (small amounts)
  | 'other';

export interface UnitDefinition {
  name: string;
  abbreviation: string;
  system: 'us' | 'metric' | 'universal';
  type: 'volume' | 'weight' | 'count';
  toGrams?: number; // For weight units
  toMilliliters?: number; // For volume units
}

// Standard unit definitions
export const UNITS: { [key: string]: UnitDefinition } = {
  // US Weight
  'ounce': { name: 'ounce', abbreviation: 'oz', system: 'us', type: 'weight', toGrams: 28.35 },
  'pound': { name: 'pound', abbreviation: 'lb', system: 'us', type: 'weight', toGrams: 453.592 },

  // US Volume
  'cup': { name: 'cup', abbreviation: 'cup', system: 'us', type: 'volume', toMilliliters: 236.588 },
  'tablespoon': { name: 'tablespoon', abbreviation: 'tbsp', system: 'us', type: 'volume', toMilliliters: 14.787 },
  'teaspoon': { name: 'teaspoon', abbreviation: 'tsp', system: 'us', type: 'volume', toMilliliters: 4.929 },
  'fluid ounce': { name: 'fluid ounce', abbreviation: 'fl oz', system: 'us', type: 'volume', toMilliliters: 29.574 },
  'pint': { name: 'pint', abbreviation: 'pt', system: 'us', type: 'volume', toMilliliters: 473.176 },
  'quart': { name: 'quart', abbreviation: 'qt', system: 'us', type: 'volume', toMilliliters: 946.353 },
  'gallon': { name: 'gallon', abbreviation: 'gal', system: 'us', type: 'volume', toMilliliters: 3785.41 },

  // Metric Weight
  'gram': { name: 'gram', abbreviation: 'g', system: 'metric', type: 'weight', toGrams: 1 },
  'kilogram': { name: 'kilogram', abbreviation: 'kg', system: 'metric', type: 'weight', toGrams: 1000 },
  'milligram': { name: 'milligram', abbreviation: 'mg', system: 'metric', type: 'weight', toGrams: 0.001 },

  // Metric Volume
  'milliliter': { name: 'milliliter', abbreviation: 'ml', system: 'metric', type: 'volume', toMilliliters: 1 },
  'liter': { name: 'liter', abbreviation: 'l', system: 'metric', type: 'volume', toMilliliters: 1000 },

  // Universal
  'piece': { name: 'piece', abbreviation: 'pc', system: 'universal', type: 'count' },
  'whole': { name: 'whole', abbreviation: 'whole', system: 'universal', type: 'count' },
  'clove': { name: 'clove', abbreviation: 'clove', system: 'universal', type: 'count' },
  'pinch': { name: 'pinch', abbreviation: 'pinch', system: 'universal', type: 'count' },
  'dash': { name: 'dash', abbreviation: 'dash', system: 'universal', type: 'count' },
  'can': { name: 'can', abbreviation: 'can', system: 'universal', type: 'count' },
  'package': { name: 'package', abbreviation: 'pkg', system: 'universal', type: 'count' },
};

// Ingredient type detection based on name
export function detectIngredientType(ingredientName: string): IngredientType {
  const name = ingredientName.toLowerCase();

  // Liquids
  if (name.includes('milk') || name.includes('water') || name.includes('oil') ||
      name.includes('broth') || name.includes('stock') || name.includes('juice') ||
      name.includes('sauce') || name.includes('vinegar') || name.includes('wine') ||
      name.includes('beer') || name.includes('cream') || name.includes('yogurt')) {
    return 'liquid';
  }

  // Proteins
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
      name.includes('fish') || name.includes('salmon') || name.includes('tuna') ||
      name.includes('turkey') || name.includes('lamb') || name.includes('shrimp') ||
      name.includes('steak') || name.includes('bacon') || name.includes('sausage')) {
    return 'protein';
  }

  // Spices (small amounts)
  if (name.includes('salt') || name.includes('pepper') || name.includes('paprika') ||
      name.includes('cumin') || name.includes('oregano') || name.includes('basil') ||
      name.includes('thyme') || name.includes('rosemary') || name.includes('cinnamon') ||
      name.includes('ginger') || name.includes('garlic powder') || name.includes('onion powder')) {
    return 'spice';
  }

  // Produce
  if (name.includes('tomato') || name.includes('onion') || name.includes('carrot') ||
      name.includes('potato') || name.includes('apple') || name.includes('banana') ||
      name.includes('lettuce') || name.includes('spinach') || name.includes('broccoli') ||
      name.includes('bell pepper') || name.includes('cucumber') || name.includes('zucchini')) {
    return 'produce';
  }

  // Solids (default for grains, flour, sugar, etc.)
  return 'solid';
}

// Get appropriate unit for ingredient type and unit system
export function getStandardUnit(ingredientType: IngredientType, unitSystem: UnitSystem): string {
  if (unitSystem === 'metric') {
    switch (ingredientType) {
      case 'liquid':
        return 'ml';
      case 'solid':
      case 'protein':
        return 'g';
      case 'spice':
        return 'g';
      case 'produce':
        return 'g';
      default:
        return 'g';
    }
  } else { // US
    switch (ingredientType) {
      case 'liquid':
        return 'cup';
      case 'solid':
        return 'cup';
      case 'protein':
        return 'oz';
      case 'spice':
        return 'tsp';
      case 'produce':
        return 'oz';
      default:
        return 'cup';
    }
  }
}

// Convert amount from one unit to another
export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string,
  ingredientType: IngredientType = 'solid'
): number {
  const from = UNITS[fromUnit.toLowerCase()];
  const to = UNITS[toUnit.toLowerCase()];

  if (!from || !to) {
    console.warn(`Unknown unit: ${fromUnit} or ${toUnit}`);
    return amount;
  }

  // Same unit, no conversion needed
  if (fromUnit.toLowerCase() === toUnit.toLowerCase()) {
    return amount;
  }

  // Count units can't be converted
  if (from.type === 'count' || to.type === 'count') {
    return amount;
  }

  // Weight conversions
  if (from.type === 'weight' && to.type === 'weight') {
    const grams = amount * (from.toGrams || 1);
    return grams / (to.toGrams || 1);
  }

  // Volume conversions
  if (from.type === 'volume' && to.type === 'volume') {
    const ml = amount * (from.toMilliliters || 1);
    return ml / (to.toMilliliters || 1);
  }

  // Volume to weight (or vice versa) - need density
  // For cooking, we'll use approximations
  if (from.type === 'volume' && to.type === 'weight') {
    const ml = amount * (from.toMilliliters || 1);
    let density = 1; // Default: water density (1g/ml)

    // Adjust density based on ingredient type
    switch (ingredientType) {
      case 'solid': // Flour, sugar, rice
        density = 0.6; // Average for flour/rice
        break;
      case 'liquid':
        density = 1; // Water-like
        break;
      case 'protein':
        density = 1; // Approximate
        break;
    }

    const grams = ml * density;
    return grams / (to.toGrams || 1);
  }

  if (from.type === 'weight' && to.type === 'volume') {
    const grams = amount * (from.toGrams || 1);
    let density = 1;

    switch (ingredientType) {
      case 'solid':
        density = 0.6;
        break;
      case 'liquid':
        density = 1;
        break;
      case 'protein':
        density = 1;
        break;
    }

    const ml = grams / density;
    return ml / (to.toMilliliters || 1);
  }

  return amount;
}

// Smart conversion: convert to user's preferred unit system
export function convertToUserSystem(
  amount: number,
  currentUnit: string,
  ingredientName: string,
  targetSystem: UnitSystem
): { amount: number; unit: string } {
  const ingredientType = detectIngredientType(ingredientName);
  const targetUnit = getStandardUnit(ingredientType, targetSystem);
  const convertedAmount = convertUnit(amount, currentUnit, targetUnit, ingredientType);

  // Round to reasonable precision
  const rounded = Math.round(convertedAmount * 100) / 100;

  return {
    amount: rounded,
    unit: targetUnit
  };
}

// Format amount with fractions for US system
export function formatAmount(amount: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'metric') {
    // Metric: just use decimals
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1);
    }
    if (amount >= 100) {
      return Math.round(amount).toString();
    }
    if (amount >= 10) {
      return amount.toFixed(1);
    }
    return amount.toFixed(2).replace(/\.?0+$/, '');
  } else {
    // US: use fractions
    const whole = Math.floor(amount);
    const decimal = amount - whole;

    const fractions: { [key: string]: string } = {
      '0.125': '⅛',
      '0.25': '¼',
      '0.333': '⅓',
      '0.5': '½',
      '0.667': '⅔',
      '0.75': '¾',
    };

    for (const [dec, frac] of Object.entries(fractions)) {
      if (Math.abs(decimal - parseFloat(dec)) < 0.05) {
        return whole > 0 ? `${whole} ${frac}` : frac;
      }
    }

    // No close fraction, return decimal
    return amount.toFixed(2).replace(/\.?0+$/, '');
  }
}

// Generate unit instructions for AI prompt
export function getUnitInstructions(unitSystem: UnitSystem): string {
  if (unitSystem === 'metric') {
    return `Use METRIC units exclusively:
- Liquids (milk, water, oil, broth): milliliters (ml) or liters (l)
- Solids (flour, rice, sugar): grams (g) or kilograms (kg)
- Proteins (chicken, beef, fish): grams (g) or kilograms (kg)
- Produce (vegetables, fruits): grams (g) for weight
- Spices: grams (g) or milliliters (ml) for small amounts
- Use whole numbers or simple decimals (e.g., 250g, 1.5kg, 500ml)`;
  } else {
    return `Use US/IMPERIAL units exclusively:
- Liquids (milk, water, oil, broth): cups, fluid ounces (fl oz), tablespoons (tbsp), teaspoons (tsp)
- Solids (flour, rice, sugar): cups, tablespoons (tbsp), teaspoons (tsp)
- Proteins (chicken, beef, fish): pounds (lb) or ounces (oz)
- Produce (vegetables, fruits): whole pieces, pounds (lb), or ounces (oz)
- Spices: tablespoons (tbsp), teaspoons (tsp), pinches
- Use fractions for precision (e.g., 1/2 cup, 1 1/2 lbs, 2/3 cup)`;
  }
}

// Parse amount string to number (handles fractions like "1/2", "1 1/2", etc.)
export function parseAmount(amountStr: string): number {
  if (typeof amountStr === 'number') return amountStr;

  const str = amountStr.toString().trim();

  // Handle fractions like "1/2", "1 1/2", "2/3"
  if (str.includes('/')) {
    let total = 0;
    const parts = str.split(' ');

    for (const part of parts) {
      if (part.includes('/')) {
        const [num, denom] = part.split('/').map(Number);
        total += num / denom;
      } else {
        total += parseFloat(part) || 0;
      }
    }

    return total;
  }

  // Simple decimal number
  return parseFloat(str) || 0;
}

// Validate and normalize unit string to abbreviated form
export function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase().trim();

  // Map common variations to standard abbreviated units
  const unitMap: { [key: string]: string } = {
    'cups': 'cup',
    'c': 'cup',
    'tablespoons': 'tbsp',
    'tablespoon': 'tbsp',
    'tbs': 'tbsp',
    'teaspoons': 'tsp',
    'teaspoon': 'tsp',
    'ounces': 'oz',
    'ounce': 'oz',
    'pounds': 'lb',
    'pound': 'lb',
    'lbs': 'lb',
    'grams': 'g',
    'gram': 'g',
    'kilograms': 'kg',
    'kilogram': 'kg',
    'milliliters': 'ml',
    'milliliter': 'ml',
    'liters': 'l',
    'liter': 'l',
    'fl oz': 'fl oz',
    'fluid ounce': 'fl oz',
    'pieces': 'pc',
    'piece': 'pc',
    'pcs': 'pc',
  };

  return unitMap[normalized] || normalized;
}
