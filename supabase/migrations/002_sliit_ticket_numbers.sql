alter table public.orders add column if not exists sliit_id text;
alter table public.orders add column if not exists checked_in_tickets integer[] not null default '{}';

create index if not exists orders_event_sliit_id_idx on public.orders(event_id, lower(sliit_id));

update public.orders
set ticket_number = sliit_id
where sliit_id is not null
  and (ticket_number is null or ticket_number !~ '^[A-Za-z]{2}[0-9]{8}$');
