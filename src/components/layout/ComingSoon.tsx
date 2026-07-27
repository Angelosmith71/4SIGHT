'use client';
import { PageShell } from './PageShell';
export function ComingSoon({ label }: { label: string }) {
  return <PageShell><div className="flex-1 flex items-center justify-center text-white/20 font-mono text-sm">[ {label.toUpperCase()} — COMING SOON ]</div></PageShell>;
}
