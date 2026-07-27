import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { demoThreats } from '@/lib/demo/data';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (isDemoMode()) {
    const { id } = await params;
    const body = await request.json();
    const threat = demoThreats.find(t => t.id === id) ?? demoThreats[0];
    return NextResponse.json({ data: { ...threat, ...body, updated_at: new Date().toISOString() } });
  }
  try {
    const { id } = await params;
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (body.status === 'mitigated') body.resolved_at = new Date().toISOString();
    const { data, error } = await sb.from('threats').update(body).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
