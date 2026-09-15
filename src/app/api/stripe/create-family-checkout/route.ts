import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import { FAMILY_WATCH_PLAN } from '@/lib/stripe/family-plan';

export async function POST() {
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const priceId = FAMILY_WATCH_PLAN.stripePriceId;
    if (!priceId) return NextResponse.json({ error: 'Family Watch price not configured' }, { status: 500 });

    const { data: fwSub } = await sb.from('family_watch_subscriptions').select('stripe_customer_id').eq('user_id', user.id).single();
    const { data: mainSub } = await sb.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single();

    let customerId = fwSub?.stripe_customer_id ?? mainSub?.stripe_customer_id;
    if (!customerId) {
      const c = await stripe.customers.create({ email: user.email ?? undefined, metadata: { supabase_user_id: user.id } });
      customerId = c.id;
    }

    await sb.from('family_watch_subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      status: 'inactive',
    }, { onConflict: 'user_id' });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: FAMILY_WATCH_PLAN.trialDays,
        metadata: { supabase_user_id: user.id, plan_id: FAMILY_WATCH_PLAN.id },
      },
      success_url: `${appUrl}/dashboard/parental-monitor?subscribed=family-watch`,
      cancel_url: `${appUrl}/pricing/family-watch?canceled=true`,
      metadata: { supabase_user_id: user.id, plan_id: FAMILY_WATCH_PLAN.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
