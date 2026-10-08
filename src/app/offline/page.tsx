import Link from 'next/link';

export const metadata = { title: 'Offline — 4Sight Guardian AI' };

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-deepVoid flex items-center justify-center p-6">
      <div className="relative max-w-sm w-full rounded-sm border border-electricCyan/25 bg-graphite p-8 text-center">
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-electricCyan/50" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-electricCyan/50" />
        <p className="font-mono text-[9px] tracking-[2px] text-electricCyan/50 uppercase">4Sight</p>
        <h1 className="font-rajdhani font-bold text-2xl text-white mt-2">You&apos;re offline</h1>
        <p className="font-mono text-[11px] text-white/40 mt-3 leading-relaxed">
          Reconnect to open the dashboard, Family Watch, and Grok xAI Agent.
        </p>
        <Link href="/dashboard"
          className="inline-block mt-6 font-mono text-[10px] tracking-[1px] uppercase px-4 py-2.5 rounded-sm border border-electricCyan/40 text-electricCyan">
          Try again
        </Link>
      </div>
    </div>
  );
}
