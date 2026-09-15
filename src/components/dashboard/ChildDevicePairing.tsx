'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { DbChildProfile } from '@/lib/supabase/types';

interface LinkedDevice {
  id: string;
  child_id: string;
  device_name: string;
  platform: string;
  extension_version: string | null;
  last_seen: string | null;
}

interface Props {
  child: DbChildProfile;
  onToast: (msg: string, ok: boolean) => void;
}

export function ChildDevicePairing({ child, onToast }: Props) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<LinkedDevice[]>([]);

  const loadDevices = useCallback(async () => {
    try {
      const res = await fetch(`/api/parental/devices/pair?child_id=${child.id}`);
      const json = await res.json();
      setDevices(json.data ?? []);
    } catch {
      setDevices([]);
    }
  }, [child.id]);

  useEffect(() => { void loadDevices(); }, [loadDevices]);

  async function generateCode() {
    setLoading(true);
    try {
      const res = await fetch('/api/parental/devices/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: child.id }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setCode(json.code);
      setExpiresAt(json.expires_at);
      onToast(`Pairing code for ${child.name}: ${json.code}`, true);
    } catch (e: unknown) {
      onToast(e instanceof Error ? e.message : 'Failed to generate code', false);
    } finally {
      setLoading(false);
    }
  }

  function relTime(iso: string | null) {
    if (!iso) return 'Never';
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    return m < 1 ? 'Just now' : m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
  }

  const expired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <div className="mt-3 p-3 rounded-sm border border-electricCyan/15 bg-black/20">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="font-mono text-[8px] tracking-[1px] text-electricCyan/60 uppercase">Guardian extension</p>
        <button type="button" onClick={generateCode} disabled={loading}
          className="font-mono text-[8px] tracking-[1px] uppercase px-2 py-1 rounded-sm border border-electricCyan/30 text-electricCyan hover:bg-electricCyan/10 disabled:opacity-40">
          {loading ? '…' : 'Link device'}
        </button>
      </div>

      {code && !expired && (
        <div className="mb-2 p-2 rounded-sm border border-emeraldPulse/30 bg-emeraldPulse/5 text-center">
          <p className="font-mono text-[8px] text-white/35 uppercase mb-1">Pairing code · 15 min</p>
          <p className="font-rajdhani font-bold text-2xl tracking-[6px] text-emeraldPulse">{code}</p>
          <p className="font-mono text-[8px] text-white/30 mt-1">Enter in Chrome extension on {child.name}&apos;s device</p>
        </div>
      )}

      {devices.length > 0 ? (
        <ul className="space-y-1">
          {devices.map(d => (
            <li key={d.id} className="flex items-center justify-between font-mono text-[9px] text-white/40">
              <span className="truncate"><span className="text-white/60">{d.device_name}</span> · {d.platform}</span>
              <span>{relTime(d.last_seen)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-[8px] text-white/25">No devices linked yet</p>
      )}
    </div>
  );
}
