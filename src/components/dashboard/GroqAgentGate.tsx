'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GroqAgentPage } from '@/components/dashboard/GroqAgentPage';
import { GroqAgentPaywall } from '@/components/dashboard/GroqAgentPaywall';
import { HudSkeleton } from '@/components/ui/HudSkeleton';
import { useGroqAgentSubscription } from '@/hooks/useGroqAgentSubscription';

export function GroqAgentGate() {
  const { hasAccess, loading, plan, refetch } = useGroqAgentSubscription();
  const sp = useSearchParams();
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    if (sp.get('subscribed') === 'groq-agent') {
      setWelcome(true);
      void refetch();
    }
  }, [sp, refetch]);

  if (loading) {
    return (
      <div className="flex flex-1 p-8">
        <HudSkeleton rows={6} height="h-16" />
      </div>
    );
  }

  if (!hasAccess) return <GroqAgentPaywall />;
  return (
    <>
      {welcome && (
        <div className="mx-4 md:mx-8 mt-4 px-4 py-2 rounded-sm border border-solarAmber/30 bg-solarAmber/8 font-mono text-[10px] text-solarAmber">
          Grok xAI Agent trial started — {plan.trialDays} days free, then ${plan.monthlyPrice / 100}/mo. Cancel anytime in Billing.
          <button type="button" onClick={() => setWelcome(false)} className="float-right opacity-60 hover:opacity-100">×</button>
        </div>
      )}
      <GroqAgentPage />
    </>
  );
}
