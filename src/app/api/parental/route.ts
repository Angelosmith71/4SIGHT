import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo';
import { getDemoAlerts } from '@/lib/demo/alerts-store';
import { getDemoActivity } from '@/lib/demo/activity-store';
import { getDemoChildren } from '@/lib/demo/children-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const childId = searchParams.get('child_id');

  if (isDemoMode()) {
    let children = [...getDemoChildren()];
    let activity = [...getDemoActivity()];
    let alerts = [...getDemoAlerts()];
    if (childId) {
      activity = activity.filter(a => a.child_id === childId);
      alerts = alerts.filter(a => a.child_id === childId);
    }
    return NextResponse.json({
      children,
      activity: activity.slice(0, 50),
      alerts: alerts.slice(0, 30),
      unread_alerts: alerts.filter(a => !a.read).length,
    });
  }

  try {
    const sb = await createClient();
    let activityQ = sb.from('viewing_activity').select('*').order('created_at', { ascending: false }).limit(50);
    let alertsQ = sb.from('parental_alerts').select('*').order('created_at', { ascending: false }).limit(30);
    if (childId) {
      activityQ = activityQ.eq('child_id', childId);
      alertsQ = alertsQ.eq('child_id', childId);
    }
    const [{ data: children }, { data: activity }, { data: alerts }] = await Promise.all([
      sb.from('child_profiles').select('*').order('name'),
      activityQ,
      alertsQ,
    ]);
    const unread = (alerts ?? []).filter((a: { read: boolean }) => !a.read).length;
    return NextResponse.json({ children: children ?? [], activity: activity ?? [], alerts: alerts ?? [], unread_alerts: unread });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
