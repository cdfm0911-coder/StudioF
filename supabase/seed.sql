-- Gestión del Gym — datos iniciales (los de la app de Muse, actualizados 2026-11-27
-- con la lista HYROX de noviembre: 22 clientes más y sus pagos de noviembre).
-- Ejecutar DESPUÉS de schema.sql, en el SQL Editor de Supabase.
-- Los IDs se fijan explícitamente para que coincidan con la app original.
-- PINs: NO hay usuarios en esta semilla. Crea el administrador desde la
-- propia app (pantalla "Crea tu cuenta de administrador") y cambia los
-- PIN de ejemplo que pongas. No guardes PIN reales en este archivo.

insert into members (id, name, phone, email, plan, goal, start_date, status, notes) overriding system value values
  (1, 'Carlos', '4426771084', '', 'Mensual', 'Hyrox', '2026-11-25', 'activo', ''),
  (2, 'Camilla Barnes', '+44 7780 663864', '', 'Mensual', 'Spinning', '2026-11-25', 'activo', ''),
  (3, 'Karla Cruz', '4411087068', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 4 · Modalidad: 1 persona'),
  (4, 'Adriana Olvera', '4461486768', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago no registrado · Modalidad: 1 persona · Pago noviembre: pendiente'),
  (5, 'Geraldine Botello', '', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 15 · Modalidad: 1 persona'),
  (6, 'Daniel y su novio', '', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 20 · Modalidad: 1 persona · Solo pago Daniel'),
  (7, 'Alexia Zúñiga', '4981006808', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 4 · Modalidad: 1 persona'),
  (8, 'Luis Flores', '', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 12 · Modalidad: 1 persona'),
  (9, 'Naomi Gonzalez', '4464039859', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 16 · Modalidad: 1 persona'),
  (10, 'Elia Landaverde', '6018625658', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 4 · Modalidad: 1 persona'),
  (11, 'Miriam Rivas', '4411196162', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 4 · Modalidad: 1 persona'),
  (12, 'Brenda Erreguín', '4411090917', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 5 · Modalidad: 1 persona'),
  (13, 'Juanito', '4411007288', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 4 · Modalidad: 1 persona'),
  (14, 'Leyda Sifuentes', '4411033755', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 4 · Modalidad: 1 persona'),
  (15, 'Melissa Anghí', '4411385882', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 11 · Modalidad: 1 persona'),
  (16, 'Nery Sánchez', '4411079487', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 4 · Modalidad: Mensualidad combinada'),
  (17, 'Vanessa Torres', '4272142831', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 21 · Modalidad: 1 persona'),
  (18, 'Lulu Jaso', '4411031136', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 4 · Modalidad: Mensualidad combinada'),
  (19, 'Grecia Suárez y Héctor', '', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 9 · Modalidad: 2 personas'),
  (20, 'Julia Flores', '4411173492', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 17 · Modalidad: 1 persona'),
  (21, 'Bethuli Manrriquez', '4423869958', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 4 · Modalidad: 1 persona'),
  (22, 'Valeria Flores', '4411377682', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago no registrado · Modalidad: 1 persona · Pago noviembre: pagado (día no registrado)'),
  (23, 'Naomi 7 am', '', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 17 · Modalidad: 1 persona'),
  (24, 'Paty Cosino', '', '', 'Mensual', 'Hyrox', NULL, 'activo', 'HYROX · Día de pago: 16 · Modalidad: 1 persona')
on conflict (id) do nothing;

insert into classes (id, title, type, date, start_time, duration_min, coach, capacity, notes) overriding system value values
  (1, 'Hyrox', 'Sesión grupal', '2026-11-27', '18:00', 60, 'Jesus', 12, ''),
  (2, 'Hyrox', 'Sesión grupal', '2026-11-27', '19:00', 60, 'Jesus', 12, ''),
  (3, 'Hyrox', 'Sesión grupal', '2026-11-30', '18:00', 60, 'Jesus', 12, ''),
  (4, 'Hyrox', 'Sesión grupal', '2026-12-01', '18:00', 60, 'Jesus', 12, ''),
  (5, 'Hyrox', 'Sesión grupal', '2026-11-30', '19:00', 60, 'Jesus', 12, ''),
  (6, 'Hyrox', 'Sesión grupal', '2026-11-30', '07:00', 60, 'Jesus', 12, ''),
  (7, 'Hyrox', 'Sesión grupal', '2026-12-01', '07:00', 60, 'Jesus', 12, ''),
  (8, 'Hyrox', 'Sesión grupal', '2026-12-01', '19:00', 60, 'Jesus', 12, ''),
  (9, 'Hyrox', 'Sesión grupal', '2026-12-02', '07:00', 60, 'Jesus', 12, ''),
  (10, 'Hyrox', 'Sesión grupal', '2026-12-02', '18:00', 60, 'Jesus', 12, ''),
  (11, 'Hyrox', 'Sesión grupal', '2026-12-03', '07:00', 60, 'Jesus', 12, ''),
  (12, 'Hyrox', 'Sesión grupal', '2026-12-04', '18:00', 60, 'Jesus', 12, ''),
  (13, 'Hyrox', 'Sesión grupal', '2026-12-03', '19:00', 60, 'Jesus', 12, ''),
  (14, 'Hyrox', 'Sesión grupal', '2026-12-02', '19:00', 60, 'Jesus', 12, ''),
  (15, 'Hyrox', 'Sesión grupal', '2026-12-04', '19:00', 60, 'Jesus', 12, ''),
  (16, 'Hyrox', 'Sesión grupal', '2026-12-03', '18:00', 60, 'Jesus', 12, ''),
  (17, 'Hyrox', 'Sesión grupal', '2026-12-04', '07:00', 60, 'Jesus', 12, '')
on conflict (id) do nothing;

insert into payments (id, member_id, concept, amount_cents, due_date, paid_date, method) overriding system value values
  (1, 1, 'Cuota mensual', 55000, '2026-11-25', null, ''),
  (2, 2, 'Cuota mensual', 55000, '2026-11-25', null, ''),
  (3, 8, 'Cuota mensual', 55000, '2026-11-12', '2026-11-12', ''),
  (4, 6, 'Cuota mensual', 55000, '2026-11-20', '2026-11-20', ''),
  (5, 5, 'Cuota mensual', 55000, '2026-11-15', '2026-11-15', ''),
  (6, 10, 'Cuota mensual', 55000, '2026-11-04', '2026-11-04', ''),
  (7, 7, 'Cuota mensual', 55000, '2026-11-04', '2026-11-04', ''),
  (8, 3, 'Cuota mensual', 55000, '2026-11-04', '2026-11-04', ''),
  (9, 9, 'Cuota mensual', 55000, '2026-11-16', '2026-11-16', ''),
  (10, 13, 'Cuota mensual', 55000, '2026-11-04', '2026-11-04', ''),
  (11, 14, 'Cuota mensual', 55000, '2026-11-04', '2026-11-04', ''),
  (12, 18, 'Cuota mensual', 75000, '2026-11-04', '2026-11-04', ''),
  (13, 17, 'Cuota mensual', 55000, '2026-11-21', '2026-11-21', ''),
  (14, 16, 'Cuota mensual', 75000, '2026-11-04', '2026-11-04', ''),
  (15, 21, 'Cuota mensual', 55000, '2026-11-04', '2026-11-04', ''),
  (16, 11, 'Cuota mensual', 55000, '2026-11-04', '2026-11-04', ''),
  (17, 12, 'Cuota mensual', 55000, '2026-11-05', '2026-11-05', ''),
  (18, 15, 'Cuota mensual', 55000, '2026-11-11', '2026-11-11', ''),
  (19, 24, 'Cuota mensual', 55000, '2026-11-16', '2026-11-16', ''),
  (21, 20, 'Cuota mensual', 55000, '2026-11-17', '2026-11-17', ''),
  (22, 23, 'Cuota mensual', 55000, '2026-11-17', '2026-11-17', ''),
  (23, 19, 'Cuota mensual', 110000, '2026-11-09', '2026-11-09', ''),
  (24, 14, 'Cuota mensual', 55000, '2026-12-04', null, ''),
  (25, 18, 'Cuota mensual', 75000, '2026-12-04', null, ''),
  (26, 10, 'Cuota mensual', 55000, '2026-12-04', null, ''),
  (27, 3, 'Cuota mensual', 55000, '2026-12-04', null, ''),
  (28, 11, 'Cuota mensual', 55000, '2026-12-04', null, ''),
  (29, 16, 'Cuota mensual', 75000, '2026-12-04', null, ''),
  (30, 7, 'Cuota mensual', 55000, '2026-12-04', null, ''),
  (31, 13, 'Cuota mensual', 55000, '2026-12-04', null, ''),
  (32, 12, 'Cuota mensual', 55000, '2026-12-05', null, ''),
  (33, 15, 'Cuota mensual', 55000, '2026-12-11', null, ''),
  (34, 19, 'Cuota mensual', 110000, '2026-12-09', null, ''),
  (35, 9, 'Cuota mensual', 55000, '2026-12-16', null, ''),
  (36, 24, 'Cuota mensual', 55000, '2026-12-16', null, ''),
  (37, 8, 'Cuota mensual', 55000, '2026-12-12', null, ''),
  (38, 21, 'Cuota mensual', 55000, '2026-12-04', null, ''),
  (39, 5, 'Cuota mensual', 55000, '2026-12-15', null, ''),
  (40, 17, 'Cuota mensual', 55000, '2026-12-21', null, ''),
  (41, 6, 'Cuota mensual', 55000, '2026-12-20', null, ''),
  (42, 23, 'Cuota mensual', 55000, '2026-12-17', null, ''),
  (43, 20, 'Cuota mensual', 55000, '2026-12-17', null, '')
on conflict (id) do nothing;
-- El pago 20 (Adriana Olvera, $550, pendiente, sin día de pago registrado) no va
-- aquí porque due_date es NOT NULL en Supabase; créalo en la app cuando sepas el día.
-- Valeria Flores (id 22) pagó noviembre pero sin día registrado: tampoco lleva
-- pago en esta semilla; su estado está en sus notas.

insert into exercises (id, name, category, muscle_group, equipment, description) overriding system value values
  (1, 'Sentadilla con barra', 'Fuerza', 'Piernas', 'Barra y rack', 'Sentadilla completa con barra en la espalda, bajando hasta romper el paralelo.'),
  (2, 'Peso muerto', 'Fuerza', 'Cadena posterior', 'Barra', 'Bisagra de cadera con barra desde el suelo, espalda neutra.'),
  (3, 'Press de banca', 'Fuerza', 'Pecho', 'Barra y banco', 'Press horizontal con barra, controlando la bajada.'),
  (4, 'Press militar', 'Fuerza', 'Hombros', 'Barra o mancuernas', 'Empuje vertical por encima de la cabeza.'),
  (5, 'Dominadas', 'Fuerza', 'Espalda', 'Barra de dominadas', 'Tracción vertical con peso corporal, agarre prono o supino.'),
  (6, 'Remo con barra', 'Fuerza', 'Espalda', 'Barra', 'Tracción horizontal inclinado, barra hacia el abdomen.'),
  (7, 'Zancadas', 'Fuerza', 'Piernas', 'Mancuernas', 'Zancadas alternas o caminando, con o sin carga.'),
  (8, 'Hip thrust', 'Fuerza', 'Glúteos', 'Barra y banco', 'Empuje de cadera con la espalda apoyada en banco.'),
  (9, 'Empuje de trineo (sled push)', 'HYROX', 'Piernas', 'Trineo', 'Empuje de trineo cargado en distancia, estación HYROX.'),
  (10, 'Tirón de trineo (sled pull)', 'HYROX', 'Espalda y piernas', 'Trineo y cuerda', 'Tirón de trineo con cuerda, estación HYROX.'),
  (11, 'Wall balls', 'HYROX', 'Cuerpo completo', 'Balón medicinal', 'Sentadilla y lanzamiento de balón a la diana, estación HYROX.'),
  (12, 'SkiErg', 'HYROX', 'Tren superior', 'SkiErg', 'Distancia en SkiErg, estación HYROX y trabajo cardiovascular.'),
  (13, 'Remo (RowErg)', 'HYROX', 'Cuerpo completo', 'Remo ergómetro', 'Distancia en remo ergómetro, estación HYROX.'),
  (14, 'Farmers carry', 'HYROX', 'Agarre y core', 'Kettlebells o mancuernas', 'Transporte de cargas pesadas en distancia, estación HYROX.'),
  (15, 'Burpee broad jump', 'HYROX', 'Cuerpo completo', 'Peso corporal', 'Burpee con salto hacia adelante, estación HYROX.'),
  (16, 'Sandbag lunges', 'HYROX', 'Piernas', 'Saco de arena', 'Zancadas caminando con saco sobre los hombros, estación HYROX.'),
  (17, 'Carrera continua', 'Cardiovascular', 'Piernas', 'Cinta o exterior', 'Carrera a ritmo constante para base aeróbica.'),
  (18, 'Intervalos de carrera', 'Cardiovascular', 'Piernas', 'Cinta o exterior', 'Series de carrera rápida con recuperación activa.'),
  (19, 'Assault bike', 'Cardiovascular', 'Cuerpo completo', 'Bici de aire', 'Trabajo por calorías o intervalos en bici de aire.'),
  (20, 'Plancha', 'Core', 'Core', 'Peso corporal', 'Isométrico de core en apoyo de antebrazos.'),
  (21, 'Dead hang', 'Core', 'Agarre', 'Barra de dominadas', 'Colgarse de la barra para fuerza de agarre y hombros.'),
  (22, 'Movilidad de cadera', 'Movilidad', 'Cadera', 'Peso corporal', 'Rutina de movilidad y apertura de cadera.')
on conflict (id) do nothing;

-- Horarios semanales (clases en serie): reglas Hyrox lunes a viernes.
-- Las 17 clases sueltas coinciden con estas reglas y no se duplican: la app las fusiona.
insert into class_rules (id, title, type, days, start_date, start_time, duration_min, capacity, coach, notes, active)
overriding system value values
  (1, 'Hyrox', 'Sesión grupal', array[1,2,3,4,5], '2026-11-27', '07:00', 60, 12, 'Jesus', '', true),
  (2, 'Hyrox', 'Sesión grupal', array[1,2,3,4,5], '2026-11-27', '18:00', 60, 12, 'Jesus', '', true),
  (3, 'Hyrox', 'Sesión grupal', array[1,2,3,4,5], '2026-11-27', '19:00', 60, 12, 'Jesus', '', true)
on conflict (id) do nothing;

-- Ajustes: plantilla de WhatsApp, número del gimnasio y links de Mercado Pago.
insert into settings (id, key, value)
overriding system value values
  (1, 'whatsapp_template', 'Hola {nombre}, te recordamos tu pago de Studio Functional Fitness: {concepto} por {importe}, que {vencimiento}. ¿Te ayudamos con algo?'),
  (2, 'whatsapp_number', ''),
  (3, 'mercadopago_550', ''),
  (4, 'mercadopago_750', ''),
  (5, 'mercadopago_1100', '')
on conflict (id) do nothing;

-- Rutinas, asignaciones, reservas y progreso: 0 en la app original, se empieza vacío.
-- Secuencias al día tras insertar IDs fijos:
select setval(pg_get_serial_sequence('members', 'id'), (select max(id) from members));
select setval(pg_get_serial_sequence('classes', 'id'), (select max(id) from classes));
select setval(pg_get_serial_sequence('payments', 'id'), (select max(id) from payments));
select setval(pg_get_serial_sequence('exercises', 'id'), (select max(id) from exercises));
select setval(pg_get_serial_sequence('class_rules', 'id'), coalesce((select max(id) from class_rules), 1));
select setval(pg_get_serial_sequence('class_rule_skips', 'id'), coalesce((select max(id) from class_rule_skips), 1));
select setval(pg_get_serial_sequence('settings', 'id'), coalesce((select max(id) from settings), 1));
