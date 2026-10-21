import { Suspense } from 'react';
import { ProtocolWatchGate } from '@/components/dashboard/ProtocolWatchGate';

export const metadata = { title: 'Protocol Check — 4Sight Guardian AI' };

export default function Page() {
  return (
    <Suspense>
      <ProtocolWatchGate />
    </Suspense>
  );
}
