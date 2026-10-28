create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  name text not null,
  email text not null,
  phone text not null,
  qty integer not null check (qty > 0),
  bank_reference text not null,
  receipt_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  ticket_number text unique,
  checked_in_count integer not null default 0 check (checked_in_count >= 0),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create index if not exists orders_event_id_idx on public.orders(event_id);
create index if not exists orders_event_email_idx on public.orders(event_id, lower(email));
create index if not exists orders_event_status_idx on public.orders(event_id, status);
create index if not exists orders_event_bank_reference_idx on public.orders(event_id, lower(bank_reference));

alter table public.orders enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

drop policy if exists "public can create pending orders" on public.orders;
create policy "public can create pending orders" on public.orders for insert to anon, authenticated
with check (status = 'pending');
drop policy if exists "admins can read orders" on public.orders;
create policy "admins can read orders" on public.orders for select to authenticated using (public.is_admin());
drop policy if exists "admins can update orders" on public.orders;
create policy "admins can update orders" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins can read admin list" on public.admins;
create policy "admins can read admin list" on public.admins for select to authenticated using (public.is_admin());

insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false)
on conflict (id) do update set public = false;

drop policy if exists "public can upload receipts" on storage.objects;
create policy "public can upload receipts" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'receipts');
drop policy if exists "admins can read receipts" on storage.objects;
create policy "admins can read receipts" on storage.objects for select to authenticated
using (bucket_id = 'receipts' and public.is_admin());
