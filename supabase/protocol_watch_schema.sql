-- Protocol Watch — separate subscription ($49/mo, 7-day trial, 3 bots)
create table if not exists public.protocol_watch_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'inactive' check (status in ('inactive','trialing','active','canceled','past_due','incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  trial_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists protocol_watch_subscriptions_updated_at on public.protocol_watch_subscriptions;
create trigger protocol_watch_subscriptions_updated_at
  before update on public.protocol_watch_subscriptions
  for each row execute procedure public.set_updated_at();

alter table public.protocol_watch_subscriptions enable row level security;

drop policy if exists "protocol_watch_subscriptions_self" on public.protocol_watch_subscriptions;
create policy "protocol_watch_subscriptions_self" on public.protocol_watch_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "protocol_watch_subscriptions_service" on public.protocol_watch_subscriptions;
create policy "protocol_watch_subscriptions_service" on public.protocol_watch_subscriptions
  for all using (auth.role() = 'service_role');

do $$ begin
  alter publication supabase_realtime add table public.protocol_watch_subscriptions;
exception when duplicate_object then null;
end $$;

create table if not exists public.protocol_bots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  job text not null default '',
  allowed_tools text not null default '',
  allowed_data text not null default '',
  forbidden_actions text not null default '',
  api_key_hash text not null unique,
  api_key_prefix text not null,
  created_at timestamptz default now()
);

alter table public.protocol_bots enable row level security;
drop policy if exists "protocol_bots_self" on public.protocol_bots;
create policy "protocol_bots_self" on public.protocol_bots
  for select using (auth.uid() = user_id);
drop policy if exists "protocol_bots_service" on public.protocol_bots;
create policy "protocol_bots_service" on public.protocol_bots
  for all using (auth.role() = 'service_role');

create table if not exists public.protocol_checks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  bot_id uuid references public.protocol_bots(id) on delete cascade not null,
  prompt text,
  tool text,
  data_accessed text,
  action text,
  reply text,
  verdict text not null check (verdict in ('pass','fail')),
  violation text,
  created_at timestamptz default now()
);

alter table public.protocol_checks enable row level security;
drop policy if exists "protocol_checks_self" on public.protocol_checks;
create policy "protocol_checks_self" on public.protocol_checks
  for select using (auth.uid() = user_id);
drop policy if exists "protocol_checks_service" on public.protocol_checks;
create policy "protocol_checks_service" on public.protocol_checks
  for all using (auth.role() = 'service_role');
