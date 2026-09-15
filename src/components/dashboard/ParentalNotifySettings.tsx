'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  loadParentalSettings,
  saveParentalSettings,
  type ParentalNotifySettings,
} from '@/lib/parental/settings';

interface Props {
  onNotifyResult?: (msg: string, ok: boolean) => void;
}

export function ParentalNotifySettings({ onNotifyResult }: Props) {
  const [settings, setSettings] = useState<ParentalNotifySettings>(loadParentalSettings);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    saveParentalSettings(settings);
  }, [settings]);

  function update<K extends keyof ParentalNotifySettings>(key: K, value: ParentalNotifySettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  async function sendTest() {
    setTesting(true);
    try {
      const res = await fetch('/api/parental/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          email: settings.emailEnabled ? settings.email : undefined,
          phone: settings.smsEnabled ? settings.phone : undefined,
          sendEmail: settings.emailEnabled,
          sendSms: settings.smsEnabled,
        }),
      });
      const json = await res.json();
      const preview = json.results?.map((r: { channel: string; demo?: boolean; preview?: string }) =>
        r.demo ? `[${r.channel} preview]\n${r.preview}` : r.channel
      ).join('\n\n');
      onNotifyResult?.(
        json.demo ? `Demo: notification ready (configure Resend/Twilio to send for real)${preview ? `\n\n${preview}` : ''}` : json.message ?? 'Sent',
        json.ok
      );
    } catch (e: unknown) {
      onNotifyResult?.(e instanceof Error ? e.message : 'Failed', false);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="rounded-sm border border-electricCyan/15 bg-electricCyan/[0.03] overflow-hidden">
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-electricCyan/40 pointer-events-none" />
      <div className="px-4 py-3 border-b border-electricCyan/10 flex items-center gap-2">
        <i className="ti ti-mail-forward" style={{ fontSize: 16, color: '#00E6FF' }} aria-hidden="true" />
        <div>
          <p className="font-mono text-[9px] tracking-[2px] text-electricCyan/50 uppercase">Parent notifications</p>
          <h3 className="font-rajdhani font-bold text-sm text-white">Email &amp; SMS alerts</h3>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px] flex items-center gap-2">
              <input type="checkbox" checked={settings.emailEnabled} onChange={e => update('emailEnabled', e.target.checked)} className="accent-electricCyan" />
              Parent email
            </label>
            <input type="email" value={settings.email} onChange={e => update('email', e.target.value)}
              placeholder="parent@email.com"
              className="bg-black/30 border border-white/12 rounded-sm px-3 py-2 font-mono text-[11px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-electricCyan/40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px] flex items-center gap-2">
              <input type="checkbox" checked={settings.smsEnabled} onChange={e => update('smsEnabled', e.target.checked)} className="accent-electricCyan" />
              Parent mobile (SMS)
            </label>
            <input type="tel" value={settings.phone} onChange={e => update('phone', e.target.value)}
              placeholder="+1 555 123 4567"
              className="bg-black/30 border border-white/12 rounded-sm px-3 py-2 font-mono text-[11px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-electricCyan/40" />
          </div>
        </div>
        <label className="font-mono text-[9px] text-white/40 flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings.autoNotifyCritical} onChange={e => update('autoNotifyCritical', e.target.checked)} className="accent-neoCrimson" />
          Automatically email/SMS on critical &amp; high severity alerts
        </label>
        <p className="font-mono text-[9px] text-white/25 leading-relaxed">
          Demo mode simulates sends. For real delivery add <span className="text-electricCyan/60">RESEND_API_KEY</span> (email) and <span className="text-electricCyan/60">TWILIO_*</span> (SMS) to .env.local.
        </p>
        <motion.button onClick={sendTest} disabled={testing || (!settings.email && !settings.phone)}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="font-mono text-[9px] tracking-[1px] uppercase px-4 py-2.5 rounded-sm border border-electricCyan/40 text-electricCyan bg-electricCyan/8 disabled:opacity-40 self-start">
          {testing ? 'Sending test...' : 'Send test email & SMS'}
        </motion.button>
      </div>
    </div>
  );
}
