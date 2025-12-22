import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Cleaning up old data for user:', user.id);

    // Delete meal plan entries
    const { error: deleteMealPlanError } = await supabase
      .from('meal_plan')
      .delete()
      .eq('user_id', user.id);

    if (deleteMealPlanError) {
      console.error('Error deleting meal plan:', deleteMealPlanError);
    }

    // Delete all recipes
    const { error: deleteRecipesError } = await supabase
      .from('recipes')
      .delete()
      .eq('user_id', user.id);

    if (deleteRecipesError) {
      console.error('Error deleting recipes:', deleteRecipesError);
      return NextResponse.json({
        error: 'Failed to delete recipes: ' + deleteRecipesError.message
      }, { status: 500 });
    }

    console.log('Cleanup completed successfully');

    return NextResponse.json({
      success: true,
      message: 'All recipes and meal plan cleared successfully'
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to cleanup data'
    }, { status: 500 });
  }
}
