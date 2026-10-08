'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGroqAgentSubscription } from '@/hooks/useGroqAgentSubscription';
import { isDemoMode } from '@/lib/demo';
import Link from 'next/link';

export function GroqAgentPaywall() {
  const { plan, subscription, startTrial } = useGroqAgentSubscription();
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
      style={{ backgroundImage: 'radial-gradient(ellipse 55% 35% at 50% 0%,rgba(255,182,72,0.08) 0%,transparent 65%)' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative max-w-lg w-full rounded-sm border border-solarAmber/25 bg-graphite p-8 overflow-hidden">
        <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-solarAmber/50" />
        <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-solarAmber/50" />

        <div className="text-center mb-6">
          <span className="text-4xl">⚡</span>
          <p className="font-mono text-[9px] tracking-[2px] text-solarAmber/60 uppercase mt-3">Grok xAI Agent</p>
          <h1 className="font-rajdhani font-bold text-2xl text-white mt-1">Activate the Grok xAI Agent</h1>
          <p className="font-mono text-[10px] text-white/35 mt-2 leading-relaxed">
            A paid add-on that answers from your dashboard using Grok on xAI. Grok Advisor stays separate and is not billed here.
          </p>
        </div>

        <div className="text-center py-4 mb-4 rounded-sm border border-solarAmber/20 bg-solarAmber/5">
          <p className="font-rajdhani font-bold text-4xl text-solarAmber">
            ${(plan.monthlyPrice / 100).toFixed(0)}<span className="text-lg">/mo</span>
          </p>
          <p className="font-mono text-[10px] text-solarAmber/80 mt-1">
            {plan.trialDays}-day free trial · {(plan.monthlyTokenCap / 1000).toLocaleString()}k tokens / month
          </p>
        </div>

        <ul className="space-y-2 mb-6">
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-2 font-mono text-[10px] text-white/55">
              <span className="text-solarAmber flex-shrink-0">✓</span>{f}
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
            <p className="font-mono text-[10px] text-white/30 text-center">Demo mode — Grok xAI Agent replies are simulated.</p>
            <Link href="/dashboard/groq-agent"
              className="block w-full text-center font-mono text-[10px] tracking-[1px] uppercase py-3 rounded-sm border border-solarAmber/40 bg-solarAmber/10 text-solarAmber">
              Continue in demo
            </Link>
          </div>
        ) : (
          <motion.button onClick={handleStart} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full font-mono text-[10px] tracking-[1.5px] uppercase py-3.5 rounded-sm border border-solarAmber/50 bg-solarAmber/12 text-solarAmber disabled:opacity-50">
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
