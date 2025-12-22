'use client';

interface RecipeCardProps {
  recipe: {
    id?: string;
    name: string;
    cookTime: number;
    prepTime?: number;
    servings: number;
    fridgeLifeDays: number;
    ingredientMatch?: number;
    totalIngredients?: number;
    cuisine?: string;
    difficulty?: string;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  onClick?: () => void;
  showDetails?: boolean;
}

export default function RecipeCard({ recipe, onClick, showDetails = false }: RecipeCardProps) {
  const getFridgeLifeBadge = (days: number) => {
    if (days >= 4) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '🟢',
        text: `${days} days`,
      };
    } else if (days >= 2) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '🟡',
        text: `${days} days`,
      };
    } else {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '🔴',
        text: 'Same day',
      };
    }
  };

  const getMatchPercentage = () => {
    if (!recipe.ingredientMatch || !recipe.totalIngredients) return null;
    return Math.round((recipe.ingredientMatch / recipe.totalIngredients) * 100);
  };

  const fridgeLife = getFridgeLifeBadge(recipe.fridgeLifeDays);
  const matchPercentage = getMatchPercentage();

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-secondary-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-secondary-900 flex-1 pr-2">{recipe.name}</h3>
          {matchPercentage !== null && matchPercentage === 100 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 flex-shrink-0">
              ✓ All ingredients
            </span>
          )}
        </div>

        {/* Recipe Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {recipe.prepTime ? `${recipe.prepTime + recipe.cookTime} min` : `${recipe.cookTime} min`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Fridge Life Badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${fridgeLife.color}`}
          >
            {fridgeLife.icon} {fridgeLife.text}
          </span>

          {/* Cuisine Badge */}
          {recipe.cuisine && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              {recipe.cuisine}
            </span>
          )}

          {/* Difficulty Badge */}
          {recipe.difficulty && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              {recipe.difficulty}
            </span>
          )}
        </div>

        {/* Nutrition Info */}
        {recipe.nutrition && (
          <div className="border-t border-secondary-200 pt-3 mb-3">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <p className="text-secondary-500">Cal</p>
                <p className="font-semibold text-secondary-900">{recipe.nutrition.calories}</p>
              </div>
              <div>
                <p className="text-secondary-500">Pro</p>
                <p className="font-semibold text-secondary-900">{recipe.nutrition.protein}g</p>
              </div>
              <div>
                <p className="text-secondary-500">Carbs</p>
                <p className="font-semibold text-secondary-900">{recipe.nutrition.carbs}g</p>
              </div>
              <div>
                <p className="text-secondary-500">Fat</p>
                <p className="font-semibold text-secondary-900">{recipe.nutrition.fats}g</p>
              </div>
            </div>
            <p className="text-xs text-secondary-400 text-center mt-2">
              ⚠️ Approximate values per serving
            </p>
          </div>
        )}

        {/* Ingredient Match */}
        {recipe.ingredientMatch !== undefined && recipe.totalIngredients !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-secondary-600">Ingredient Match</span>
              <span className="font-medium text-secondary-900">
                {recipe.ingredientMatch}/{recipe.totalIngredients}
              </span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  matchPercentage === 100
                    ? 'bg-success-500'
                    : matchPercentage && matchPercentage >= 70
                    ? 'bg-primary-500'
                    : 'bg-yellow-500'
                }`}
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        {showDetails && (
          <button className="w-full mt-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium rounded-lg transition-colors border border-primary-200">
            View Recipe
          </button>
        )}
      </div>
    </div>
  );
}
