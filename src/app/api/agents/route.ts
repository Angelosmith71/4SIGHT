import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { demoAgents } from '@/lib/demo/data';

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ data: demoAgents });
  try {
    const sb = await createClient();
    const { data, error } = await sb.from('agents').select('*').order('name', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
