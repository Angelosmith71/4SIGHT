'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DbThreat, DbLogEntry, DbAgent, DbMetrics, DbBotEvent, DbChildProfile, DbViewingActivity, DbParentalAlert } from '@/lib/supabase/types';
import { DEMO_COOKIE, isDemoMode } from '@/lib/demo';
import { demoBotEvents } from '@/lib/demo/data';

function subscribeRealtime(fetchFn: () => void, setup: (sb: ReturnType<typeof createClient>) => () => void) {
  fetchFn();
  if (isDemoMode()) return;
  const sb = createClient();
  return setup(sb);
}

export function useThreats() {
  const [threats, setThreats] = useState<DbThreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch('/api/threats?limit=50');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setThreats(json.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    return subscribeRealtime(fetch, sb => {
      const ch = sb.channel(`threats-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'threats' }, () => fetch()).subscribe();
      return () => { sb.removeChannel(ch); };
    });
  }, [fetch]);
  const updateThreat = useCallback(async (id: string, patch: Partial<DbThreat>) => {
    const res = await window.fetch(`/api/threats/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    setThreats(prev => prev.map(t => t.id === id ? { ...t, ...json.data } : t));
    return json.data as DbThreat;
  }, []);
  return { threats, loading, error, refetch: fetch, updateThreat };
}

export function useLogs(options?: { level?: string; search?: string }) {
  const [logs, setLogs] = useState<DbLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    try {
      const p = new URLSearchParams({ limit: '100' });
      if (options?.level) p.set('level', options.level);
      if (options?.search) p.set('search', options.search);
      const res = await window.fetch(`/api/logs?${p}`);
      const json = await res.json();
      setLogs(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [options?.level, options?.search]);
  useEffect(() => {
    return subscribeRealtime(fetch, sb => {
      const ch = sb.channel(`logs-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'log_entries' }, payload => setLogs(prev => [payload.new as DbLogEntry, ...prev].slice(0, 150))).subscribe();
      return () => { sb.removeChannel(ch); };
    });
  }, [fetch]);
  return { logs, loading, refetch: fetch };
}

export function useAgents() {
  const [agents, setAgents] = useState<DbAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch('/api/agents');
      const json = await res.json();
      setAgents(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    return subscribeRealtime(fetch, sb => {
      const ch = sb.channel(`agents-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, payload => {
        if (payload.eventType === 'UPDATE') setAgents(prev => prev.map(a => a.id === payload.new.id ? payload.new as DbAgent : a));
      }).subscribe();
      return () => { sb.removeChannel(ch); };
    });
  }, [fetch]);
  const updateAgent = useCallback(async (id: string, patch: Partial<DbAgent>) => {
    const res = await window.fetch(`/api/agents/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    return (await res.json()).data as DbAgent;
  }, []);
  return { agents, loading, refetch: fetch, updateAgent };
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<DbMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch('/api/metrics');
      const json = await res.json();
      setMetrics(json.data ?? null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const cleanup = subscribeRealtime(fetch, sb => {
      const ch = sb.channel(`metrics-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: '*', schema: 'public', table: 'metrics' }, () => fetch()).subscribe();
      return () => { sb.removeChannel(ch); };
    });
    const iv = setInterval(fetch, 30000);
    return () => { cleanup?.(); clearInterval(iv); };
  }, [fetch]);
  return { metrics, loading, refetch: fetch };
}

export function useBotEvents() {
  const [events, setEvents] = useState<DbBotEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    try {
      if (isDemoMode()) { setEvents(demoBotEvents); return; }
      const sb = createClient();
      const { data } = await sb.from('bot_events').select('*').order('created_at', { ascending: false }).limit(20);
      setEvents(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    return subscribeRealtime(fetch, sb => {
      const ch = sb.channel(`bot-events-${Math.random().toString(36).slice(2)}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bot_events' }, payload => setEvents(prev => [payload.new as DbBotEvent, ...prev].slice(0, 20))).subscribe();
      return () => { sb.removeChannel(ch); };
    });
  }, [fetch]);
  return { events, loading, refetch: fetch };
}

export function useParentalMonitoring(childId?: string | null) {
  const [children, setChildren] = useState<DbChildProfile[]>([]);
  const [activity, setActivity] = useState<DbViewingActivity[]>([]);
  const [alerts, setAlerts] = useState<DbParentalAlert[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (childId) p.set('child_id', childId);
      const res = await window.fetch(`/api/parental?${p}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setChildren(json.children ?? []);
      setActivity(json.activity ?? []);
      setAlerts(json.alerts ?? []);
      setUnreadAlerts(json.unread_alerts ?? 0);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetch();
    const iv = setInterval(fetch, 20000);
    return () => clearInterval(iv);
  }, [fetch]);

  const markAlertRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    setUnreadAlerts(prev => Math.max(0, prev - 1));
  }, []);

  const saveChild = useCallback(async (data: { name: string; age: number; device: string; status: DbChildProfile['status']; avatar_icon: string; screen_time_limit_mins: number; content_filter: DbChildProfile['content_filter'] }, id?: string) => {
    const url = id ? `/api/parental/children/${id}` : '/api/parental/children';
    const res = await window.fetch(url, {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetch();
    return json.data as DbChildProfile;
  }, [fetch]);

  const deleteChild = useCallback(async (id: string) => {
    const res = await window.fetch(`/api/parental/children/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetch();
  }, [fetch]);

  return { children, activity, alerts, unreadAlerts, loading, refetch: fetch, markAlertRead, saveChild, deleteChild };
}

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (isDemoMode()) {
      const hasDemo = typeof document !== 'undefined' && document.cookie.includes(`${DEMO_COOKIE}=1`);
      setUser(hasDemo ? { id: 'demo', email: 'demo@guardian.ai' } : null);
      setLoading(false);
      return;
    }
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
      setLoading(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const signOut = useCallback(async () => {
    if (isDemoMode()) {
      document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0`;
      window.location.href = '/login';
      return;
    }
    const sb = createClient();
    await sb.auth.signOut();
    window.location.href = '/login';
  }, []);
  return { user, loading, signOut };
}
