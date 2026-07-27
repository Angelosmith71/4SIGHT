'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ThreatSeverity } from '@/types';
import type { DbThreat } from '@/lib/supabase/types';
import { useThreats } from '@/hooks/useData';
import { cardVariant, listVariant, rotatingRingFast, pulseGlow, flicker } from '@/utils/animations';
import { PageShell } from '@/components/layout/PageShell';
import { HudSkeleton } from '@/components/ui/HudSkeleton';

const SEV: Record<ThreatSeverity, { color:string; glow:string; label:string; icon:string }> = {
  critical: { color:'#FF2E4C', glow:'rgba(255,46,76,0.7)',  label:'CRITICAL', icon:'ti-shield-x'       },
  high:     { color:'#FFB648', glow:'rgba(255,182,72,0.6)', label:'HIGH',     icon:'ti-alert-triangle' },
  medium:   { color:'#A45CFF', glow:'rgba(164,92,255,0.6)', label:'MED',      icon:'ti-eye'            },
  low:      { color:'#00E6FF', glow:'rgba(0,230,255,0.5)',  label:'LOW',      icon:'ti-info-circle'    },
};

function relTime(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 60 ? `${m}m ago` : `${Math.floor(m/60)}h ${m%60}m ago`;
}

const FILTERS = ['All','Critical','High','Medium','Low','Active','Mitigated'] as const;
type Filter = typeof FILTERS[number];

function ThreatRow({ threat, selected, onClick }: { threat:DbThreat; selected:boolean; onClick:()=>void }) {
  const s = SEV[threat.severity];
  const isActive = threat.status === 'active';

  return (
    <motion.div variants={cardVariant} onClick={onClick}
      className={`relative flex items-center gap-4 p-4 rounded-sm border cursor-pointer transition-all overflow-hidden
        ${selected?'border-electricCyan/40 bg-electricCyan/5':'border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/14'}`}>
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background:s.color }}/>
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor:s.color }}/>
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor:selected?'#00E6FF':s.color }}/>
      {selected && (
        <motion.div className="absolute left-0 right-0 h-[1px] pointer-events-none"
          style={{ background:`linear-gradient(90deg,transparent,${s.color},transparent)` }}
          animate={{ top:['-2px','105%'] }} transition={{ duration:2.8,repeat:Infinity,ease:'linear' }}/>
      )}
      <motion.div animate={isActive?{boxShadow:[`0 0 0px ${s.glow}`,`0 0 16px ${s.glow}`,`0 0 0px ${s.glow}`]}:{}}
        transition={{ duration:1.4,repeat:Infinity }}
        className="w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0 border"
        style={{ color:s.color,borderColor:`${s.color}40`,background:`${s.color}10` }}>
        <i className={`ti ${s.icon}`} style={{ fontSize:22 }} aria-hidden="true"/>
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-[10px] text-electricCyan/40">»»</span>
          <motion.span variants={isActive?flicker:undefined} animate={isActive?'alert':'idle'}
            className="font-rajdhani font-bold text-[15px] text-white truncate">{threat.name}</motion.span>
        </div>
        <p className="font-mono text-[9px] text-white/30">{threat.source}</p>
      </div>
      <span className="font-mono text-[9px] text-white/25 flex-shrink-0">{relTime(threat.created_at)}</span>
      <span className="font-mono text-[9px] tracking-[1px] uppercase px-2.5 py-1 rounded-sm flex-shrink-0 font-bold"
        style={{ color:s.color,background:`${s.color}18`,border:`1px solid ${s.color}40` }}>
        {threat.status.toUpperCase()}
      </span>
      <span className="font-mono text-[9px] tracking-[1px] uppercase px-2 py-0.5 rounded-sm flex-shrink-0"
        style={{ color:s.color,background:`${s.color}15`,border:`1px solid ${s.color}35` }}>
        {s.label}
      </span>
      {selected && <span className="text-electricCyan/40 font-mono text-sm flex-shrink-0">▶</span>}
    </motion.div>
  );
}

function ThreatDetail({ threat, onClose, onMitigate }: { threat:DbThreat; onClose:()=>void; onMitigate:(id:string)=>void }) {
  const s = SEV[threat.severity];
  const [saving, setSaving] = useState(false);

  async function handleMitigate() {
    setSaving(true);
    try { await onMitigate(threat.id); onClose(); }
    finally { setSaving(false); }
  }

  return (
    <motion.aside initial={{ opacity:0,x:40 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:40 }}
      transition={{ duration:0.25,ease:'easeOut' }}
      className="w-[300px] flex-shrink-0 flex flex-col border-l border-electricCyan/10 bg-[#08060e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage:'linear-gradient(rgba(0,230,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,1) 1px,transparent 1px)',backgroundSize:'26px 26px' }}/>
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background:`radial-gradient(ellipse 80% 100% at 50% 0%,${s.color}15,transparent 70%)` }}/>

      <div className="relative z-10 px-5 pt-5 pb-4 border-b flex items-start justify-between" style={{ borderColor:`${s.color}20` }}>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-mono text-[9px] text-electricCyan/40">«</span>
            <span className="font-mono text-[9px] tracking-[2px] text-white/25 uppercase">Threat Profile</span>
          </div>
          <h2 className="font-rajdhani font-bold text-lg text-white leading-tight">{threat.name}</h2>
          <p className="font-mono text-[9px] text-white/25 mt-0.5 uppercase tracking-[1px]">Threat Analysis</p>
        </div>
        <button onClick={onClose} className="text-white/25 hover:text-white/60 font-mono text-base">✕</button>
      </div>

      <div className="relative z-10 flex justify-center py-5 border-b" style={{ borderColor:`${s.color}15` }}>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <motion.svg {...rotatingRingFast} className="absolute inset-0" viewBox="0 0 96 96" width={96} height={96}>
            <circle cx="48" cy="48" r="44" stroke={s.color} strokeWidth="0.75" strokeDasharray="4 8" fill="none" opacity=".35"/>
          </motion.svg>
          <motion.div {...(threat.status==='active'?pulseGlow:{})}
            className="w-16 h-16 rounded-sm border-2 flex items-center justify-center relative overflow-hidden"
            style={{ borderColor:`${s.color}50`,background:`${s.color}0f` }}>
            <div className="absolute inset-0" style={{ background:`radial-gradient(circle at top left,${s.color}20,transparent 70%)` }}/>
            <i className={`ti ${s.icon} relative z-10`} style={{ color:s.color,fontSize:28 }} aria-hidden="true"/>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 px-5 py-4 flex flex-col gap-2.5 border-b flex-1" style={{ borderColor:`${s.color}15` }}>
        {([['Source',threat.source],['Status',threat.status.toUpperCase()],['Detected',relTime(threat.created_at)],['Severity',s.label]] as [string,string][]).map(([k,v])=>(
          <div key={k} className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-electricCyan/40 text-[9px]">»</span>
            <span className="text-white/30 w-16 flex-shrink-0">{k}:</span>
            <span className="text-white/70">{v}</span>
          </div>
        ))}
        {threat.description && (
          <div className="mt-1 p-3 rounded-sm border" style={{ borderColor:`${s.color}20`,background:`${s.color}06` }}>
            <p className="font-mono text-[9px] text-white/25 uppercase tracking-[1px] mb-1.5">◆ Description</p>
            <p className="text-[11px] text-white/45 leading-relaxed">{threat.description}</p>
          </div>
        )}
      </div>

      <div className="relative z-10 px-5 py-4">
        <div className="flex items-center gap-1.5 mb-4">
          <span className="font-mono text-[9px] text-electricCyan/40">«</span>
          <span className="font-mono text-[9px] tracking-[2px] text-white/25 uppercase">Security Actions</span>
          <span className="font-mono text-[9px] text-electricCyan/40">»</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} disabled={saving}
            className="relative flex items-center justify-center gap-2 py-2.5 rounded-sm border overflow-hidden disabled:opacity-40"
            style={{ color:'#FF2E4C',borderColor:'rgba(255,46,76,0.4)',background:'rgba(255,46,76,0.08)' }}>
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neoCrimson/60"/>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-neoCrimson/60"/>
            <i className="ti ti-shield-lock" style={{ fontSize:16 }} aria-hidden="true"/>
            <span className="font-mono text-[10px] tracking-[1.5px] font-bold">ISOLATE SOURCE</span>
          </motion.button>
          <motion.button onClick={handleMitigate} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            disabled={saving || threat.status==='mitigated'}
            className="relative flex items-center justify-center gap-2 py-2.5 rounded-sm border overflow-hidden disabled:opacity-40"
            style={{ color:'#00E6FF',borderColor:'rgba(0,230,255,0.35)',background:'rgba(0,230,255,0.08)' }}>
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-electricCyan/60"/>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-electricCyan/60"/>
            <i className={`ti ${saving?'ti-loader-2':'ti-circle-check'}`} style={{ fontSize:16 }} aria-hidden="true"/>
            <span className="font-mono text-[10px] tracking-[1.5px] font-bold">
              {saving ? 'SAVING...' : threat.status==='mitigated' ? 'MITIGATED ✓' : 'MARK MITIGATED'}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}

export function ThreatsPage() {
  const { threats, loading, error, updateThreat } = useThreats();
  const [selected, setSelected] = useState<DbThreat|null>(null);
  const [filter,   setFilter]   = useState<Filter>('All');

  const filtered = threats.filter(t => {
    if (filter==='All') return true;
    if (filter==='Active') return t.status==='active';
    if (filter==='Mitigated') return t.status==='mitigated';
    return t.severity===filter.toLowerCase();
  });
  const activeCount = threats.filter(t=>t.status==='active').length;

  async function handleMitigate(id: string) {
    await updateThreat(id, { status:'mitigated' });
  }

  return (
    <PageShell>
      <div className="flex flex-col flex-1 overflow-hidden"
        style={{
          backgroundImage:`radial-gradient(ellipse 60% 40% at 50% 0%,rgba(255,46,76,0.06) 0%,transparent 65%),linear-gradient(rgba(0,230,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.02) 1px,transparent 1px)`,
          backgroundSize:'100% 100%,32px 32px,32px 32px',
        }}>
        <div className="px-4 md:px-8 pt-5 pb-4 flex-shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-neoCrimson font-bold text-lg">«</span>
            <span className="font-rajdhani font-bold text-base tracking-[2px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-mono text-[9px] tracking-[3px] text-electricCyan/30 uppercase mb-1">// threat intelligence</p>
              <h1 className="font-rajdhani font-bold text-2xl text-white tracking-wide">Threat Registry</h1>
            </div>
            <motion.div animate={{ boxShadow:['0 0 0px rgba(255,46,76,0)','0 0 14px rgba(255,46,76,0.6)','0 0 0px rgba(255,46,76,0)'] }}
              transition={{ duration:1.2,repeat:Infinity }}
              className="font-mono text-[10px] px-3 py-1.5 rounded-sm bg-neoCrimson/10 border border-neoCrimson/40 text-neoCrimson flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neoCrimson animate-pulse"/>
              {activeCount} LIVE THREATS
            </motion.div>
          </div>
          <div className="flex gap-1.5 flex-wrap mt-4">
            {FILTERS.map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className={`font-mono text-[9px] tracking-[1px] px-2.5 py-1 rounded-sm border uppercase transition-all
                  ${filter===f?'bg-electricCyan/10 border-electricCyan/50 text-electricCyan':'border-white/10 text-white/30 hover:border-white/25 hover:text-white/55'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
            {loading ? (
              <HudSkeleton rows={6} height="h-[72px]" />
            ) : error ? (
              <p className="font-mono text-[11px] text-neoCrimson/60 text-center mt-16">Error: {error}</p>
            ) : (
              <motion.div key={filter} variants={listVariant} initial="hidden" animate="visible" className="flex flex-col gap-2.5">
                {filtered.map(t=>(
                  <ThreatRow key={t.id} threat={t} selected={selected?.id===t.id}
                    onClick={()=>setSelected(s=>s?.id===t.id?null:t)} />
                ))}
                {filtered.length===0 && (
                  <p className="font-mono text-[11px] text-white/20 text-center mt-16">No threats match this filter.</p>
                )}
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {selected && (
              <ThreatDetail key={selected.id} threat={selected}
                onClose={()=>setSelected(null)}
                onMitigate={handleMitigate} />
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 md:px-8 py-2 border-t border-white/5 flex items-center gap-2 flex-shrink-0">
          <motion.span animate={{ opacity:[1,0.2,1] }} transition={{ duration:1.5,repeat:Infinity }} className="w-1.5 h-1.5 rounded-full bg-neoCrimson"/>
          <p className="font-mono text-[9px] text-white/25 italic">
            Analyzing AI threats in real time · {activeCount} active · {threats.filter(t=>t.status==='mitigated').length} mitigated
          </p>
        </div>
      </div>
    </PageShell>
  );
}
