import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Stripe from 'stripe';

// Map Stripe price IDs to subscription tiers
const PRICE_TO_TIER: { [key: string]: 'starter' | 'pro' | 'premium' } = {
  [process.env.STRIPE_PRICE_ID_STARTER || '']: 'starter',
  [process.env.STRIPE_PRICE_ID_PRO || '']: 'pro',
  [process.env.STRIPE_PRICE_ID_PREMIUM || '']: 'premium',
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get the subscription to extract price ID
        let tier: 'starter' | 'pro' | 'premium' = 'starter';

        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const priceId = subscription.items.data[0]?.price.id;
          tier = PRICE_TO_TIER[priceId] || 'starter';
        }

        // Update user subscription
        const { error } = await supabase
          .from('users')
          .update({
            subscription_tier: tier,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', session.metadata?.user_id);

        if (error) {
          console.error('Error updating user subscription:', error);
        }

        console.log('Subscription created for user:', session.metadata?.user_id, 'tier:', tier);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Determine tier from price ID
        let tier: 'free' | 'starter' | 'pro' | 'premium' = 'free';

        if (subscription.status === 'active') {
          const priceId = subscription.items.data[0]?.price.id;
          tier = PRICE_TO_TIER[priceId] || 'starter';
        }

        // Update subscription status
        const { error } = await supabase
          .from('users')
          .update({
            subscription_tier: tier,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
        }

        console.log('Subscription updated:', subscription.id, 'tier:', tier, 'status:', subscription.status);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Downgrade to free tier
        const { error } = await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error canceling subscription:', error);
        }

        console.log('Subscription canceled:', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error('Payment failed for invoice:', invoice.id);

        // Optionally notify user of payment failure
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
