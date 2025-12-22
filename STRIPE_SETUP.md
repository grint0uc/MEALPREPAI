# Stripe Setup Guide

## What You've Already Done ✅
- Stripe SDK installed
- Environment variables added to `.env.example`
- API keys input

## Required Steps to Complete Stripe Integration:

### 1. Create Products in Stripe Dashboard

Go to https://dashboard.stripe.com/test/products and create 3 products:

**Product 1: Starter**
- Name: `Meal Prep AI - Starter`
- Price: `$4.99/month` (recurring)
- After creating, copy the **Price ID** (starts with `price_...`)
- Add to `.env.local`: `STRIPE_PRICE_ID_STARTER=price_xxx...`

**Product 2: Pro**
- Name: `Meal Prep AI - Pro`
- Price: `$7.99/month` (recurring)
- Copy the **Price ID**
- Add to `.env.local`: `STRIPE_PRICE_ID_PRO=price_xxx...`

**Product 3: Premium** (optional for now)
- Name: `Meal Prep AI - Premium`
- Price: `$12.99/month` (recurring)
- Copy the **Price ID**
- Add to `.env.local`: `STRIPE_PRICE_ID_PREMIUM=price_xxx...`

### 2. Configure Webhook Endpoint

**In Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/stripe/webhook`
   - For local testing: Use ngrok or similar tool to expose localhost
   - Example: `https://abc123.ngrok.io/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Webhook signing secret** (starts with `whsec_...`)
7. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxx...`

### 3. Environment Variables Checklist

Your `.env.local` should have:

```bash
# Stripe Keys (from dashboard)
STRIPE_SECRET_KEY=sk_test_xxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...

# Price IDs (from products you created)
STRIPE_PRICE_ID_STARTER=price_xxx...
STRIPE_PRICE_ID_PRO=price_xxx...
STRIPE_PRICE_ID_PREMIUM=price_xxx...
```

### 4. Run Database Migrations

Make sure the pricing migration is applied:

```bash
# Apply migration 006 for ingredient pricing
# This adds avg_price_per_unit column to ingredients table
# Run this in your Supabase SQL editor or via migration
```

### 5. Test the Payment Flow

**Test Cards (Stripe Test Mode):**
- Success: `4242 4242 4242 4242`
- Requires Auth: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC (e.g., 123)
- Any ZIP code

**Testing Steps:**
1. Go to `/dashboard/upgrade`
2. Click "Upgrade to Starter" or "Upgrade to Pro"
3. Use test card `4242 4242 4242 4242`
4. Complete checkout
5. Verify:
   - User is redirected back with success message
   - Database `users` table shows updated `subscription_tier`
   - Database has `stripe_customer_id` and `stripe_subscription_id`

### 6. Enable Customer Portal (Optional but Recommended)

1. Go to https://dashboard.stripe.com/test/settings/billing/portal
2. Click "Activate test link"
3. Configure what customers can do:
   - Cancel subscriptions ✅
   - Update payment methods ✅
   - View invoices ✅
4. Save settings

Now users can manage their subscriptions via the "Manage Subscription" button!

### 7. Before Going Live

When ready for production:

1. **Switch to Live Mode in Stripe**
2. **Create products again in Live mode** (test products don't carry over)
3. **Get live API keys**: `sk_live_...` and `pk_live_...`
4. **Create new webhook** with live webhook secret
5. **Update environment variables** with live keys
6. **Test with real card** (small amount first!)

## Common Issues & Solutions

**Webhook not receiving events?**
- Check webhook URL is publicly accessible
- Use ngrok for local testing: `ngrok http 3000`
- Verify webhook secret matches
- Check Stripe dashboard > Webhooks > Events for errors

**"Price ID not configured" error?**
- Make sure all STRIPE_PRICE_ID_* variables are set
- Verify price IDs are correct (copy from Stripe dashboard)
- Restart your dev server after adding env variables

**Database not updating after payment?**
- Check webhook is receiving events (Stripe dashboard)
- Check server logs for errors
- Verify RLS policies allow updates to users table
- Make sure `stripe_customer_id` and `stripe_subscription_id` columns exist in users table

## Database Schema Requirements

Make sure your `users` table has these columns:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
```

## Need Help?

- Stripe Docs: https://stripe.com/docs
- Stripe Test Cards: https://stripe.com/docs/testing
- Webhook Testing: https://dashboard.stripe.com/test/webhooks
