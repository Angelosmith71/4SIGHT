'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isDemoMode } from '@/lib/demo';
import { FAMILY_WATCH_PLAN, isFamilyWatchActive } from '@/lib/stripe/family-plan';

export interface FamilyWatchSubscription {
  status: string;
  trialEnd: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

const demoSub = (): FamilyWatchSubscription => ({
  status: 'trialing',
  trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
});

export function useFamilyWatchSubscription() {
  const demo = isDemoMode();
  const [subscription, setSubscription] = useState<FamilyWatchSubscription | null>(demo ? demoSub() : null);
  const [loading, setLoading] = useState(!demo);

  const fetch = useCallback(async () => {
    if (demo) {
      setSubscription(demoSub());
      setLoading(false);
      return;
    }
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const { data } = await sb.from('family_watch_subscriptions').select('*').eq('user_id', user.id).single();
    if (data) {
      setSubscription({
        status: data.status,
        trialEnd: data.trial_end ? new Date(data.trial_end) : null,
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
        cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
      });
    } else {
      setSubscription({ status: 'inactive', trialEnd: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, stripeCustomerId: null, stripeSubscriptionId: null });
    }
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    fetch();
    if (demo) return;
    const sb = createClient();
    const ch = sb.channel('family-watch-sub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_watch_subscriptions' }, fetch)
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [fetch, demo]);

  // const hasAccess = demo || isFamilyWatchActive(subscription?.status);
  const hasAccess = true; // Temporarily unlocked for free plan testing

  const startTrial = useCallback(async () => {
    if (demo) throw new Error('Billing is disabled in demo mode');
    const res = await window.fetch('/api/stripe/create-family-checkout', { method: 'POST' });
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

  return {
    subscription,
    plan: FAMILY_WATCH_PLAN,
    loading,
    hasAccess,
    startTrial,
    openPortal,
    refetch: fetch,
  };
}
