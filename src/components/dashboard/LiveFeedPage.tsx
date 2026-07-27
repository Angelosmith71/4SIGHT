'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scanLine, pulseGlow } from '@/utils/animations';
import { PageShell } from '@/components/layout/PageShell';
import { useLogs } from '@/hooks/useData';
import type { DbLogEntry } from '@/lib/supabase/types';
import { HudSkeleton } from '@/components/ui/HudSkeleton';

const LV: Record<DbLogEntry['level'],{ color:string; dot:string; icon:string; label:string; bg:string }> = {
  critical:{ color:'#FF2E4C', dot:'bg-neoCrimson shadow-[0_0_6px_#FF2E4C]', icon:'ti-alert-octagon',  label:'CRIT', bg:'rgba(255,46,76,0.04)'  },
  warn:    { color:'#FFB648', dot:'bg-solarAmber',                           icon:'ti-alert-triangle', label:'WARN', bg:'rgba(255,182,72,0.03)' },
  ok:      { color:'#00FF9C', dot:'bg-emeraldPulse',                         icon:'ti-circle-check',   label:'OK',   bg:'rgba(0,255,156,0.03)'  },
  info:    { color:'rgba(255,255,255,0.35)', dot:'bg-white/25',              icon:'ti-info-circle',    label:'INFO', bg:'transparent'           },
};

const FILTERS = ['all','critical','warn','ok','info'] as const;
type F = typeof FILTERS[number];

function pad(n:number){ return String(n).padStart(2,'0'); }
function ft(iso:string){
  const d=new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function LiveFeedPage() {
  const [filter, setFilter] = useState<F>('all');
  const [search, setSearch] = useState('');
  const [paused, setPaused] = useState(false);

  const { logs, loading } = useLogs(
    paused ? undefined : { level: filter==='all'?undefined:filter, search:search||undefined }
  );

  const counts = logs.reduce((a,e)=>({...a,[e.level]:(a[e.level]??0)+1}),{} as Record<string,number>);

  return (
    <PageShell>
      <div className="flex flex-col flex-1 overflow-hidden"
        style={{
          backgroundImage:`radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,230,255,0.05) 0%,transparent 65%),linear-gradient(rgba(0,230,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.02) 1px,transparent 1px)`,
          backgroundSize:'100% 100%,32px 32px,32px 32px',
        }}>
        <div className="px-4 md:px-8 pt-5 pb-4 flex-shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-neoCrimson font-bold text-lg">«</span>
            <span className="font-rajdhani font-bold text-base tracking-[2px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="font-mono text-[9px] tracking-[3px] text-electricCyan/30 uppercase mb-1">// live event stream</p>
              <h1 className="font-rajdhani font-bold text-2xl text-white tracking-wide">Live Feed</h1>
            </div>
            <motion.button {...(paused?{}:pulseGlow)} onClick={()=>setPaused(p=>!p)}
              className={`font-mono text-[10px] tracking-[1px] uppercase px-4 py-2 rounded-sm border flex items-center gap-2 transition-colors
                ${paused?'border-white/20 text-white/40':'border-electricCyan/40 text-electricCyan bg-electricCyan/8'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${paused?'bg-white/30':'bg-electricCyan animate-pulse'}`}/>
              {paused?'▶ RESUME':'⏸ PAUSE'}
            </motion.button>
          </div>

          <div className="flex gap-2 flex-wrap mb-3">
            {(['critical','warn','ok','info'] as const).map(lvl=>{
              const lv=LV[lvl];
              return (
                <button key={lvl} onClick={()=>setFilter(f=>f===lvl?'all':lvl)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all ${filter===lvl?'':'border-white/8 bg-white/[0.02] hover:bg-white/[0.04]'}`}
                  style={filter===lvl?{borderColor:`${lv.color}50`,background:`${lv.color}10`}:{}}>
                  <span className={`w-1.5 h-1.5 rounded-full ${lv.dot}`}/>
                  <span className="font-mono text-[9px] uppercase tracking-[1px]" style={{color:lv.color}}>{lvl}</span>
                  <span className="font-rajdhani font-bold text-sm" style={{color:lv.color}}>{counts[lvl]??0}</span>
                </button>
              );
            })}
            <span className="font-mono text-[9px] text-white/20 ml-auto self-center">{logs.length} events</span>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-electricCyan/40">»</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events..."
              className="w-full bg-deepVoid/60 border border-electricCyan/12 rounded-sm pl-7 pr-3 py-2 font-mono text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-electricCyan/35"/>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative">
          {!paused && <motion.div {...scanLine} className="absolute left-0 right-0 h-px bg-electricCyan/15 pointer-events-none z-10"/>}
          {loading ? (
            <div className="px-4 md:px-8 py-4"><HudSkeleton rows={8} height="h-10"/></div>
          ) : (
            <AnimatePresence initial={false}>
              {logs.map(entry=>{
                const lv=LV[entry.level];
                return (
                  <motion.div key={entry.id} initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} layout
                    className="relative flex items-center gap-3 px-4 md:px-8 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors overflow-hidden"
                    style={{background:lv.bg}}>
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-60" style={{background:lv.color}}/>
                    <div className="w-8 h-8 rounded-sm flex items-center justify-center border flex-shrink-0"
                      style={{color:lv.color,borderColor:`${lv.color}30`,background:`${lv.color}0c`}}>
                      <i className={`ti ${lv.icon}`} style={{fontSize:15}} aria-hidden="true"/>
                    </div>
                    <span className="font-mono text-[9px] text-white/20 flex-shrink-0 w-[64px] hidden md:block">{ft(entry.created_at)}</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-mono text-[9px] tracking-[1px]" style={{color:lv.color}}>{lv.label}</span>
                      <span className="font-mono text-[9px] text-electricCyan/30">»</span>
                      <span className="font-mono text-[11px] truncate" style={{color:lv.color}}>{entry.message}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          {!loading && logs.length===0 && <p className="font-mono text-[11px] text-white/20 text-center mt-16">No matching events.</p>}
        </div>

        <div className="px-4 md:px-8 py-2 border-t border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {!paused && <motion.span animate={{opacity:[1,0.2,1]}} transition={{duration:1.2,repeat:Infinity}} className="w-1.5 h-1.5 rounded-full bg-electricCyan"/>}
            <span className="font-mono text-[9px] text-white/25 italic">{paused?'⏸ Stream paused':'Analyzing AI threats in real time...'}</span>
          </div>
          <span className="font-mono text-[9px] text-white/20">{logs.length} events</span>
        </div>
      </div>
    </PageShell>
  );
}
