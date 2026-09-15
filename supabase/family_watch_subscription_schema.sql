-- Family Watch — separate subscription (7-day trial, $20/mo)
create table if not exists public.family_watch_subscriptions (
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

create trigger family_watch_subscriptions_updated_at
  before update on public.family_watch_subscriptions
  for each row execute procedure public.set_updated_at();

alter table public.family_watch_subscriptions enable row level security;

drop policy if exists "family_watch_subscriptions_self" on public.family_watch_subscriptions;
create policy "family_watch_subscriptions_self" on public.family_watch_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "family_watch_subscriptions_service" on public.family_watch_subscriptions;
create policy "family_watch_subscriptions_service" on public.family_watch_subscriptions
  for all using (auth.role() = 'service_role');

do $$ begin
  alter publication supabase_realtime add table public.family_watch_subscriptions;
exception when duplicate_object then null;
end $$;
