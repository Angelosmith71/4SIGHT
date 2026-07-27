'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cardVariant, listVariant, pulseGlow, rotatingRing, flicker } from '@/utils/animations';
import { PageShell } from '@/components/layout/PageShell';
import { HudPageHeader } from '@/components/ui/HudPrimitives';
import { useBotEvents } from '@/hooks/useData';
import type { DbBotEvent } from '@/lib/supabase/types';
import { HudSkeleton } from '@/components/ui/HudSkeleton';

type Severity = 'critical'|'high'|'medium'|'low';

const SEV_CONFIG: Record<Severity,{ color:string; glow:string; riskLabel:string }> = {
  critical: { color:'#FF2E4C', glow:'rgba(255,46,76,0.7)',  riskLabel:'CRITICAL THREAT' },
  high:     { color:'#A45CFF', glow:'rgba(164,92,255,0.7)', riskLabel:'HIGH THREAT'     },
  medium:   { color:'#FFB648', glow:'rgba(255,182,72,0.6)', riskLabel:'MEDIUM THREAT'   },
  low:      { color:'#00E6FF', glow:'rgba(0,230,255,0.5)',  riskLabel:'LOW THREAT'      },
};

function EventRow({ e, selected, onClick }: { e:DbBotEvent; selected:boolean; onClick:()=>void }) {
  const s = SEV_CONFIG[e.severity as Severity];
  return (
    <motion.div variants={cardVariant} onClick={onClick}
      className={`relative flex items-center gap-4 p-4 rounded-sm border cursor-pointer transition-all overflow-hidden
        ${selected?'border-electricCyan/40 bg-electricCyan/5':'border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15'}`}>
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-sm" style={{ background:s.color }}/>
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor:s.color }}/>
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor:s.color }}/>
      {selected && (
        <motion.div className="absolute left-0 right-0 h-[1px] pointer-events-none"
          style={{ background:`linear-gradient(90deg,transparent,${s.color},transparent)` }}
          animate={{ top:['-2px','105%'] }} transition={{ duration:2.5,repeat:Infinity,ease:'linear' }}/>
      )}
      <motion.div
        animate={e.severity==='critical'?{boxShadow:[`0 0 0px ${s.glow}`,`0 0 16px ${s.glow}`,`0 0 0px ${s.glow}`]}:{}}
        transition={{ duration:1.4,repeat:Infinity }}
        className="w-14 h-14 rounded-sm flex items-center justify-center flex-shrink-0 border"
        style={{ background:`${s.color}12`,borderColor:`${s.color}40`,color:s.color }}>
        <i className={`ti ${e.icon}`} style={{ fontSize:26 }} aria-hidden="true"/>
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] text-white/35">{new Date(e.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
          <span className="font-rajdhani font-semibold text-[13px]" style={{ color:s.color }}>{e.actor}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-electricCyan/50 tracking-[1px]">»»</span>
          <span className="font-rajdhani font-bold text-[15px] text-white">{e.action_bold}</span>
          <span className="font-rajdhani text-[13px] text-white/55">{e.action_light}</span>
        </div>
      </div>
      <motion.span whileHover={{ scale:1.05 }}
        className="flex-shrink-0 font-mono text-[10px] tracking-[1px] uppercase px-3 py-1 rounded-sm font-bold"
        style={{ background:`${e.status==='Blocked'?'#FF2E4C':e.status==='Quarantined'?'#A45CFF':'#FFB648'}25`, color:e.status==='Blocked'?'#FF2E4C':e.status==='Quarantined'?'#A45CFF':'#FFB648', border:`1px solid ${e.status==='Blocked'?'#FF2E4C':e.status==='Quarantined'?'#A45CFF':'#FFB648'}50` }}>
        {e.status}
      </motion.span>
      {selected && <span className="text-electricCyan/50 font-mono text-sm flex-shrink-0">▶</span>}
    </motion.div>
  );
}

function BotProfile({ bot }: { bot:DbBotEvent }) {
  const s = SEV_CONFIG[bot.severity as Severity];
  return (
    <motion.div key={bot.id} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:16}}
      transition={{duration:0.25,ease:'easeOut'}}
      className="relative rounded-sm border overflow-hidden flex flex-col h-full"
      style={{borderColor:`${s.color}40`,background:'rgba(10,8,14,0.95)'}}>
      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 z-10" style={{borderColor:s.color}}/>
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 z-10" style={{borderColor:s.color}}/>
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{backgroundImage:'linear-gradient(rgba(0,230,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,1) 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{background:`radial-gradient(ellipse 70% 80% at 50% 0%,${s.color}18,transparent 70%)`}}/>

      <div className="relative z-10 px-5 pt-5 pb-3 border-b" style={{borderColor:`${s.color}20`}}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-electricCyan/50 font-mono text-[10px]">«</span>
          <span className="font-mono text-[10px] tracking-[2px] text-white/35 uppercase">Bot Profile</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[9px] tracking-[2px] text-white/25 uppercase">Threat Analysis</p>
          <span className="font-mono text-[10px] tracking-[1px] uppercase px-2.5 py-0.5 rounded-sm"
            style={{color:bot.status==='Blocked'?'#FF2E4C':bot.status==='Quarantined'?'#A45CFF':'#FFB648',background:`${bot.status==='Blocked'?'#FF2E4C':bot.status==='Quarantined'?'#A45CFF':'#FFB648'}20`,border:`1px solid ${bot.status==='Blocked'?'#FF2E4C':bot.status==='Quarantined'?'#A45CFF':'#FFB648'}40`}}>
            {bot.status}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center py-5 px-5 border-b" style={{borderColor:`${s.color}15`}}>
        <div className="relative w-28 h-28 flex items-center justify-center mb-4">
          <motion.svg {...rotatingRing} className="absolute inset-0" viewBox="0 0 112 112" width={112} height={112}>
            <circle cx="56" cy="56" r="52" stroke={s.color} strokeWidth="0.75" strokeDasharray="4 9" fill="none" opacity=".3"/>
          </motion.svg>
          <motion.div {...pulseGlow}
            className="w-24 h-24 rounded-full flex items-center justify-center border-2 relative overflow-hidden"
            style={{borderColor:`${s.color}50`,background:`radial-gradient(circle at 40% 35%,${s.color}20,#050608 70%)`}}>
            <svg viewBox="0 0 80 80" width={80} height={80} className="absolute inset-0">
              <ellipse cx="40" cy="28" rx="14" ry="16" fill={`${s.color}25`}/>
              <ellipse cx="40" cy="65" rx="22" ry="18" fill={`${s.color}15`}/>
              <ellipse cx="34" cy="27" rx="3" ry="2.5" fill={s.color} opacity=".9"/>
              <ellipse cx="46" cy="27" rx="3" ry="2.5" fill={s.color} opacity=".9"/>
            </svg>
            <motion.span variants={bot.severity==='critical'?flicker:undefined} animate={bot.severity==='critical'?'alert':'idle'}
              className="font-rajdhani font-bold text-xs tracking-widest relative z-10 mt-5" style={{color:s.color}}>
              {bot.actor.toUpperCase().split(' ').slice(0,2).join(' ')}
            </motion.span>
          </motion.div>
        </div>
        <h2 className="font-rajdhani font-bold text-2xl text-white tracking-wide">{bot.actor.toUpperCase()}</h2>
        <p className="font-mono text-[10px] text-white/35 mt-1"><span className="text-white/20">ORIGIN:</span> {bot.origin??'Unidentified'}</p>
        <div className="w-full mt-4 p-3 rounded-sm border" style={{borderColor:`${s.color}30`,background:`${s.color}08`}}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-electricCyan/40 font-mono text-[10px]">«</span>
              <span className="font-mono text-[9px] tracking-[2px] text-white/30 uppercase">Risk Level</span>
            </div>
            <motion.span animate={{color:[s.color,'#fff',s.color]}} transition={{duration:2,repeat:Infinity}}
              className="font-rajdhani font-bold text-[13px] tracking-wider">{s.riskLabel}</motion.span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <motion.div className="h-full rounded-full" style={{background:`linear-gradient(90deg,${s.color}80,${s.color})`}}
              initial={{width:'0%'}} animate={{width:`${bot.risk_pct}%`}} transition={{duration:0.9,ease:'easeOut'}}/>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-5 py-4 flex flex-col gap-2.5 border-b" style={{borderColor:`${s.color}15`}}>
        {[['Behavior',bot.behavior??'—'],['Permissions',bot.permissions??'—']].map(([k,v])=>(
          <div key={k} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-electricCyan/40 text-[10px]">»</span>
            <span className="text-white/35">{k}:</span>
            <span className="text-white/75">{v}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 font-mono text-[11px] mt-1">
          <span className="text-[10px]" style={{color:s.color}}>◆</span>
          <span className="text-white/35">Recommended:</span>
          <span className="font-rajdhani font-bold text-[13px] tracking-wide" style={{color:s.color}}>QUARANTINE BOT</span>
          <span className="font-mono text-[10px]" style={{color:s.color}}>»»</span>
        </div>
      </div>

      <div className="relative z-10 px-5 py-4 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-electricCyan/40 font-mono text-[10px]">«</span>
          <span className="font-mono text-[9px] tracking-[2px] text-white/30 uppercase">Security Actions</span>
          <span className="text-electricCyan/40 font-mono text-[10px]">»</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {label:'BLOCK\nBOT',    icon:'ti-shield-x',    color:'#FF2E4C'},
            {label:'LIMIT\nACCESS', icon:'ti-lock',         color:'#00E6FF'},
            {label:'TRUST\nBOT?',   icon:'ti-circle-check', color:'#00FF9C'},
          ].map(({label,icon,color})=>(
            <motion.button key={label} whileHover={{scale:1.04,boxShadow:`0 0 18px ${color}40`}} whileTap={{scale:0.96}}
              className="relative flex flex-col items-center gap-2 py-3 px-2 rounded-sm border overflow-hidden"
              style={{background:`${color}10`,borderColor:`${color}40`,color}}>
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{borderColor:color}}/>
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{borderColor:color}}/>
              <i className={`ti ${icon}`} style={{fontSize:22}} aria-hidden="true"/>
              <span className="font-rajdhani font-bold text-[11px] tracking-wider text-center leading-tight whitespace-pre-line">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="relative z-10 px-5 py-3 border-t flex items-center gap-2" style={{borderColor:`${s.color}15`}}>
        <motion.span animate={{opacity:[1,0.2,1]}} transition={{duration:1.2,repeat:Infinity}}
          className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:s.color}}/>
        <p className="font-mono text-[9px] italic" style={{color:`${s.color}60`}}>Analyzing AI threats in real time...</p>
      </div>
    </motion.div>
  );
}

export function AiBotMonitor() {
  const { events, loading } = useBotEvents();
  const [selected, setSelected] = useState<DbBotEvent|null>(null);

  // Auto-select first critical event once loaded
  React.useEffect(() => {
    if (!selected && events.length > 0) {
      setSelected(events.find(e=>e.severity==='critical') ?? events[0]);
    }
  }, [events, selected]);

  return (
    <PageShell>
      <div className="flex flex-col flex-1 overflow-hidden"
        style={{
          backgroundImage:`radial-gradient(ellipse 60% 40% at 50% 0%,rgba(164,92,255,0.07) 0%,transparent 65%),linear-gradient(rgba(0,230,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.018) 1px,transparent 1px)`,
          backgroundSize:'100% 100%,32px 32px,32px 32px',
        }}>
        <div className="px-4 md:px-8 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-neoCrimson font-bold text-lg leading-none">«</span>
            <span className="font-rajdhani font-bold text-base tracking-[2px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
          </div>
          <HudPageHeader eyebrow="// bot monitor" title="AI Bot Monitor"/>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 min-h-full">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-electricCyan/40 font-mono text-[10px]">»</span>
                <span className="font-mono text-[10px] tracking-[2px] text-white/30 uppercase">Bot Activity Log</span>
                <span className="text-electricCyan/40 font-mono text-[10px]">»»</span>
              </div>
              {loading ? (
                <HudSkeleton rows={4} height="h-[88px]"/>
              ) : (
                <motion.div variants={listVariant} initial="hidden" animate="visible" className="flex flex-col gap-3">
                  {events.map(e=>(
                    <EventRow key={e.id} e={e} selected={selected?.id===e.id} onClick={()=>setSelected(e)}/>
                  ))}
                </motion.div>
              )}
            </div>
            <AnimatePresence mode="wait">
              {selected && <BotProfile key={selected.id} bot={selected}/>}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-4 md:px-8 py-2 border-t border-white/5 flex items-center gap-2 flex-shrink-0">
          <motion.span animate={{opacity:[1,0.3,1]}} transition={{duration:1.5,repeat:Infinity}} className="w-1.5 h-1.5 rounded-full bg-electricCyan"/>
          <p className="font-mono text-[9px] text-white/25 italic">
            Analyzing AI threats in real time · {events.filter(e=>e.status==='Blocked'||e.status==='Quarantined').length} threats neutralized
          </p>
        </div>
      </div>
    </PageShell>
  );
}
