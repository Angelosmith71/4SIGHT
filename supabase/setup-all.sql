-- ============================================================
-- GUARDIAN AI — Paste ALL of this in Supabase SQL Editor → Run
-- Safe to re-run (uses IF NOT EXISTS / drops old triggers first)
-- ============================================================

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  role text default 'analyst',
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated-at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Threats
create table if not exists public.threats (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  source text not null,
  severity text not null check (severity in ('critical','high','medium','low')),
  status text not null default 'active' check (status in ('active','investigating','mitigated')),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  resolved_at timestamptz,
  user_id uuid references auth.users(id) on delete set null
);

drop trigger if exists threats_updated_at on public.threats;
create trigger threats_updated_at before update on public.threats
  for each row execute procedure public.set_updated_at();

-- Log entries
create table if not exists public.log_entries (
  id uuid default gen_random_uuid() primary key,
  level text not null check (level in ('critical','warn','ok','info')),
  message text not null,
  source text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Agents
create table if not exists public.agents (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  role text not null check (role in ('scanner','firewall','monitor','analyzer')),
  status text not null default 'active' check (status in ('active','idle','error','updating')),
  node text not null,
  version text default 'v2.4.1',
  cpu_pct int default 0,
  mem_pct int default 0,
  tasks_today int default 0,
  uptime_hours int default 0,
  last_seen timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists agents_updated_at on public.agents;
create trigger agents_updated_at before update on public.agents
  for each row execute procedure public.set_updated_at();

-- Bot events
create table if not exists public.bot_events (
  id uuid default gen_random_uuid() primary key,
  actor text not null,
  action_bold text not null,
  action_light text not null,
  status text not null check (status in ('Blocked','Quarantined','Alert','Monitoring')),
  severity text not null check (severity in ('critical','high','medium','low')),
  origin text,
  behavior text,
  permissions text,
  risk_pct int default 50,
  icon text default 'ti-robot',
  created_at timestamptz default now()
);

-- Metrics
create table if not exists public.metrics (
  id uuid default gen_random_uuid() primary key,
  threats_blocked int default 0,
  active_threats int default 0,
  nodes_monitored int default 0,
  threat_score numeric(4,1) default 0.0,
  privacy_score int default 86,
  cookies_blocked int default 0,
  trackers_killed int default 0,
  recorded_at timestamptz default now()
);

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan_id text not null default 'free' check (plan_id in ('free','pro','enterprise')),
  status text not null default 'active' check (status in ('active','canceled','past_due','trialing','incomplete')),
  billing_interval text check (billing_interval in ('month','year')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  trial_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_subscription()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subscriptions (user_id, plan_id, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_subscription on auth.users;
create trigger on_auth_user_subscription
  after insert on auth.users
  for each row execute procedure public.handle_new_subscription();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.threats enable row level security;
alter table public.log_entries enable row level security;
alter table public.agents enable row level security;
alter table public.bot_events enable row level security;
alter table public.metrics enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles for all using (auth.uid() = id);

drop policy if exists "threats_read" on public.threats;
create policy "threats_read" on public.threats for select using (auth.role() = 'authenticated');
drop policy if exists "threats_write" on public.threats;
create policy "threats_write" on public.threats for all using (auth.role() = 'authenticated');

drop policy if exists "logs_read" on public.log_entries;
create policy "logs_read" on public.log_entries for select using (auth.role() = 'authenticated');
drop policy if exists "logs_write" on public.log_entries;
create policy "logs_write" on public.log_entries for insert with check (auth.role() = 'authenticated');

drop policy if exists "agents_read" on public.agents;
create policy "agents_read" on public.agents for select using (auth.role() = 'authenticated');
drop policy if exists "agents_write" on public.agents;
create policy "agents_write" on public.agents for all using (auth.role() = 'authenticated');

drop policy if exists "bot_events_read" on public.bot_events;
create policy "bot_events_read" on public.bot_events for select using (auth.role() = 'authenticated');
drop policy if exists "bot_events_write" on public.bot_events;
create policy "bot_events_write" on public.bot_events for all using (auth.role() = 'authenticated');

drop policy if exists "metrics_read" on public.metrics;
create policy "metrics_read" on public.metrics for select using (auth.role() = 'authenticated');
drop policy if exists "metrics_write" on public.metrics;
create policy "metrics_write" on public.metrics for all using (auth.role() = 'authenticated');

drop policy if exists "subscriptions_self" on public.subscriptions;
create policy "subscriptions_self" on public.subscriptions for select using (auth.uid() = user_id);
drop policy if exists "subscriptions_service" on public.subscriptions;
create policy "subscriptions_service" on public.subscriptions for all using (auth.role() = 'service_role');

-- Seed data (only if tables are empty)
insert into public.threats (name, source, severity, status, description)
select * from (values
  ('SQL Injection Attempt','192.168.4.21','critical','active','Repeated injection payloads targeting db-api-03'),
  ('DDoS Spike Detected','External','critical','active','14k req/s spike on edge-01'),
  ('Port Scan Activity','10.0.0.88','high','investigating','Sequential port scan on internal subnet'),
  ('Anomaly: Auth Pattern','svc_deploy','medium','investigating','Unusual auth pattern from service account'),
  ('Lateral Movement','10.0.0.14','high','investigating','Credential reuse across 3 internal services'),
  ('Suspicious DNS Query','host-webapp-02','medium','mitigated','Lookups to known C2 domain'),
  ('Brute Force — SSH','203.0.113.42','high','mitigated','1,240 failed auth attempts over 6 minutes'),
  ('Config File Exfil','svc_backup','critical','active','Unusual outbound transfer of /etc/shadow')
) as v(name, source, severity, status, description)
where not exists (select 1 from public.threats limit 1);

insert into public.log_entries (level, message, source)
select * from (values
  ('critical','[CRIT] SQL injection blocked — db-api-03','db-api-03'),
  ('critical','[CRIT] DDoS mitigation engaged — edge-01','edge-01'),
  ('warn','[WARN] Unusual auth pattern — svc_deploy','svc_deploy'),
  ('warn','[WARN] Port scan from 10.0.0.88','firewall'),
  ('ok','[OK] Firewall rules updated — v4.2.1','fw-primary'),
  ('info','[INFO] Neural model sync complete','ml-core'),
  ('ok','[OK] 842 nodes heartbeat confirmed','monitor')
) as v(level, message, source)
where not exists (select 1 from public.log_entries limit 1);

insert into public.agents (name, role, status, node, cpu_pct, mem_pct, tasks_today, uptime_hours)
select * from (values
  ('ALPHA-7','scanner','active','edge-01',23,41,342,342),
  ('BRAVO-3','firewall','active','fw-primary',61,55,891,722),
  ('CHARLIE-9','monitor','active','node-cluster-07',8,29,124,182),
  ('DELTA-2','analyzer','idle','compute-02',1,18,0,537),
  ('ECHO-5','scanner','updating','edge-02',12,33,0,0),
  ('FOXTROT-1','monitor','error','node-cluster-03',0,0,0,0)
) as v(name, role, status, node, cpu_pct, mem_pct, tasks_today, uptime_hours)
where not exists (select 1 from public.agents limit 1);

insert into public.bot_events (actor, action_bold, action_light, status, severity, origin, behavior, permissions, risk_pct, icon)
select * from (values
  ('ChatGPT','ATTEMPTED','TO ACCESS CLIPBOARD','Blocked','high','OpenAI CDN','Clipboard Scraping','Read/Write Clipboard',78,'ti-shield-bolt'),
  ('Unknown Bot','SCANNED','YOUR COOKIES','Quarantined','critical','Unidentified','Cookie Enumeration','Full Cookie Access',96,'ti-robot'),
  ('Claude AI','REQUESTED','BROWSER HISTORY','Blocked','high','Anthropic CDN','History Traversal','Browser History',71,'ti-world'),
  ('Suspicious Bot','LOGIN ATTEMPT','FLAGGED','Alert','medium','Unknown Proxy','Credential Testing','Auth Token',52,'ti-alert-triangle')
) as v(actor, action_bold, action_light, status, severity, origin, behavior, permissions, risk_pct, icon)
where not exists (select 1 from public.bot_events limit 1);

insert into public.metrics (threats_blocked, active_threats, nodes_monitored, threat_score, privacy_score, cookies_blocked, trackers_killed)
select 1247, 3, 842, 6.4, 86, 23, 14
where not exists (select 1 from public.metrics limit 1);

insert into public.subscriptions (user_id, plan_id, status)
select id, 'free', 'active' from auth.users
on conflict (user_id) do nothing;

-- Realtime (ignore errors if already added)
do $$ begin
  alter publication supabase_realtime add table public.threats;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.log_entries;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.agents;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.bot_events;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.metrics;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.subscriptions;
exception when duplicate_object then null;
end $$;
