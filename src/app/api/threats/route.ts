import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { demoThreats } from '@/lib/demo/data';

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const { searchParams } = new URL(request.url);
    let data = [...demoThreats];
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    if (severity) data = data.filter(t => t.severity === severity);
    if (status) data = data.filter(t => t.status === status);
    const limit = parseInt(searchParams.get('limit') ?? '50');
    return NextResponse.json({ data: data.slice(0, limit), count: data.length });
  }
  try {
    const sb = await createClient();
    const { searchParams } = new URL(request.url);
    let q = sb.from('threats').select('*').order('created_at', { ascending: false }).limit(parseInt(searchParams.get('limit') ?? '50'));
    if (searchParams.get('severity')) q = q.eq('severity', searchParams.get('severity')!);
    if (searchParams.get('status')) q = q.eq('status', searchParams.get('status')!);
    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ data, count: data?.length ?? 0 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ data: demoThreats[0] }, { status: 201 });
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { data, error } = await sb.from('threats').insert({ ...body, user_id: user.id }).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
