'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PLANS, yearlySaving, type BillingInterval } from '@/lib/stripe/plans';
import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';
import { isFamilyWatchActive } from '@/lib/stripe/family-plan';
import { isGroqAgentActive } from '@/lib/stripe/groq-plan';
import { FAMILY_WATCH_PLAN } from '@/lib/stripe/family-plan';
import { GROQ_AGENT_PLAN } from '@/lib/stripe/groq-plan';
import { PROTOCOL_WATCH_PLAN } from '@/lib/stripe/protocol-plan';
import { ContactModal } from '@/components/ui/ContactModal';

export default function PricingPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [interval,setInterval]=useState<BillingInterval>('month');const [loading,setLoading]=useState<string|null>(null);
  const{subscription,checkout}=useSubscription();const router=useRouter();
  async function handleSelect(planId:string){if(planId==='free'){router.push('/dashboard');return;}if(planId==='family'){router.push('/pricing/family-watch');return;}setLoading(planId);try{await checkout(planId as 'pro'|'enterprise',interval);}catch(e:any){if(e.message==='Unauthorized'){router.push('/login');}else{console.error(e);}}finally{setLoading(null);}}
  return(
    <div className="min-h-screen bg-deepVoid" style={{backgroundImage:'radial-gradient(ellipse 70% 45% at 50% 0%,rgba(164,92,255,0.08) 0%,transparent 60%),linear-gradient(rgba(0,230,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.018) 1px,transparent 1px)',backgroundSize:'100% 100%,32px 32px,32px 32px'}}>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 h-[56px] bg-deepVoid/90 backdrop-blur-md border-b border-electricCyan/10">
        <Link href="/" className="flex items-center gap-3 font-rajdhani font-bold text-base tracking-[3px]">
          <img src="/guardian-ai-logo.jpeg" alt="Guardian AI Logo" className="w-10 h-10 rounded-md object-cover border border-electricCyan/50 shadow-[0_0_15px_rgba(0,230,255,0.35)] flex-shrink-0" />
          <span>4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
        </Link>
        <div className="hidden md:flex gap-6 font-mono text-[10px]">
          <Link href="/" className="text-white/35 hover:text-electricCyan uppercase">Home</Link>
          <Link href="/services" className="text-white/35 hover:text-electricCyan uppercase">Services</Link>
          <Link href="/about" className="text-white/35 hover:text-electricCyan uppercase">About</Link>
          <a href="mailto:INFO@4SIGHTGUARDIANAI.NET" className="text-white/35 hover:text-electricCyan uppercase">INFO@4SIGHTGUARDIANAI.NET</a>
          <span className="text-electricCyan uppercase">Pricing</span>
          <button onClick={() => setIsContactOpen(true)} className="text-white/35 hover:text-electricCyan uppercase focus:outline-none">Contact</button>
        </div>
        <Link href="/signup"><motion.button whileHover={{scale:1.03,boxShadow:'0 0 16px rgba(0,230,255,0.3)'}} whileTap={{scale:0.97}} className="relative font-mono text-[9px] tracking-[1.5px] uppercase px-4 py-2 rounded-sm border border-electricCyan/40 text-electricCyan bg-electricCyan/8 overflow-hidden"><span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-electricCyan/60"/><span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-electricCyan/60"/>» Start Free</motion.button></Link>
      </nav>
      <div className="px-4 py-12">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <p className="font-mono text-[10px] tracking-[3px] text-electricCyan/30 uppercase mb-3">// subscription plans</p>
          <h1 className="font-rajdhani font-bold text-4xl text-white tracking-wide mb-3">Choose Your <span className="text-plasmaViolet">Shield</span></h1>
          <p className="font-mono text-[11px] text-white/35">All plans include a 14-day free trial. No credit card required to start.</p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`font-mono text-[10px] uppercase ${interval==='month'?'text-white':'text-white/35'}`}>Monthly</span>
            <button onClick={()=>setInterval(i=>i==='month'?'year':'month')} className="relative w-12 h-6 rounded-full border border-plasmaViolet/40 bg-plasmaViolet/10"><motion.span className="absolute top-0.5 w-5 h-5 rounded-full bg-plasmaViolet" animate={{left:interval==='year'?'1.5rem':'0.125rem'}} transition={{type:'spring',stiffness:400,damping:30}}/></button>
            <span className={`font-mono text-[10px] uppercase ${interval==='year'?'text-white':'text-white/35'}`}>Yearly</span>
            {interval==='year'&&<motion.span initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} className="font-mono text-[9px] px-2 py-0.5 rounded-sm bg-emeraldPulse/15 border border-emeraldPulse/30 text-emeraldPulse">SAVE 10%</motion.span>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            PLANS.find(p => p.id === 'free')!,
            PLANS.find(p => p.id === 'pro')!,
            PLANS.find(p => p.id === 'enterprise')!,
            PLANS.find(p => p.id === 'family')!,
          ].filter(Boolean).map(plan=>{
            const price=interval==='month'?plan.monthlyPrice:plan.yearlyPrice;const isCurrent=subscription?.planId===plan.id;const isLoading=loading===plan.id;const saving=yearlySaving(plan);
            return(
              <div key={plan.id} className={`relative flex flex-col rounded-sm border overflow-hidden ${plan.popular?'scale-[1.02]':''}`} style={{borderColor:`${plan.color}35`,background:'rgba(10,8,14,0.95)'}}>
                <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{borderColor:plan.color}}/><span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{borderColor:plan.color}}/>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(0,230,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,1) 1px,transparent 1px)',backgroundSize:'24px 24px'}}/>
                <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{background:`radial-gradient(ellipse 80% 100% at 50% 0%,${plan.color}12,transparent 70%)`}}/>
                {plan.popular&&<div className="relative z-10 flex justify-center pt-3"><span className="font-mono text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-sm" style={{color:plan.color,background:`${plan.color}20`,border:`1px solid ${plan.color}40`}}>◆ Most Popular</span></div>}
                <div className="relative z-10 px-5 pt-4 pb-4 border-b" style={{borderColor:`${plan.color}20`}}>
                  <h2 className="font-rajdhani font-bold text-xl text-white">{plan.name}</h2>
                  {plan.monthlyPrice===0?<div className="font-rajdhani font-bold text-4xl mt-1" style={{color:plan.color}}>Free<span className="font-mono text-[10px] text-white/30 ml-2">forever</span></div>:(
                    <><div className="font-rajdhani font-bold text-4xl mt-1" style={{color:plan.color}}>${(price/100).toFixed(interval==='month'?0:2)}<span className="text-base">/mo</span></div>
                    {interval==='year'&&<div className="flex items-center gap-2 mt-1"><span className="font-mono text-[9px] text-white/25 line-through">${(plan.monthlyPrice/100)}/mo</span><span className="font-mono text-[9px] text-emeraldPulse">Save {saving}%</span></div>}
                    {interval==='year'&&<p className="font-mono text-[9px] text-white/25 mt-1">${(plan.yearlyTotal/100).toFixed(2)} billed annually</p>}</>
                  )}
                </div>
                <div className="relative z-10 px-5 py-4 flex flex-col gap-2.5 flex-1">
                  {plan.features.map(f=><div key={f.text} className="flex items-center gap-2.5"><span className="font-mono text-[10px] flex-shrink-0" style={{color:f.included?plan.color:'rgba(255,255,255,0.2)'}}>{f.included?'✓':'✗'}</span><span className={`font-mono text-[10px] ${f.included?'text-white/70':'text-white/25 line-through'}`}>{f.text}</span></div>)}
                </div>
                <div className="relative z-10 px-5 pb-5 pt-3">
                  {isCurrent?<div className="flex items-center justify-center gap-2 py-3 rounded-sm border" style={{borderColor:`${plan.color}40`,background:`${plan.color}08`,color:plan.color}}><i className="ti ti-circle-check"/><span className="font-mono text-[10px] uppercase tracking-[1.5px]">Current Plan</span></div>:(
                    <motion.button onClick={()=>handleSelect(plan.id)} disabled={!!loading} whileHover={!loading?{scale:1.02,boxShadow:`0 0 20px ${plan.accentGlow}`}:{}} whileTap={!loading?{scale:0.97}:{}} className="relative w-full flex items-center justify-center gap-2 py-3 rounded-sm border overflow-hidden disabled:opacity-50" style={{borderColor:`${plan.color}50`,background:`${plan.color}12`,color:plan.color}}>
                      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l" style={{borderColor:plan.color}}/><span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r" style={{borderColor:plan.color}}/>
                      {isLoading?<><motion.span animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}} className="w-3 h-3 border border-current border-t-transparent rounded-full"/><span className="font-mono text-[10px] tracking-[1.5px] uppercase">Processing...</span></>:<span className="font-mono text-[10px] tracking-[1.5px] uppercase">{plan.cta}</span>}
                    </motion.button>
                  )}
                </div>
              </div>
            );
          })}
          <div className={`relative flex flex-col rounded-sm border overflow-hidden hover:scale-[1.02] transition-transform`} style={{borderColor:`${GROQ_AGENT_PLAN.color}35`,background:'rgba(10,8,14,0.95)'}}>
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{borderColor:GROQ_AGENT_PLAN.color}}/><span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{borderColor:GROQ_AGENT_PLAN.color}}/>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(0,230,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,1) 1px,transparent 1px)',backgroundSize:'24px 24px'}}/>
            <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{background:`radial-gradient(ellipse 80% 100% at 50% 0%,${GROQ_AGENT_PLAN.color}12,transparent 70%)`}}/>
            <div className="relative z-10 px-5 pt-4 pb-4 border-b" style={{borderColor:`${GROQ_AGENT_PLAN.color}20`}}>
              <h2 className="font-rajdhani font-bold text-xl text-white">{GROQ_AGENT_PLAN.name}</h2>
              <div className="font-rajdhani font-bold text-4xl mt-1" style={{color:GROQ_AGENT_PLAN.color}}>${(GROQ_AGENT_PLAN.monthlyPrice/100).toFixed(0)}<span className="text-base">/mo</span></div>
            </div>
            <div className="relative z-10 px-5 py-4 flex flex-col gap-2.5 flex-1">
              {GROQ_AGENT_PLAN.features.map(f=><div key={f} className="flex items-center gap-2.5"><span className="font-mono text-[10px] flex-shrink-0" style={{color:GROQ_AGENT_PLAN.color}}>✓</span><span className={`font-mono text-[10px] text-white/70`}>{f}</span></div>)}
            </div>
            <div className="relative z-10 px-5 pb-5 pt-3">
              <Link href="/pricing/groq-agent" className="relative w-full flex items-center justify-center gap-2 py-3 rounded-sm border overflow-hidden transition-all hover:bg-white/5" style={{borderColor:`${GROQ_AGENT_PLAN.color}50`,background:`${GROQ_AGENT_PLAN.color}12`,color:GROQ_AGENT_PLAN.color}}>
                <span className="font-mono text-[10px] tracking-[1.5px] uppercase">View Details</span>
              </Link>
            </div>
          </div>
          <div className={`relative flex flex-col rounded-sm border overflow-hidden hover:scale-[1.02] transition-transform`} style={{borderColor:`${PROTOCOL_WATCH_PLAN.color}35`,background:'rgba(10,8,14,0.95)'}}>
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{borderColor:PROTOCOL_WATCH_PLAN.color}}/><span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{borderColor:PROTOCOL_WATCH_PLAN.color}}/>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(0,230,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,1) 1px,transparent 1px)',backgroundSize:'24px 24px'}}/>
            <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{background:`radial-gradient(ellipse 80% 100% at 50% 0%,${PROTOCOL_WATCH_PLAN.color}12,transparent 70%)`}}/>
            <div className="relative z-10 px-5 pt-4 pb-4 border-b" style={{borderColor:`${PROTOCOL_WATCH_PLAN.color}20`}}>
              <h2 className="font-rajdhani font-bold text-xl text-white">{PROTOCOL_WATCH_PLAN.name}</h2>
              <div className="font-rajdhani font-bold text-4xl mt-1" style={{color:PROTOCOL_WATCH_PLAN.color}}>${(PROTOCOL_WATCH_PLAN.monthlyPrice/100).toFixed(0)}<span className="text-base">/mo</span></div>
            </div>
            <div className="relative z-10 px-5 py-4 flex flex-col gap-2.5 flex-1">
              {['Up to 3 AI bots', 'PASS / FAIL per step', 'Custom forbidden rules', 'Live alert on violation', '7-day free trial'].map(f=><div key={f} className="flex items-center gap-2.5"><span className="font-mono text-[10px] flex-shrink-0" style={{color:PROTOCOL_WATCH_PLAN.color}}>✓</span><span className={`font-mono text-[10px] text-white/70`}>{f}</span></div>)}
            </div>
            <div className="relative z-10 px-5 pb-5 pt-3">
              <Link href="/pricing/protocol-watch" className="relative w-full flex items-center justify-center gap-2 py-3 rounded-sm border overflow-hidden transition-all hover:bg-white/5" style={{borderColor:`${PROTOCOL_WATCH_PLAN.color}50`,background:`${PROTOCOL_WATCH_PLAN.color}12`,color:PROTOCOL_WATCH_PLAN.color}}>
                <span className="font-mono text-[10px] tracking-[1.5px] uppercase">View Details</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-10 font-mono text-[9px] text-white/25 flex-wrap">
          {['14-day free trial','Cancel anytime','Secure via Stripe','No hidden fees'].map(t=><span key={t} className="flex items-center gap-1.5"><span className="text-emeraldPulse">✓</span>{t}</span>)}
        </div>
      </div>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
