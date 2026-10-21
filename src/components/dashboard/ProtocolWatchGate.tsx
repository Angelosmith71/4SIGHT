'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { HudPageHeader } from '@/components/ui/HudPrimitives';
import { HudSkeleton } from '@/components/ui/HudSkeleton';
import { ProtocolWatchPaywall } from '@/components/dashboard/ProtocolWatchPaywall';
import { ProtocolWatchPage } from '@/components/dashboard/ProtocolWatchPage';
import { ProtocolSetup } from '@/components/dashboard/ProtocolSetup';
import { useProtocolWatchSubscription } from '@/hooks/useProtocolWatchSubscription';

export function ProtocolWatchGate({ view = 'home' }: { view?: 'home' | 'setup' }) {
  const { hasAccess, loading, plan, refetch } = useProtocolWatchSubscription();
  const sp = useSearchParams();
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    if (sp.get('subscribed') === 'protocol-watch') {
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

  if (!hasAccess) return <ProtocolWatchPaywall />;

  return (
    <PageShell>
      <div className="px-4 md:px-8 py-6 flex flex-col gap-5 overflow-y-auto flex-1">
        {welcome && (
          <div className="px-4 py-2 rounded-sm border border-electricCyan/30 bg-electricCyan/8 font-mono text-[10px] text-electricCyan">
            Protocol Check trial started — {plan.trialDays} days free, then ${plan.monthlyPrice / 100}/mo. Cancel anytime in Billing.
            <button type="button" onClick={() => setWelcome(false)} className="float-right opacity-60 hover:opacity-100">×</button>
          </div>
        )}
        <HudPageHeader eyebrow="// protocol check" title={view === 'setup' ? 'Connect a bot' : 'Protocol Check'} />
        <div className="flex gap-4 font-mono text-[10px]">
          <Link href="/dashboard/protocol-watch" className={view === 'home' ? 'text-electricCyan' : 'text-white/35 hover:text-white/60'}>Checks</Link>
          <Link href="/dashboard/protocol-watch/setup" className={view === 'setup' ? 'text-electricCyan' : 'text-white/35 hover:text-white/60'}>Setup</Link>
        </div>
        {view === 'setup' ? <ProtocolSetup /> : <ProtocolWatchPage />}
      </div>
    </PageShell>
  );
}
