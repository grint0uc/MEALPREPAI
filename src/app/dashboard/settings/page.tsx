'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function SettingsPage() {
  const [unitSystem, setUnitSystem] = useState<'us' | 'metric'>('us');
  const [goalType, setGoalType] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load unit system from user_preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('unit_system')
      .eq('user_id', user.id)
      .single();

    if (prefs) {
      setUnitSystem(prefs.unit_system);
    }

    // Load goal type from users table
    const { data: userData } = await supabase
      .from('users')
      .select('goal_type')
      .eq('id', user.id)
      .single();

    if (userData) {
      setGoalType(userData.goal_type || 'maintain');
    }

    setLoading(false);
  };

  const savePreferences = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save unit system to user_preferences
    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        unit_system: unitSystem,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    // Save goal type to users table
    await supabase
      .from('users')
      .update({ goal_type: goalType })
      .eq('id', user.id);

    setSaving(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Settings</h1>
          <p className="text-secondary-600">
            Manage your account preferences
          </p>
        </div>

        {/* Fitness Goal */}
        <div className="bg-white rounded-lg border border-secondary-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Fitness Goal</h2>
          <p className="text-sm text-secondary-600 mb-4">
            Your fitness goal affects recipe recommendations and macro balance.
          </p>

          <div className="space-y-3">
            <label className="flex items-center p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="radio"
                name="goalType"
                value="lose"
                checked={goalType === 'lose'}
                onChange={(e) => setGoalType(e.target.value as 'lose')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="font-medium text-secondary-900">Lose Weight</div>
                <div className="text-sm text-secondary-600">Calorie deficit, high protein meals</div>
              </div>
            </label>

            <label className="flex items-center p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="radio"
                name="goalType"
                value="maintain"
                checked={goalType === 'maintain'}
                onChange={(e) => setGoalType(e.target.value as 'maintain')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="font-medium text-secondary-900">Maintain Weight</div>
                <div className="text-sm text-secondary-600">Balanced nutrition and macros</div>
              </div>
            </label>

            <label className="flex items-center p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="radio"
                name="goalType"
                value="gain"
                checked={goalType === 'gain'}
                onChange={(e) => setGoalType(e.target.value as 'gain')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="font-medium text-secondary-900">Build Muscle</div>
                <div className="text-sm text-secondary-600">High protein, moderate carbs</div>
              </div>
            </label>
          </div>
        </div>

        {/* Measurement Units */}
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Measurement Units</h2>
          <p className="text-sm text-secondary-600 mb-4">
            Choose your preferred unit system. This affects recipe generation and ingredient measurements.
          </p>

          <div className="space-y-3">
            <label className="flex items-center p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="radio"
                name="unitSystem"
                value="us"
                checked={unitSystem === 'us'}
                onChange={(e) => setUnitSystem(e.target.value as 'us')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="font-medium text-secondary-900">US Units</div>
                <div className="text-sm text-secondary-600">Cups, tablespoons, teaspoons, ounces, pounds</div>
              </div>
            </label>

            <label className="flex items-center p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors">
              <input
                type="radio"
                name="unitSystem"
                value="metric"
                checked={unitSystem === 'metric'}
                onChange={(e) => setUnitSystem(e.target.value as 'metric')}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="font-medium text-secondary-900">Metric Units</div>
                <div className="text-sm text-secondary-600">Grams, kilograms, milliliters, liters</div>
              </div>
            </label>
          </div>

          <div className="mt-6">
            <button
              onClick={savePreferences}
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
