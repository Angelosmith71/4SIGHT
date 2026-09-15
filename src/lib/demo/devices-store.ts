import type { DbChildProfile } from '@/lib/supabase/types';
import { getDemoChildren, upsertDemoChild } from '@/lib/demo/children-store';

export interface DemoDevice {
  id: string;
  child_id: string;
  user_id: string;
  device_token: string;
  pairing_code: string | null;
  pairing_expires_at: string | null;
  device_name: string;
  platform: string;
  extension_version: string | null;
  last_seen: string | null;
  created_at: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __guardianDemoDevices: DemoDevice[] | undefined;
}

function devices(): DemoDevice[] {
  if (!global.__guardianDemoDevices) global.__guardianDemoDevices = [];
  return global.__guardianDemoDevices;
}

export function getDemoDevices(childId?: string): DemoDevice[] {
  const list = devices();
  return childId ? list.filter(d => d.child_id === childId) : list;
}

export function getDeviceByToken(token: string): DemoDevice | undefined {
  return devices().find(d => d.device_token === token);
}

export function getDeviceByPairingCode(code: string): DemoDevice | undefined {
  const normalized = code.trim().toUpperCase();
  const now = Date.now();
  return devices().find(d =>
    d.pairing_code === normalized &&
    d.pairing_expires_at &&
    new Date(d.pairing_expires_at).getTime() > now
  );
}

export function createPairingCode(childId: string, userId = 'demo'): { code: string; expires_at: string } {
  const child = getDemoChildren().find(c => c.id === childId);
  if (!child) throw new Error('Child not found');

  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const existing = devices().find(d => d.child_id === childId && d.pairing_code);
  if (existing) {
    existing.pairing_code = code;
    existing.pairing_expires_at = expires_at;
  } else {
    devices().push({
      id: `d${Date.now()}`,
      child_id: childId,
      user_id: userId,
      device_token: '',
      pairing_code: code,
      pairing_expires_at: expires_at,
      device_name: '',
      platform: 'chrome',
      extension_version: null,
      last_seen: null,
      created_at: new Date().toISOString(),
    });
  }

  return { code, expires_at };
}

export function completePairing(code: string, deviceName: string, extensionVersion?: string): DemoDevice {
  const pending = getDeviceByPairingCode(code);
  if (!pending) throw new Error('Invalid or expired pairing code');

  pending.device_token = `demo-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  pending.device_name = deviceName || 'Chrome Device';
  pending.pairing_code = null;
  pending.pairing_expires_at = null;
  pending.extension_version = extensionVersion ?? '1.0.0';
  pending.last_seen = new Date().toISOString();
  return pending;
}

export function removeDemoDevice(deviceId: string) {
  global.__guardianDemoDevices = devices().filter(d => d.id !== deviceId);
}

export function updateDemoChildFromAgent(childId: string, patch: Partial<DbChildProfile>) {
  const child = getDemoChildren().find(c => c.id === childId);
  if (!child) return;
  upsertDemoChild({ ...child, ...patch });
}
