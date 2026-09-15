'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFamilyWatchSubscription } from '@/hooks/useFamilyWatchSubscription';
import { isDemoMode } from '@/lib/demo';
import Link from 'next/link';

export function FamilyWatchPaywall() {
  const { plan, subscription, startTrial } = useFamilyWatchSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const demo = isDemoMode();

  async function handleStart() {
    setError('');
    setLoading(true);
    try {
      await startTrial();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8"
      style={{ backgroundImage: 'radial-gradient(ellipse 55% 35% at 50% 0%,rgba(0,255,156,0.08) 0%,transparent 65%)' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative max-w-lg w-full rounded-sm border border-emeraldPulse/25 bg-graphite p-8 overflow-hidden">
        <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-emeraldPulse/50" />
        <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-emeraldPulse/50" />

        <div className="text-center mb-6">
          <span className="text-4xl">👨‍👩‍👧</span>
          <p className="font-mono text-[9px] tracking-[2px] text-emeraldPulse/60 uppercase mt-3">Family Watch</p>
          <h1 className="font-rajdhani font-bold text-2xl text-white mt-1">Protect your family online</h1>
          <p className="font-mono text-[10px] text-white/35 mt-2 leading-relaxed">
            Monitor what children watch, set content filters and screen time limits, and get instant alerts — separate from your main Guardian plan.
          </p>
        </div>

        <div className="text-center py-4 mb-4 rounded-sm border border-emeraldPulse/20 bg-emeraldPulse/5">
          <p className="font-rajdhani font-bold text-4xl text-emeraldPulse">
            ${(plan.monthlyPrice / 100).toFixed(0)}<span className="text-lg">/mo</span>
          </p>
          <p className="font-mono text-[10px] text-emeraldPulse/80 mt-1">
            {plan.trialDays}-day free trial · cancel anytime
          </p>
        </div>

        <ul className="space-y-2 mb-6">
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-2 font-mono text-[10px] text-white/55">
              <span className="text-emeraldPulse flex-shrink-0">✓</span>{f}
            </li>
          ))}
        </ul>

        {subscription?.status === 'past_due' && (
          <p className="font-mono text-[10px] text-neoCrimson mb-3 text-center">Payment failed — update billing to restore access.</p>
        )}

        {error && (
          <p className="font-mono text-[10px] text-neoCrimson mb-3 text-center">{error}</p>
        )}

        {demo ? (
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-white/30 text-center">Demo mode — Family Watch is unlocked for testing.</p>
            <Link href="/dashboard/parental-monitor"
              className="block w-full text-center font-mono text-[10px] tracking-[1px] uppercase py-3 rounded-sm border border-emeraldPulse/40 bg-emeraldPulse/10 text-emeraldPulse">
              Continue in demo
            </Link>
          </div>
        ) : (
          <motion.button onClick={handleStart} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full font-mono text-[10px] tracking-[1.5px] uppercase py-3.5 rounded-sm border border-emeraldPulse/50 bg-emeraldPulse/12 text-emeraldPulse disabled:opacity-50">
            {loading ? 'Opening checkout…' : `Start ${plan.trialDays}-day free trial`}
          </motion.button>
        )}

        <p className="font-mono text-[8px] text-white/25 text-center mt-4">
          Card required for trial. You won&apos;t be charged until day {plan.trialDays + 1}. Cancel anytime in billing settings.
        </p>
      </motion.div>
    </div>
  );
}
