'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error Boundary caught exception:', error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[400px]">
      <div className="relative max-w-md w-full rounded-sm border border-neoCrimson/40 bg-graphite/90 p-6 overflow-hidden">
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neoCrimson" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neoCrimson" />
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-sm flex items-center justify-center border border-neoCrimson/40 bg-neoCrimson/10 text-neoCrimson">
            <i className="ti ti-alert-triangle" style={{ fontSize: 20 }} aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-[2px] text-neoCrimson/70 uppercase">System Exception</p>
            <h2 className="font-rajdhani font-bold text-lg text-white">Dashboard Signal Interrupted</h2>
          </div>
        </div>

        <p className="font-mono text-[10px] text-white/45 mb-4 leading-relaxed">
          An issue occurred while loading this section. Neural core state has been isolated.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 font-mono text-[10px] tracking-[1.5px] uppercase py-2.5 rounded-sm border border-electricCyan/50 bg-electricCyan/10 text-electricCyan hover:bg-electricCyan/20 transition-colors"
          >
            Re-initialize
          </button>
          <Link
            href="/dashboard"
            className="font-mono text-[10px] tracking-[1.5px] uppercase px-4 py-2.5 rounded-sm border border-white/15 text-white/40 hover:text-white/70 transition-colors flex items-center justify-center"
          >
            Reset
          </Link>
        </div>
      </div>
    </div>
  );
}
