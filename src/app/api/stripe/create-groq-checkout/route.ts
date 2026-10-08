import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { GROQ_AGENT_PLAN } from '@/lib/stripe/groq-plan';

export async function POST() {
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const priceId = GROQ_AGENT_PLAN.stripePriceId;
    if (!priceId) return NextResponse.json({ error: 'Grok xAI Agent price not configured' }, { status: 500 });

    const { data: groqSub } = await sb.from('groq_agent_subscriptions').select('stripe_customer_id').eq('user_id', user.id).single();
    const { data: mainSub } = await sb.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single();

    let customerId = groqSub?.stripe_customer_id ?? mainSub?.stripe_customer_id;
    if (!customerId) {
      const c = await stripe.customers.create({ email: user.email ?? undefined, metadata: { supabase_user_id: user.id } });
      customerId = c.id;
    }

    const admin = createServiceClient();
    const { data: existing } = await admin.from('groq_agent_subscriptions').select('user_id').eq('user_id', user.id).single();
    await admin.from('groq_agent_subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      ...(existing ? {} : { status: 'inactive' }),
    }, { onConflict: 'user_id' });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: GROQ_AGENT_PLAN.trialDays,
        metadata: { supabase_user_id: user.id, plan_id: GROQ_AGENT_PLAN.id },
      },
      success_url: `${appUrl}/dashboard/groq-agent?subscribed=groq-agent`,
      cancel_url: `${appUrl}/pricing/groq-agent?canceled=true`,
      metadata: { supabase_user_id: user.id, plan_id: GROQ_AGENT_PLAN.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
