import { Suspense } from 'react';
import { ParentalMonitorGate } from '@/components/dashboard/ParentalMonitorGate';
import { HudSkeleton } from '@/components/ui/HudSkeleton';

export const metadata = { title: 'Family Watch — Guardian AI' };

export default function Page() {
  return (
    <Suspense fallback={<div className="flex flex-1 p-8"><HudSkeleton rows={6} height="h-16" /></div>}>
      <ParentalMonitorGate />
    </Suspense>
  );
}
