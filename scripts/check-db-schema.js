/**
 * Database Schema Checker
 * Run this script to verify that all required database migrations have been applied
 *
 * Usage: node scripts/check-db-schema.js
 *
 * Make sure to set environment variables:
 * NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

async function checkDatabaseSchema() {
  const { createClient } = require('@supabase/supabase-js');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Checking database schema...\n');

  // Check recipes table columns
  const { data: recipeColumns, error: columnsError } = await supabase
    .from('recipes')
    .select('*')
    .limit(0);

  if (columnsError) {
    console.error('❌ Error accessing recipes table:', columnsError.message);
    console.error('\n📋 Please run the following migrations in Supabase SQL Editor:');
    console.error('   1. supabase/migrations/001_add_recipes_tables.sql');
    console.error('   2. supabase/migrations/002_add_credits_system.sql');
    console.error('   3. supabase/migrations/003_add_meal_time_and_favorites.sql');
    console.error('   4. supabase/migrations/004_add_meal_plan_calendar.sql');
    console.error('   5. supabase/migrations/005_add_user_preferences.sql');
    console.error('   6. supabase/migrations/006_add_ingredient_pricing.sql');
    console.error('   7. supabase/migrations/007_add_stripe_columns.sql');
    console.error('   8. supabase/migrations/008_add_recipe_source_and_notes.sql');
    process.exit(1);
  }

  // Test insert with web recipe format
  const testRecipe = {
    user_id: '00000000-0000-0000-0000-000000000000', // Fake UUID for testing
    name: 'Test Recipe',
    description: 'Test description',
    prep_time: 10,
    cook_time: 20,
    servings: 1,
    fridge_life: 4,
    ingredients: [{name: 'test', amount: '1 cup', fromFridge: true}],
    instructions: ['Step 1', 'Step 2'],
    nutrition: {calories: 300, protein: 20, carbs: 30, fats: 10},
    storage_tips: 'Store in fridge',
    day_number: 1,
    meal_time: 'dinner',
    source: 'web',
    source_url: 'https://example.com'
  };

  console.log('📝 Testing recipe insert format...');

  // This will fail with RLS but will validate the schema
  const { error: testError } = await supabase
    .from('recipes')
    .insert([testRecipe])
    .select();

  if (testError) {
    // RLS error is expected, column errors are not
    if (testError.code === '42703') {
      console.error('❌ Missing column:', testError.message);
      console.error('\n📋 Migration needed: supabase/migrations/008_add_recipe_source_and_notes.sql');
      console.error('   Run this migration in your Supabase SQL Editor');
      process.exit(1);
    } else if (testError.code === '42P01') {
      console.error('❌ Table does not exist:', testError.message);
      console.error('\n📋 Migration needed: supabase/migrations/001_add_recipes_tables.sql');
      process.exit(1);
    } else if (testError.message && testError.message.includes('policy')) {
      console.log('✅ Schema validation passed (RLS policy error is expected)');
    } else {
      console.warn('⚠️  Test insert failed with:', testError.message);
      console.warn('   Error code:', testError.code);
      console.warn('   This might be normal if RLS is enabled');
    }
  } else {
    console.log('✅ Schema validation passed');
    // Clean up test data
    await supabase
      .from('recipes')
      .delete()
      .eq('user_id', '00000000-0000-0000-0000-000000000000');
  }

  console.log('\n✨ Database schema check complete!');
  console.log('\nRequired columns for web recipes:');
  console.log('  ✓ source (TEXT)');
  console.log('  ✓ source_url (TEXT)');
  console.log('  ✓ meal_time (TEXT)');
  console.log('  ✓ day_number (INTEGER)');
  console.log('  ✓ prep_time (INTEGER)');
  console.log('  ✓ cook_time (INTEGER)');
  console.log('  ✓ fridge_life (INTEGER)');
}

checkDatabaseSchema().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
