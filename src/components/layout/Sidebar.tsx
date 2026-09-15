'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ROUTES } from '@/utils/navRoutes';
import { useSubscription } from '@/hooks/useSubscription';
import { useFamilyWatchSubscription } from '@/hooks/useFamilyWatchSubscription';
import { isDemoMode } from '@/lib/demo';
import type { NavRoute } from '@/types';
const GATED: Record<string,'botMonitor'|'analytics'|'reports'|'realtime'> = { '/dashboard/bot-monitor':'botMonitor', '/dashboard/analytics':'analytics', '/dashboard/reports':'reports', '/dashboard/live-feed':'realtime' };
export function Sidebar() {
  const pathname=usePathname(); const{subscription,can}=useSubscription();
  const { hasAccess: hasFamilyWatch } = useFamilyWatchSubscription();
  const demo=isDemoMode();
  return (
    <nav className="flex flex-col bg-graphite/60 border-r border-electricCyan/10 py-4 gap-0.5">
      {(['monitor','analyze','system'] as const).map(sec=>(
        <div key={sec}>
          <p className="font-mono text-[9px] tracking-[2px] text-white/20 px-4 pt-3 pb-1.5 uppercase">{sec}</p>
          {NAV_ROUTES.filter(r=>r.section===sec).map(route=>{
            const gf=GATED[route.href];
            const isFamily=route.href==='/dashboard/parental-monitor';
            const locked=!demo?(isFamily?!hasFamilyWatch:(gf?!can(gf):false)):false;
            return <NavItem key={route.href} route={route} active={pathname===route.href} locked={locked}/>;
          })}
        </div>
      ))}
      <div className="flex-1"/>
      {subscription && (
        <Link href="/billing" className="mx-3 mb-2">
          <div className="relative flex items-center justify-between px-3 py-2 rounded-sm border overflow-hidden hover:opacity-80 transition-opacity" style={{borderColor:`${subscription.plan.color}30`,background:`${subscription.plan.color}08`}}>
            <div><p className="font-mono text-[8px] text-white/25 uppercase">Plan</p><p className="font-rajdhani font-bold text-[13px]" style={{color:subscription.plan.color}}>{subscription.plan.name}</p></div>
          </div>
        </Link>
      )}
      <Link href="/dashboard/emergency" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-neoCrimson border-l-2 border-neoCrimson/60 hover:bg-neoCrimson/5 transition-colors">⚠ Emergency</Link>
    </nav>
  );
}
function NavItem({ route, active, locked }: { route:NavRoute; active:boolean; locked:boolean }) {
  if(locked) return <Link href="/pricing" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium border-l-2 border-transparent text-white/20 hover:text-white/35 transition-colors"><span className="text-base opacity-40">{route.icon}</span><span className="flex-1">{route.label}</span><span className="font-mono text-[8px] px-1.5 py-0.5 rounded-sm border border-plasmaViolet/30 text-plasmaViolet/60">PRO</span></Link>;
  return <Link href={route.href} className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium border-l-2 transition-all ${active?'text-electricCyan border-electricCyan bg-electricCyan/5':'text-white/40 border-transparent hover:text-white/70 hover:bg-electricCyan/[0.03]'}`}><span className="text-base">{route.icon}</span><span className="flex-1">{route.label}</span>{route.badge!==undefined&&<span className="bg-neoCrimson text-white text-[10px] font-mono px-1.5 py-0.5 rounded-[3px]">{route.badge}</span>}</Link>;
}
