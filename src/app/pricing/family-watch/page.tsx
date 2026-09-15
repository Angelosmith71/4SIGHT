'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useFamilyWatchSubscription } from '@/hooks/useFamilyWatchSubscription';
import { isDemoMode } from '@/lib/demo';

function fmt(d: Date | null) {
  if (!d) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FamilyWatchPricingPage() {
  const { plan, subscription, hasAccess, startTrial, openPortal } = useFamilyWatchSubscription();
  const [loading, setLoading] = useState(false);
  const demo = isDemoMode();

  async function handleStart() {
    setLoading(true);
    try { await startTrial(); } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const isTrialing = subscription?.status === 'trialing';
  const isActive = subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-deepVoid px-4 py-12"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 45% at 50% 0%,rgba(0,255,156,0.08) 0%,transparent 60%)' }}>
      <div className="text-center mb-10 max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="text-neoCrimson font-bold text-xl">«</span>
          <span className="font-rajdhani font-bold text-lg tracking-[3px]">4SIGHT <span className="text-electricCyan">GUARDIAN AI</span></span>
        </Link>
        <p className="font-mono text-[10px] tracking-[3px] text-emeraldPulse/50 uppercase mb-3">// family watch</p>
        <h1 className="font-rajdhani font-bold text-4xl text-white tracking-wide mb-3">
          Family Watch <span className="text-emeraldPulse">Subscription</span>
        </h1>
        <p className="font-mono text-[11px] text-white/35">
          Separate from Pro or Enterprise. {plan.trialDays}-day free trial, then ${plan.monthlyPrice / 100}/month. Cancel anytime.
        </p>
      </div>

      <div className="max-w-md mx-auto relative rounded-sm border overflow-hidden" style={{ borderColor: `${plan.color}35`, background: 'rgba(10,8,14,0.95)' }}>
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: plan.color }} />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: plan.color }} />

        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: `${plan.color}20` }}>
          <h2 className="font-rajdhani font-bold text-xl text-white">{plan.name}</h2>
          <p className="font-mono text-[10px] text-white/35 mt-1">{plan.tagline}</p>
          <div className="font-rajdhani font-bold text-4xl mt-3" style={{ color: plan.color }}>
            ${plan.monthlyPrice / 100}<span className="text-base">/mo</span>
          </div>
          <p className="font-mono text-[9px] mt-1" style={{ color: `${plan.color}99` }}>
            First {plan.trialDays} days free
          </p>
        </div>

        <div className="px-6 py-4 flex flex-col gap-2">
          {plan.features.map(f => (
            <div key={f} className="flex items-center gap-2">
              <span className="font-mono text-[10px]" style={{ color: plan.color }}>✓</span>
              <span className="font-mono text-[10px] text-white/65">{f}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          {hasAccess && !demo ? (
            <div className="space-y-2">
              <div className="py-3 px-4 rounded-sm border text-center" style={{ borderColor: `${plan.color}40`, background: `${plan.color}08`, color: plan.color }}>
                <p className="font-mono text-[10px] uppercase tracking-[1px]">
                  {isTrialing ? 'Trial active' : isActive ? 'Subscribed' : subscription?.status}
                </p>
                {isTrialing && subscription?.trialEnd && (
                  <p className="font-mono text-[9px] text-white/40 mt-1">Trial ends {fmt(subscription.trialEnd)}</p>
                )}
                {subscription?.currentPeriodEnd && (
                  <p className="font-mono text-[9px] text-white/40 mt-1">
                    {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} {fmt(subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => openPortal()}
                className="w-full font-mono text-[10px] tracking-[1px] uppercase py-3 rounded-sm border border-white/15 text-white/50 hover:text-white/70">
                Manage subscription · cancel anytime
              </button>
              <Link href="/dashboard/parental-monitor"
                className="block w-full text-center font-mono text-[10px] tracking-[1px] uppercase py-3 rounded-sm border"
                style={{ borderColor: `${plan.color}50`, color: plan.color, background: `${plan.color}10` }}>
                Open Family Watch
              </Link>
            </div>
          ) : demo ? (
            <Link href="/dashboard/parental-monitor"
              className="block w-full text-center font-mono text-[10px] tracking-[1px] uppercase py-3 rounded-sm border"
              style={{ borderColor: `${plan.color}50`, color: plan.color, background: `${plan.color}10` }}>
              Try in demo mode
            </Link>
          ) : (
            <motion.button onClick={handleStart} disabled={loading} whileHover={{ scale: 1.02 }}
              className="w-full font-mono text-[10px] tracking-[1.5px] uppercase py-3 rounded-sm border disabled:opacity-50"
              style={{ borderColor: `${plan.color}50`, background: `${plan.color}12`, color: plan.color }}>
              {loading ? 'Processing…' : `Start ${plan.trialDays}-day free trial`}
            </motion.button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-8 font-mono text-[9px] text-white/25 flex-wrap">
        {[`${plan.trialDays}-day free trial`, 'Cancel anytime', 'Secure via Stripe', 'Separate from Pro'].map(t => (
          <span key={t} className="flex items-center gap-1.5"><span className="text-emeraldPulse">✓</span>{t}</span>
        ))}
      </div>

      <p className="text-center mt-6 font-mono text-[9px] text-white/25">
        Need the full security dashboard? <Link href="/pricing" className="text-electricCyan hover:underline">View Pro & Enterprise plans</Link>
      </p>
    </div>
  );
}
