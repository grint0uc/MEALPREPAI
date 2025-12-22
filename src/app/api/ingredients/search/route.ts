import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (!query || query.length < 2) {
    return NextResponse.json({ ingredients: [] });
  }

  try {
    const supabase = await createServerSupabaseClient();

    console.log('[Ingredient Search] Searching for:', query);

    // Search ingredients by name (case-insensitive)
    const { data: ingredients, error } = await supabase
      .from('ingredients')
      .select('id, name, category, subcategory, unit, calories_per_100g, protein_per_100g')
      .ilike('name', `%${query}%`)
      .order('is_common', { ascending: false })
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[Ingredient Search] Error:', error);
      return NextResponse.json({ error: 'Failed to search ingredients' }, { status: 500 });
    }

    console.log('[Ingredient Search] Found:', ingredients?.length || 0, 'results');
    if (ingredients && ingredients.length > 0) {
      console.log('[Ingredient Search] First result:', ingredients[0]);
    }

    return NextResponse.json({ ingredients: ingredients || [] });
  } catch (error) {
    console.error('[Ingredient Search] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
