'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ROUTES } from '@/utils/navRoutes';
const MOBILE_TABS = NAV_ROUTES.filter(r=>['/dashboard','/dashboard/threats','/dashboard/live-feed','/dashboard/bot-monitor','/dashboard/analytics'].includes(r.href));
export function MobileNav() {
  const pathname=usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-graphite border-t border-electricCyan/20 z-50 md:hidden">
      <div className="flex justify-around py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {MOBILE_TABS.map(tab=>{ const active=pathname===tab.href; return (
          <Link key={tab.href} href={tab.href} className="relative flex flex-col items-center gap-0.5 px-3 py-1 min-w-[52px]">
            <span className={`text-xl leading-none transition-colors ${active?'opacity-100':'opacity-40'}`}>{tab.icon}</span>
            <span className={`text-[9px] tracking-widest transition-colors font-mono ${active?'text-electricCyan':'text-white/30'}`}>{tab.label.toUpperCase()}</span>
            {active&&<div className="absolute -bottom-2 w-8 h-[2px] bg-electricCyan rounded-full shadow-[0_0_10px_rgba(0,230,255,0.9)]"/>}
          </Link>
        ); })}
      </div>
    </nav>
  );
}
