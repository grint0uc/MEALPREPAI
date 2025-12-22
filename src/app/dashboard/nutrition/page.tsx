'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

interface NutritionData {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  avgCaloriesPerDay: number;
  avgProteinPerDay: number;
  avgCarbsPerDay: number;
  avgFatsPerDay: number;
  dailyBreakdown: {
    day: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    meals: number;
  }[];
}

export default function NutritionPage() {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');
  const { dbUser } = useAuth();
  const supabase = createClient();

  const isPremium = dbUser?.subscription_tier === 'pro' || dbUser?.subscription_tier === 'premium';

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get meal plan with recipe nutrition data
      const { data: mealPlan } = await supabase
        .from('meal_plan')
        .select(`
          day_of_week,
          meal_time,
          servings,
          recipe:recipes (
            name,
            servings,
            nutrition
          )
        `)
        .eq('user_id', user.id);

      if (!mealPlan || mealPlan.length === 0) {
        setNutritionData(null);
        setLoading(false);
        return;
      }

      // Calculate nutrition totals and daily breakdown
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dailyBreakdown: { [key: string]: any } = {};

      daysOfWeek.forEach(day => {
        dailyBreakdown[day] = {
          day,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          meals: 0
        };
      });

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      mealPlan.forEach((meal: any) => {
        if (!meal.recipe?.nutrition) return;

        const servingMultiplier = meal.servings / meal.recipe.servings;
        const nutrition = meal.recipe.nutrition;

        const calories = (nutrition.calories || 0) * servingMultiplier;
        const protein = (nutrition.protein || 0) * servingMultiplier;
        const carbs = (nutrition.carbs || 0) * servingMultiplier;
        const fats = (nutrition.fats || 0) * servingMultiplier;

        totalCalories += calories;
        totalProtein += protein;
        totalCarbs += carbs;
        totalFats += fats;

        if (dailyBreakdown[meal.day_of_week]) {
          dailyBreakdown[meal.day_of_week].calories += calories;
          dailyBreakdown[meal.day_of_week].protein += protein;
          dailyBreakdown[meal.day_of_week].carbs += carbs;
          dailyBreakdown[meal.day_of_week].fats += fats;
          dailyBreakdown[meal.day_of_week].meals += 1;
        }
      });

      setNutritionData({
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFats: Math.round(totalFats),
        avgCaloriesPerDay: Math.round(totalCalories / 7),
        avgProteinPerDay: Math.round(totalProtein / 7),
        avgCarbsPerDay: Math.round(totalCarbs / 7),
        avgFatsPerDay: Math.round(totalFats / 7),
        dailyBreakdown: Object.values(dailyBreakdown)
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
      setLoading(false);
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

  if (!nutritionData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Nutrition Dashboard</h1>
            <p className="text-secondary-600">
              Track your weekly nutrition and macros
            </p>
          </div>

          <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-secondary-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No nutrition data yet</h3>
            <p className="text-secondary-600 mb-4">Add meals to your calendar to see nutrition insights</p>
            <a href="/dashboard/calendar" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Go to Calendar
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">Nutrition Dashboard</h1>
              <p className="text-secondary-600">
                Weekly nutrition breakdown from your meal plan
              </p>
            </div>

            {isPremium && (
              <div className="flex items-center gap-2 bg-white rounded-lg border border-secondary-200 p-1">
                <button
                  onClick={() => setViewMode('basic')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'basic'
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  Basic
                </button>
                <button
                  onClick={() => setViewMode('advanced')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'advanced'
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  Advanced
                </button>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-secondary-600">
              ⚠️ <strong>Note:</strong> Nutrition values are approximate estimates based on recipe ingredients and serving sizes. For precise tracking, consult a nutritionist.
            </p>
          </div>
        </div>

        {/* Basic View - Available to all users */}
        {viewMode === 'basic' && (
          <div className="space-y-6">
            {/* Weekly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-secondary-600">Avg Calories/Day</h3>
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="text-3xl font-bold text-secondary-900">{nutritionData.avgCaloriesPerDay}</p>
                <p className="text-xs text-secondary-500 mt-1">{nutritionData.totalCalories} total/week</p>
              </div>

              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-secondary-600">Avg Protein/Day</h3>
                  <span className="text-2xl">💪</span>
                </div>
                <p className="text-3xl font-bold text-secondary-900">{nutritionData.avgProteinPerDay}g</p>
                <p className="text-xs text-secondary-500 mt-1">{nutritionData.totalProtein}g total/week</p>
              </div>

              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-secondary-600">Avg Carbs/Day</h3>
                  <span className="text-2xl">🌾</span>
                </div>
                <p className="text-3xl font-bold text-secondary-900">{nutritionData.avgCarbsPerDay}g</p>
                <p className="text-xs text-secondary-500 mt-1">{nutritionData.totalCarbs}g total/week</p>
              </div>

              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-secondary-600">Avg Fats/Day</h3>
                  <span className="text-2xl">🥑</span>
                </div>
                <p className="text-3xl font-bold text-secondary-900">{nutritionData.avgFatsPerDay}g</p>
                <p className="text-xs text-secondary-500 mt-1">{nutritionData.totalFats}g total/week</p>
              </div>
            </div>

            {/* Macro Ratio Pie Chart */}
            <div className="bg-white rounded-lg border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Weekly Macro Ratio</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Simple Donut Chart */}
                <div className="relative w-48 h-48">
                  {(() => {
                    const total = nutritionData.totalProtein + nutritionData.totalCarbs + nutritionData.totalFats;
                    const proteinPct = (nutritionData.totalProtein / total) * 100;
                    const carbsPct = (nutritionData.totalCarbs / total) * 100;
                    const fatsPct = (nutritionData.totalFats / total) * 100;

                    const proteinDeg = (proteinPct / 100) * 360;
                    const carbsDeg = (carbsPct / 100) * 360;

                    return (
                      <div
                        className="w-full h-full rounded-full"
                        style={{
                          background: `conic-gradient(
                            #3b82f6 0deg ${proteinDeg}deg,
                            #22c55e ${proteinDeg}deg ${proteinDeg + carbsDeg}deg,
                            #eab308 ${proteinDeg + carbsDeg}deg 360deg
                          )`
                        }}
                      >
                        <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-secondary-900">{total}g</p>
                            <p className="text-xs text-secondary-500">Total Macros</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Legend */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span className="text-sm text-secondary-700 flex-1">Protein</span>
                    <span className="text-sm font-semibold text-secondary-900">{nutritionData.totalProtein}g</span>
                    <span className="text-sm text-secondary-500">
                      ({Math.round((nutritionData.totalProtein / (nutritionData.totalProtein + nutritionData.totalCarbs + nutritionData.totalFats)) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm text-secondary-700 flex-1">Carbs</span>
                    <span className="text-sm font-semibold text-secondary-900">{nutritionData.totalCarbs}g</span>
                    <span className="text-sm text-secondary-500">
                      ({Math.round((nutritionData.totalCarbs / (nutritionData.totalProtein + nutritionData.totalCarbs + nutritionData.totalFats)) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span className="text-sm text-secondary-700 flex-1">Fats</span>
                    <span className="text-sm font-semibold text-secondary-900">{nutritionData.totalFats}g</span>
                    <span className="text-sm text-secondary-500">
                      ({Math.round((nutritionData.totalFats / (nutritionData.totalProtein + nutritionData.totalCarbs + nutritionData.totalFats)) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Calories Bar Chart */}
            <div className="bg-white rounded-lg border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Daily Calorie Distribution</h3>
              <div className="flex items-end justify-between gap-2 h-48">
                {nutritionData.dailyBreakdown.map((day) => {
                  const maxCalories = Math.max(...nutritionData.dailyBreakdown.map(d => d.calories));
                  const heightPct = maxCalories > 0 ? (day.calories / maxCalories) * 100 : 0;

                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full flex justify-center mb-2 group">
                        <div
                          className="w-full max-w-12 bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                          style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? '8px' : '0' }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {Math.round(day.calories)} cal
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-secondary-600">{day.day.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <p className="text-sm text-secondary-500 text-center">
                  Average: <span className="font-semibold text-secondary-900">{nutritionData.avgCaloriesPerDay} cal/day</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Advanced View - Pro/Premium only */}
        {viewMode === 'advanced' && isPremium && (
          <div className="space-y-6">
            {/* Daily Breakdown Table */}
            <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
              <div className="p-4 bg-secondary-50 border-b border-secondary-200">
                <h3 className="text-lg font-semibold text-secondary-900">Daily Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50 border-b border-secondary-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">Day</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">Meals</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">Calories</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">Protein</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">Carbs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">Fats</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {nutritionData.dailyBreakdown.map((day) => (
                      <tr key={day.day} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">{day.day}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">{day.meals}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{Math.round(day.calories)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{Math.round(day.protein)}g</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{Math.round(day.carbs)}g</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">{Math.round(day.fats)}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weekly Averages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Macro Distribution (%)</h3>
                <div className="space-y-3">
                  {(() => {
                    const totalMacros = nutritionData.totalProtein + nutritionData.totalCarbs + nutritionData.totalFats;
                    const proteinPct = Math.round((nutritionData.totalProtein / totalMacros) * 100);
                    const carbsPct = Math.round((nutritionData.totalCarbs / totalMacros) * 100);
                    const fatsPct = Math.round((nutritionData.totalFats / totalMacros) * 100);

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary-700">Protein</span>
                          <span className="text-lg font-semibold text-blue-600">{proteinPct}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary-700">Carbs</span>
                          <span className="text-lg font-semibold text-green-600">{carbsPct}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary-700">Fats</span>
                          <span className="text-lg font-semibold text-yellow-600">{fatsPct}%</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-secondary-200 p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Calorie Sources</h3>
                <div className="space-y-3">
                  {(() => {
                    const proteinCals = nutritionData.totalProtein * 4;
                    const carbsCals = nutritionData.totalCarbs * 4;
                    const fatsCals = nutritionData.totalFats * 9;

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary-700">From Protein</span>
                          <span className="text-lg font-semibold text-blue-600">{Math.round(proteinCals)} cal</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary-700">From Carbs</span>
                          <span className="text-lg font-semibold text-green-600">{Math.round(carbsCals)} cal</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary-700">From Fats</span>
                          <span className="text-lg font-semibold text-yellow-600">{Math.round(fatsCals)} cal</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Prompt for Free Users trying to access Advanced */}
        {viewMode === 'advanced' && !isPremium && (
          <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-primary-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Upgrade to Pro or Premium</h3>
            <p className="text-secondary-600 mb-4">Get advanced nutrition insights with daily breakdowns and detailed macro analysis</p>
            <a href="/dashboard" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Upgrade Now
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
