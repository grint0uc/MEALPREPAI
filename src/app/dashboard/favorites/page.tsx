'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import RecipeCard from '@/components/recipes/RecipeCard';
import RecipeModal from '@/components/recipes/RecipeModal';
import RecipeDetail from '@/components/recipes/RecipeDetail';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check subscription tier
    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const isProUser = userProfile?.subscription_tier && userProfile.subscription_tier !== 'free';
    setIsPro(isProUser);

    if (isProUser) {
      // Load favorite recipes
      const { data: favoriteRecipes } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });

      if (favoriteRecipes) {
        setFavorites(favoriteRecipes);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isPro) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Favorites is a Pro Feature</h2>
            <p className="text-secondary-600 mb-6">
              Upgrade to Pro or Premium to save your favorite recipes and access them anytime!
            </p>
            <a
              href="/dashboard/upgrade"
              className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Favorite Recipes</h1>
          <p className="text-secondary-600">
            Your saved recipes for quick access
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-secondary-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No favorites yet</h3>
            <p className="text-secondary-600 mb-4">Start favoriting recipes from your meal plans!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={{
                  id: recipe.id,
                  name: recipe.name,
                  prepTime: recipe.prep_time,
                  cookTime: recipe.cook_time,
                  servings: recipe.servings,
                  fridgeLifeDays: recipe.fridge_life,
                }}
                onClick={() => {
                  setSelectedRecipe(recipe);
                  setIsModalOpen(true);
                }}
              />
            ))}
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
              ingredients: selectedRecipe.ingredients.map((ing: any) => ({
                name: ing.name,
                quantity: ing.amount.split(' ')[0] || '1',
                unit: ing.amount.split(' ').slice(1).join(' ') || '',
                available: ing.fromFridge,
              })),
              instructions: selectedRecipe.instructions,
              storageInstructions: selectedRecipe.storage_tips,
            }}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedRecipe(null);
              loadFavorites(); // Reload favorites in case user unfavorited
            }}
          />
        </RecipeModal>
      )}
    </DashboardLayout>
  );
}
