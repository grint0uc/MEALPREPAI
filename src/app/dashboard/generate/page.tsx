'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import RecipeCard from '@/components/recipes/RecipeCard';
import RecipeModal from '@/components/recipes/RecipeModal';
import RecipeDetail from '@/components/recipes/RecipeDetail';

interface Recipe {
  id: string;
  name: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  fridge_life: number;
  ingredients: Array<{
    name: string;
    amount: string;
    fromFridge: boolean;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  storage_tips: string;
  day_number: number;
  meal_time: string;
}

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [loadingRecipeId, setLoadingRecipeId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [ingredientCount, setIngredientCount] = useState(0);
  const [credits, setCredits] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipeSource, setRecipeSource] = useState<'ai' | 'web' | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMealTime, setFilterMealTime] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count } = await supabase
      .from('user_ingredients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setIngredientCount(count || 0);

    const { data: userProfile } = await supabase
      .from('users')
      .select('credits, subscription_tier')
      .eq('id', user.id)
      .single();

    setCredits(userProfile?.credits || 0);
    setSubscriptionTier(userProfile?.subscription_tier || 'free');

    // Load existing recipes if any
    await loadExistingRecipes(user.id);
  };

  const loadExistingRecipes = async (userId: string) => {
    const { data: existingRecipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('day_number', { ascending: true })
      .order('meal_time', { ascending: true });

    if (error) {
      console.error('Error loading recipes:', error);
      return;
    }

    if (existingRecipes && existingRecipes.length > 0) {
      setRecipes(existingRecipes);
      // Get source from first recipe (all recipes in a batch have same source)
      const source = existingRecipes[0].source as 'ai' | 'web' | null;
      setRecipeSource(source || 'ai');
    }
  };

  const handleGenerateRecipes = async (source: 'ai' | 'web') => {
    if (ingredientCount === 0) {
      setError('Please add ingredients to your fridge first!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setRecipeSource(source);

    try {
      const endpoint = source === 'ai' ? '/api/recipes/generate' : '/api/recipes/search-web';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.insufficientCredits) {
          setError(data.error);
        } else if (data.migration) {
          // Database migration needed
          setError(`${data.error}\n\nDetails: ${data.details}\n\nPlease run the migration: ${data.migration}`);
        } else if (data.details) {
          // Show detailed error message
          setError(`${data.error}\n\nDetails: ${data.details}`);
        } else {
          setError(data.error || 'Failed to generate recipes');
        }
        return;
      }

      setRecipes(data.recipes);
      setCredits(data.creditsRemaining || 0);

      // Auto-add to calendar
      await addRecipesToCalendar(data.recipes);

      setSuccessMessage(`Successfully generated ${data.recipes.length} recipes and added to your calendar!`);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addRecipesToCalendar = async (recipesToAdd: Recipe[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First delete existing meal plan
    await supabase
      .from('meal_plan')
      .delete()
      .eq('user_id', user.id);

    // Map day numbers to day names
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Add new recipes to meal plan
    const mealPlanEntries = recipesToAdd.map((recipe) => ({
      user_id: user.id,
      recipe_id: recipe.id,
      day_of_week: dayNames[(recipe.day_number - 1) % 7],
      meal_time: recipe.meal_time || 'dinner',
      servings: 1,
    }));

    const { error: insertError } = await supabase
      .from('meal_plan')
      .insert(mealPlanEntries);

    if (insertError) {
      console.error('Error adding recipes to calendar:', insertError);
    }
  };

  const handleRegenerateSingle = async (recipeId: string) => {
    if (!confirm('Regenerate this meal for 20 credits?')) return;

    setLoadingRecipeId(recipeId);
    setError('');

    try {
      const response = await fetch('/api/recipes/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to regenerate recipe');
        return;
      }

      setRecipes(recipes.map(r => r.id === recipeId ? data.recipe : r));
      setCredits(data.creditsRemaining || 0);
    } catch (err: any) {
      console.error('Regeneration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoadingRecipeId(null);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const mealsPerDay = subscriptionTier === 'free' ? 1 : 3;
  const totalRecipes = 7 * mealsPerDay;

  // Filter recipes based on search and meal time
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchQuery === '' ||
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMealTime = filterMealTime === 'all' || recipe.meal_time === filterMealTime;

    return matchesSearch && matchesMealTime;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Generate Meal Plan
          </h1>
          <p className="text-secondary-600">
            Choose how you want to create your weekly meal plan
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Ingredients</p>
                  <p className="text-lg font-bold text-secondary-900">{ingredientCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Credits</p>
                  <p className="text-lg font-bold text-primary-600">{credits}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Your Plan</p>
                  <p className="text-lg font-bold text-secondary-900">{totalRecipes} recipes/week</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* No Ingredients Warning */}
        {ingredientCount === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Add ingredients to your fridge before generating meal plans!{' '}
              <a href="/dashboard/fridge" className="underline font-medium">Go to Fridge →</a>
            </p>
          </div>
        )}

        {/* Recipe Source Selection - Only show if no recipes yet */}
        {!loading && recipes.length === 0 && ingredientCount > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* AI Generated Option */}
            <div className="bg-white rounded-xl border-2 border-secondary-200 p-6 hover:border-primary-400 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">AI Generated Recipes</h3>
                  <p className="text-sm text-secondary-500">50 credits</p>
                </div>
              </div>
              <p className="text-secondary-600 mb-4">
                Custom recipes created by AI based on your ingredients and fitness goals.
                Unique recipes tailored just for you.
              </p>
              <ul className="text-sm text-secondary-600 mb-6 space-y-1">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {totalRecipes} custom recipes
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Optimized for your goal
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Auto-added to calendar
                </li>
              </ul>
              <button
                onClick={() => handleGenerateRecipes('ai')}
                disabled={loading || credits < 50}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate AI Recipes
              </button>
            </div>

            {/* Web Recipes Option */}
            <div className="bg-white rounded-xl border-2 border-secondary-200 p-6 hover:border-primary-400 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">Web Recipes</h3>
                  <p className="text-sm text-secondary-500">100 credits</p>
                </div>
              </div>
              <p className="text-secondary-600 mb-4">
                Popular recipes from trusted cooking websites, matched to your
                available ingredients.
              </p>
              <ul className="text-sm text-secondary-600 mb-6 space-y-1">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {totalRecipes} curated recipes
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Tested & reviewed
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Auto-added to calendar
                </li>
              </ul>
              <button
                onClick={() => handleGenerateRecipes('web')}
                disabled={loading || credits < 100}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search Web Recipes
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-lg border border-secondary-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
            <p className="text-secondary-600 font-medium">
              {recipeSource === 'ai' ? 'Generating your custom meal plan...' : 'Searching for recipes...'}
            </p>
            <p className="text-secondary-500 text-sm mt-2">This may take up to 30 seconds</p>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && recipes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-secondary-900">
                  Your Weekly Meal Plan
                </h2>
                <p className="text-sm text-secondary-500">
                  {recipeSource === 'ai' ? '🤖 AI Generated' : '🌐 Web Recipes'} • {recipes.length} recipes
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white border border-secondary-200 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-3">
                {/* Web Search Button */}
                <button
                  onClick={() => {
                    if (confirm('Search for web recipes?\n\nThis will cost 100 credits and replace your current recipes.')) {
                      handleGenerateRecipes('web');
                    }
                  }}
                  disabled={loading || credits < 100}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>🌐</span>
                  <span>Web Search</span>
                  <span className="text-xs opacity-75">(100 credits)</span>
                </button>

                {/* AI Generate Button */}
                <button
                  onClick={() => {
                    if (confirm('Generate AI recipes?\n\nThis will cost 50 credits and replace your current recipes.')) {
                      handleGenerateRecipes('ai');
                    }
                  }}
                  disabled={loading || credits < 50}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>🤖</span>
                  <span>AI Generate</span>
                  <span className="text-xs opacity-75">(50 credits)</span>
                </button>
              </div>
              <p className="text-xs text-secondary-500 mt-2">
                Generating new recipes will replace your current meal plan and calendar.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ These recipes have been automatically added to your calendar. Nutrition values are approximate estimates.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white border border-secondary-200 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search recipes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Meal Time Filter */}
                {mealsPerDay > 1 && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-secondary-600">Filter:</label>
                    <select
                      value={filterMealTime}
                      onChange={(e) => setFilterMealTime(e.target.value)}
                      className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Meals</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                )}
              </div>

              {(searchQuery || filterMealTime !== 'all') && (
                <p className="text-sm text-secondary-500 mt-2">
                  Showing {filteredRecipes.length} of {recipes.length} recipes
                  {searchQuery && <span> matching "{searchQuery}"</span>}
                  {filterMealTime !== 'all' && <span> for {filterMealTime}</span>}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="relative">
                  {loadingRecipeId === recipe.id ? (
                    <div className="bg-white rounded-lg border border-secondary-200 shadow-sm p-6 flex flex-col items-center justify-center min-h-[280px]">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mb-3"></div>
                      <p className="text-secondary-600 font-medium">Regenerating...</p>
                    </div>
                  ) : (
                    <>
                      <RecipeCard
                        recipe={{
                          id: recipe.id,
                          name: recipe.name,
                          prepTime: recipe.prep_time,
                          cookTime: recipe.cook_time,
                          servings: recipe.servings,
                          fridgeLifeDays: recipe.fridge_life,
                          nutrition: recipe.nutrition,
                        }}
                        onClick={() => handleRecipeClick(recipe)}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateSingle(recipe.id);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm border border-secondary-200 transition-colors"
                        title="Regenerate this meal (20 credits)"
                      >
                        <svg className="w-4 h-4 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRecipe(null);
          }}
        >
          <RecipeDetail
            recipe={{
              id: selectedRecipe.id,
              name: selectedRecipe.name,
              prepTime: selectedRecipe.prep_time,
              cookTime: selectedRecipe.cook_time,
              servings: selectedRecipe.servings,
              fridgeLifeDays: selectedRecipe.fridge_life,
              ingredients: selectedRecipe.ingredients.map((ing: any) => {
                const amountStr = ing.amount || '';
                const match = amountStr.match(/^([\d./\s]+)(.*)$/);

                return {
                  name: ing.name,
                  quantity: match ? match[1].trim() : amountStr,
                  unit: match ? match[2].trim() : '',
                  available: ing.fromFridge,
                };
              }),
              instructions: selectedRecipe.instructions,
              storageInstructions: selectedRecipe.storage_tips,
              nutrition: selectedRecipe.nutrition,
            }}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedRecipe(null);
            }}
          />
        </RecipeModal>
      )}
    </DashboardLayout>
  );
}
