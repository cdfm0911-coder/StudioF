-- Eliminar la serie permanente de Hyrox 7:00 y la clase del viernes 4 dic 2026.
-- Ejecutar en el SQL Editor de Supabase (una sola vez).
-- Desde el 4 dic ya no aparece Hyrox 7 am; las de las 7:00 del 30 nov al 3 dic se quedan,
-- y las de las 18:00 y 19:00 no cambian.
delete from bookings
where class_id in (
  select id from classes
  where title = 'Hyrox' and start_time = '07:00' and date >= '2026-12-04'
);

delete from classes
where title = 'Hyrox' and start_time = '07:00' and date >= '2026-12-04';

delete from class_rule_skips
where rule_id in (
  select id from class_rules
  where title = 'Hyrox' and start_time = '07:00'
);

delete from class_rules
where title = 'Hyrox' and start_time = '07:00';
