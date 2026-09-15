'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ParentalMonitorPage } from '@/components/dashboard/ParentalMonitorPage';
import { FamilyWatchPaywall } from '@/components/dashboard/FamilyWatchPaywall';
import { HudSkeleton } from '@/components/ui/HudSkeleton';
import { useFamilyWatchSubscription } from '@/hooks/useFamilyWatchSubscription';

export function ParentalMonitorGate() {
  const { hasAccess, loading, refetch } = useFamilyWatchSubscription();
  const sp = useSearchParams();
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    if (sp.get('subscribed') === 'family-watch') {
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

  if (!hasAccess) return <FamilyWatchPaywall />;
  return (
    <>
      {welcome && (
        <div className="mx-4 md:mx-8 mt-4 px-4 py-2 rounded-sm border border-emeraldPulse/30 bg-emeraldPulse/8 font-mono text-[10px] text-emeraldPulse">
          Family Watch trial started — 7 days free, then $20/mo. Cancel anytime in Billing.
          <button type="button" onClick={() => setWelcome(false)} className="float-right opacity-60 hover:opacity-100">×</button>
        </div>
      )}
      <ParentalMonitorPage />
    </>
  );
}
