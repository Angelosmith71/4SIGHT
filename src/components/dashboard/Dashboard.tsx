'use client';

import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { useMetrics, useParentalMonitoring } from '@/hooks/useData';

export function Dashboard() {
  const { metrics, loading } = useMetrics();
  const { children, unreadAlerts, alerts, loading: parentalLoading } = useParentalMonitoring();

  const latestAlert = (alerts ?? []).find(a => a && !a.read);

  const privacyScore = Number(metrics?.privacy_score ?? 86);
  const threatsBlocked = Number(metrics?.threats_blocked ?? 1247);
  const cookiesBlocked = Number(metrics?.cookies_blocked ?? 23);
  const threatScore = Number(metrics?.threat_score ?? 6.4);

  return (
    <PageShell>
      <div className="px-8 py-6 flex flex-col gap-6 overflow-y-auto flex-1" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,230,255,0.06) 0%,transparent 70%)' }}>
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2"><span className="text-neoCrimson font-bold text-xl">«</span><h1 className="font-rajdhani font-bold text-xl tracking-[3px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></h1></div>
            <p className="font-mono text-[10px] text-white/30 mt-0.5">Your AI shield for cookies, trackers &amp; bots.</p>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="font-mono text-[11px] text-white/30">Loading dashboard...</div></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Privacy Score', value: Number.isNaN(privacyScore) ? 86 : privacyScore, color: '#00E6FF' },
              { label: 'Threats Blocked', value: (Number.isNaN(threatsBlocked) ? 1247 : threatsBlocked).toLocaleString(), color: '#FF2E4C' },
              { label: 'Cookies Blocked', value: Number.isNaN(cookiesBlocked) ? 23 : cookiesBlocked, color: '#A45CFF' },
              { label: 'Threat Score', value: (Number.isNaN(threatScore) ? 6.4 : threatScore).toFixed(1), color: '#FFB648' },
            ].map(m => (
              <div key={m.label} className="relative p-4 rounded-sm border border-white/8 bg-white/[0.02] overflow-hidden">
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: m.color }} />
                <p className="font-mono text-[9px] text-white/25 uppercase tracking-[1px] mb-1">{m.label}</p>
                <p className="font-rajdhani font-bold text-2xl" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Family Watch summary */}
        <Link href="/dashboard/parental-monitor"
          className="relative block p-5 rounded-sm border border-plasmaViolet/25 bg-plasmaViolet/5 hover:bg-plasmaViolet/10 transition-colors overflow-hidden group">
          <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-plasmaViolet/50" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-plasmaViolet/50" />
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">👨‍👩‍👧</span>
                <p className="font-mono text-[9px] tracking-[2px] text-plasmaViolet/60 uppercase">Family Watch</p>
              </div>
              <h2 className="font-rajdhani font-bold text-lg text-white group-hover:text-plasmaViolet transition-colors">Parental Monitoring</h2>
              <p className="font-mono text-[10px] text-white/35 mt-1 max-w-md">Monitor what children under 18 watch online and receive instant alerts.</p>
            </div>
            {!parentalLoading && (
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="font-rajdhani font-bold text-2xl text-plasmaViolet">{(children ?? []).length}</p>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Children</p>
                </div>
                <div className="text-center">
                  <p className="font-rajdhani font-bold text-2xl text-neoCrimson">{unreadAlerts ?? 0}</p>
                  <p className="font-mono text-[9px] text-white/30 uppercase">Unread alerts</p>
                </div>
              </div>
            )}
          </div>
          {latestAlert && (
            <div className="mt-3 pt-3 border-t border-plasmaViolet/15 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neoCrimson animate-pulse" />
              <p className="font-mono text-[10px] text-white/45 truncate">
                <span className="text-neoCrimson">{latestAlert.child_name}:</span> {latestAlert.title}
              </p>
            </div>
          )}
        </Link>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: 'Clear Cookies', i: '🍪', href: '/dashboard' },
            { l: 'Family Watch', i: '👨‍👩‍👧', href: '/dashboard/parental-monitor' },
            { l: 'Run Scan', i: '🔍', href: '/dashboard/threats' },
            { l: 'Review Bots', i: '🤖', href: '/dashboard/bot-monitor' },
          ].map(a => (
            <Link key={a.l} href={a.href}
              className="relative flex flex-col items-center gap-2 py-4 px-3 bg-graphite/60 border border-electricCyan/20 rounded-sm hover:bg-electricCyan/8 transition-colors overflow-hidden">
              <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-electricCyan/50" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-electricCyan/50" />
              <span className="text-xl">{a.i}</span>
              <span className="font-mono text-[9px] tracking-[1px] uppercase text-electricCyan/70">{a.l}</span>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
