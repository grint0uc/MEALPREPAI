import { NextRequest, NextResponse } from 'next/server';
import { detectIngredientType } from '@/lib/units';

interface UserIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  sourceUrl: string;
  sourceName: string;
  readyInMinutes: number;
  servings: number;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  extendedIngredients?: Array<{
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
}

// Helper to convert US units to metric
function convertToMetric(amount: string, ingredientName: string): string {
  const match = amount.match(/^([\d./\s]+)(.*)$/);
  if (!match) return amount;

  const numericPart = match[1].trim();
  const unitPart = match[2].trim().toLowerCase();

  let value = 0;
  if (numericPart.includes('/')) {
    const parts = numericPart.split(' ');
    for (const part of parts) {
      if (part.includes('/')) {
        const [num, denom] = part.split('/').map(Number);
        value += num / denom;
      } else {
        value += parseFloat(part) || 0;
      }
    }
  } else {
    value = parseFloat(numericPart) || 0;
  }

  const ingredientType = detectIngredientType(ingredientName);

  switch (unitPart) {
    case 'oz':
    case 'ounce':
    case 'ounces':
      return `${Math.round(value * 28.35)} g`;
    case 'lb':
    case 'lbs':
    case 'pound':
    case 'pounds':
      const gramsFromLb = Math.round(value * 453.592);
      return gramsFromLb >= 1000 ? `${(gramsFromLb / 1000).toFixed(1)} kg` : `${gramsFromLb} g`;
    case 'cup':
    case 'cups':
      if (ingredientType === 'liquid') {
        return `${Math.round(value * 236.588)} ml`;
      } else {
        return `${Math.round(value * 120)} g`;
      }
    case 'tbsp':
    case 'tablespoon':
    case 'tablespoons':
      return `${Math.round(value * 14.787)} ml`;
    case 'tsp':
    case 'teaspoon':
    case 'teaspoons':
      return `${Math.round(value * 4.929)} ml`;
    case 'fl oz':
    case 'fluid ounce':
      return `${Math.round(value * 29.574)} ml`;
    default:
      return amount;
  }
}

// Fetch recipes from Spoonacular API
async function fetchFromSpoonacular(
  ingredientNames: string[],
  totalRecipes: number
): Promise<SpoonacularRecipe[] | null> {
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    console.log('Spoonacular API key not configured, using mock data');
    return null;
  }

  try {
    // First, search for recipes by ingredients
    const ingredientsParam = ingredientNames.slice(0, 5).join(',');
    const searchUrl = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${encodeURIComponent(ingredientsParam)}&number=${totalRecipes}&ranking=2&ignorePantry=true`;

    console.log('Fetching recipes from Spoonacular...');
    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      console.error('Spoonacular search failed:', searchResponse.status);
      return null;
    }

    const searchResults = await searchResponse.json();

    if (!searchResults || searchResults.length === 0) {
      console.log('No recipes found from Spoonacular');
      return null;
    }

    // Get detailed info for each recipe
    const recipeIds = searchResults.map((r: { id: number }) => r.id).join(',');
    const detailUrl = `https://api.spoonacular.com/recipes/informationBulk?apiKey=${apiKey}&ids=${recipeIds}&includeNutrition=true`;

    const detailResponse = await fetch(detailUrl);

    if (!detailResponse.ok) {
      console.error('Spoonacular detail fetch failed:', detailResponse.status);
      return null;
    }

    const detailedRecipes = await detailResponse.json();
    console.log(`Fetched ${detailedRecipes.length} detailed recipes from Spoonacular`);

    return detailedRecipes;
  } catch (error) {
    console.error('Spoonacular API error:', error);
    return null;
  }
}

// Transform Spoonacular recipe to our format
function transformSpoonacularRecipe(
  recipe: SpoonacularRecipe,
  day: number,
  mealTime: string,
  userIngredients: UserIngredient[],
  unitSystem: string
): Record<string, unknown> {
  // Extract nutrition info
  const nutrients = recipe.nutrition?.nutrients || [];
  const calories = nutrients.find(n => n.name === 'Calories')?.amount || 0;
  const protein = nutrients.find(n => n.name === 'Protein')?.amount || 0;
  const carbs = nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0;
  const fats = nutrients.find(n => n.name === 'Fat')?.amount || 0;

  // Transform ingredients
  const ingredients = (recipe.extendedIngredients || []).map(ing => {
    const userHasIt = userIngredients.some(userIng =>
      userIng.name.toLowerCase().includes(ing.name.toLowerCase()) ||
      ing.name.toLowerCase().includes(userIng.name.toLowerCase())
    );

    let amount = `${ing.amount} ${ing.unit}`;
    if (unitSystem === 'metric') {
      amount = convertToMetric(amount, ing.name);
    }

    return {
      name: ing.name,
      amount,
      inFridge: userHasIt,
      status: userHasIt ? 'have' : 'need'
    };
  });

  // Extract instructions
  const instructions = recipe.analyzedInstructions?.[0]?.steps.map(s => s.step) ||
    ['Follow the recipe instructions at the source URL'];

  const matchCount = ingredients.filter(i => i.inFridge).length;
  const matchPercentage = ingredients.length > 0
    ? Math.round((matchCount / ingredients.length) * 100)
    : 0;

  return {
    name: recipe.title,
    source: recipe.sourceName || 'Spoonacular',
    url: recipe.sourceUrl,
    description: `${recipe.title} - Ready in ${recipe.readyInMinutes} minutes`,
    prepTime: Math.round(recipe.readyInMinutes * 0.3),
    cookTime: Math.round(recipe.readyInMinutes * 0.7),
    servings: 1, // We standardize to 1 serving
    ingredients,
    instructions,
    nutrition: {
      calories: Math.round(calories / recipe.servings),
      protein: Math.round(protein / recipe.servings),
      carbs: Math.round(carbs / recipe.servings),
      fats: Math.round(fats / recipe.servings)
    },
    day,
    mealTime,
    matchPercentage,
    missingIngredients: ingredients.filter(i => !i.inFridge).length
  };
}

// Mock recipe pool for fallback
const mockRecipePool = [
  {
    name: "Grilled Chicken Breast with Vegetables",
    source: "AllRecipes",
    url: "https://www.allrecipes.com/recipe/grilled-chicken",
    description: "Juicy grilled chicken breast served with seasonal roasted vegetables",
    prepTime: 15,
    cookTime: 25,
    servings: 1,
    ingredients: [
      { name: "chicken breast", amount: "6 oz", notes: "boneless, skinless" },
      { name: "olive oil", amount: "1 tbsp" },
      { name: "bell pepper", amount: "1/2 cup", notes: "sliced" },
      { name: "zucchini", amount: "1/2 cup", notes: "sliced" },
      { name: "garlic", amount: "2 cloves", notes: "minced" },
      { name: "salt", amount: "1/2 tsp" },
      { name: "black pepper", amount: "1/4 tsp" }
    ],
    instructions: [
      "Season chicken breast with salt, pepper, and minced garlic",
      "Heat grill or grill pan to medium-high heat",
      "Grill chicken for 6-7 minutes per side until internal temperature reaches 165°F",
      "Meanwhile, toss vegetables with olive oil, salt, and pepper",
      "Roast vegetables in oven at 425°F for 20 minutes",
      "Serve chicken with roasted vegetables"
    ],
    nutrition: { calories: 380, protein: 42, carbs: 12, fats: 18 }
  },
  {
    name: "Mediterranean Quinoa Bowl",
    source: "Food Network",
    url: "https://www.foodnetwork.com/recipes/quinoa-bowl",
    description: "Protein-packed quinoa bowl with fresh vegetables and feta cheese",
    prepTime: 10,
    cookTime: 20,
    servings: 1,
    ingredients: [
      { name: "quinoa", amount: "1/2 cup", notes: "dry" },
      { name: "cherry tomatoes", amount: "1/2 cup", notes: "halved" },
      { name: "cucumber", amount: "1/2 cup", notes: "diced" },
      { name: "feta cheese", amount: "2 tbsp", notes: "crumbled" },
      { name: "olive oil", amount: "1 tbsp" },
      { name: "lemon juice", amount: "1 tbsp" },
      { name: "chickpeas", amount: "1/4 cup", notes: "cooked" }
    ],
    instructions: [
      "Cook quinoa according to package directions",
      "Let quinoa cool to room temperature",
      "Combine quinoa, tomatoes, cucumber, and chickpeas in a bowl",
      "Drizzle with olive oil and lemon juice",
      "Top with crumbled feta cheese",
      "Toss gently and serve"
    ],
    nutrition: { calories: 420, protein: 15, carbs: 52, fats: 16 }
  },
  {
    name: "Pan-Seared Salmon with Asparagus",
    source: "Bon Appetit",
    url: "https://www.bonappetit.com/recipe/salmon-asparagus",
    description: "Pan-seared salmon fillet with garlic butter asparagus",
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    ingredients: [
      { name: "salmon fillet", amount: "6 oz", notes: "skin-on" },
      { name: "asparagus", amount: "8 spears", notes: "trimmed" },
      { name: "butter", amount: "1 tbsp" },
      { name: "garlic", amount: "2 cloves", notes: "minced" },
      { name: "lemon", amount: "1/2", notes: "sliced" },
      { name: "salt", amount: "1/2 tsp" },
      { name: "black pepper", amount: "1/4 tsp" }
    ],
    instructions: [
      "Season salmon with salt and pepper",
      "Heat butter in a pan over medium-high heat",
      "Add salmon skin-side down, cook for 4-5 minutes",
      "Flip salmon and cook for another 3-4 minutes",
      "Remove salmon and add asparagus to the same pan",
      "Sauté asparagus with garlic for 5-6 minutes",
      "Serve salmon with asparagus and lemon slices"
    ],
    nutrition: { calories: 450, protein: 38, carbs: 8, fats: 28 }
  },
  {
    name: "Beef Stir-Fry with Broccoli",
    source: "Serious Eats",
    url: "https://www.seriouseats.com/beef-broccoli-stir-fry",
    description: "Classic Chinese-style beef and broccoli stir-fry",
    prepTime: 15,
    cookTime: 10,
    servings: 1,
    ingredients: [
      { name: "beef sirloin", amount: "6 oz", notes: "thinly sliced" },
      { name: "broccoli", amount: "1 cup", notes: "florets" },
      { name: "soy sauce", amount: "2 tbsp" },
      { name: "garlic", amount: "2 cloves", notes: "minced" },
      { name: "ginger", amount: "1 tsp", notes: "minced" },
      { name: "sesame oil", amount: "1 tsp" },
      { name: "cornstarch", amount: "1 tsp" }
    ],
    instructions: [
      "Marinate beef in soy sauce and cornstarch for 10 minutes",
      "Heat sesame oil in a wok over high heat",
      "Stir-fry beef until browned, about 3 minutes",
      "Remove beef and set aside",
      "Add garlic, ginger, and broccoli to wok",
      "Stir-fry vegetables for 5 minutes",
      "Return beef to wok, toss to combine, and serve"
    ],
    nutrition: { calories: 410, protein: 40, carbs: 15, fats: 22 }
  },
  {
    name: "Greek Yogurt Parfait",
    source: "Cooking Light",
    url: "https://www.cookinglight.com/recipes/yogurt-parfait",
    description: "Healthy breakfast parfait with Greek yogurt, berries, and granola",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    ingredients: [
      { name: "Greek yogurt", amount: "1 cup", notes: "plain, non-fat" },
      { name: "strawberries", amount: "1/2 cup", notes: "sliced" },
      { name: "blueberries", amount: "1/4 cup" },
      { name: "granola", amount: "1/4 cup" },
      { name: "honey", amount: "1 tbsp" }
    ],
    instructions: [
      "Layer half the yogurt in a glass or bowl",
      "Add half the berries",
      "Add remaining yogurt",
      "Top with remaining berries and granola",
      "Drizzle with honey and serve"
    ],
    nutrition: { calories: 320, protein: 22, carbs: 48, fats: 6 }
  },
  {
    name: "Turkey Meatballs with Marinara",
    source: "AllRecipes",
    url: "https://www.allrecipes.com/recipe/turkey-meatballs",
    description: "Lean turkey meatballs in homemade tomato sauce",
    prepTime: 20,
    cookTime: 25,
    servings: 1,
    ingredients: [
      { name: "ground turkey", amount: "6 oz", notes: "lean" },
      { name: "breadcrumbs", amount: "2 tbsp" },
      { name: "egg", amount: "1" },
      { name: "marinara sauce", amount: "1/2 cup" },
      { name: "parmesan cheese", amount: "2 tbsp", notes: "grated" }
    ],
    instructions: [
      "Mix turkey, breadcrumbs, and egg in a bowl",
      "Form into 6-8 meatballs",
      "Bake at 375°F for 20 minutes",
      "Heat marinara sauce in a pan",
      "Add cooked meatballs to sauce",
      "Simmer for 5 minutes and serve with parmesan"
    ],
    nutrition: { calories: 390, protein: 44, carbs: 18, fats: 16 }
  },
  {
    name: "Veggie Omelette",
    source: "Food Network",
    url: "https://www.foodnetwork.com/recipes/veggie-omelette",
    description: "Fluffy egg omelette loaded with fresh vegetables",
    prepTime: 5,
    cookTime: 8,
    servings: 1,
    ingredients: [
      { name: "eggs", amount: "3", notes: "large" },
      { name: "bell pepper", amount: "1/4 cup", notes: "diced" },
      { name: "onion", amount: "2 tbsp", notes: "diced" },
      { name: "spinach", amount: "1/2 cup", notes: "fresh" },
      { name: "cheese", amount: "2 tbsp", notes: "shredded" },
      { name: "butter", amount: "1 tsp" }
    ],
    instructions: [
      "Beat eggs in a bowl with salt and pepper",
      "Melt butter in a non-stick pan",
      "Pour in eggs and let set slightly",
      "Add vegetables to one half",
      "Sprinkle cheese on top",
      "Fold omelette in half and cook until set"
    ],
    nutrition: { calories: 310, protein: 24, carbs: 8, fats: 21 }
  },
  {
    name: "Shrimp Tacos",
    source: "Bon Appetit",
    url: "https://www.bonappetit.com/recipe/shrimp-tacos",
    description: "Spicy grilled shrimp tacos with lime crema",
    prepTime: 15,
    cookTime: 10,
    servings: 1,
    ingredients: [
      { name: "shrimp", amount: "6 oz", notes: "peeled, deveined" },
      { name: "corn tortillas", amount: "3", notes: "small" },
      { name: "cabbage", amount: "1/2 cup", notes: "shredded" },
      { name: "lime", amount: "1" },
      { name: "sour cream", amount: "2 tbsp" },
      { name: "chili powder", amount: "1 tsp" }
    ],
    instructions: [
      "Season shrimp with chili powder, salt, and pepper",
      "Grill shrimp for 2-3 minutes per side",
      "Warm tortillas in a dry pan",
      "Mix sour cream with lime juice",
      "Assemble tacos with shrimp, cabbage, and crema",
      "Serve with extra lime wedges"
    ],
    nutrition: { calories: 360, protein: 32, carbs: 36, fats: 10 }
  },
  {
    name: "Chicken Caesar Salad",
    source: "Cooking Light",
    url: "https://www.cookinglight.com/recipes/caesar-salad",
    description: "Classic Caesar salad with grilled chicken",
    prepTime: 10,
    cookTime: 12,
    servings: 1,
    ingredients: [
      { name: "chicken breast", amount: "5 oz", notes: "boneless" },
      { name: "romaine lettuce", amount: "2 cups", notes: "chopped" },
      { name: "caesar dressing", amount: "2 tbsp" },
      { name: "parmesan cheese", amount: "2 tbsp", notes: "shaved" },
      { name: "croutons", amount: "1/4 cup" }
    ],
    instructions: [
      "Season and grill chicken breast until cooked through",
      "Let chicken rest, then slice",
      "Toss lettuce with Caesar dressing",
      "Top with sliced chicken, parmesan, and croutons",
      "Serve immediately"
    ],
    nutrition: { calories: 380, protein: 38, carbs: 16, fats: 18 }
  },
  {
    name: "Pork Chops with Apple Sauce",
    source: "Serious Eats",
    url: "https://www.seriouseats.com/pork-chops-applesauce",
    description: "Pan-seared pork chops with homemade apple sauce",
    prepTime: 10,
    cookTime: 20,
    servings: 1,
    ingredients: [
      { name: "pork chop", amount: "6 oz", notes: "bone-in" },
      { name: "apple", amount: "1", notes: "diced" },
      { name: "cinnamon", amount: "1/4 tsp" },
      { name: "butter", amount: "1 tbsp" },
      { name: "brown sugar", amount: "1 tsp" }
    ],
    instructions: [
      "Season pork chop with salt and pepper",
      "Pan-sear pork chop for 4-5 minutes per side",
      "Remove pork and rest",
      "In same pan, cook apple with butter, cinnamon, and sugar",
      "Simmer until apples are soft",
      "Serve pork chop with apple sauce"
    ],
    nutrition: { calories: 420, protein: 36, carbs: 22, fats: 20 }
  }
];

// Generate mock recipes with ingredient matching
function generateMockRecipes(
  userIngredients: UserIngredient[],
  mealsPerDay: number,
  unitSystem: string
): Record<string, unknown>[] {
  const allRecipes: Record<string, unknown>[] = [];
  const mealTimes = mealsPerDay === 3 ? ['breakfast', 'lunch', 'dinner'] : ['dinner'];

  for (let day = 1; day <= 7; day++) {
    for (let mealIndex = 0; mealIndex < mealsPerDay; mealIndex++) {
      const recipeIndex = ((day - 1) * mealsPerDay + mealIndex) % mockRecipePool.length;
      const baseRecipe = mockRecipePool[recipeIndex];

      const ingredients = baseRecipe.ingredients.map(ing => {
        const userHasIt = userIngredients.some(userIng =>
          userIng.name.toLowerCase().includes(ing.name.toLowerCase()) ||
          ing.name.toLowerCase().includes(userIng.name.toLowerCase())
        );

        let amount = ing.amount;
        if (unitSystem === 'metric') {
          amount = convertToMetric(ing.amount, ing.name);
        }

        return {
          name: ing.name,
          amount,
          notes: 'notes' in ing ? ing.notes : undefined,
          inFridge: userHasIt,
          status: userHasIt ? 'have' : 'need'
        };
      });

      const matchCount = ingredients.filter(i => i.inFridge).length;
      const matchPercentage = ingredients.length > 0
        ? Math.round((matchCount / ingredients.length) * 100)
        : 0;

      allRecipes.push({
        ...baseRecipe,
        ingredients,
        day,
        mealTime: mealTimes[mealIndex],
        matchPercentage,
        missingIngredients: ingredients.filter(i => !i.inFridge).length
      });
    }
  }

  return allRecipes;
}

export async function POST(request: NextRequest) {
  try {
    const { userIngredients, mealsPerDay, unitSystem } = await request.json();

    console.log('Fetching web recipes, mealsPerDay:', mealsPerDay);

    const totalRecipes = 7 * mealsPerDay;
    const ingredientNames = userIngredients.map((ui: UserIngredient) => ui.name);

    // Try Spoonacular API first
    const spoonacularRecipes = await fetchFromSpoonacular(ingredientNames, totalRecipes);

    let recipes: Record<string, unknown>[];

    if (spoonacularRecipes && spoonacularRecipes.length > 0) {
      console.log('Using Spoonacular recipes');
      const mealTimes = mealsPerDay === 3 ? ['breakfast', 'lunch', 'dinner'] : ['dinner'];

      recipes = [];
      let recipeIndex = 0;

      for (let day = 1; day <= 7; day++) {
        for (let mealIndex = 0; mealIndex < mealsPerDay; mealIndex++) {
          if (recipeIndex < spoonacularRecipes.length) {
            recipes.push(transformSpoonacularRecipe(
              spoonacularRecipes[recipeIndex],
              day,
              mealTimes[mealIndex],
              userIngredients,
              unitSystem
            ));
            recipeIndex++;
          }
        }
      }

      // If we don't have enough recipes, fill with duplicates
      while (recipes.length < totalRecipes && spoonacularRecipes.length > 0) {
        const sourceRecipe = spoonacularRecipes[recipes.length % spoonacularRecipes.length];
        const day = Math.floor(recipes.length / mealsPerDay) + 1;
        const mealIndex = recipes.length % mealsPerDay;
        const mealTimes = mealsPerDay === 3 ? ['breakfast', 'lunch', 'dinner'] : ['dinner'];

        recipes.push(transformSpoonacularRecipe(
          sourceRecipe,
          day,
          mealTimes[mealIndex],
          userIngredients,
          unitSystem
        ));
      }
    } else {
      console.log('Using mock recipes (Spoonacular unavailable or no API key)');
      recipes = generateMockRecipes(userIngredients, mealsPerDay, unitSystem);
    }

    return NextResponse.json({
      recipes,
      totalFound: recipes.length,
      source: spoonacularRecipes ? 'spoonacular' : 'mock'
    });

  } catch (error) {
    console.error('Fetch web recipes error:', error);
    return NextResponse.json({
      error: 'Failed to fetch recipes from web'
    }, { status: 500 });
  }
}
