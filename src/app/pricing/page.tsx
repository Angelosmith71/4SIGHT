'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PLANS, yearlySaving, type BillingInterval } from '@/lib/stripe/plans';
import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';
export default function PricingPage() {
  const [interval,setInterval]=useState<BillingInterval>('month');const [loading,setLoading]=useState<string|null>(null);
  const{subscription,checkout}=useSubscription();const router=useRouter();
  async function handleSelect(planId:string){if(planId==='free'){router.push('/dashboard');return;}if(planId==='family'){router.push('/pricing/family-watch');return;}setLoading(planId);try{await checkout(planId as 'pro'|'enterprise',interval);}catch(e){console.error(e);}finally{setLoading(null);}}
  return(
    <div className="min-h-screen bg-deepVoid px-4 py-12" style={{backgroundImage:'radial-gradient(ellipse 70% 45% at 50% 0%,rgba(164,92,255,0.08) 0%,transparent 60%),linear-gradient(rgba(0,230,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,255,0.018) 1px,transparent 1px)',backgroundSize:'100% 100%,32px 32px,32px 32px'}}>
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-6"><span className="text-neoCrimson font-bold text-xl">«</span><span className="font-rajdhani font-bold text-lg tracking-[3px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span></Link>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[1200px] mx-auto">
        {PLANS.map(plan=>{
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
      </div>
      <div className="flex items-center justify-center gap-6 mt-10 font-mono text-[9px] text-white/25 flex-wrap">
        {['14-day free trial','Cancel anytime','Secure via Stripe','No hidden fees'].map(t=><span key={t} className="flex items-center gap-1.5"><span className="text-emeraldPulse">✓</span>{t}</span>)}
      </div>
    </div>
  );
}
