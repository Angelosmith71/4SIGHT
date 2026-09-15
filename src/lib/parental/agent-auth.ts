import { NextRequest } from 'next/server';
import { isDemoMode } from '@/lib/demo';
import { getDeviceByToken } from '@/lib/demo/devices-store';
import { createServiceClient } from '@/lib/supabase/server';

export interface AuthenticatedDevice {
  deviceId: string;
  childId: string;
  userId: string;
  deviceName: string;
}

export function extractBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

export async function authenticateDevice(request: NextRequest): Promise<AuthenticatedDevice | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  if (isDemoMode()) {
    const device = getDeviceByToken(token);
    if (!device) return null;
    return { deviceId: device.id, childId: device.child_id, userId: device.user_id, deviceName: device.device_name };
  }

  try {
    const sb = createServiceClient();
    const { data, error } = await sb.from('guardian_devices')
      .select('id, child_id, user_id, device_name')
      .eq('device_token', token)
      .single();
    if (error || !data) return null;
    return { deviceId: data.id, childId: data.child_id, userId: data.user_id, deviceName: data.device_name };
  } catch {
    return null;
  }
}
