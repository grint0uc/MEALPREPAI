'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Recipe {
  id: string;
  name: string;
  servings: number;
  meal_time: string;
  day_number: number;
  fridge_life: number;
}

interface MealPlan {
  [day: string]: {
    [mealTime: string]: {
      recipeId: string;
      recipeName: string;
      servings: number;
    } | null;
  };
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTimes = ['breakfast', 'lunch', 'dinner'];

export default function CalendarPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [clearing, setClearing] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: recipesData } = await supabase
      .from('recipes')
      .select('id, name, servings, meal_time, day_number, fridge_life')
      .eq('user_id', user.id)
      .order('day_number', { ascending: true });

    if (recipesData) {
      setRecipes(recipesData);

      // Initialize empty meal plan
      const plan: MealPlan = {};
      daysOfWeek.forEach((day) => {
        plan[day] = {
          breakfast: null,
          lunch: null,
          dinner: null,
        };
      });

      // Load saved meal plan from database
      const { data: mealPlanData } = await supabase
        .from('meal_plan')
        .select(`
          day_of_week,
          meal_time,
          servings,
          recipe:recipes (id, name)
        `)
        .eq('user_id', user.id);

      if (mealPlanData && mealPlanData.length > 0) {
        // Use saved meal plan
        mealPlanData.forEach((meal: any) => {
          if (plan[meal.day_of_week] && meal.recipe) {
            plan[meal.day_of_week][meal.meal_time] = {
              recipeId: meal.recipe.id,
              recipeName: meal.recipe.name,
              servings: meal.servings,
            };
          }
        });
      } else {
        // Auto-fill from recipes if no saved meal plan
        recipesData.forEach(recipe => {
          const dayIndex = (recipe.day_number - 1) % 7;
          const day = daysOfWeek[dayIndex];
          if (plan[day] && recipe.meal_time) {
            plan[day][recipe.meal_time] = {
              recipeId: recipe.id,
              recipeName: recipe.name,
              servings: recipe.servings,
            };
          }
        });
      }

      setMealPlan(plan);
    }
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, recipe: Recipe) => {
    e.dataTransfer.setData('recipeId', recipe.id);
    e.dataTransfer.setData('recipeName', recipe.name);
    e.dataTransfer.setData('servings', recipe.servings.toString());
  };

  const saveMealToDatabase = async (day: string, mealTime: string, recipeId: string, servings: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('meal_plan')
      .upsert({
        user_id: user.id,
        day_of_week: day,
        meal_time: mealTime,
        recipe_id: recipeId,
        servings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,day_of_week,meal_time'
      });
  };

  const handleDrop = async (e: React.DragEvent, day: string, mealTime: string) => {
    e.preventDefault();
    const recipeId = e.dataTransfer.getData('recipeId');
    const recipeName = e.dataTransfer.getData('recipeName');
    const servings = parseInt(e.dataTransfer.getData('servings'));

    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealTime]: { recipeId, recipeName, servings },
      },
    }));

    // Save to database
    await saveMealToDatabase(day, mealTime, recipeId, servings);
  };

  const handleMobileRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleMobileCellClick = async (day: string, mealTime: string) => {
    if (!selectedRecipe) return;

    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealTime]: {
          recipeId: selectedRecipe.id,
          recipeName: selectedRecipe.name,
          servings: selectedRecipe.servings,
        },
      },
    }));

    // Save to database
    await saveMealToDatabase(day, mealTime, selectedRecipe.id, selectedRecipe.servings);

    // Clear selection after placing
    setSelectedRecipe(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeMeal = async (day: string, mealTime: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealTime]: null,
      },
    }));

    // Remove from database
    await supabase
      .from('meal_plan')
      .delete()
      .eq('user_id', user.id)
      .eq('day_of_week', day)
      .eq('meal_time', mealTime);
  };

  const adjustServings = async (day: string, mealTime: string, delta: number) => {
    const meal = mealPlan[day]?.[mealTime];
    if (!meal) return;

    const newServings = Math.max(1, meal.servings + delta);
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealTime]: {
          ...meal,
          servings: newServings,
        },
      },
    }));

    // Update servings in database
    await saveMealToDatabase(day, mealTime, meal.recipeId, newServings);
  };

  const handlePrintCalendar = () => {
    window.print();
  };

  const handleExportCalendar = () => {
    let text = 'WEEKLY MEAL PLAN\n';
    text += '='.repeat(50) + '\n\n';

    daysOfWeek.forEach(day => {
      text += `${day.toUpperCase()}\n`;
      text += '-'.repeat(30) + '\n';

      mealTimes.forEach(mealTime => {
        const meal = mealPlan[day]?.[mealTime];
        const mealLabel = mealTime.charAt(0).toUpperCase() + mealTime.slice(1);
        if (meal) {
          text += `  ${mealLabel}: ${meal.recipeName} (${meal.servings} serving${meal.servings > 1 ? 's' : ''})\n`;
        } else {
          text += `  ${mealLabel}: -\n`;
        }
      });
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllRecipes = async () => {
    if (!confirm('Are you sure you want to clear all recipes and meal plan? This cannot be undone.')) {
      return;
    }

    setClearing(true);
    try {
      const response = await fetch('/api/recipes/cleanup', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setRecipes([]);
        setMealPlan({});
        alert('✅ All recipes and meal plan cleared successfully!');
      } else {
        alert(`Failed to clear: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to clear recipes:', error);
      alert('Failed to clear recipes. Please try again.');
    } finally {
      setClearing(false);
    }
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Meal Prep Calendar</h1>
            <p className="text-secondary-600">
              Drag recipes to plan your week. Adjust servings to spread meals across multiple days.
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleExportCalendar}
              className="px-4 py-2 bg-white text-secondary-700 border border-secondary-300 rounded-lg hover:bg-secondary-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button
              onClick={handlePrintCalendar}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={() => {
                setLoading(true);
                loadRecipes();
              }}
              className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={clearAllRecipes}
              disabled={clearing}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-secondary-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No recipes yet</h3>
            <p className="text-secondary-600 mb-4">Generate a weekly meal plan first to use the calendar</p>
            <a href="/dashboard/generate" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Generate Meal Plan
            </a>
          </div>
        ) : (
          <div className={`grid gap-6 items-start ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-4'}`}>
            {/* Available Recipes Sidebar */}
            <div className={isMobile ? '' : 'lg:col-span-1'}>
              <div className="bg-white rounded-lg border border-secondary-200 flex flex-col" style={{ height: isMobile ? '300px' : 'calc(100vh - 200px)' }}>
                <div className="p-4 border-b border-secondary-200">
                  <h3 className="font-semibold text-secondary-900">Available Recipes</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {isMobile && selectedRecipe && (
                    <div className="mb-3 p-3 bg-primary-100 border border-primary-300 rounded-lg">
                      <p className="text-xs text-primary-800 font-medium mb-1">Selected: {selectedRecipe.name}</p>
                      <p className="text-xs text-primary-700">Tap a calendar slot to place this recipe</p>
                      <button
                        onClick={() => setSelectedRecipe(null)}
                        className="mt-2 text-xs text-primary-600 underline"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {recipes.map(recipe => (
                    <div
                      key={recipe.id}
                      draggable={!isMobile}
                      onDragStart={(e) => !isMobile && handleDragStart(e, recipe)}
                      onClick={() => isMobile && handleMobileRecipeClick(recipe)}
                      className={`p-3 rounded-lg transition-colors border ${
                        selectedRecipe?.id === recipe.id
                          ? 'bg-primary-100 border-primary-300'
                          : 'bg-secondary-50 border-secondary-200 hover:bg-secondary-100'
                      } ${isMobile ? 'cursor-pointer' : 'cursor-move'}`}
                    >
                      <div className="font-medium text-sm text-secondary-900 mb-1">{recipe.name}</div>
                      <div className="text-xs text-secondary-600">{recipe.servings} servings • {recipe.fridge_life} days</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-secondary-200">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>Tip:</strong> Make 3 servings and spread them across 4 days by dragging the same recipe multiple times!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className={isMobile ? '' : 'lg:col-span-3'} style={{ height: isMobile ? 'auto' : 'calc(100vh - 200px)' }}>
              <div className="bg-white rounded-lg border border-secondary-200 overflow-auto" style={{ height: isMobile ? 'auto' : '100%' }}>
                <div className="grid grid-cols-7 border-b border-secondary-200">
                  {daysOfWeek.map(day => (
                    <div key={day} className="p-3 bg-secondary-50 border-r border-secondary-200 last:border-r-0">
                      <div className="font-semibold text-sm text-secondary-900">{day}</div>
                    </div>
                  ))}
                </div>

                {mealTimes.map(mealTime => (
                  <div key={mealTime} className="grid grid-cols-7 border-b border-secondary-200 last:border-b-0">
                    {daysOfWeek.map(day => {
                      const meal = mealPlan[day]?.[mealTime];
                      return (
                        <div
                          key={`${day}-${mealTime}`}
                          onDrop={(e) => !isMobile && handleDrop(e, day, mealTime)}
                          onDragOver={!isMobile ? handleDragOver : undefined}
                          onClick={() => isMobile && !meal && handleMobileCellClick(day, mealTime)}
                          className={`min-h-[100px] p-2 border-r border-secondary-200 last:border-r-0 transition-colors ${
                            isMobile && selectedRecipe && !meal
                              ? 'hover:bg-primary-50 cursor-pointer'
                              : 'hover:bg-secondary-50'
                          }`}
                        >
                          <div className="text-xs text-secondary-500 mb-1 capitalize">{mealTime}</div>
                          {meal ? (
                            <div className="bg-primary-50 border border-primary-200 rounded p-2 relative group">
                              <button
                                onClick={() => removeMeal(day, mealTime)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                              <div className="text-xs font-medium text-secondary-900 mb-2 pr-4">{meal.recipeName}</div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => adjustServings(day, mealTime, -1)}
                                  className="w-5 h-5 rounded bg-white border border-secondary-300 flex items-center justify-center text-xs hover:bg-secondary-50"
                                >
                                  −
                                </button>
                                <span className="text-xs text-secondary-700 flex-1 text-center">{meal.servings}</span>
                                <button
                                  onClick={() => adjustServings(day, mealTime, 1)}
                                  className="w-5 h-5 rounded bg-white border border-secondary-300 flex items-center justify-center text-xs hover:bg-secondary-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-secondary-400 text-center py-4">Drop here</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
