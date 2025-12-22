import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { normalizeUnit } from '@/lib/units';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ingredientName, quantity, unit } = await request.json();

    console.log('Received request:', { ingredientName, quantity, unit });

    if (!ingredientName || !quantity || !unit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize the unit to abbreviated form
    const normalizedUnit = normalizeUnit(unit);

    // Find ingredient with flexible matching
    // Get all ingredients and find best match
    let { data: ingredients } = await supabase
      .from('ingredients')
      .select('id, fridge_life_days, name');

    console.log('Searching for:', ingredientName, 'in', ingredients?.length, 'ingredients');

    let ingredient = null;
    if (ingredients && ingredients.length > 0) {
      const searchTerms = ingredientName.toLowerCase().split(/[\s(),]+/).filter(t => t.length > 2);

      // Find best match: check if ingredient name contains major search terms
      ingredient = ingredients.find(ing => {
        const ingName = ing.name.toLowerCase();
        return searchTerms.every(term => ingName.includes(term));
      });

      // If no exact match, try partial match
      if (!ingredient) {
        ingredient = ingredients.find(ing => {
          const ingName = ing.name.toLowerCase();
          return searchTerms.some(term => term.length > 3 && ingName.includes(term));
        });
      }
    }

    console.log('Found ingredient:', ingredient);

    if (!ingredient) {
      // Cannot create ingredients due to RLS - they must be added manually first
      console.error('No matching ingredient found for:', ingredientName);
      return NextResponse.json({
        error: `Ingredient "${ingredientName}" not found. Please add it to your fridge manually first.`
      }, { status: 404 });
    }

    // Check if user already has this ingredient
    const { data: existing, error: existingError } = await supabase
      .from('user_ingredients')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('ingredient_id', ingredient.id)
      .single();

    console.log('Existing user ingredient:', existing, 'Error:', existingError);

    if (existing) {
      // Update existing quantity (add to it)
      const newQuantity = parseFloat(existing.quantity) + quantity;
      console.log('Updating quantity from', existing.quantity, 'to', newQuantity);

      const { error: updateError } = await supabase
        .from('user_ingredients')
        .update({
          quantity: newQuantity.toString(),
          unit: normalizedUnit,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      // Insert new user ingredient
      console.log('Inserting new user ingredient');

      const { error: insertError } = await supabase
        .from('user_ingredients')
        .insert({
          user_id: user.id,
          ingredient_id: ingredient.id,
          quantity: quantity.toString(),
          unit: normalizedUnit,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    console.log('Successfully added to fridge');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Add purchased ingredient error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to add ingredient to fridge'
    }, { status: 500 });
  }
}
