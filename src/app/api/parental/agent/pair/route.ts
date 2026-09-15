import { NextRequest, NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/demo';
import { completePairing } from '@/lib/demo/devices-store';
import { getDemoChildren } from '@/lib/demo/children-store';
import { createServiceClient } from '@/lib/supabase/server';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const code = String(body.code ?? '').trim().toUpperCase();
  const deviceName = String(body.device_name ?? 'Chrome Device').trim();
  const extensionVersion = String(body.extension_version ?? '1.0.0').trim();

  if (!code) return NextResponse.json({ error: 'Pairing code is required' }, { status: 400, headers: corsHeaders() });

  if (isDemoMode()) {
    try {
      const device = completePairing(code, deviceName, extensionVersion);
      const child = getDemoChildren().find(c => c.id === device.child_id);
      if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404, headers: corsHeaders() });

      return NextResponse.json({
        device_token: device.device_token,
        child: { id: child.id, name: child.name, content_filter: child.content_filter, screen_time_limit_mins: child.screen_time_limit_mins },
      }, { headers: corsHeaders() });
    } catch (e: unknown) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid code' }, { status: 400, headers: corsHeaders() });
    }
  }

  try {
    const sb = createServiceClient();
    const now = new Date().toISOString();
    const { data: pending, error } = await sb.from('guardian_devices')
      .select('id, child_id, pairing_expires_at')
      .eq('pairing_code', code)
      .single();

    if (error || !pending) return NextResponse.json({ error: 'Invalid pairing code' }, { status: 400, headers: corsHeaders() });
    if (!pending.pairing_expires_at || new Date(pending.pairing_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Pairing code expired' }, { status: 400, headers: corsHeaders() });
    }

    const deviceToken = `gd_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    await sb.from('guardian_devices').update({
      device_token: deviceToken,
      device_name: deviceName,
      extension_version: extensionVersion,
      pairing_code: null,
      pairing_expires_at: null,
      last_seen: now,
    }).eq('id', pending.id);

    const { data: child } = await sb.from('child_profiles')
      .select('id, name, content_filter, screen_time_limit_mins')
      .eq('id', pending.child_id).single();

    return NextResponse.json({
      device_token: deviceToken,
      child,
    }, { headers: corsHeaders() });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500, headers: corsHeaders() });
  }
}
