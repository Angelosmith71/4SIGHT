import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { createPairingCode, getDemoDevices } from '@/lib/demo/devices-store';

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const childId = String(body.child_id ?? '').trim();
  if (!childId) return NextResponse.json({ error: 'child_id is required' }, { status: 400 });

  if (isDemoMode()) {
    try {
      const { code, expires_at } = createPairingCode(childId);
      return NextResponse.json({ code, expires_at, expires_in_mins: 15 });
    } catch (e: unknown) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 404 });
    }
  }

  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: child, error: childErr } = await sb.from('child_profiles')
      .select('id').eq('id', childId).eq('user_id', user.id).single();
    if (childErr || !child) return NextResponse.json({ error: 'Child not found' }, { status: 404 });

    const code = randomCode();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const service = createServiceClient();

    const { data: existing } = await service.from('guardian_devices')
      .select('id').eq('child_id', childId).not('pairing_code', 'is', null).maybeSingle();

    if (existing) {
      await service.from('guardian_devices').update({ pairing_code: code, pairing_expires_at: expires_at })
        .eq('id', existing.id);
    } else {
      await service.from('guardian_devices').insert({
        child_id: childId,
        user_id: user.id,
        device_token: `pending_${crypto.randomUUID()}`,
        pairing_code: code,
        pairing_expires_at: expires_at,
        device_name: 'Pending',
        platform: 'chrome',
      });
    }

    return NextResponse.json({ code, expires_at, expires_in_mins: 15 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const childId = new URL(request.url).searchParams.get('child_id');

  if (isDemoMode()) {
    return NextResponse.json({ data: getDemoDevices(childId ?? undefined).filter(d => d.device_token) });
  }

  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let q = sb.from('guardian_devices').select('id, child_id, device_name, platform, extension_version, last_seen, created_at')
      .eq('user_id', user.id).is('pairing_code', null);
    if (childId) q = q.eq('child_id', childId);

    const { data, error } = await q.order('last_seen', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
