import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { getDemoChildren, newDemoChildId, upsertDemoChild } from '@/lib/demo/children-store';
import { defaultContentFilterForAge, isValidContentFilter } from '@/lib/parental/content-filter';
import { defaultScreenTimeLimitForAge } from '@/lib/parental/screen-time';
import type { DbChildProfile } from '@/lib/supabase/types';

function validateBody(body: Record<string, unknown>) {
  const name = String(body.name ?? '').trim();
  const age = Number(body.age);
  const device = String(body.device ?? '').trim();
  const status = body.status as DbChildProfile['status'];
  const avatar_icon = String(body.avatar_icon ?? 'ti-mood-kid').trim();
  const rawLimit = body.screen_time_limit_mins;
  const screen_time_limit_mins = rawLimit === undefined || rawLimit === null || rawLimit === ''
    ? defaultScreenTimeLimitForAge(age)
    : Number(rawLimit);

  if (!name) return { error: 'Name is required' };
  if (!Number.isFinite(age) || age < 1 || age >= 18) return { error: 'Age must be between 1 and 17' };
  if (!['online', 'offline', 'restricted'].includes(status)) return { error: 'Invalid status' };
  if (!Number.isFinite(screen_time_limit_mins) || screen_time_limit_mins < 0 || screen_time_limit_mins > 720) {
    return { error: 'Daily limit must be 0 (unlimited) or between 15 and 720 minutes' };
  }
  if (screen_time_limit_mins > 0 && screen_time_limit_mins < 15) {
    return { error: 'Daily limit must be at least 15 minutes or set to unlimited (0)' };
  }

  const content_filter = isValidContentFilter(body.content_filter)
    ? body.content_filter
    : defaultContentFilterForAge(age);

  return { name, age, device: device || 'Unknown device', status, avatar_icon, screen_time_limit_mins, content_filter };
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ data: getDemoChildren() });
  }
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await sb.from('child_profiles').select('*').eq('user_id', user.id).order('name');
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = validateBody(body);
  if ('error' in validated) return NextResponse.json({ error: validated.error }, { status: 400 });

  const now = new Date().toISOString();

  if (isDemoMode()) {
    const child: DbChildProfile = {
      id: newDemoChildId(),
      user_id: 'demo-user',
      name: validated.name,
      age: validated.age,
      device: validated.device,
      status: validated.status,
      avatar_icon: validated.avatar_icon,
      screen_time_mins: 0,
      screen_time_limit_mins: validated.screen_time_limit_mins,
      content_filter: validated.content_filter,
      alerts_today: 0,
      created_at: now,
    };
    upsertDemoChild(child);
    return NextResponse.json({ data: child }, { status: 201 });
  }

  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await sb.from('child_profiles').insert({
      user_id: user.id,
      name: validated.name,
      age: validated.age,
      device: validated.device,
      status: validated.status,
      avatar_icon: validated.avatar_icon,
      screen_time_limit_mins: validated.screen_time_limit_mins,
      content_filter: validated.content_filter,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
