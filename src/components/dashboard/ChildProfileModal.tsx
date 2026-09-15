'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DbChildProfile } from '@/lib/supabase/types';
import { CONTENT_FILTERS, defaultContentFilterForAge, type ContentFilter } from '@/lib/parental/content-filter';
import { defaultScreenTimeLimitForAge, formatScreenTime, SCREEN_TIME_PRESETS } from '@/lib/parental/screen-time';

const AVATARS = [
  { icon: 'ti-mood-kid', label: 'Kid' },
  { icon: 'ti-device-tablet', label: 'Tablet' },
  { icon: 'ti-device-laptop', label: 'Laptop' },
  { icon: 'ti-device-mobile', label: 'Phone' },
  { icon: 'ti-device-gamepad-2', label: 'Gaming' },
  { icon: 'ti-device-tv', label: 'TV' },
];

const STATUSES: DbChildProfile['status'][] = ['online', 'offline', 'restricted'];

export type ChildFormData = {
  name: string;
  age: number;
  device: string;
  status: DbChildProfile['status'];
  avatar_icon: string;
  screen_time_limit_mins: number;
  content_filter: ContentFilter;
};

interface Props {
  open: boolean;
  child?: DbChildProfile | null;
  onClose: () => void;
  onSave: (data: ChildFormData) => Promise<void>;
}

export function ChildProfileModal({ open, child, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(10);
  const [device, setDevice] = useState('');
  const [status, setStatus] = useState<DbChildProfile['status']>('offline');
  const [avatar, setAvatar] = useState('ti-mood-kid');
  const [limitMins, setLimitMins] = useState(120);
  const [unlimited, setUnlimited] = useState(false);
  const [contentFilter, setContentFilter] = useState<ContentFilter>('PG');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const initialAge = child?.age ?? 10;
      setName(child?.name ?? '');
      setAge(initialAge);
      setDevice(child?.device ?? '');
      setStatus(child?.status ?? 'offline');
      setAvatar(child?.avatar_icon ?? 'ti-mood-kid');
      const limit = child?.screen_time_limit_mins ?? defaultScreenTimeLimitForAge(initialAge);
      setLimitMins(limit > 0 ? limit : defaultScreenTimeLimitForAge(initialAge));
      setUnlimited(limit === 0);
      setContentFilter(child?.content_filter ?? defaultContentFilterForAge(initialAge));
      setError('');
    }
  }, [open, child]);

  function handleAgeChange(nextAge: number) {
    setAge(nextAge);
    if (!child && !unlimited) {
      setLimitMins(defaultScreenTimeLimitForAge(nextAge));
    }
    if (!child) {
      setContentFilter(defaultContentFilterForAge(nextAge));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({
        name, age, device, status, avatar_icon: avatar,
        screen_time_limit_mins: unlimited ? 0 : limitMins,
        content_filter: contentFilter,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[90vh] rounded-sm border border-electricCyan/25 bg-graphite overflow-hidden flex flex-col">
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-electricCyan/60" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-electricCyan/60" />

            <div className="px-5 pt-5 pb-3 border-b border-white/8">
              <p className="font-mono text-[9px] tracking-[2px] text-electricCyan/40 uppercase">Child profile</p>
              <h2 className="font-rajdhani font-bold text-xl text-white">{child ? 'Edit child' : 'Add child'}</h2>
              <p className="font-mono text-[9px] text-white/30 mt-1">Must be under 18 years old</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Emma"
                  className="bg-black/30 border border-white/12 rounded-sm px-3 py-2.5 font-mono text-[12px] text-white/80 focus:outline-none focus:border-electricCyan/40" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Age</label>
                <input type="number" min={1} max={17} value={age} onChange={e => handleAgeChange(Number(e.target.value))} required
                  className="bg-black/30 border border-white/12 rounded-sm px-3 py-2.5 font-mono text-[12px] text-white/80 focus:outline-none focus:border-electricCyan/40" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Daily screen time limit</label>
                  <button type="button" onClick={() => setUnlimited(v => !v)}
                    className={`font-mono text-[8px] tracking-[1px] uppercase px-2 py-0.5 rounded-sm border transition-all
                      ${unlimited ? 'border-electricCyan/50 text-electricCyan bg-electricCyan/10' : 'border-white/10 text-white/30 hover:border-white/25'}`}>
                    {unlimited ? 'Enable daily limit' : 'No limit'}
                  </button>
                </div>
                {!unlimited && (
                  <>
                    <div className="flex gap-1.5 flex-wrap">
                      {SCREEN_TIME_PRESETS.map(p => (
                        <button key={p.mins} type="button" onClick={() => setLimitMins(p.mins)}
                          className={`font-mono text-[9px] tracking-[1px] px-2.5 py-1 rounded-sm border transition-all
                            ${limitMins === p.mins ? 'bg-plasmaViolet/15 border-plasmaViolet/50 text-plasmaViolet' : 'border-white/10 text-white/30 hover:border-white/25'}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="range" min={15} max={480} step={15} value={limitMins}
                        onChange={e => setLimitMins(Number(e.target.value))}
                        className="flex-1 accent-plasmaViolet" />
                      <span className="font-mono text-[11px] text-plasmaViolet w-14 text-right">{formatScreenTime(limitMins)}</span>
                    </div>
                    <p className="font-mono text-[8px] text-white/25">
                      Recommended for age {age}: {formatScreenTime(defaultScreenTimeLimitForAge(age))}
                    </p>
                  </>
                )}
                {unlimited && (
                  <p className="font-mono text-[9px] text-white/30">No daily cap — usage is tracked but not blocked.</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Content filter (max rating)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CONTENT_FILTERS.map(f => (
                    <button key={f.value} type="button" onClick={() => setContentFilter(f.value)}
                      className={`text-left p-2.5 rounded-sm border transition-all
                        ${contentFilter === f.value ? 'border-electricCyan/50 bg-electricCyan/8' : 'border-white/10 hover:border-white/25'}`}>
                      <span className="font-rajdhani font-bold text-sm" style={{ color: contentFilter === f.value ? f.color : 'rgba(255,255,255,0.5)' }}>
                        {f.label}
                      </span>
                      <p className="font-mono text-[8px] text-white/30 mt-0.5 leading-snug">{f.desc}</p>
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[8px] text-white/25">
                  Recommended for age {age}: {defaultContentFilterForAge(age)}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Device</label>
                <input value={device} onChange={e => setDevice(e.target.value)} placeholder="iPad · Living Room"
                  className="bg-black/30 border border-white/12 rounded-sm px-3 py-2.5 font-mono text-[12px] text-white/80 focus:outline-none focus:border-electricCyan/40" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Status</label>
                <div className="flex gap-1.5 flex-wrap">
                  {STATUSES.map(s => (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      className={`font-mono text-[9px] tracking-[1px] uppercase px-2.5 py-1 rounded-sm border transition-all
                        ${status === s ? 'bg-electricCyan/10 border-electricCyan/50 text-electricCyan' : 'border-white/10 text-white/30 hover:border-white/25'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-white/35 uppercase tracking-[1px]">Avatar</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATARS.map(a => (
                    <button key={a.icon} type="button" onClick={() => setAvatar(a.icon)}
                      title={a.label}
                      className={`w-10 h-10 rounded-sm border flex items-center justify-center transition-all
                        ${avatar === a.icon ? 'border-electricCyan/50 bg-electricCyan/10 text-electricCyan' : 'border-white/10 text-white/35 hover:border-white/25'}`}>
                      <i className={`ti ${a.icon}`} style={{ fontSize: 18 }} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="font-mono text-[10px] text-neoCrimson px-3 py-2 border border-neoCrimson/30 bg-neoCrimson/8 rounded-sm">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 font-mono text-[9px] tracking-[1px] uppercase py-2.5 rounded-sm border border-white/15 text-white/40 hover:text-white/60">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 font-mono text-[9px] tracking-[1px] uppercase py-2.5 rounded-sm border border-electricCyan/40 bg-electricCyan/10 text-electricCyan disabled:opacity-40">
                  {saving ? 'Saving...' : child ? 'Save changes' : 'Add child'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
