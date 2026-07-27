'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getPlan, type Plan, type PlanId, type BillingInterval } from '@/lib/stripe/plans';
import { isDemoMode } from '@/lib/demo';

export interface Subscription { planId:PlanId; plan:Plan; status:string; billingInterval:BillingInterval|null; currentPeriodEnd:Date|null; cancelAtPeriodEnd:boolean; trialEnd:Date|null; stripeCustomerId:string|null; stripeSubscriptionId:string|null; }

const demoSubscription = (): Subscription => ({
  planId: 'pro',
  plan: getPlan('pro'),
  status: 'active',
  billingInterval: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  trialEnd: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
});

export function useSubscription() {
  const demo = isDemoMode();
  const [subscription, setSubscription] = useState<Subscription | null>(demo ? demoSubscription() : null);
  const [loading, setLoading] = useState(!demo);

  const fetch = useCallback(async () => {
    if (demo) {
      setSubscription(demoSubscription());
      setLoading(false);
      return;
    }
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await sb.from('subscriptions').select('*').eq('user_id', user.id).single();
    if (data) {
      const planId = (data.plan_id ?? 'free') as PlanId;
      setSubscription({
        planId, plan: getPlan(planId), status: data.status, billingInterval: data.billing_interval,
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
        cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
        trialEnd: data.trial_end ? new Date(data.trial_end) : null,
        stripeCustomerId: data.stripe_customer_id, stripeSubscriptionId: data.stripe_subscription_id,
      });
    } else {
      setSubscription(demoSubscription());
    }
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    fetch();
    if (demo) return;
    const sb = createClient();
    const ch = sb.channel(`sub-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, fetch).subscribe();
    return () => { sb.removeChannel(ch); };
  }, [fetch, demo]);

  const checkout = useCallback(async (planId: PlanId, interval: BillingInterval) => {
    if (demo) throw new Error('Billing is disabled in demo mode');
    const res = await window.fetch('/api/stripe/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId, interval }) });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    window.location.href = json.url;
  }, [demo]);

  const openPortal = useCallback(async () => {
    if (demo) throw new Error('Billing is disabled in demo mode');
    const res = await window.fetch('/api/stripe/create-portal', { method: 'POST' });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    window.location.href = json.url;
  }, [demo]);

  const can = useCallback((feature: string) => {
    if (demo) return true;
    const pid = subscription?.planId ?? 'free';
    const map: Record<string, PlanId[]> = {
      botMonitor: ['pro', 'enterprise'],
      analytics: ['pro', 'enterprise'],
      reports: ['pro', 'enterprise'],
      realtime: ['pro', 'enterprise'],
    };
    return map[feature]?.includes(pid) ?? false;
  }, [demo, subscription]);

  return { subscription, loading, checkout, openPortal, can };
}
