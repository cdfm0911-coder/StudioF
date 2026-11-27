export type Role = "administrador" | "entrenador" | "cliente";

export interface Member {
  id: number;
  name: string;
  phone: string;
  email: string;
  plan: string;
  goal: string;
  startDate: string;
  status: "activo" | "inactivo";
  notes: string;
}

export interface GymClass {
  id: number;
  title: string;
  type: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMin: number;
  coach: string;
  capacity: number;
  notes: string;
  /** Sesión generada por un horario semanal (no es una fila real en la tabla). */
  virtual?: boolean;
  /** Regla semanal que genera esta sesión, si es virtual. */
  ruleId?: number | null;
}

/** Horario semanal: una clase en serie que se repite cada semana. */
export interface ClassRule {
  id: number;
  title: string;
  type: string;
  days: number[]; // 0=domingo … 6=sábado
  startDate: string; // YYYY-MM-DD, primer día de la serie
  startTime: string; // HH:MM
  durationMin: number;
  coach: string;
  capacity: number;
  notes: string;
  active: boolean;
}

/** Un día cancelado de una serie (no se genera esa sesión). */
export interface ClassRuleSkip {
  id: number;
  ruleId: number;
  date: string; // YYYY-MM-DD
}

export interface Booking {
  id: number;
  classId: number;
  memberId: number;
  attended: boolean | null;
}

export interface Payment {
  id: number;
  memberId: number;
  concept: string;
  amountCents: number;
  dueDate: string; // YYYY-MM-DD
  paidDate: string | null;
  method: string;
}

export interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  description: string;
}

export interface RoutineExercise {
  id: number;
  routineDayId: number;
  exerciseId: number | null;
  exerciseName: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  notes: string;
}

export interface RoutineDay {
  id: number;
  routineId: number;
  title: string;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: number;
  name: string;
  goal: string;
  level: string;
  description: string;
  days: RoutineDay[];
}

export interface Assignment {
  id: number;
  memberId: number;
  routineId: number;
  startDate: string;
  active: boolean;
}

export interface ProgressEntry {
  id: number;
  memberId: number;
  date: string;
  weight: string;
  bodyFat: string;
  note: string;
}

export interface AppUser {
  id: number;
  name: string;
  username: string;
  role: Role;
  memberId: number | null;
  /** En modo demo se guarda el PIN en claro en localStorage (solo para pruebas).
   *  En Supabase se guarda pin_hash. Cambia los PIN de ejemplo al desplegar. */
  pin: string;
}

export interface GymData {
  members: Member[];
  classes: GymClass[];
  bookings: Booking[];
  payments: Payment[];
  exercises: Exercise[];
  routines: Routine[];
  assignments: Assignment[];
  progress: ProgressEntry[];
  users: AppUser[];
  classRules: ClassRule[];
  classRuleSkips: ClassRuleSkip[];
}
