'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { parseAmount, formatAmount } from '@/lib/units';

interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
  available?: boolean;
}

interface Recipe {
  id?: string;
  name: string;
  cookTime: number;
  prepTime?: number;
  servings: number;
  fridgeLifeDays: number;
  cuisine?: string;
  difficulty?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  storageInstructions?: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface RecipeDetailProps {
  recipe: Recipe;
  onClose?: () => void;
  userIngredients?: string[];
}

export default function RecipeDetail({ recipe, onClose, userIngredients = [] }: RecipeDetailProps) {
  const [adjustedServings, setAdjustedServings] = useState(recipe.servings);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'us' | 'metric'>('us');
  const [userNotes, setUserNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showNotesSection, setShowNotesSection] = useState(false);
  const servingMultiplier = adjustedServings / recipe.servings;
  const supabase = createClient();

  // Load unit system preference
  useEffect(() => {
    loadUnitPreference();
  }, []);

  const loadUnitPreference = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('unit_system')
      .eq('user_id', user.id)
      .single();

    if (data?.unit_system) {
      setUnitSystem(data.unit_system);
    }
  };

  // Load favorite status, notes, and rating when component mounts
  useEffect(() => {
    loadRecipeData();
  }, [recipe.id]);

  const loadRecipeData = async () => {
    if (!recipe.id) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('recipes')
      .select('is_favorite, user_notes, rating')
      .eq('id', recipe.id)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setIsFavorite(data.is_favorite || false);
      setUserNotes(data.user_notes || '');
      setRating(data.rating || null);
      if (data.user_notes || data.rating) {
        setShowNotesSection(true);
      }
    }
  };

  const toggleFavorite = async () => {
    if (!recipe.id) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newFavoriteState = !isFavorite;

    // Update UI immediately
    setIsFavorite(newFavoriteState);

    // Update in database
    const { error } = await supabase
      .from('recipes')
      .update({ is_favorite: newFavoriteState })
      .eq('id', recipe.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update favorite:', error);
      // Revert on error
      setIsFavorite(!newFavoriteState);
      alert('Failed to update favorite. Please try again.');
    }
  };

  const saveNotesAndRating = async () => {
    if (!recipe.id) return;

    setIsSavingNotes(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('recipes')
        .update({
          user_notes: userNotes || null,
          rating: rating
        })
        .eq('id', recipe.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to save notes:', error);
        alert('Failed to save notes. Please try again.');
      }
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleRatingClick = async (newRating: number) => {
    const updatedRating = rating === newRating ? null : newRating;
    setRating(updatedRating);

    if (!recipe.id) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('recipes')
      .update({ rating: updatedRating })
      .eq('id', recipe.id)
      .eq('user_id', user.id);
  };

  const markAsCooked = async () => {
    if (!recipe.id) return;

    setIsMarking(true);
    try {
      const response = await fetch('/api/recipes/mark-cooked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: recipe.id,
          servings: adjustedServings,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Marked as cooked! Ingredients have been deducted from your fridge.`);
      } else {
        alert(`Failed to mark as cooked: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to mark as cooked:', error);
      alert('Failed to mark as cooked. Please try again.');
    } finally {
      setIsMarking(false);
    }
  };

  const adjustIngredientQuantity = (quantity: string, unit: string) => {
    // Parse amount using centralized function
    const amount = parseAmount(quantity);

    // Adjust for servings
    const adjusted = amount * servingMultiplier;

    // Format using centralized function
    const formattedAmount = formatAmount(adjusted, unitSystem);

    // Return with unit if present, otherwise just the amount
    return unit ? `${formattedAmount} ${unit}` : formattedAmount;
  };
  const getFridgeLifeBadge = (days: number) => {
    if (days >= 4) {
      return { color: 'bg-green-100 text-green-800', icon: '🟢', text: `Stores ${days} days` };
    } else if (days >= 2) {
      return { color: 'bg-yellow-100 text-yellow-800', icon: '🟡', text: `Stores ${days} days` };
    } else {
      return { color: 'bg-red-100 text-red-800', icon: '🔴', text: 'Consume same day' };
    }
  };

  const fridgeLife = getFridgeLifeBadge(recipe.fridgeLifeDays);
  const availableCount = recipe.ingredients.filter((ing) =>
    userIngredients.some((ui) => ui.toLowerCase() === ing.name.toLowerCase())
  ).length;

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-secondary-900">{recipe.name}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          {recipe.id && (
            <>
              <button
                onClick={markAsCooked}
                disabled={isMarking}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Mark as cooked and deduct ingredients from fridge"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isMarking ? 'Marking...' : 'Mark as Cooked'}
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Recipe Info */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-secondary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">
              {recipe.prepTime ? recipe.prepTime + recipe.cookTime : recipe.cookTime}
            </div>
            <div className="text-sm text-secondary-600 mt-1">
              {recipe.prepTime ? 'Total Time' : 'Cook Time'}
            </div>
            {recipe.prepTime && (
              <div className="text-xs text-secondary-500 mt-1">
                Prep: {recipe.prepTime}m | Cook: {recipe.cookTime}m
              </div>
            )}
          </div>

          <div className="text-center p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setAdjustedServings(Math.max(1, adjustedServings - 1))}
                className="w-8 h-8 rounded-full bg-white border border-secondary-300 hover:bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold"
              >
                −
              </button>
              <div className="text-2xl font-bold text-primary-600 min-w-[60px]">{adjustedServings}</div>
              <button
                onClick={() => setAdjustedServings(adjustedServings + 1)}
                className="w-8 h-8 rounded-full bg-white border border-secondary-300 hover:bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold"
              >
                +
              </button>
            </div>
            <div className="text-sm text-secondary-600 mt-1">Servings</div>
            {adjustedServings !== recipe.servings && (
              <div className="text-xs text-secondary-500 mt-1">
                Original: {recipe.servings}
              </div>
            )}
          </div>

          <div className="text-center p-4 bg-secondary-50 rounded-lg">
            <div className="text-sm font-medium text-secondary-900">{fridgeLife.text}</div>
            <div className="text-xs text-secondary-500 mt-1">Fridge Life</div>
          </div>
        </div>

        {/* Badges */}
        {(recipe.cuisine || recipe.difficulty) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.cuisine && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {recipe.cuisine}
              </span>
            )}
            {recipe.difficulty && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {recipe.difficulty}
              </span>
            )}
          </div>
        )}

        {/* Nutrition Info */}
        {recipe.nutrition && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Nutrition Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-600">{Math.round(recipe.nutrition.calories * servingMultiplier)}</div>
                <div className="text-sm text-secondary-600 mt-1">Calories</div>
                <div className="text-xs text-secondary-400 mt-1">
                  {Math.round(recipe.nutrition.calories)} per serving
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{Math.round(recipe.nutrition.protein * servingMultiplier)}g</div>
                <div className="text-sm text-secondary-600 mt-1">Protein</div>
                <div className="text-xs text-secondary-400 mt-1">
                  {Math.round(recipe.nutrition.protein)}g per serving
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600">{Math.round(recipe.nutrition.carbs * servingMultiplier)}g</div>
                <div className="text-sm text-secondary-600 mt-1">Carbs</div>
                <div className="text-xs text-secondary-400 mt-1">
                  {Math.round(recipe.nutrition.carbs)}g per serving
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-yellow-600">{Math.round(recipe.nutrition.fats * servingMultiplier)}g</div>
                <div className="text-sm text-secondary-600 mt-1">Fats</div>
                <div className="text-xs text-secondary-400 mt-1">
                  {Math.round(recipe.nutrition.fats)}g per serving
                </div>
              </div>
            </div>
            <p className="text-xs text-secondary-500 text-center mt-4">
              ⚠️ Nutrition values are approximate estimates based on ingredients
            </p>
          </div>
        )}

        {/* Ingredients Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-secondary-900">Ingredients</h3>
            {userIngredients.length > 0 && (
              <span className="text-sm text-secondary-600">
                You have {availableCount} of {recipe.ingredients.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => {
              const isAvailable = userIngredients.some(
                (ui) => ui.toLowerCase() === ingredient.name.toLowerCase()
              );
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isAvailable
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isAvailable
                        ? 'border-green-500 bg-green-500'
                        : 'border-secondary-300 bg-white'
                    }`}
                  >
                    {isAvailable && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={isAvailable ? 'text-secondary-900' : 'text-secondary-700'}>
                      {adjustIngredientQuantity(ingredient.quantity, ingredient.unit)} {ingredient.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">Instructions</h3>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-secondary-700 leading-relaxed">{instruction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storage Instructions */}
        {recipe.storageInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Storage Tips</h4>
                <p className="text-sm text-blue-800">{recipe.storageInstructions}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes & Rating Section */}
        {recipe.id && (
          <div className="mb-6">
            <button
              onClick={() => setShowNotesSection(!showNotesSection)}
              className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-3"
            >
              <svg className={`w-4 h-4 transition-transform ${showNotesSection ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium">Notes & Rating</span>
              {rating && (
                <span className="text-yellow-500">
                  {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                </span>
              )}
            </button>

            {showNotesSection && (
              <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Your Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        className={`text-2xl transition-colors ${
                          rating && star <= rating
                            ? 'text-yellow-400 hover:text-yellow-500'
                            : 'text-secondary-300 hover:text-yellow-400'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    {rating && (
                      <button
                        onClick={() => handleRatingClick(rating)}
                        className="ml-2 text-xs text-secondary-500 hover:text-secondary-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Personal Notes</label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Add your notes about this recipe (modifications, tips, etc.)"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={saveNotesAndRating}
                      disabled={isSavingNotes}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
                    >
                      {isSavingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Print Button */}
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <button
            onClick={() => window.print()}
            className="w-full px-4 py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
