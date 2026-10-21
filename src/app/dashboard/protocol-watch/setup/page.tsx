import { Suspense } from 'react';
import { ProtocolWatchGate } from '@/components/dashboard/ProtocolWatchGate';

export const metadata = { title: 'Connect a bot — Protocol Check' };

export default function Page() {
  return (
    <Suspense>
      <ProtocolWatchGate view="setup" />
    </Suspense>
  );
}
