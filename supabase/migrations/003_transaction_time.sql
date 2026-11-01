alter table public.orders
add column if not exists transaction_at timestamptz;

update public.orders
set transaction_at = created_at
where transaction_at is null;

alter table public.orders
alter column transaction_at set not null;

create index if not exists orders_event_transaction_at_idx
on public.orders(event_id, transaction_at desc);
