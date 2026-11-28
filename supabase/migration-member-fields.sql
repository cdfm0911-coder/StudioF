-- Datos de cobro por cliente: cuota mensual, día de pago y modalidad.
-- Ejecutar en el SQL Editor de Supabase.
alter table members add column if not exists monthly_fee_cents integer;
alter table members add column if not exists payment_day integer;
alter table members add column if not exists modality text not null default '';

-- Backfill con los datos del Excel HYROX (solo rellena donde aún no hay cuota).
update members set monthly_fee_cents = 55000, payment_day = NULL, modality = '' where id = 1 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = NULL, modality = '' where id = 2 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 4, modality = '1 persona' where id = 3 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = NULL, modality = '1 persona' where id = 4 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 15, modality = '1 persona' where id = 5 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 20, modality = '1 persona' where id = 6 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 4, modality = '1 persona' where id = 7 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 12, modality = '1 persona' where id = 8 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 16, modality = '1 persona' where id = 9 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 4, modality = '1 persona' where id = 10 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 4, modality = '1 persona' where id = 11 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 5, modality = '1 persona' where id = 12 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 4, modality = '1 persona' where id = 13 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 4, modality = '1 persona' where id = 14 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 11, modality = '1 persona' where id = 15 and monthly_fee_cents is null;
update members set monthly_fee_cents = 75000, payment_day = 4, modality = 'Mensualidad combinada' where id = 16 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 21, modality = '1 persona' where id = 17 and monthly_fee_cents is null;
update members set monthly_fee_cents = 75000, payment_day = 4, modality = 'Mensualidad combinada' where id = 18 and monthly_fee_cents is null;
update members set monthly_fee_cents = 110000, payment_day = 9, modality = '2 personas' where id = 19 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 17, modality = '1 persona' where id = 20 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 4, modality = '1 persona' where id = 21 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = NULL, modality = '1 persona' where id = 22 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 17, modality = '1 persona' where id = 23 and monthly_fee_cents is null;
update members set monthly_fee_cents = 55000, payment_day = 16, modality = '1 persona' where id = 24 and monthly_fee_cents is null;
