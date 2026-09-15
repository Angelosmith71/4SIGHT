'use client';
import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { useFamilyWatchSubscription } from '@/hooks/useFamilyWatchSubscription';
import { isFamilyWatchActive } from '@/lib/stripe/family-plan';
import { PageShell } from '@/components/layout/PageShell';
import Link from 'next/link';
function fmt(d:Date|null){if(!d)return'—';return d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});}
function BillingPageContent(){
  const{subscription,loading,openPortal}=useSubscription();
  const{subscription:fwSub,plan:fwPlan,loading:fwLoading,startTrial,openPortal:openFwPortal}=useFamilyWatchSubscription();
  const[pl,setPl]=useState(false);const[fwPl,setFwPl]=useState(false);
  const sp=useSearchParams();const success=sp.get('success');const newPlan=sp.get('plan');
  async function handlePortal(){setPl(true);try{await openPortal();}catch(e){console.error(e);}finally{setPl(false);}}
  const plan=subscription?.plan;const status=subscription?.status??'active';
  const sc:Record<string,{color:string;dot:string}>={active:{color:'#00FF9C',dot:'bg-emeraldPulse'},trialing:{color:'#00E6FF',dot:'bg-electricCyan'},past_due:{color:'#FFB648',dot:'bg-solarAmber animate-pulse'},canceled:{color:'#FF2E4C',dot:'bg-neoCrimson'},incomplete:{color:'#FFB648',dot:'bg-solarAmber'}};
  const s=sc[status]??sc.active;
  return(
    <PageShell>
      <div className="px-4 md:px-8 py-6 flex flex-col gap-6 overflow-y-auto flex-1" style={{backgroundImage:'radial-gradient(ellipse 60% 40% at 50% 0%,rgba(164,92,255,0.06) 0%,transparent 65%)',}}>
        <div><p className="font-mono text-[9px] tracking-[3px] text-electricCyan/30 uppercase mb-1">// billing</p><h1 className="font-rajdhani font-bold text-2xl text-white">Billing & Plan</h1></div>
        {success&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="relative flex items-center gap-3 px-4 py-3 rounded-sm border border-emeraldPulse/30 bg-emeraldPulse/8 overflow-hidden"><span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emeraldPulse/50"/><div className="w-8 h-8 rounded-sm flex items-center justify-center border border-emeraldPulse/30 bg-emeraldPulse/10"><i className="ti ti-circle-check" style={{color:'#00FF9C',fontSize:18}}/></div><div><p className="font-rajdhani font-bold text-[15px] text-white">Welcome to {newPlan?newPlan.charAt(0).toUpperCase()+newPlan.slice(1):'your new plan'}!</p><p className="font-mono text-[9px] text-white/40">Your subscription is now active. Enjoy your 14-day trial.</p></div></motion.div>}
        {loading?<div className="flex flex-col gap-3">{[0,1,2].map(i=><motion.div key={i} animate={{opacity:[0.3,0.6,0.3]}} transition={{duration:1.5,repeat:Infinity,delay:i*0.15}} className="h-24 rounded-sm border border-white/6 bg-white/[0.03]"/>)}</div>:(
          <div className="flex flex-col gap-4">
            <div className="relative flex flex-col gap-4 p-5 rounded-sm border overflow-hidden" style={{borderColor:`${plan?.color??'#00E6FF'}35`,background:`${plan?.color??'#00E6FF'}05`}}>
              <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{borderColor:plan?.color??'#00E6FF'}}/><span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{borderColor:plan?.color??'#00E6FF'}}/>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div><p className="font-mono text-[9px] text-white/25 uppercase tracking-[1px] mb-1">Current Plan</p><h2 className="font-rajdhani font-bold text-2xl" style={{color:plan?.color??'#00E6FF'}}>{plan?.name??'Free'}</h2></div>
                <div className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/><span className="font-mono text-[10px] uppercase" style={{color:s.color}}>{status}</span></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[['Billing',subscription?.billingInterval?`${subscription.billingInterval}ly`:'Free'],['Next Renewal',fmt(subscription?.currentPeriodEnd??null)],['Trial Ends',subscription?.trialEnd?fmt(subscription.trialEnd):'N/A'],['Auto-renew',subscription?.cancelAtPeriodEnd?'Off':'On']].map(([k,v])=>(
                  <div key={k} className="flex flex-col gap-1"><span className="font-mono text-[8px] text-white/25 uppercase tracking-[1px]">{k}</span><span className="font-mono text-[11px] text-white/70">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              {subscription?.planId!=='free'&&<motion.button onClick={handlePortal} disabled={pl} whileHover={{scale:1.02}} whileTap={{scale:0.97}} className="relative flex items-center justify-center gap-2 px-6 py-3 rounded-sm border border-electricCyan/40 bg-electricCyan/8 text-electricCyan overflow-hidden disabled:opacity-50"><span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-electricCyan/60"/><span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-electricCyan/60"/><i className={`ti ${pl?'ti-loader-2':'ti-credit-card'}`} style={{fontSize:16}}/><span className="font-mono text-[10px] tracking-[1.5px] uppercase font-bold">{pl?'Opening...':'Manage Billing'}</span></motion.button>}
              <Link href="/pricing"><motion.div whileHover={{scale:1.02}} className="relative flex items-center justify-center gap-2 px-6 py-3 rounded-sm border border-plasmaViolet/40 bg-plasmaViolet/8 text-plasmaViolet overflow-hidden cursor-pointer"><span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-plasmaViolet/60"/><span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-plasmaViolet/60"/><i className="ti ti-arrow-up-circle" style={{fontSize:16}}/><span className="font-mono text-[10px] tracking-[1.5px] uppercase font-bold">{subscription?.planId==='free'?'Upgrade Plan':'Change Plan'}</span></motion.div></Link>
            </div>
            {!fwLoading && (
              <div className="relative flex flex-col gap-4 p-5 rounded-sm border overflow-hidden" style={{borderColor:`${fwPlan.color}35`,background:`${fwPlan.color}05`}}>
                <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{borderColor:fwPlan.color}}/>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-mono text-[9px] text-white/25 uppercase tracking-[1px] mb-1">Family Watch</p>
                    <h2 className="font-rajdhani font-bold text-xl" style={{color:fwPlan.color}}>{fwPlan.name}</h2>
                    <p className="font-mono text-[9px] text-white/35 mt-1">${fwPlan.monthlyPrice/100}/mo · {fwPlan.trialDays}-day trial</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase" style={{color:isFamilyWatchActive(fwSub?.status)?fwPlan.color:'#666'}}>{fwSub?.status??'inactive'}</span>
                </div>
                {isFamilyWatchActive(fwSub?.status) ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="font-mono text-[8px] text-white/25 uppercase">Trial ends</span><p className="font-mono text-[11px] text-white/70">{fmt(fwSub?.trialEnd??null)}</p></div>
                    <div><span className="font-mono text-[8px] text-white/25 uppercase">Renews</span><p className="font-mono text-[11px] text-white/70">{fmt(fwSub?.currentPeriodEnd??null)}</p></div>
                  </div>
                ) : (
                  <p className="font-mono text-[10px] text-white/35">Separate parental monitoring subscription — not included in Pro or Enterprise.</p>
                )}
                <div className="flex flex-col md:flex-row gap-3">
                  {isFamilyWatchActive(fwSub?.status) ? (
                    <motion.button onClick={async()=>{setFwPl(true);try{await openFwPortal();}finally{setFwPl(false);}}} disabled={fwPl} className="font-mono text-[10px] tracking-[1.5px] uppercase px-6 py-3 rounded-sm border disabled:opacity-50" style={{borderColor:`${fwPlan.color}40`,color:fwPlan.color,background:`${fwPlan.color}08`}}>{fwPl?'Opening…':'Manage Family Watch · cancel anytime'}</motion.button>
                  ) : (
                    <motion.button onClick={async()=>{setFwPl(true);try{await startTrial();}catch(e){console.error(e);}finally{setFwPl(false);}}} disabled={fwPl} className="font-mono text-[10px] tracking-[1.5px] uppercase px-6 py-3 rounded-sm border disabled:opacity-50" style={{borderColor:`${fwPlan.color}40`,color:fwPlan.color,background:`${fwPlan.color}08`}}>{fwPl?'Processing…':`Start ${fwPlan.trialDays}-day free trial`}</motion.button>
                  )}
                  <Link href="/pricing/family-watch" className="font-mono text-[10px] tracking-[1.5px] uppercase px-6 py-3 rounded-sm border border-white/15 text-white/40 text-center hover:text-white/60">View details</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="px-4 md:px-8 py-6 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-sm border border-white/6 bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </PageShell>
    }>
      <BillingPageContent />
    </Suspense>
  );
}
