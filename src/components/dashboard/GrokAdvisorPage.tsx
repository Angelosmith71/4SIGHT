'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/layout/PageShell';
import { HudPageHeader } from '@/components/ui/HudPrimitives';

type Msg = { role: 'user' | 'assistant'; content: string };
type ContextMode = 'auto' | 'threats' | 'family' | 'none';

const STARTERS = [
  'Summarize my top security threats and what to fix first',
  'Explain my Family Watch alerts for today',
  'How can I reduce my threat score this week?',
  'What content filter should I use for a 12-year-old?',
];

export function GrokAdvisorPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: 'I\'m **Grok**, your Guardian advisor. I can read your dashboard context (threats, metrics, Family Watch) and help you decide what to do next. What would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<ContextMode>('auto');
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError('');
    const next: Msg[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/grok/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setDemo(json.demo ?? false);
      setMessages([...next, { role: 'assistant', content: json.message.content }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="flex flex-col flex-1 overflow-hidden min-h-0"
        style={{ backgroundImage: 'radial-gradient(ellipse 50% 30% at 50% 0%,rgba(164,92,255,0.08) 0%,transparent 65%)' }}>
        <div className="px-4 md:px-8 pt-5 pb-3 flex-shrink-0 border-b border-white/5">
          <HudPageHeader
            eyebrow="// grok · xai"
            title="Guardian Advisor"
            right={
              <div className="flex items-center gap-2 flex-wrap">
                {demo === true && (
                  <span className="font-mono text-[8px] tracking-[1px] uppercase px-2 py-1 rounded-sm border border-solarAmber/40 text-solarAmber bg-solarAmber/10">
                    Demo responses
                  </span>
                )}
                {demo === false && (
                  <span className="font-mono text-[8px] tracking-[1px] uppercase px-2 py-1 rounded-sm border border-plasmaViolet/40 text-plasmaViolet bg-plasmaViolet/10">
                    Grok live
                  </span>
                )}
              </div>
            }
          />
          <p className="font-mono text-[10px] text-white/30 mt-2 max-w-2xl">
            Powered by Grok (xAI). Uses live dashboard context when available — threats, metrics, and Family Watch.
          </p>
          <div className="flex gap-1.5 flex-wrap mt-3">
            {(['auto', 'threats', 'family', 'none'] as ContextMode[]).map(c => (
              <button key={c} type="button" onClick={() => setContext(c)}
                className={`font-mono text-[8px] tracking-[1px] uppercase px-2.5 py-1 rounded-sm border transition-all
                  ${context === c ? 'border-plasmaViolet/50 text-plasmaViolet bg-plasmaViolet/10' : 'border-white/10 text-white/30 hover:border-white/25'}`}>
                Context: {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-3">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`max-w-3xl ${m.role === 'user' ? 'ml-auto' : ''}`}>
              <div className={`rounded-sm border px-4 py-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap
                ${m.role === 'user'
                  ? 'border-electricCyan/30 bg-electricCyan/8 text-white/85'
                  : 'border-white/10 bg-white/[0.03] text-white/70'}`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="font-mono text-[10px] text-plasmaViolet/70 animate-pulse">Grok is thinking…</div>
          )}
          {error && (
            <p className="font-mono text-[10px] text-neoCrimson border border-neoCrimson/30 bg-neoCrimson/8 px-3 py-2 rounded-sm">{error}</p>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex-shrink-0 px-4 md:px-8 pb-5 pt-2 border-t border-white/5">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {STARTERS.map(s => (
              <button key={s} type="button" onClick={() => send(s)}
                className="font-mono text-[8px] text-white/35 hover:text-plasmaViolet border border-white/8 hover:border-plasmaViolet/30 px-2 py-1 rounded-sm transition-colors">
                {s.length > 48 ? `${s.slice(0, 48)}…` : s}
              </button>
            ))}
          </div>
          <form
            onSubmit={e => { e.preventDefault(); void send(input); }}
            className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Grok about threats, Family Watch, or security…"
              disabled={loading}
              className="flex-1 bg-black/30 border border-white/12 rounded-sm px-3 py-2.5 font-mono text-[12px] text-white/80 focus:outline-none focus:border-plasmaViolet/40 disabled:opacity-50"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="font-mono text-[9px] tracking-[1px] uppercase px-4 py-2.5 rounded-sm border border-plasmaViolet/40 bg-plasmaViolet/10 text-plasmaViolet disabled:opacity-40">
              Send
            </button>
          </form>
          <p className="font-mono text-[8px] text-white/20 mt-2">
            Set <span className="text-white/35">XAI_API_KEY</span> in .env.local for live Grok. Get keys at console.x.ai.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
