'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Error Boundary caught exception:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-deepVoid text-white flex items-center justify-center p-6">
        <div className="relative max-w-md w-full rounded-sm border border-neoCrimson/50 bg-graphite p-8 text-center overflow-hidden">
          <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-neoCrimson" />
          <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-neoCrimson" />
          
          <div className="w-12 h-12 rounded-sm mx-auto mb-4 flex items-center justify-center border border-neoCrimson/40 bg-neoCrimson/10 text-neoCrimson text-2xl">
            ⚠
          </div>
          
          <p className="font-mono text-[9px] tracking-[2px] text-neoCrimson/80 uppercase">Guardian AI Security System</p>
          <h1 className="font-rajdhani font-bold text-2xl text-white mt-1">Application Recovered</h1>
          <p className="font-mono text-[10px] text-white/40 mt-2 mb-6">
            A client-side exception was safely contained by Guardian Shield.
          </p>

          <button
            onClick={() => reset()}
            className="w-full font-mono text-[10px] tracking-[1.5px] uppercase py-3 rounded-sm border border-electricCyan/50 bg-electricCyan/10 text-electricCyan hover:bg-electricCyan/20 transition-colors"
          >
            Reload Module
          </button>
        </div>
      </body>
    </html>
  );
}
