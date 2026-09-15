import type { DbAgent, DbBotEvent, DbLogEntry, DbMetrics, DbThreat, DbChildProfile, DbViewingActivity, DbParentalAlert } from '@/lib/supabase/types';

const now = new Date().toISOString();

export const demoMetrics: DbMetrics = {
  id: 'demo-metrics',
  threats_blocked: 1247,
  active_threats: 3,
  nodes_monitored: 842,
  threat_score: 6.4,
  privacy_score: 86,
  cookies_blocked: 23,
  trackers_killed: 891,
  recorded_at: now,
};

export const demoThreats: DbThreat[] = [
  { id: 't1', name: 'SQL Injection Attempt', source: '192.168.4.21', severity: 'critical', status: 'active', description: 'Repeated injection payloads targeting db-api-03', created_at: now, updated_at: now, resolved_at: null, user_id: null },
  { id: 't2', name: 'DDoS Spike Detected', source: 'External', severity: 'critical', status: 'active', description: '14k req/s spike on edge-01', created_at: now, updated_at: now, resolved_at: null, user_id: null },
  { id: 't3', name: 'Port Scan Activity', source: '10.0.0.88', severity: 'high', status: 'investigating', description: null, created_at: now, updated_at: now, resolved_at: null, user_id: null },
  { id: 't4', name: 'Anomaly: Auth Pattern', source: 'svc_deploy', severity: 'medium', status: 'investigating', description: null, created_at: now, updated_at: now, resolved_at: null, user_id: null },
  { id: 't5', name: 'Brute Force — SSH', source: '203.0.113.42', severity: 'high', status: 'mitigated', description: null, created_at: now, updated_at: now, resolved_at: null, user_id: null },
];

export const demoLogs: DbLogEntry[] = [
  { id: 'l1', level: 'critical', message: '[CRIT] SQL injection blocked — db-api-03', source: 'firewall', metadata: {}, created_at: now },
  { id: 'l2', level: 'critical', message: '[CRIT] DDoS mitigation engaged — edge-01', source: 'edge', metadata: {}, created_at: now },
  { id: 'l3', level: 'warn', message: '[WARN] Unusual auth pattern — svc_deploy', source: 'auth', metadata: {}, created_at: now },
  { id: 'l4', level: 'ok', message: '[OK] Firewall rules updated — v4.2.1', source: 'system', metadata: {}, created_at: now },
  { id: 'l5', level: 'info', message: '[INFO] Neural model sync complete', source: 'ai-core', metadata: {}, created_at: now },
];

export const demoAgents: DbAgent[] = [
  { id: 'a1', name: 'Cookie Shield', role: 'firewall', status: 'active', node: 'edge-01', version: 'v2.4.1', cpu_pct: 12, mem_pct: 34, tasks_today: 842, uptime_hours: 720, last_seen: now, created_at: now, updated_at: now },
  { id: 'a2', name: 'Bot Monitor', role: 'monitor', status: 'active', node: 'core-02', version: 'v2.4.1', cpu_pct: 28, mem_pct: 41, tasks_today: 156, uptime_hours: 720, last_seen: now, created_at: now, updated_at: now },
  { id: 'a3', name: 'Tracker Defense', role: 'scanner', status: 'idle', node: 'scan-03', version: 'v2.4.0', cpu_pct: 5, mem_pct: 18, tasks_today: 89, uptime_hours: 168, last_seen: now, created_at: now, updated_at: now },
];

export const demoBotEvents: DbBotEvent[] = [
  { id: 'b1', actor: 'ClipBot Alpha', action_bold: 'Clipboard Access', action_light: 'attempt blocked', status: 'Blocked', severity: 'critical', origin: 'chrome-extension', behavior: 'Read clipboard without consent', permissions: 'clipboard-read', risk_pct: 92, icon: 'ti-robot', created_at: now },
  { id: 'b2', actor: 'ScrapeBot X', action_bold: 'Cookie Scan', action_light: 'detected & quarantined', status: 'Quarantined', severity: 'high', origin: 'third-party script', behavior: 'Enumerate document.cookie', permissions: 'storage', risk_pct: 78, icon: 'ti-spy', created_at: now },
  { id: 'b3', actor: 'TrackBot 7', action_bold: 'History Harvest', action_light: 'monitoring', status: 'Monitoring', severity: 'medium', origin: 'analytics SDK', behavior: 'Fingerprint browser', permissions: 'navigation', risk_pct: 55, icon: 'ti-eye', created_at: now },
  { id: 'b4', actor: 'AdBot Delta', action_bold: 'Cross-Site Track', action_light: 'alert raised', status: 'Alert', severity: 'high', origin: 'ad network', behavior: 'Third-party tracker injection', permissions: 'network', risk_pct: 71, icon: 'ti-radar', created_at: now },
];

export const demoChildren: DbChildProfile[] = [
  { id: 'c1', user_id: 'u1', name: 'Alex', age: 12, device: 'Alex Chromebook', status: 'online', avatar_icon: 'ti-mood-kid', screen_time_mins: 85, screen_time_limit_mins: 120, content_filter: 'PG-13', alerts_today: 1, created_at: now },
  { id: 'c2', user_id: 'u1', name: 'Sam', age: 8, device: 'Sam iPad', status: 'offline', avatar_icon: 'ti-mood-smile', screen_time_mins: 110, screen_time_limit_mins: 120, content_filter: 'G', alerts_today: 0, created_at: now },
];

export const demoViewingActivity: DbViewingActivity[] = [
  { id: 'v1', child_id: 'c1', child_name: 'Alex', platform: 'YouTube', title: 'Minecraft Let\'s Play', category: 'video', rating: 'safe', duration_mins: 45, url: 'https://youtube.com', icon: 'ti-brand-youtube', created_at: now },
  { id: 'v2', child_id: 'c2', child_name: 'Sam', platform: 'Netflix', title: 'Cartoons', category: 'streaming', rating: 'safe', duration_mins: 30, url: null, icon: 'ti-brand-netflix', created_at: now },
];

export const demoParentalAlerts: DbParentalAlert[] = [
  { id: 'p1', child_id: 'c1', child_name: 'Alex', title: 'Restricted Content Blocked', message: 'Attempted to access R-rated movie site', severity: 'high', read: false, action_taken: 'blocked', icon: 'ti-shield', created_at: now },
];
