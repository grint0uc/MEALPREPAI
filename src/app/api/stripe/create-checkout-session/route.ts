import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_TIERS } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await request.json();

    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    const tierInfo = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

    if (!tierInfo.priceId) {
      return NextResponse.json({
        error: 'Price ID not configured for this tier. Please contact support.'
      }, { status: 500 });
    }

    // Get user email
    const { data: userData } = await supabase
      .from('users')
      .select('email, full_name, stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = userData?.stripe_customer_id;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email || user.email,
        name: userData?.full_name || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierInfo.priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/dashboard/upgrade?success=true`,
      cancel_url: `${request.headers.get('origin')}/dashboard/upgrade?canceled=true`,
      metadata: {
        user_id: user.id,
        tier: tier,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to create checkout session'
    }, { status: 500 });
  }
}
