'use client';
import { useClock } from '@/hooks/useClock';
import { useAuth } from '@/hooks/useData';
import { motion } from 'framer-motion';
export function Topbar({ activeThreats }: { activeThreats: number }) {
  const time=useClock(); const{signOut}=useAuth();
  return (
    <header className="col-span-2 flex items-center justify-between px-5 h-[52px] bg-graphite border-b border-electricCyan/10">
      <div className="flex items-center gap-2 font-rajdhani text-xl font-bold tracking-[2px] text-electricCyan">
        <span className="w-2 h-2 rounded-full bg-electricCyan shadow-[0_0_8px_#00E6FF] animate-pulse"/>
        GUARDIAN<span className="text-white/40 font-normal">&nbsp;AI</span>
      </div>
      <div className="flex items-center gap-5 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-emeraldPulse shadow-[0_0_6px_#00FF9C]"/>Neural core online</div>
        <div className="flex items-center gap-1.5 text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-neoCrimson shadow-[0_0_6px_#FF2E4C] animate-pulse"/>{activeThreats} active threats</div>
        <div className="flex items-center gap-1.5 text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-solarAmber"/>Firewall 97%</div>
      </div>
      <div className="flex items-center gap-3">
        <time className="font-mono text-[12px] text-electricCyan/80" suppressHydrationWarning>{time}</time>
        <motion.button onClick={signOut} whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="font-mono text-[9px] tracking-[1px] uppercase px-2.5 py-1 rounded-sm border border-white/15 text-white/35 hover:border-neoCrimson/40 hover:text-neoCrimson transition-colors">Sign out</motion.button>
      </div>
    </header>
  );
}
