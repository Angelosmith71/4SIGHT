import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { demoMetrics, demoThreats } from '@/lib/demo/data';

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({
      data: { ...demoMetrics, active_threats: demoThreats.filter(t => t.status === 'active').length, total_logs: 5 },
    });
  }
  try {
    const sb = await createClient();
    const { data, error } = await sb.from('metrics').select('*').order('recorded_at', { ascending: false }).limit(1).single();
    if (error) throw error;
    const [{ count: ac }, { count: tl }] = await Promise.all([
      sb.from('threats').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      sb.from('log_entries').select('*', { count: 'exact', head: true }),
    ]);
    return NextResponse.json({ data: { ...data, active_threats: ac ?? data.active_threats, total_logs: tl ?? 0 } });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
