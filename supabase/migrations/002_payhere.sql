alter table public.orders
  alter column bank_reference drop not null,
  alter column receipt_path drop not null;

alter table public.orders
  add column if not exists payment_method text not null default 'bank_transfer'
    check (payment_method in ('bank_transfer', 'payhere')),
  add column if not exists payment_amount text;

create index if not exists orders_payment_method_idx on public.orders(payment_method);
