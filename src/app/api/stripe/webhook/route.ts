import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/supabase/server';
import { cancelFamilyWatchSubscription, isFamilyWatchPrice, upsertFamilyWatchSubscription } from '@/app/api/stripe/family-webhook-helpers';
import type Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

function getPlan(priceId: string) {
  const pro = [process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY, process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY];
  const ent = [process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY, process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY];
  if (pro.includes(priceId)) return 'pro';
  if (ent.includes(priceId)) return 'enterprise';
  return 'free';
}

function toIsoDate(timestamp?: number | null): string | null {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) return null;
  const d = new Date(timestamp * 1000);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

async function upsertMainSubscription(sb: ReturnType<typeof createServiceClient>, sub: Stripe.Subscription) {
  const userId = sub.metadata?.supabase_user_id;
  let resolvedId = userId;
  if (!userId) {
    const { data } = await sb.from('subscriptions').select('user_id').eq('stripe_customer_id', sub.customer as string).single();
    if (data) resolvedId = data.user_id;
  }
  if (!resolvedId) {
    console.error('No resolved user_id for subscription upsert:', sub.id);
    return;
  }
  const priceId = sub.items.data[0]?.price?.id ?? '';
  if (isFamilyWatchPrice(priceId, sub.metadata)) return;
  const planId = getPlan(priceId);
  await sb.from('subscriptions').upsert(
    {
      user_id: resolvedId,
      stripe_customer_id: sub.customer as string,
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId,
      plan_id: planId,
      status: sub.status,
      billing_interval: sub.items.data[0]?.plan?.interval,
      current_period_start: toIsoDate(sub.current_period_start),
      current_period_end: toIsoDate(sub.current_period_end),
      cancel_at_period_end: sub.cancel_at_period_end,
      trial_end: toIsoDate(sub.trial_end),
    },
    { onConflict: 'user_id' }
  );
}

async function handleSubscription(sb: ReturnType<typeof createServiceClient>, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price?.id ?? '';
  if (isFamilyWatchPrice(priceId, sub.metadata)) {
    await upsertFamilyWatchSubscription(sb, sub);
  } else {
    await upsertMainSubscription(sb, sub);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const sb = createServiceClient();
  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.mode === 'subscription' && s.subscription) {
        const sub = await stripe.subscriptions.retrieve(s.subscription as string);
        if (!sub.metadata?.supabase_user_id && s.metadata?.supabase_user_id) {
          await stripe.subscriptions.update(sub.id, { metadata: { ...sub.metadata, supabase_user_id: s.metadata.supabase_user_id } });
          sub.metadata.supabase_user_id = s.metadata.supabase_user_id;
        }
        await handleSubscription(sb, sub);
      }
    } else if (['customer.subscription.created', 'customer.subscription.updated'].includes(event.type)) {
      await handleSubscription(sb, event.data.object as Stripe.Subscription);
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price?.id ?? '';
      if (isFamilyWatchPrice(priceId, sub.metadata)) {
        await cancelFamilyWatchSubscription(sb, sub.id);
      } else {
        await sb.from('subscriptions').update({ plan_id: 'free', status: 'canceled', stripe_subscription_id: null, stripe_price_id: null, billing_interval: null }).eq('stripe_subscription_id', sub.id);
      }
    } else if (event.type === 'invoice.payment_failed') {
      const inv = event.data.object as Stripe.Invoice;
      if (inv.subscription) {
        const sub = await stripe.subscriptions.retrieve(inv.subscription as string);
        const priceId = sub.items.data[0]?.price?.id ?? '';
        if (isFamilyWatchPrice(priceId, sub.metadata)) {
          await sb.from('family_watch_subscriptions').update({ status: 'past_due' }).eq('stripe_subscription_id', sub.id);
        } else {
          await sb.from('subscriptions').update({ status: 'past_due' }).eq('stripe_subscription_id', sub.id);
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

