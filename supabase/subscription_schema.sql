create table public.subscriptions (id uuid default gen_random_uuid() primary key, user_id uuid references auth.users(id) on delete cascade not null unique, stripe_customer_id text unique, stripe_subscription_id text unique, stripe_price_id text, plan_id text not null default 'free' check (plan_id in ('free','pro','enterprise')), status text not null default 'active' check (status in ('active','canceled','past_due','trialing','incomplete')), billing_interval text check (billing_interval in ('month','year')), current_period_start timestamptz, current_period_end timestamptz, cancel_at_period_end boolean default false, trial_end timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.set_updated_at();
create or replace function public.handle_new_subscription() returns trigger language plpgsql security definer as $$ begin insert into public.subscriptions (user_id,plan_id,status) values (new.id,'free','active') on conflict (user_id) do nothing; return new; end; $$;
create trigger on_auth_user_subscription after insert on auth.users for each row execute procedure public.handle_new_subscription();
alter table public.subscriptions enable row level security;
create policy "subscriptions_self" on public.subscriptions for select using (auth.uid()=user_id);
create policy "subscriptions_service" on public.subscriptions for all using (auth.role()='service_role');
insert into public.subscriptions (user_id,plan_id,status) select id,'free','active' from auth.users on conflict (user_id) do nothing;
alter publication supabase_realtime add table public.subscriptions;
