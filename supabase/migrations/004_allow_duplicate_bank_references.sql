-- Multiple purchases can share a student's default reference and SLIIT ID.
-- Duplicate references remain visible as an admin warning.
do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    join pg_attribute attr
      on attr.attrelid = rel.oid
     and attr.attnum = con.conkey[1]
    where nsp.nspname = 'public'
      and rel.relname = 'orders'
      and con.contype = 'u'
      and array_length(con.conkey, 1) = 1
      and attr.attname in ('bank_reference', 'ticket_number')
  loop
    execute format('alter table public.orders drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;
