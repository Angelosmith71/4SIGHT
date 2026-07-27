'use client';
import React from 'react';
import { motion } from 'framer-motion';
export function HudPanel({ children, className='', accentColor='#00E6FF', onClick, active }: { children:React.ReactNode; className?:string; accentColor?:string; onClick?:()=>void; active?:boolean }) {
  return (
    <motion.div onClick={onClick} whileHover={onClick?{scale:1.01}:undefined} transition={{duration:0.15}}
      className={`relative bg-[rgba(17,20,24,0.85)] border rounded-sm overflow-visible ${className} ${onClick?'cursor-pointer':''}`}
      style={{borderColor:active?'rgba(0,230,255,0.4)':'rgba(255,255,255,0.08)',background:active?'rgba(0,230,255,0.05)':undefined}}>
      <span className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 pointer-events-none" style={{borderColor:accentColor}}/>
      <span className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 pointer-events-none" style={{borderColor:accentColor}}/>
      {children}
    </motion.div>
  );
}
export function HudPageHeader({ eyebrow, title, right }: { eyebrow:string; title:string; right?:React.ReactNode }) {
  return (
    <div className="flex items-start justify-between pb-4 border-b border-electricCyan/10 flex-shrink-0">
      <div><p className="font-mono text-[9px] tracking-[3px] text-electricCyan/30 uppercase mb-1">{eyebrow}</p><h1 className="font-rajdhani font-bold text-2xl text-white tracking-wide">{title}</h1></div>
      {right&&<div className="flex items-center gap-3 mt-1">{right}</div>}
    </div>
  );
}
export function HudTag({ label, color }: { label:string; color:string }) {
  return <span className="font-mono text-[9px] tracking-[1px] px-2 py-0.5 rounded-sm uppercase flex-shrink-0" style={{color,background:`${color}18`,border:`1px solid ${color}35`}}>{label}</span>;
}
export function HudBar({ pct, color, label, value }: { pct:number; color:string; label:string; value?:string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between font-mono text-[10px]"><span className="text-white/35">{label}</span><span style={{color}}>{value??`${pct}%`}</span></div>
      <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{background:color}} initial={{width:'0%'}} animate={{width:`${pct}%`}} transition={{duration:0.9,ease:'easeOut',delay:0.2}}/>
      </div>
    </div>
  );
}
export function HudFilters<T extends string>({ options, active, onChange }: { options:readonly T[]; active:T; onChange:(v:T)=>void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(opt=><button key={opt} onClick={()=>onChange(opt)} className={`font-mono text-[9px] tracking-[1px] px-2.5 py-1 rounded-sm border uppercase transition-all ${active===opt?'bg-electricCyan/10 border-electricCyan/50 text-electricCyan':'border-white/10 text-white/30 hover:border-white/25 hover:text-white/55'}`}>{opt}</button>)}
    </div>
  );
}
export function HudStat({ label, value, color }: { label:string; value:string|number; color:string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2.5 border-r border-white/5 last:border-0">
      <span className="font-rajdhani font-bold text-xl" style={{color}}>{value}</span>
      <span className="font-mono text-[9px] text-white/25 tracking-[1px] uppercase">{label}</span>
    </div>
  );
}
export function HudButton({ label, variant='primary', onClick }: { label:string; variant?:'primary'|'danger'|'success'; onClick?:()=>void }) {
  const s={primary:{border:'rgba(0,230,255,0.35)',color:'#00E6FF',bg:'rgba(0,230,255,0.08)'},danger:{border:'rgba(255,46,76,0.35)',color:'#FF2E4C',bg:'rgba(255,46,76,0.08)'},success:{border:'rgba(0,255,156,0.35)',color:'#00FF9C',bg:'rgba(0,255,156,0.08)'}}[variant];
  return <motion.button onClick={onClick} whileHover={{scale:1.03}} whileTap={{scale:0.96}} className="relative font-mono text-[10px] tracking-[1.5px] uppercase px-4 py-2 rounded-sm" style={{border:`1px solid ${s.border}`,color:s.color,background:s.bg}}><span className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{borderColor:s.color}}/><span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{borderColor:s.color}}/>{label}</motion.button>;
}
