'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ContactModal } from '@/components/ui/ContactModal';

function Counter({ end, decimals=0, suffix='+', color }: { end:number; decimals?:number; suffix?:string; color:string }) {
  const [val,setVal]=useState(0); const ref=useRef<HTMLSpanElement>(null); const inView=useInView(ref,{once:true});
  useEffect(()=>{ if(!inView)return; let v=0; const step=end/(2000/16); const t=setInterval(()=>{ v+=step; if(v>=end){v=end;clearInterval(t);} setVal(parseFloat(v.toFixed(decimals))); },16); return()=>clearInterval(t); },[inView,end,decimals]);
  return <span ref={ref} style={{color}}>{decimals>0?val.toFixed(decimals):Math.floor(val).toLocaleString()}{suffix}</span>;
}

function Navbar({ onContactClick }: { onContactClick: () => void }) {
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>20); window.addEventListener('scroll',fn); return()=>window.removeEventListener('scroll',fn); },[]);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-[60px] transition-all ${scrolled?'bg-deepVoid/90 backdrop-blur-xl border-b border-electricCyan/10':'bg-transparent'}`}>
      <Link href="/" className="flex items-center gap-3 font-rajdhani font-bold text-lg tracking-[3px]">
        <img src="/guardian-ai-logo.jpeg" alt="Guardian AI Logo" className="w-10 h-10 rounded-md object-cover border border-electricCyan/50 shadow-[0_0_15px_rgba(0,230,255,0.35)] flex-shrink-0" />
        <span>4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
      </Link>
      <div className="hidden md:flex gap-7 font-mono text-[10px]">
        <a href="#features" className="text-white/38 hover:text-electricCyan transition-colors uppercase tracking-[1px]">Features</a>
        <a href="#pricing" className="text-white/38 hover:text-electricCyan transition-colors uppercase tracking-[1px]">Pricing</a>
        <Link href="/about" className="text-white/38 hover:text-electricCyan transition-colors uppercase tracking-[1px]">About</Link>
        <button onClick={onContactClick} className="text-white/38 hover:text-electricCyan transition-colors uppercase tracking-[1px] focus:outline-none">Contact</button>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login"><motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} className="font-mono text-[10px] tracking-[1.5px] uppercase px-4 py-2 rounded-sm border border-white/15 text-white/50 hover:border-electricCyan/40 hover:text-electricCyan transition-all">Log In</motion.button></Link>
        <Link href="/signup"><motion.button whileHover={{scale:1.04,boxShadow:'0 0 20px rgba(164,92,255,0.4)'}} whileTap={{scale:0.96}} className="relative font-mono text-[10px] tracking-[1.5px] uppercase px-5 py-2 rounded-sm border border-plasmaViolet/50 text-plasmaViolet bg-plasmaViolet/12 overflow-hidden"><span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-plasmaViolet/60"/><span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-plasmaViolet/60"/>» Get Started Free</motion.button></Link>
      </div>
    </nav>
  );
}

const FEATURES=[{icon:'ti-shield-bolt',color:'#FF2E4C',title:'Cookie Shield',desc:'Blocks third-party tracking cookies before they profile your behaviour across the web.'},{icon:'ti-robot',color:'#A45CFF',title:'AI Bot Monitor',desc:'Detects rogue AI bots attempting clipboard access, cookie scanning, or history harvesting.'},{icon:'ti-radar',color:'#00E6FF',title:'Tracker Defense',desc:'Neutralizes cross-site trackers and behavioral fingerprinting scripts in real time.'},{icon:'ti-database-lock',color:'#00FF9C',title:'Data Watch',desc:'Monitors for unusual outbound data transfers and unauthorized access attempts.'},{icon:'ti-activity',color:'#FFB648',title:'Live Feed',desc:'Real-time event stream showing every threat detected, blocked, and neutralized.'},{icon:'ti-chart-dots',color:'#A45CFF',title:'Analytics',desc:'Deep threat analytics, attack breakdowns, and exportable compliance reports.'}];
const PLANS=[{name:'Free',price:'$0',period:'forever',color:'#00E6FF',popular:false,features:['10 threat detections','1 neural agent','7-day log retention','Cookie Shield'],locked:['Bot Monitor','Analytics'],cta:'Get Started Free',href:'/signup'},{name:'Pro',price:'$49',period:'/mo · $449/yr saves 10%',color:'#A45CFF',popular:true,features:['Unlimited threats','All 6 neural agents','90-day log retention','Bot Monitor','Analytics & Reports','5 team members'],locked:[],cta:'Start Pro Trial',href:'/signup'},{name:'Enterprise',price:'$99',period:'/mo · $899/yr saves 10%',color:'#FF2E4C',popular:false,features:['Unlimited everything','Unlimited agents','365-day logs','Priority support + SLA','Unlimited team members','Custom agents'],locked:[],cta:'Start Enterprise Trial',href:'/signup'}];

export default function LandingPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <div className="min-h-screen bg-deepVoid" style={{backgroundImage:'linear-gradient(rgba(0,230,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.018) 1px,transparent 1px)',backgroundSize:'32px 32px'}}>
      <Navbar onContactClick={() => setIsContactOpen(true)}/>
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 80% 70% at 50% -10%,rgba(164,92,255,0.14) 0%,transparent 65%)'}}/>
        <motion.div className="absolute left-0 right-0 h-px pointer-events-none" style={{background:'linear-gradient(90deg,transparent,rgba(0,230,255,0.2),transparent)'}} animate={{top:['0%','100%']}} transition={{duration:5,repeat:Infinity,ease:'linear'}}/>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[2px] uppercase px-4 py-2 rounded-full border border-electricCyan/20 bg-electricCyan/6 text-electricCyan/70 mb-6">
          <motion.span animate={{opacity:[1,0.2,1]}} transition={{duration:1.5,repeat:Infinity}} className="w-1.5 h-1.5 rounded-full bg-electricCyan"/>AI-Powered Privacy Shield — Real-Time Protection
        </motion.div>
        <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}} className="font-rajdhani font-bold text-5xl md:text-7xl tracking-wide leading-[1.05] mb-5">
          See the Invisible.<br/><span style={{background:'linear-gradient(135deg,#00E6FF 0%,#A45CFF 50%,#FF2E4C 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Stop the Threat. Own Your Data.</span>
        </motion.h1>
        <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}} className="font-mono text-[11px] text-white/35 max-w-xl leading-[1.9] mb-10">4Sight Guardian Shield watches your digital world in real time — detecting hidden trackers, rogue AI bots, and data-harvesting scripts before they reach you.</motion.p>
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.3}} className="flex items-center gap-3 mb-12 flex-wrap justify-center">
          <Link href="/signup"><motion.button whileHover={{scale:1.03,boxShadow:'0 0 28px rgba(164,92,255,0.45)'}} whileTap={{scale:0.97}} className="relative px-8 py-4 rounded-sm border border-plasmaViolet/55 text-plasmaViolet bg-plasmaViolet/14 font-mono text-[11px] tracking-[2px] uppercase overflow-hidden"><span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-plasmaViolet/60"/><span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-plasmaViolet/60"/>» Start Free — No Card Needed</motion.button></Link>
          <Link href="/login"><motion.button whileHover={{scale:1.03,boxShadow:'0 0 18px rgba(0,230,255,0.25)'}} whileTap={{scale:0.97}} className="relative px-8 py-4 rounded-sm border border-electricCyan/30 text-electricCyan bg-electricCyan/7 font-mono text-[11px] tracking-[2px] uppercase overflow-hidden"><span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-electricCyan/50"/><span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-electricCyan/50"/>Log In</motion.button></Link>
        </motion.div>
        <div className="flex items-center gap-6 flex-wrap justify-center">
          {['14-day free trial','No credit card required','Cancel anytime','Stripe-secured'].map(t=><div key={t} className="flex items-center gap-2 font-mono text-[9px] text-white/22"><i className="ti ti-shield-check" style={{color:'#00FF9C',fontSize:13}}/>{t}</div>)}
        </div>
      </section>
      {/* STATS */}
      <div className="border-t border-b border-white/5 bg-white/[0.015]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {[{label:'Threats Blocked',color:'#FF2E4C',end:1247382},{label:'Trackers Neutralized',color:'#00E6FF',end:8943201},{label:'Users Protected',color:'#A45CFF',end:52000},{label:'Uptime',color:'#00FF9C',end:99.9,decimals:1,suffix:'%'}].map(s=>(
            <div key={s.label} className="text-center px-6 py-7"><div className="font-rajdhani font-bold text-3xl md:text-4xl leading-none mb-1"><Counter end={s.end} decimals={s.decimals??0} suffix={s.suffix??'+'} color={s.color}/></div><p className="font-mono text-[9px] text-white/25 uppercase tracking-[1px]">{s.label}</p></div>
          ))}
        </div>
      </div>
      {/* FEATURES */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12"><p className="font-mono text-[9px] tracking-[3px] text-electricCyan/40 uppercase mb-3">// core capabilities</p><h2 className="font-rajdhani font-bold text-3xl md:text-4xl text-white">Everything You Need to <span className="text-electricCyan">Stay Protected</span></h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FEATURES.map(f=>(
            <motion.div key={f.title} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="relative p-6 rounded-sm border border-white/7 bg-white/[0.02] overflow-hidden hover:-translate-y-1 transition-all cursor-default">
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{borderColor:f.color}}/>
              <div className="w-11 h-11 rounded-md flex items-center justify-center border mb-4" style={{color:f.color,borderColor:`${f.color}35`,background:`${f.color}0c`,fontSize:20}}><i className={`ti ${f.icon}`}/></div>
              <h3 className="font-rajdhani font-bold text-[17px] mb-2" style={{color:f.color}}>{f.title}</h3>
              <p className="font-mono text-[9px] text-white/35 leading-[1.8]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* PRICING */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-12"><p className="font-mono text-[9px] tracking-[3px] text-electricCyan/40 uppercase mb-3">// subscription plans</p><h2 className="font-rajdhani font-bold text-3xl md:text-4xl text-white">Choose Your <span className="text-electricCyan">Shield</span></h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(p=>(
            <motion.div key={p.name} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className={`relative flex flex-col rounded-sm border bg-[rgba(10,8,14,0.9)] overflow-hidden hover:-translate-y-1 transition-all ${p.popular?'scale-[1.03]':''}`} style={{borderColor:`${p.color}35`}}>
              <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{borderColor:p.color}}/><span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{borderColor:p.color}}/>
              {p.popular&&<div className="text-center pt-2.5 font-mono text-[8px] tracking-[2px] uppercase" style={{color:p.color}}>◆ Most Popular</div>}
              <div className="px-5 pt-4 pb-4 border-b" style={{borderColor:`${p.color}18`,background:`${p.color}06`}}>
                <h3 className="font-rajdhani font-bold text-xl" style={{color:p.color}}>{p.name}</h3>
                <div className="font-rajdhani font-bold text-3xl mt-1" style={{color:p.color}}>{p.price}{p.price!=='$0'&&<span className="text-base">/mo</span>}</div>
                <p className="font-mono text-[8px] text-white/25 mt-1">{p.period}</p>
              </div>
              <div className="px-5 py-4 flex flex-col gap-2 flex-1">
                {p.features.map(f=><div key={f} className="flex items-center gap-2 font-mono text-[9px] text-white/60"><span style={{color:p.color}}>✓</span>{f}</div>)}
                {p.locked.map(f=><div key={f} className="flex items-center gap-2 font-mono text-[9px] text-white/20"><span>✗</span><span className="line-through">{f}</span></div>)}
              </div>
              <div className="px-5 pb-5"><Link href={p.href}><motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} className="relative w-full py-2.5 rounded-sm border font-mono text-[9px] tracking-[1px] uppercase overflow-hidden" style={{borderColor:`${p.color}45`,color:p.color,background:`${p.color}10`}}><span className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{borderColor:p.color}}/><span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{borderColor:p.color}}/>{p.cta}</motion.button></Link></div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* CTA */}
      <section className="relative text-center px-6 py-24 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 60% 70% at 50% 50%,rgba(164,92,255,0.08) 0%,transparent 65%)'}}/>
        <h2 className="font-rajdhani font-bold text-4xl md:text-5xl text-white mb-3 relative z-10">Ready to Own Your<br/><span className="text-plasmaViolet">Digital Life?</span></h2>
        <p className="font-mono text-[11px] text-white/30 mb-10 relative z-10">Join thousands of users who chose to see the invisible — and stop it.</p>
        <div className="flex items-center justify-center gap-3 relative z-10 flex-wrap">
          <Link href="/signup"><motion.button whileHover={{scale:1.03,boxShadow:'0 0 28px rgba(164,92,255,0.45)'}} whileTap={{scale:0.97}} className="relative px-10 py-4 rounded-sm border border-plasmaViolet/50 text-plasmaViolet bg-plasmaViolet/12 font-mono text-[11px] tracking-[2px] uppercase overflow-hidden"><span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-plasmaViolet/60"/><span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-plasmaViolet/60"/>» Create Free Account</motion.button></Link>
          <Link href="/login"><motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} className="relative px-10 py-4 rounded-sm border border-electricCyan/30 text-electricCyan bg-electricCyan/7 font-mono text-[11px] tracking-[2px] uppercase overflow-hidden"><span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-electricCyan/50"/><span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-electricCyan/50"/>Log In</motion.button></Link>
        </div>
      </section>
      {/* FOOTER */}
      <footer className="flex items-center justify-between px-6 md:px-10 py-6 border-t border-white/5 flex-wrap gap-4">
        <div className="flex items-center gap-3 font-rajdhani font-bold text-sm tracking-[2px]">
          <img src="/guardian-ai-logo.jpeg" alt="Guardian AI Logo" className="w-7 h-7 rounded-md object-cover border border-electricCyan/40 shadow-[0_0_10px_rgba(0,230,255,0.25)] flex-shrink-0" />
          <span>4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
        </div>
        <div className="flex gap-5 font-mono text-[9px]">
          {[['About','/about'],['Pricing','/pricing'],['Contact','contact'],['Login','/login'],['Sign Up','/signup']].map(([l,h])=>
            h === 'contact' ? (
              <button key={l} onClick={() => setIsContactOpen(true)} className="text-white/25 hover:text-electricCyan transition-colors uppercase focus:outline-none">{l}</button>
            ) : (
              <Link key={l} href={h} className="text-white/25 hover:text-electricCyan transition-colors uppercase">{l}</Link>
            )
          )}
        </div>
        <div className="flex items-center gap-2"><motion.span animate={{opacity:[1,0.2,1]}} transition={{duration:2,repeat:Infinity}} className="w-1.5 h-1.5 rounded-full bg-electricCyan"/><span className="font-mono text-[9px] text-white/18 italic">Analyzing AI threats in real time...</span></div>
      </footer>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
