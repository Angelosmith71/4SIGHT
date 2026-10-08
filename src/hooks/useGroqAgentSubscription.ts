'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isDemoMode } from '@/lib/demo';
import { GROQ_AGENT_PLAN, isGroqAgentActive } from '@/lib/stripe/groq-plan';

export interface GroqAgentSubscription {
  status: string;
  trialEnd: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  tokensUsed: number;
}

const demoSub = (): GroqAgentSubscription => ({
  status: 'trialing',
  trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  tokensUsed: 0,
});

export function useGroqAgentSubscription() {
  const demo = isDemoMode();
  const [subscription, setSubscription] = useState<GroqAgentSubscription | null>(demo ? demoSub() : null);
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
    const { data } = await sb.from('groq_agent_subscriptions').select('*').eq('user_id', user.id).single();
    if (data) {
      setSubscription({
        status: data.status,
        trialEnd: data.trial_end ? new Date(data.trial_end) : null,
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
        cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        tokensUsed: data.tokens_used ?? 0,
      });
    } else {
      setSubscription({
        status: 'inactive',
        trialEnd: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        tokensUsed: 0,
      });
    }
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    fetch();
    if (demo) return;
    const sb = createClient();
    const ch = sb.channel('groq-agent-sub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groq_agent_subscriptions' }, fetch)
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [fetch, demo]);

  const hasAccess = demo || isGroqAgentActive(subscription?.status);

  const startTrial = useCallback(async () => {
    if (demo) throw new Error('Billing is disabled in demo mode');
    const res = await window.fetch('/api/stripe/create-groq-checkout', { method: 'POST' });
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
    plan: GROQ_AGENT_PLAN,
    loading,
    hasAccess,
    startTrial,
    openPortal,
    refetch: fetch,
  };
}
