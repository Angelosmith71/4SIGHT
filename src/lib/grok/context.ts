import { isDemoMode } from '@/lib/demo';
import { demoMetrics, demoParentalAlerts, demoThreats } from '@/lib/demo/data';
import { getDemoChildren } from '@/lib/demo/children-store';
import { createClient } from '@/lib/supabase/server';

export type GrokContextMode = 'auto' | 'threats' | 'family' | 'none';

export async function buildDashboardContext(mode: GrokContextMode): Promise<string> {
  if (mode === 'none') return '';

  if (isDemoMode()) {
    return formatDemoContext(mode);
  }

  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return '';

    const parts: string[] = [];

    if (mode === 'auto' || mode === 'threats') {
      const { data: threats } = await sb.from('threats').select('name, severity, status, source').eq('user_id', user.id).limit(8);
      const { data: metrics } = await sb.from('metrics').select('*').order('recorded_at', { ascending: false }).limit(1).single();
      if (metrics) {
        parts.push(`Metrics: privacy_score=${metrics.privacy_score}, threat_score=${metrics.threat_score}, threats_blocked=${metrics.threats_blocked}, cookies_blocked=${metrics.cookies_blocked}`);
      }
      if (threats?.length) {
        parts.push('Active/recent threats:\n' + threats.map(t => `- [${t.severity}] ${t.name} (${t.status}) from ${t.source}`).join('\n'));
      }
    }

    if (mode === 'auto' || mode === 'family') {
      const { data: children } = await sb.from('child_profiles').select('name, age, content_filter, screen_time_mins, screen_time_limit_mins, status, alerts_today').eq('user_id', user.id);
      const { data: alerts } = await sb.from('parental_alerts').select('child_name, title, severity, read').order('created_at', { ascending: false }).limit(5);
      if (children?.length) {
        parts.push('Children:\n' + children.map(c =>
          `- ${c.name} (${c.age}): filter ${c.content_filter}, screen ${c.screen_time_mins}/${c.screen_time_limit_mins || '∞'} min, status ${c.status}, ${c.alerts_today} alerts today`
        ).join('\n'));
      }
      if (alerts?.length) {
        parts.push('Recent parental alerts:\n' + alerts.map(a => `- [${a.severity}] ${a.child_name}: ${a.title}${a.read ? ' (read)' : ' (unread)'}`).join('\n'));
      }
    }

    return parts.join('\n\n');
  } catch {
    return '';
  }
}

function formatDemoContext(mode: GrokContextMode): string {
  const parts: string[] = [];
  if (mode === 'auto' || mode === 'threats') {
    parts.push(`Metrics: privacy_score=${demoMetrics.privacy_score}, threat_score=${demoMetrics.threat_score}, threats_blocked=${demoMetrics.threats_blocked}`);
    parts.push('Threats:\n' + demoThreats.slice(0, 5).map(t => `- [${t.severity}] ${t.name} (${t.status})`).join('\n'));
  }
  if (mode === 'auto' || mode === 'family') {
    const children = getDemoChildren();
    parts.push('Children:\n' + children.map(c =>
      `- ${c.name} (${c.age}): ${c.content_filter}, ${c.screen_time_mins}/${c.screen_time_limit_mins} min`
    ).join('\n'));
    parts.push('Parental alerts:\n' + demoParentalAlerts.slice(0, 4).map(a => `- [${a.severity}] ${a.child_name}: ${a.title}`).join('\n'));
  }
  return parts.join('\n\n');
}
