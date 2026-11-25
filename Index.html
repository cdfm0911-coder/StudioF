-- Gestión del Gym — Studio Functional Fitness
-- Esquema para Supabase (Postgres). Ejecutar en el SQL Editor de Supabase.
-- Orden: tablas base primero, luego las que referencian.

create table if not exists members (
  id bigint generated always as identity primary key,
  name text not null,
  phone text not null default '',
  email text not null default '',
  plan text not null default 'Mensual',
  goal text not null default '',
  start_date date,
  status text not null default 'activo' check (status in ('activo', 'inactivo')),
  notes text not null default ''
);

create table if not exists exercises (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null default '',
  muscle_group text not null default '',
  equipment text not null default '',
  description text not null default ''
);

create table if not exists classes (
  id bigint generated always as identity primary key,
  title text not null,
  type text not null default 'Sesión grupal',
  date date not null,
  start_time text not null,
  duration_min integer not null default 60,
  coach text not null default '',
  capacity integer not null default 12,
  notes text not null default ''
);

create table if not exists bookings (
  id bigint generated always as identity primary key,
  class_id bigint not null references classes(id) on delete cascade,
  member_id bigint not null references members(id) on delete cascade,
  attended boolean,
  unique (class_id, member_id)
);

create table if not exists payments (
  id bigint generated always as identity primary key,
  member_id bigint not null references members(id) on delete cascade,
  concept text not null,
  amount_cents integer not null default 0,
  due_date date not null,
  paid_date date,
  method text not null default ''
);

-- Las rutinas guardan sus días y ejercicios en JSONB para mantener
-- la estructura anidada (days -> exercises) sin joins complejos.
create table if not exists routines (
  id bigint generated always as identity primary key,
  name text not null,
  goal text not null default '',
  level text not null default 'Intermedio',
  description text not null default '',
  days jsonb not null default '[]'::jsonb
);

create table if not exists assignments (
  id bigint generated always as identity primary key,
  member_id bigint not null references members(id) on delete cascade,
  routine_id bigint not null references routines(id) on delete cascade,
  start_date date,
  active boolean not null default true
);

create table if not exists progress (
  id bigint generated always as identity primary key,
  member_id bigint not null references members(id) on delete cascade,
  date date not null,
  weight text not null default '',
  body_fat text not null default '',
  note text not null default ''
);

create table if not exists app_users (
  id bigint generated always as identity primary key,
  name text not null,
  username text not null unique,
  role text not null check (role in ('administrador', 'entrenador', 'cliente')),
  member_id bigint references members(id) on delete set null,
  pin_hash text not null default ''
);

-- Row Level Security: activado. Las políticas siguientes son PERMISIVAS
-- (la app filtra por rol en la interfaz, como en la versión de Muse).
-- Para producción, sustitúyelas por políticas ligadas a Supabase Auth
-- (auth.uid()) y no uses la anon key para escribir.
alter table members enable row level security;
alter table exercises enable row level security;
alter table classes enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table routines enable row level security;
alter table assignments enable row level security;
alter table progress enable row level security;
alter table app_users enable row level security;

do $$
declare t text;
begin
  foreach t in array['members','exercises','classes','bookings','payments','routines','assignments','progress','app_users'] loop
    execute format('create policy "acceso app" on %I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;
