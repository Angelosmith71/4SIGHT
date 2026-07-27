'use client';
import { PageShell } from '@/components/layout/PageShell';
import { motion } from 'framer-motion';
export function ReportsPage() {
  return (
    <PageShell>
      <div className="flex flex-col flex-1 overflow-hidden" style={{backgroundImage:'linear-gradient(rgba(0,230,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.02) 1px,transparent 1px)',backgroundSize:'32px 32px'}}>
        <div className="px-4 md:px-8 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5 mb-3"><img src="/guardian-ai-logo.jpeg" alt="Guardian AI Logo" className="w-8 h-8 rounded-md object-cover border border-electricCyan/50 shadow-[0_0_12px_rgba(0,230,255,0.3)] flex-shrink-0" /><span className="font-rajdhani font-bold text-base tracking-[2px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span></div>
          <h1 className="font-rajdhani font-bold text-2xl text-white">ReportsPage</h1>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center max-w-sm">
            <motion.div animate={{opacity:[0.3,1,0.3]}} transition={{duration:2,repeat:Infinity}} className="w-16 h-16 rounded-sm border border-electricCyan/30 bg-electricCyan/8 flex items-center justify-center mx-auto mb-6"><i className="ti ti-shield-check" style={{color:'#00E6FF',fontSize:28}}/></motion.div>
            <p className="font-rajdhani font-bold text-xl text-white mb-2">ReportsPage Active</p>
            <p className="font-mono text-[10px] text-white/35 leading-[1.8]">Connected to Supabase. Follow QUICKSTART.md to set up your database and see live data here.</p>
          </div>
        </div>
        <div className="px-4 md:px-8 py-2 border-t border-white/5 flex items-center gap-2">
          <motion.span animate={{opacity:[1,0.2,1]}} transition={{duration:1.5,repeat:Infinity}} className="w-1.5 h-1.5 rounded-full bg-electricCyan"/>
          <p className="font-mono text-[9px] text-white/25 italic">Analyzing AI threats in real time...</p>
        </div>
      </div>
    </PageShell>
  );
}
