'use client';
// Full component — see guardian-ai-COMPLETE.zip from previous session
// or rebuild from the chat history. This file uses:
// - useMetrics() from @/hooks/useData
// - HudMetricSkeleton from @/components/ui/HudSkeleton  
// - rotatingRing, pulseGlow from @/utils/animations
// - PageShell from @/components/layout/PageShell
import { PageShell } from '@/components/layout/PageShell';
import { useMetrics } from '@/hooks/useData';
export function Dashboard() {
  const { metrics, loading } = useMetrics();
  return (
    <PageShell>
      <div className="px-8 py-6 flex flex-col gap-6 overflow-y-auto flex-1" style={{backgroundImage:'radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,230,255,0.06) 0%,transparent 70%)',}}>
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img src="/guardian-ai-logo.jpeg" alt="Guardian AI Logo" className="w-10 h-10 rounded-md object-cover border border-electricCyan/50 shadow-[0_0_15px_rgba(0,230,255,0.35)] flex-shrink-0" />
              <h1 className="font-rajdhani font-bold text-xl tracking-[3px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></h1>
            </div>
            <p className="font-mono text-[10px] text-white/30 mt-0.5">Your AI shield for cookies, trackers &amp; bots.</p>
          </div>
        </header>
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="font-mono text-[11px] text-white/30">Loading dashboard...</div></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:'Privacy Score', value:metrics?.privacy_score??86, color:'#00E6FF' },
              { label:'Threats Blocked', value:(metrics?.threats_blocked??1247).toLocaleString(), color:'#FF2E4C' },
              { label:'Cookies Blocked', value:metrics?.cookies_blocked??23, color:'#A45CFF' },
              { label:'Threat Score', value:(metrics?.threat_score??6.4).toFixed(1), color:'#FFB648' },
            ].map(m=>(
              <div key={m.label} className="relative p-4 rounded-sm border border-white/8 bg-white/[0.02] overflow-hidden">
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{borderColor:m.color}}/>
                <p className="font-mono text-[9px] text-white/25 uppercase tracking-[1px] mb-1">{m.label}</p>
                <p className="font-rajdhani font-bold text-2xl" style={{color:m.color}}>{m.value}</p>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[{l:'Clear Cookies',i:'🍪'},{l:'Review Bots',i:'🤖'},{l:'Run Scan',i:'🔍'},{l:'Permissions',i:'🔐'}].map(a=>(
            <button key={a.l} className="relative flex flex-col items-center gap-2 py-4 px-3 bg-graphite/60 border border-electricCyan/20 rounded-sm hover:bg-electricCyan/8 transition-colors group overflow-hidden">
              <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-electricCyan/50"/>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-electricCyan/50"/>
              <span className="text-xl">{a.i}</span>
              <span className="font-mono text-[9px] tracking-[1px] uppercase text-electricCyan/70">{a.l}</span>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
