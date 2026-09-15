import { NextRequest, NextResponse } from 'next/server';
import { authenticateDevice } from '@/lib/parental/agent-auth';
import { isDemoMode } from '@/lib/demo';
import { getDemoChildren } from '@/lib/demo/children-store';
import { createServiceClient } from '@/lib/supabase/server';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  const device = await authenticateDevice(request);
  if (!device) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });

  if (isDemoMode()) {
    const child = getDemoChildren().find(c => c.id === device.childId);
    if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404, headers: corsHeaders() });
    return NextResponse.json({
      child: {
        id: child.id,
        name: child.name,
        age: child.age,
        content_filter: child.content_filter,
        screen_time_limit_mins: child.screen_time_limit_mins,
        screen_time_mins: child.screen_time_mins,
        status: child.status,
      },
      device_name: device.deviceName,
    }, { headers: corsHeaders() });
  }

  try {
    const sb = createServiceClient();
    const { data: child, error } = await sb.from('child_profiles')
      .select('id, name, age, content_filter, screen_time_limit_mins, screen_time_mins, status')
      .eq('id', device.childId).single();
    if (error || !child) return NextResponse.json({ error: 'Child not found' }, { status: 404, headers: corsHeaders() });

    return NextResponse.json({ child, device_name: device.deviceName }, { headers: corsHeaders() });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500, headers: corsHeaders() });
  }
}
