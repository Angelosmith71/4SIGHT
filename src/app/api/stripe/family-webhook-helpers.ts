import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FAMILY_WATCH_PLAN } from '@/lib/stripe/family-plan';

export function isFamilyWatchPrice(priceId: string, metadata?: Record<string, string>): boolean {
  if (metadata?.plan_id === FAMILY_WATCH_PLAN.id) return true;
  const familyPrice = process.env.NEXT_PUBLIC_STRIPE_FAMILY_WATCH_MONTHLY;
  return !!familyPrice && priceId === familyPrice;
}

export async function upsertFamilyWatchSubscription(sb: SupabaseClient, sub: Stripe.Subscription) {
  const userId = sub.metadata?.supabase_user_id;
  let resolvedId = userId;

  if (!resolvedId) {
    const { data } = await sb.from('family_watch_subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', sub.customer as string)
      .single();
    if (data) resolvedId = data.user_id;
  }

  if (!resolvedId) {
    const { data } = await sb.from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', sub.customer as string)
      .single();
    if (data) resolvedId = data.user_id;
  }

  if (!resolvedId) return;

  const priceId = sub.items.data[0]?.price?.id ?? '';
  await sb.from('family_watch_subscriptions').upsert({
    user_id: resolvedId,
    stripe_customer_id: sub.customer as string,
    stripe_subscription_id: sub.id,
    stripe_price_id: priceId,
    status: sub.status,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
    trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
  }, { onConflict: 'user_id' });
}

export async function cancelFamilyWatchSubscription(sb: SupabaseClient, stripeSubscriptionId: string) {
  await sb.from('family_watch_subscriptions').update({
    status: 'canceled',
    stripe_subscription_id: null,
    stripe_price_id: null,
    cancel_at_period_end: false,
  }).eq('stripe_subscription_id', stripeSubscriptionId);
}
