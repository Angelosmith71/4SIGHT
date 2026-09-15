import { NextRequest, NextResponse } from 'next/server';
import { authenticateDevice } from '@/lib/parental/agent-auth';
import { contentExceedsFilter } from '@/lib/parental/content-filter';
import { classifyUrl } from '@/lib/parental/url-classifier';
import { isDemoMode } from '@/lib/demo';
import { addDemoActivity, newActivityId } from '@/lib/demo/activity-store';
import { addDemoAlert, newAlertId } from '@/lib/demo/alerts-store';
import { getDemoChildren, upsertDemoChild } from '@/lib/demo/children-store';
import { updateDemoChildFromAgent } from '@/lib/demo/devices-store';
import { createServiceClient } from '@/lib/supabase/server';
import type { DbParentalAlert, DbViewingActivity } from '@/lib/supabase/types';

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
  const device = await authenticateDevice(request);
  if (!device) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });

  const body = await request.json();
  const url = String(body.url ?? '').trim();
  const documentTitle = body.title ? String(body.title) : undefined;
  const durationMins = Math.max(1, Math.min(120, Number(body.duration_mins) || 1));
  const blocked = Boolean(body.blocked);
  const now = new Date().toISOString();

  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400, headers: corsHeaders() });

  const classified = classifyUrl(url, documentTitle);

  if (isDemoMode()) {
    const child = getDemoChildren().find(c => c.id === device.childId);
    if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404, headers: corsHeaders() });

    const activity: DbViewingActivity = {
      id: newActivityId(),
      child_id: child.id,
      child_name: child.name,
      platform: classified.platform,
      title: classified.title,
      category: classified.category,
      rating: classified.rating,
      duration_mins: durationMins,
      url,
      icon: classified.icon,
      created_at: now,
    };
    addDemoActivity(activity);

    const newScreenTime = child.screen_time_mins + durationMins;
    const limit = child.screen_time_limit_mins ?? 0;
    const screenTimeExceeded = limit > 0 && newScreenTime >= limit;
    upsertDemoChild({
      ...child,
      screen_time_mins: newScreenTime,
      status: screenTimeExceeded ? 'restricted' : 'online',
      alerts_today: child.alerts_today,
    });

    let alert: DbParentalAlert | null = null;
    const shouldBlock = blocked || contentExceedsFilter(child.content_filter, classified.rating) || screenTimeExceeded;

    if (shouldBlock) {
      const title = screenTimeExceeded
        ? 'Daily screen time limit reached'
        : `Blocked: ${classified.platform}`;
      const message = screenTimeExceeded
        ? `${child.name} reached the daily limit of ${limit} minutes. Further browsing is restricted.`
        : `${child.name} (${child.age}) attempted to access content rated above the ${child.content_filter} filter: ${classified.title}`;

      alert = {
        id: newAlertId(),
        child_id: child.id,
        child_name: child.name,
        title,
        message,
        severity: screenTimeExceeded ? 'high' : classified.rating === 'flagged' ? 'critical' : 'high',
        read: false,
        action_taken: 'blocked',
        icon: screenTimeExceeded ? 'ti-clock-exclamation' : 'ti-shield-exclamation',
        created_at: now,
      };
      addDemoAlert(alert);
      upsertDemoChild({ ...getDemoChildren().find(c => c.id === child.id)!, alerts_today: child.alerts_today + 1 });
    }

    updateDemoChildFromAgent(device.childId, {});

    return NextResponse.json({
      ok: true,
      blocked: shouldBlock,
      activity,
      alert,
      screen_time_mins: newScreenTime,
    }, { headers: corsHeaders() });
  }

  try {
    const sb = createServiceClient();
    const { data: child, error: childErr } = await sb.from('child_profiles')
      .select('*').eq('id', device.childId).single();
    if (childErr || !child) return NextResponse.json({ error: 'Child not found' }, { status: 404, headers: corsHeaders() });

    const { data: activity, error: actErr } = await sb.from('viewing_activity').insert({
      child_id: child.id,
      child_name: child.name,
      platform: classified.platform,
      title: classified.title,
      category: classified.category,
      rating: classified.rating,
      duration_mins: durationMins,
      url,
      icon: classified.icon,
    }).select().single();
    if (actErr) throw actErr;

    const newScreenTime = (child.screen_time_mins ?? 0) + durationMins;
    const limit = child.screen_time_limit_mins ?? 0;
    const screenTimeExceeded = limit > 0 && newScreenTime >= limit;
    const shouldBlock = blocked || contentExceedsFilter(child.content_filter, classified.rating) || screenTimeExceeded;

    await sb.from('child_profiles').update({
      screen_time_mins: newScreenTime,
      status: screenTimeExceeded ? 'restricted' : 'online',
    }).eq('id', child.id);

    await sb.from('guardian_devices').update({ last_seen: now, extension_version: body.extension_version ?? null })
      .eq('id', device.deviceId);

    let alert = null;
    if (shouldBlock) {
      const title = screenTimeExceeded ? 'Daily screen time limit reached' : `Blocked: ${classified.platform}`;
      const message = screenTimeExceeded
        ? `${child.name} reached the daily limit of ${limit} minutes.`
        : `${child.name} attempted to access content above the ${child.content_filter} filter.`;

      const { data: alertRow } = await sb.from('parental_alerts').insert({
        child_id: child.id,
        child_name: child.name,
        title,
        message,
        severity: screenTimeExceeded ? 'high' : classified.rating === 'flagged' ? 'critical' : 'high',
        action_taken: 'blocked',
        icon: screenTimeExceeded ? 'ti-clock-exclamation' : 'ti-shield-exclamation',
      }).select().single();
      alert = alertRow;

      await sb.from('child_profiles').update({ alerts_today: (child.alerts_today ?? 0) + 1 }).eq('id', child.id);
    }

    return NextResponse.json({
      ok: true,
      blocked: shouldBlock,
      activity,
      alert,
      screen_time_mins: newScreenTime,
    }, { headers: corsHeaders() });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500, headers: corsHeaders() });
  }
}
