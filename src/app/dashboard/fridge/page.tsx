'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import IngredientSearch from '@/components/ingredients/IngredientSearch';
import { createClient } from '@/lib/supabase';
import { normalizeUnit } from '@/lib/units';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  unit: string;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
}

interface UserIngredient extends Ingredient {
  userIngredientId: string;
  quantity: number;
  userUnit: string;
  added_at: string;
}

export default function FridgePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<UserIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'category' | 'none'>('category');
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadUserIngredients();
    }
  }, [user]);

  const loadUserIngredients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_ingredients')
        .select(`
          id,
          quantity,
          unit,
          added_at,
          ingredient_id,
          ingredients (
            id,
            name,
            category,
            subcategory,
            unit,
            calories_per_100g,
            protein_per_100g
          )
        `)
        .eq('user_id', user?.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      const formattedIngredients = (data || []).map((item: any) => ({
        userIngredientId: item.id,
        quantity: item.quantity,
        userUnit: item.unit,
        added_at: item.added_at,
        id: item.ingredients.id,
        name: item.ingredients.name,
        category: item.ingredients.category,
        subcategory: item.ingredients.subcategory,
        unit: item.ingredients.unit,
        calories_per_100g: item.ingredients.calories_per_100g,
        protein_per_100g: item.ingredients.protein_per_100g,
      }));

      setIngredients(formattedIngredients);
    } catch (err: any) {
      console.error('Error loading ingredients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async (ingredient: Ingredient & { quantity: number; userUnit: string }) => {
    try {
      // Check if ingredient already exists
      const existing = ingredients.find((i) => i.id === ingredient.id);
      if (existing) {
        setError('This ingredient is already in your fridge. You can update the quantity below.');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const { data, error } = await supabase
        .from('user_ingredients')
        .insert({
          user_id: user?.id,
          ingredient_id: ingredient.id,
          quantity: ingredient.quantity,
          unit: normalizeUnit(ingredient.userUnit),
        })
        .select()
        .single();

      if (error) throw error;

      await loadUserIngredients();
    } catch (err: any) {
      console.error('Error adding ingredient:', err);
      setError(err.message);
    }
  };

  const handleUpdateQuantity = async (userIngredientId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('user_ingredients')
        .update({ quantity: newQuantity })
        .eq('id', userIngredientId);

      if (error) throw error;

      setIngredients((prev) =>
        prev.map((ing) =>
          ing.userIngredientId === userIngredientId ? { ...ing, quantity: newQuantity } : ing
        )
      );
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      setError(err.message);
    }
  };

  const handleRemoveIngredient = async (userIngredientId: string) => {
    try {
      const { error } = await supabase
        .from('user_ingredients')
        .delete()
        .eq('id', userIngredientId);

      if (error) throw error;

      setIngredients((prev) => prev.filter((ing) => ing.userIngredientId !== userIngredientId));
    } catch (err: any) {
      console.error('Error removing ingredient:', err);
      setError(err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to remove all ingredients from your fridge?')) return;

    try {
      const { error } = await supabase
        .from('user_ingredients')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setIngredients([]);
    } catch (err: any) {
      console.error('Error clearing ingredients:', err);
      setError(err.message);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      proteins: 'bg-red-100 text-red-800 border-red-200',
      vegetables: 'bg-green-100 text-green-800 border-green-200',
      fruits: 'bg-pink-100 text-pink-800 border-pink-200',
      grains: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dairy: 'bg-blue-100 text-blue-800 border-blue-200',
      fats_oils: 'bg-purple-100 text-purple-800 border-purple-200',
      spices_herbs: 'bg-orange-100 text-orange-800 border-orange-200',
      condiments: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      legumes: 'bg-amber-100 text-amber-800 border-amber-200',
      nuts_seeds: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      beverages: 'bg-teal-100 text-teal-800 border-teal-200',
      other: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    };
    return colors[category as keyof typeof colors] || 'bg-secondary-100 text-secondary-800 border-secondary-200';
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const groupedIngredients = () => {
    if (groupBy === 'none') {
      return { 'All Ingredients': ingredients };
    }

    const grouped: Record<string, UserIngredient[]> = {};
    ingredients.forEach((ing) => {
      const key = formatCategoryName(ing.category);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ing);
    });
    return grouped;
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Loading your ingredients...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const grouped = groupedIngredients();

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-secondary-900">My Fridge</h1>
          <p className="text-secondary-600 mt-2">
            Add ingredients you have on hand to generate personalized meal plans
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Add Ingredients</h2>
          <IngredientSearch
            onAddIngredient={handleAddIngredient}
            selectedIngredients={ingredients}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">
                Your Ingredients ({ingredients.length})
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'category' | 'none')}
                className="px-3 py-1.5 border border-secondary-300 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="category">Group by Category</option>
                <option value="none">No Grouping</option>
              </select>
              {ingredients.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-danger-600 hover:text-danger-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {ingredients.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-secondary-900">No ingredients yet</h3>
              <p className="mt-2 text-sm text-secondary-500">
                Start by searching and adding ingredients above
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([categoryName, categoryIngredients]) => (
                <div key={categoryName}>
                  {groupBy === 'category' && (
                    <h3 className="text-sm font-semibold text-secondary-700 uppercase tracking-wide mb-3">
                      {categoryName} ({categoryIngredients.length})
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryIngredients.map((ingredient) => (
                      <div
                        key={ingredient.userIngredientId}
                        className={`border rounded-lg p-4 ${getCategoryColor(ingredient.category)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-secondary-900 truncate">
                              {ingredient.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-2">
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={ingredient.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(
                                    ingredient.userIngredientId,
                                    parseFloat(e.target.value) || 0.1
                                  )
                                }
                                className="w-20 px-2 py-1 border border-secondary-300 rounded text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <span className="text-sm text-secondary-700">{ingredient.userUnit}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveIngredient(ingredient.userIngredientId)}
                            className="ml-3 text-secondary-400 hover:text-danger-600 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {ingredients.length > 0 && (
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0"
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
              <div className="ml-3">
                <h4 className="text-sm font-medium text-primary-800">Ready to cook?</h4>
                <p className="mt-1 text-sm text-primary-700">
                  Head to the Generate Meals page to create recipes based on these ingredients!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
