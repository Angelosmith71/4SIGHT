'use client';

import Link from 'next/link';
import { PROTOCOL_WATCH_PLAN } from '@/lib/stripe/protocol-plan';

export function ProtocolSetup() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <p className="font-mono text-[11px] text-white/50 leading-relaxed">
        Protocol Check checks bots you connect. It compares each reported step with the protocol you wrote for that bot. A passing step means that step stayed inside those rules. It is not a promise the bot is safe forever.
      </p>
      <ol className="flex flex-col gap-3">
        {[
          'Register the bot and write its allowed tools, allowed data, and forbidden actions. Separate items with commas.',
          'Copy the API key. It is shown once. The bot sends every prompt, tool call, and reply with that key.',
          '4Sight returns pass or fail and names the rule that broke. A failure also shows on the dashboard.',
        ].map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="font-mono text-[10px] text-electricCyan">{i + 1}</span>
            <span className="font-mono text-[11px] text-white/60 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
      <div className="rounded-sm border border-white/10 bg-black/30 p-4">
        <p className="font-mono text-[9px] tracking-[1px] uppercase text-white/30 mb-2">What the bot sends</p>
        <pre className="font-mono text-[10px] text-electricCyan/80 whitespace-pre-wrap leading-relaxed">{`POST /api/protocol/ingest
Authorization: Bearer pw_your_key

{
  "prompt": "Find the open invoice",
  "tool": "search",
  "data": "invoices",
  "action": "search invoices",
  "reply": "Invoice 104 is open."
}`}</pre>
      </div>
      <p className="font-mono text-[10px] text-white/35 leading-relaxed">
        The plan includes {PROTOCOL_WATCH_PLAN.botLimit} bots at ${PROTOCOL_WATCH_PLAN.monthlyPrice / 100}/month after a {PROTOCOL_WATCH_PLAN.trialDays}-day trial. Bots that are not connected are not checked.
      </p>
      <Link href="/dashboard/protocol-watch" className="font-mono text-[10px] tracking-[1px] uppercase text-electricCyan hover:underline">
        Back to Protocol Check
      </Link>
    </div>
  );
}
