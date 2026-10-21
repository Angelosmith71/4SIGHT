'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isDemoMode } from '@/lib/demo';
import { PROTOCOL_WATCH_PLAN, isProtocolWatchActive } from '@/lib/stripe/protocol-plan';

export interface ProtocolWatchSubscription {
  status: string;
  trialEnd: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

const demoSub = (): ProtocolWatchSubscription => ({
  status: 'trialing',
  trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
});

export function useProtocolWatchSubscription() {
  const demo = isDemoMode();
  const [subscription, setSubscription] = useState<ProtocolWatchSubscription | null>(demo ? demoSub() : null);
  const [loading, setLoading] = useState(!demo);

  const fetchSub = useCallback(async () => {
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
    try {
      const { data } = await sb.from('protocol_watch_subscriptions').select('*').eq('user_id', user.id).maybeSingle();
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
        setSubscription({
          status: 'inactive',
          trialEnd: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        });
      }
    } catch {
      setSubscription({
        status: 'inactive',
        trialEnd: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      });
    }
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    fetchSub();
    if (demo) return;
    try {
      const sb = createClient();
      const ch = sb.channel(`protocol-watch-sub-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'protocol_watch_subscriptions' }, fetchSub)
        .subscribe();
      return () => { sb.removeChannel(ch); };
    } catch { /* ignore */ }
  }, [fetchSub, demo]);

  const hasAccess = demo || isProtocolWatchActive(subscription?.status);

  const startTrial = useCallback(async () => {
    if (demo) throw new Error('Billing is disabled in demo mode');
    const res = await window.fetch('/api/stripe/create-protocol-checkout', { method: 'POST' });
    const json = await res.json();
    if (json.error) {
      if (json.error === 'Unauthorized') {
        window.location.href = '/login';
        return;
      }
      throw new Error(json.error);
    }
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
    plan: PROTOCOL_WATCH_PLAN,
    loading,
    hasAccess,
    startTrial,
    openPortal,
    refetch: fetchSub,
  };
}
