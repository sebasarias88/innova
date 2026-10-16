-- ═══════════════════════════════════════════════════════════════════════
-- 11 · Booking: manual confirmation and 2-hour visits
--   Owners confirm every booking by WhatsApp. Workday 8 a. m. – 5 p. m.:
--   visits of 2 hours (8–10, 10–12, 2–4).
-- ═══════════════════════════════════════════════════════════════════════
alter table public.booking_settings alter column auto_confirm set default false;
update public.booking_settings set auto_confirm = false where id = 1;

alter table public.availability_rules alter column slot_minutes set default 120;
alter table public.availability_exceptions alter column slot_minutes set default 120;
update public.availability_rules set slot_minutes = 120 where start_time = time '08:00' and end_time = time '12:00';
update public.availability_rules set slot_minutes = 120, end_time = time '16:00' where start_time = time '14:00' and end_time = time '18:00';
