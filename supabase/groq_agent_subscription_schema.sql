-- Grok xAI Agent — separate subscription (7-day trial, $15/mo, 500k tokens)
create table if not exists public.groq_agent_subscriptions (
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
  tokens_used integer not null default 0,
  token_period_start timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger groq_agent_subscriptions_updated_at
  before update on public.groq_agent_subscriptions
  for each row execute procedure public.set_updated_at();

alter table public.groq_agent_subscriptions enable row level security;

drop policy if exists "groq_agent_subscriptions_self" on public.groq_agent_subscriptions;
create policy "groq_agent_subscriptions_self" on public.groq_agent_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "groq_agent_subscriptions_service" on public.groq_agent_subscriptions;
create policy "groq_agent_subscriptions_service" on public.groq_agent_subscriptions
  for all using (auth.role() = 'service_role');

do $$ begin
  alter publication supabase_realtime add table public.groq_agent_subscriptions;
exception when duplicate_object then null;
end $$;
