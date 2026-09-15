-- Parental monitoring tables (run after schema.sql)
create table if not exists public.child_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  age int not null check (age > 0 and age < 18),
  device text,
  status text not null default 'offline' check (status in ('online','offline','restricted')),
  avatar_icon text default 'ti-mood-kid',
  screen_time_mins int default 0,
  screen_time_limit_mins int default 120,
  content_filter text not null default 'PG' check (content_filter in ('G','PG','PG-13','R')),
  alerts_today int default 0,
  created_at timestamptz default now()
);

create table if not exists public.viewing_activity (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.child_profiles(id) on delete cascade not null,
  child_name text not null,
  platform text not null,
  title text not null,
  category text not null check (category in ('video','social','gaming','web','streaming')),
  rating text not null check (rating in ('safe','review','flagged')),
  duration_mins int default 0,
  url text,
  icon text default 'ti-world',
  created_at timestamptz default now()
);

create table if not exists public.parental_alerts (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.child_profiles(id) on delete cascade not null,
  child_name text not null,
  title text not null,
  message text not null,
  severity text not null check (severity in ('critical','high','medium','low')),
  read boolean default false,
  action_taken text check (action_taken in ('blocked','notified','logged')),
  icon text default 'ti-bell',
  created_at timestamptz default now()
);

alter table public.child_profiles enable row level security;
alter table public.viewing_activity enable row level security;
alter table public.parental_alerts enable row level security;

create policy "child_profiles_owner" on public.child_profiles for all using (auth.uid() = user_id);
create policy "viewing_activity_auth" on public.viewing_activity for select using (auth.role() = 'authenticated');
create policy "viewing_activity_insert" on public.viewing_activity for insert using (auth.role() = 'authenticated');
create policy "parental_alerts_auth" on public.parental_alerts for select using (auth.role() = 'authenticated');
create policy "parental_alerts_update" on public.parental_alerts for update using (auth.role() = 'authenticated');

alter table public.child_profiles add column if not exists screen_time_limit_mins int default 120;
alter table public.child_profiles add column if not exists content_filter text default 'PG';
update public.child_profiles set content_filter = 'PG' where content_filter is null;
alter table public.child_profiles drop constraint if exists child_profiles_content_filter_check;
alter table public.child_profiles add constraint child_profiles_content_filter_check check (content_filter in ('G','PG','PG-13','R'));

create table if not exists public.guardian_devices (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.child_profiles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  device_token text unique not null,
  pairing_code text unique,
  pairing_expires_at timestamptz,
  device_name text not null default 'Chrome Device',
  platform text default 'chrome',
  extension_version text,
  last_seen timestamptz,
  created_at timestamptz default now()
);

alter table public.guardian_devices enable row level security;
drop policy if exists "guardian_devices_owner" on public.guardian_devices;
create policy "guardian_devices_owner" on public.guardian_devices for all using (auth.uid() = user_id);

do $$ begin alter publication supabase_realtime add table public.parental_alerts; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.viewing_activity; exception when duplicate_object then null; end $$;
