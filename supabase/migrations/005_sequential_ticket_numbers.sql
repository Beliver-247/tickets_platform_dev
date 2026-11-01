alter table public.orders
add column if not exists ticket_start integer;

update public.orders current_order
set ticket_start = coalesce((
  select 1 + sum(previous_order.qty)
  from public.orders previous_order
  where previous_order.event_id = current_order.event_id
    and previous_order.sliit_id = current_order.sliit_id
    and previous_order.status = 'approved'
    and previous_order.approved_at is not null
    and (
      previous_order.approved_at < current_order.approved_at
      or (
        previous_order.approved_at = current_order.approved_at
        and previous_order.id < current_order.id
      )
    )
), 1)
where current_order.status = 'approved'
  and current_order.ticket_start is null;

update public.orders
set ticket_start = 1
where ticket_start is null;

alter table public.orders
alter column ticket_start set default 1,
alter column ticket_start set not null;
