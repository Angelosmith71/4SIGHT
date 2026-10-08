import { Suspense } from 'react';
import { GroqAgentGate } from '@/components/dashboard/GroqAgentGate';
import { HudSkeleton } from '@/components/ui/HudSkeleton';

export const metadata = { title: 'Grok xAI Agent — 4Sight Guardian AI' };

export default function Page() {
  return (
    <Suspense fallback={<div className="flex flex-1 p-8"><HudSkeleton rows={6} height="h-16" /></div>}>
      <GroqAgentGate />
    </Suspense>
  );
}
