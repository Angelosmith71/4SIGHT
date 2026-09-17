'use client';
import { useEffect, useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ParentalAlertBanner } from './ParentalAlertBanner';
import { createClient } from '@/lib/supabase/client';

import { isDemoMode } from '@/lib/demo';

const isDemo = isDemoMode();

export function AppShell({ children }: { children: React.ReactNode }) {
  const [activeThreats, setActiveThreats] = useState(0);
  const [parentalAlerts, setParentalAlerts] = useState(0);

  useEffect(() => {
    async function loadCount() {
      const res = await fetch('/api/threats?status=active&limit=50');
      const json = await res.json();
      setActiveThreats(json.data?.length ?? 0);
    }

    if (isDemo) {
      loadCount();
      return;
    }

    try {
      const sb = createClient();
      const updateCount = async () => {
        try {
          const { count } = await sb.from('threats').select('*', { count: 'exact', head: true }).eq('status', 'active');
          setActiveThreats(count ?? 0);
        } catch { /* ignore */ }
      };
      void updateCount();
      const ch = sb.channel(`shell-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'threats' }, () => {
        void updateCount();
      }).subscribe();
      return () => { try { sb.removeChannel(ch); } catch { /* ignore */ } };
    } catch {
      loadCount();
    }
  }, []);

  useEffect(() => {
    async function loadParental() {
      try {
        const res = await fetch('/api/parental');
        const json = await res.json();
        setParentalAlerts(json.unread_alerts ?? 0);
      } catch { /* ignore */ }
    }
    loadParental();
    const iv = setInterval(loadParental, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen bg-deepVoid">
      <div className="hidden md:grid border border-electricCyan/10 rounded-xl overflow-hidden" style={{ gridTemplateColumns: '200px 1fr', gridTemplateRows: 'auto 1fr', minHeight: '100vh' }}>
        <Topbar activeThreats={activeThreats} parentalAlerts={parentalAlerts} />
        <Sidebar />
        <main className="flex flex-col flex-1 overflow-hidden bg-deepVoid">
          <ParentalAlertBanner />
          {children}
        </main>
      </div>
      <div className="md:hidden flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-4 h-[52px] bg-graphite border-b border-electricCyan/10 flex-shrink-0">
          <div className="flex items-center gap-2 font-rajdhani text-lg font-bold tracking-[2px] text-electricCyan"><span className="w-2 h-2 rounded-full bg-electricCyan shadow-[0_0_8px_#00E6FF] animate-pulse" />GUARDIAN<span className="text-white/40 font-normal">&nbsp;AI</span></div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/30"><span className="w-1.5 h-1.5 rounded-full bg-neoCrimson animate-pulse" />{activeThreats} threats</div>
        </div>
        <main className="flex flex-col flex-1 overflow-hidden bg-deepVoid pb-[60px]">
          <ParentalAlertBanner />
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
