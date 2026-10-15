-- ═══════════════════════════════════════════════════════════════════════
-- 09 · Admin updates on orders
--   When the admin sets the agreed shipping cost ("a convenir"), the total is
--   recalculated in the database. Online (Wompi) or paid orders keep their
--   amount: it is the one sent to the payment gateway.
-- ═══════════════════════════════════════════════════════════════════════
create or replace function private.orders_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.shipping_cost is distinct from old.shipping_cost then
    if old.payment_method = 'wompi' or old.payment_status = 'approved' then
      raise exception 'paid_order_amount_locked' using errcode = '23514';
    end if;
    new.total := new.subtotal + coalesce(new.shipping_cost, 0);
  end if;
  return new;
end;
$$;
revoke all on function private.orders_before_update() from public, anon, authenticated;

create trigger orders_recalculate_total
  before update of shipping_cost on public.orders
  for each row execute function private.orders_before_update();
