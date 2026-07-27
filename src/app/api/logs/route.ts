import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { demoLogs } from '@/lib/demo/data';

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const { searchParams } = new URL(request.url);
    let data = [...demoLogs];
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    if (level) data = data.filter(l => l.level === level);
    if (search) data = data.filter(l => l.message.toLowerCase().includes(search.toLowerCase()));
    return NextResponse.json({ data, count: data.length });
  }
  try {
    const sb = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '100');
    const offset = parseInt(searchParams.get('offset') ?? '0');
    let q = sb.from('log_entries').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (searchParams.get('level')) q = q.eq('level', searchParams.get('level')!);
    if (searchParams.get('search')) q = q.ilike('message', `%${searchParams.get('search')}%`);
    const { data, error, count } = await q;
    if (error) throw error;
    return NextResponse.json({ data, count });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) return NextResponse.json({ data: demoLogs[0] }, { status: 201 });
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { data, error } = await sb.from('log_entries').insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
