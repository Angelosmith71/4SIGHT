'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cardVariant, listVariant, rotatingRing } from '@/utils/animations';
import { PageShell } from '@/components/layout/PageShell';

const HOURLY = [
  {l:'00',v:12},{l:'02',v:8},{l:'04',v:5},{l:'06',v:18},
  {l:'08',v:34},{l:'10',v:47},{l:'12',v:61},{l:'14',v:55},
  {l:'16',v:72},{l:'18',v:80},{l:'20',v:43},{l:'22',v:29},
];

const ATTACK_TYPES = [
  {label:'SQL Injection',color:'#FF2E4C',pct:92,count:312,icon:'ti-code'},
  {label:'DDoS',         color:'#FFB648',pct:58,count:198,icon:'ti-wave-square'},
  {label:'Port Scan',    color:'#A45CFF',pct:43,count:147,icon:'ti-scan'},
  {label:'Brute Force',  color:'#00E6FF',pct:39,count:134,icon:'ti-key'},
  {label:'XSS Attempt',  color:'#00FF9C',pct:26,count:89, icon:'ti-bug'},
  {label:'Config Exfil', color:'#FFB648',pct:13,count:44, icon:'ti-file-alert'},
];

function makeSparkPts(n=18){ let v=40;const p=[];for(let i=0;i<n;i++){v=Math.max(5,Math.min(95,v+(Math.random()-.48)*18));p.push({x:(i/(n-1))*100,y:100-v});}return p; }
function sparkPath(pts:{x:number;y:number}[]){ return pts.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' '); }
const SPARKS = { blocked:makeSparkPts(), response:makeSparkPts(), nodes:makeSparkPts() };

function SparkCard({ label, value, sub, pts, color, icon }: { label:string;value:string;sub:string;pts:{x:number;y:number}[];color:string;icon:string }) {
  return (
    <motion.div variants={cardVariant}
      className="relative flex flex-col gap-2 p-4 rounded-sm border overflow-hidden"
      style={{ borderColor:`${color}30`, background:`${color}06` }}>
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor:color }} />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor:color }} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center border" style={{ color, borderColor:`${color}40`, background:`${color}10` }}>
            <i className={`ti ${icon}`} style={{ fontSize:16 }} aria-hidden="true" />
          </div>
          <p className="font-mono text-[9px] tracking-[1px] text-white/30 uppercase">{label}</p>
        </div>
      </div>
      <p className="font-rajdhani font-bold text-2xl" style={{ color }}>{value}</p>
      <svg viewBox="0 0 100 60" className="w-full h-10" preserveAspectRatio="none">
        <path d={sparkPath(pts)} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <path d={`${sparkPath(pts)} L 100 60 L 0 60 Z`} fill={color} fillOpacity="0.07"/>
      </svg>
      <p className="font-mono text-[9px] text-white/25">{sub}</p>
    </motion.div>
  );
}

function ThreatRing({ score }: { score:number }) {
  const r=42; const circ=2*Math.PI*r;
  const color = score>=7?'#FF2E4C':score>=4?'#FFB648':'#00FF9C';
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <motion.svg {...rotatingRing} className="absolute inset-0" viewBox="0 0 144 144" width={144} height={144}>
        <circle cx="72" cy="72" r="68" stroke="#00E6FF" strokeWidth="0.5" strokeDasharray="4 8" fill="none" opacity=".2"/>
      </motion.svg>
      <svg viewBox="0 0 144 144" width={144} height={144} className="absolute inset-0 -rotate-90">
        <circle cx="72" cy="72" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="9" fill="none"/>
        <motion.circle cx="72" cy="72" r={r} stroke={color} strokeWidth="9" fill="none" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset:circ }}
          animate={{ strokeDashoffset:circ*(1-score/10) }} transition={{ duration:1.2,ease:'easeOut',delay:0.3 }}/>
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-1">
        <motion.span className="font-rajdhani font-bold text-3xl text-white"
          initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }}>{score.toFixed(1)}</motion.span>
        <span className="font-mono text-[8px] text-white/25 tracking-[1px] uppercase">Threat Score</span>
        <span className="font-mono text-[8px] uppercase" style={{ color }}>↑ HIGH</span>
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label:string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="font-mono text-[9px] text-electricCyan/40">«</span>
      <span className="font-mono text-[9px] tracking-[2px] text-white/30 uppercase">{label}</span>
      <span className="font-mono text-[9px] text-electricCyan/40">»</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

export function AnalyticsPage() {
  const [barsReady, setBarsReady] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setBarsReady(true),300);return ()=>clearTimeout(t); },[]);

  return (
    <PageShell>
      <div className="px-4 md:px-8 py-5 flex flex-col gap-6 overflow-y-auto flex-1"
        style={{
          backgroundImage:`radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,230,255,0.05) 0%,transparent 65%),linear-gradient(rgba(0,230,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.02) 1px,transparent 1px)`,
          backgroundSize:'100% 100%,32px 32px,32px 32px',
        }}>

        {/* Logo + title */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-neoCrimson font-bold text-lg">«</span>
            <span className="font-rajdhani font-bold text-base tracking-[2px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
          </div>
          <p className="font-mono text-[9px] tracking-[3px] text-electricCyan/30 uppercase mb-1">// analytics</p>
          <h1 className="font-rajdhani font-bold text-2xl text-white tracking-wide">Analytics</h1>
        </div>

        {/* Sparklines */}
        <div>
          <SectionHeader label="System Performance" />
          <motion.div variants={listVariant} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3">
            <SparkCard label="Threats Blocked"  value="1,247" sub="+14 this hour"  pts={SPARKS.blocked}  color="#00E6FF" icon="ti-shield-check" />
            <SparkCard label="Avg Response"      value="1.4s"  sub="-0.3s vs prev"  pts={SPARKS.response} color="#00FF9C" icon="ti-bolt" />
            <SparkCard label="Nodes Online"      value="842"   sub="99.2% healthy"  pts={SPARKS.nodes}    color="#A45CFF" icon="ti-server" />
          </motion.div>
        </div>

        {/* Bar chart + ring */}
        <div>
          <SectionHeader label="Hourly Threat Volume" />
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div className="relative p-4 rounded-sm border border-white/8 bg-white/[0.02] overflow-hidden">
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-electricCyan/40" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-electricCyan/40" />
              <div className="flex items-end gap-1.5 h-[100px]">
                {HOURLY.map(bar => {
                  const pct = (bar.v/80)*100;
                  const color = pct>80?'#FF2E4C':pct>50?'#FFB648':'#00E6FF';
                  return (
                    <div key={bar.l} className="flex flex-col items-center gap-1 flex-1">
                      <motion.div className="w-full rounded-t-sm" style={{ background:color, opacity:0.5+(pct/100)*0.5 }}
                        initial={{ height:0 }} animate={{ height:barsReady?`${pct}%`:0 }}
                        transition={{ duration:0.7,ease:'easeOut',delay:0.05 }} />
                      <span className="font-mono text-[7px] text-white/20">{bar.l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative p-4 rounded-sm border border-neoCrimson/20 bg-neoCrimson/5 flex flex-col items-center justify-center gap-1 overflow-hidden">
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neoCrimson/50" />
              <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neoCrimson/50" />
              <ThreatRing score={6.4} />
              <p className="font-mono text-[8px] text-white/20 text-center mt-1">↑ from 4.1 yesterday</p>
            </div>
          </div>
        </div>

        {/* Attack breakdown */}
        <div>
          <SectionHeader label="Attack Type Breakdown" />
          <motion.div variants={listVariant} initial="hidden" animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ATTACK_TYPES.map(a => (
              <motion.div key={a.label} variants={cardVariant}
                className="relative flex items-center gap-3 p-3 rounded-sm border bg-white/[0.02] overflow-hidden"
                style={{ borderColor:`${a.color}25` }}>
                <span className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background:a.color }} />
                <div className="w-9 h-9 rounded-sm flex items-center justify-center border flex-shrink-0"
                  style={{ color:a.color, borderColor:`${a.color}35`, background:`${a.color}0c` }}>
                  <i className={`ti ${a.icon}`} style={{ fontSize:16 }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between font-mono text-[10px] mb-1.5">
                    <span className="text-white/50">{a.label}</span>
                    <span style={{ color:a.color }}>{a.count}</span>
                  </div>
                  <div className="h-[3px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background:a.color }}
                      initial={{ width:'0%' }} animate={{ width:`${a.pct}%` }}
                      transition={{ duration:0.9,ease:'easeOut',delay:0.2 }} />
                  </div>
                </div>
                <span className="font-mono text-[9px] flex-shrink-0" style={{ color:a.color }}>{a.pct}%</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageShell>
  );
}
