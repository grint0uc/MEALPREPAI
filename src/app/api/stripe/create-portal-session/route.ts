import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!userData?.stripe_customer_id) {
      return NextResponse.json({
        error: 'No active subscription found'
      }, { status: 404 });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${request.headers.get('origin')}/dashboard/upgrade`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Create portal session error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to create portal session'
    }, { status: 500 });
  }
}
