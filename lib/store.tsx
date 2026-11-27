"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SEED_DATA } from "./seed";
import { getSupabase, hasSupabase } from "./supabaseClient";
import {
  AppUser,
  Assignment,
  Booking,
  Exercise,
  GymClass,
  GymData,
  Member,
  Payment,
  ProgressEntry,
  Routine,
  RoutineDay,
  RoutineExercise,
} from "./types";

const STORAGE_KEY = "gestion-del-gym-v1";
const SESSION_KEY = "gestion-del-gym-session";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function nextId(items: { id: number }[]): number {
  return items.reduce((m, i) => Math.max(m, i.id), 0) + 1;
}

interface GymContextValue {
  data: GymData;
  loading: boolean;
  mode: "supabase" | "demo";
  currentUser: AppUser | null;
  login: (username: string, pin: string) => string | null;
  logout: () => void;
  setupAdmin: (name: string, username: string, pin: string) => string | null;
  createUser: (u: Omit<AppUser, "id">) => string | null;
  updateUser: (u: AppUser) => void;
  deleteUser: (id: number) => void;
  saveMember: (m: Member) => void;
  deleteMember: (id: number) => void;
  saveClass: (c: GymClass) => void;
  deleteClass: (id: number) => void;
  bookMember: (classId: number, memberId: number) => void;
  cancelBooking: (classId: number, memberId: number) => void;
  setAttendance: (bookingId: number, attended: boolean | null) => void;
  savePayment: (p: Payment) => void;
  deletePayment: (id: number) => void;
  markPaid: (id: number) => void;
  saveExercise: (e: Exercise) => void;
  deleteExercise: (id: number) => void;
  saveRoutine: (r: Routine) => void;
  deleteRoutine: (id: number) => void;
  addRoutineDay: (routineId: number, title: string) => void;
  deleteRoutineDay: (routineId: number, dayId: number) => void;
  addRoutineExercise: (routineId: number, dayId: number, ex: Omit<RoutineExercise, "id" | "routineDayId">) => void;
  deleteRoutineExercise: (routineId: number, dayId: number, exId: number) => void;
  assignRoutine: (memberId: number, routineId: number) => void;
  removeAssignment: (id: number) => void;
  saveProgress: (p: ProgressEntry) => void;
  deleteProgress: (id: number) => void;
}

const GymContext = createContext<GymContextValue | null>(null);

export function useGym(): GymContextValue {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym debe usarse dentro de GymProvider");
  return ctx;
}

// --- Mapeo Supabase <-> tipos (las tablas usan snake_case) ---
function fromDbRow(table: string, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = v;
  }
  if (table === "payments") {
    out.amountCents = (row as { amount_cents?: number }).amount_cents ?? 0;
  }
  if (table === "app_users") {
    out.pin = (row as { pin_hash?: string }).pin_hash ?? "";
  }
  return out;
}

function toDbRow(table: string, item: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(item)) {
    if (k === "days" || k === "exercises") continue;
    const snake = k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
    out[snake] = v;
  }
  if (table === "payments") {
    out.amount_cents = (item as { amountCents?: number }).amountCents ?? 0;
    delete out.amount_cents;
  }
  if (table === "app_users") {
    // Demo: se guarda el PIN como pin_hash (hash real en producción: ver README).
    out.pin_hash = (item as { pin?: string }).pin ?? "";
    delete out.pin;
  }
  if (table === "routines") {
    out.days = (item as { days?: unknown }).days ?? [];
  }
  return out;
}

const TABLES: (keyof GymData)[] = [
  "members",
  "classes",
  "bookings",
  "payments",
  "exercises",
  "routines",
  "assignments",
  "progress",
  "users",
];
const TABLE_NAME: Record<keyof GymData, string> = {
  members: "members",
  classes: "classes",
  bookings: "bookings",
  payments: "payments",
  exercises: "exercises",
  routines: "routines",
  assignments: "assignments",
  progress: "progress",
  users: "app_users",
};

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<GymData>(() => clone(SEED_DATA));
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const mode: "supabase" | "demo" = hasSupabase ? "supabase" : "demo";

  // Carga inicial
  useEffect(() => {
    async function load() {
      // Sesión guardada
      try {
        const rawSession = localStorage.getItem(SESSION_KEY);
        if (rawSession) {
          const parsed = JSON.parse(rawSession) as AppUser;
          setCurrentUser(parsed);
        }
      } catch {
        /* sin sesión */
      }
      const sb = getSupabase();
      if (!sb) {
        // Modo demo: localStorage o semilla
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as GymData;
            if (parsed && Array.isArray(parsed.members)) setData(parsed);
          }
        } catch {
          /* semilla */
        }
        setLoading(false);
        return;
      }
      try {
        const loaded: Partial<GymData> = {};
        for (const key of TABLES) {
          const { data: rows, error } = await sb.from(TABLE_NAME[key]).select("*").order("id");
          if (error) throw error;
          loaded[key] = (rows || []).map((r) => fromDbRow(TABLE_NAME[key], r as Record<string, unknown>)) as never;
        }
        // Si Supabase está vacío y es la primera vez, sembrar desde los datos iniciales
        const empty = (loaded.members as Member[] | undefined)?.length === 0;
        if (empty) {
          setData(clone(SEED_DATA));
        } else {
          setData((prev) => ({ ...prev, ...(loaded as GymData) }));
        }
      } catch (e) {
        console.warn("No se pudo cargar Supabase, usando modo local:", e);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistencia en modo demo
  useEffect(() => {
    if (loading || mode !== "demo") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* almacenamiento lleno */
    }
  }, [data, loading, mode]);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* sin storage */
    }
  }, [currentUser]);

  async function syncRow(table: keyof GymData, item: Record<string, unknown>, deleted = false) {
    const sb = getSupabase();
    if (!sb) return;
    try {
      if (deleted) {
        await sb.from(TABLE_NAME[table]).delete().eq("id", item.id as number);
      } else {
        const row = toDbRow(TABLE_NAME[table], item);
        await sb.from(TABLE_NAME[table]).upsert(row);
      }
    } catch (e) {
      console.warn("Sync Supabase falló (se guarda en local):", e);
    }
  }

  function update<K extends keyof GymData>(key: K, fn: (items: GymData[K]) => GymData[K]) {
    setData((prev) => {
      const next = { ...prev, [key]: fn(prev[key]) };
      return next;
    });
  }

  const value: GymContextValue = useMemo(() => {
    const login = (username: string, pin: string): string | null => {
      const user = data.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
      if (!user || user.pin !== pin) return "Usuario o PIN incorrectos";
      setCurrentUser(user);
      return null;
    };
    const logout = () => setCurrentUser(null);
    const setupAdmin = (name: string, username: string, pin: string): string | null => {
      if (data.users.some((u) => u.role === "administrador")) return "Ya existe una cuenta de administrador";
      if (data.users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase()))
        return "Ese usuario ya existe";
      if (pin.length < 4) return "El PIN debe tener al menos 4 dígitos";
      const admin: AppUser = { id: nextId(data.users), name, username: username.trim(), role: "administrador", memberId: null, pin };
      update("users", (items) => [...items, admin]);
      void syncRow("users", admin as unknown as Record<string, unknown>);
      setCurrentUser(admin);
      return null;
    };
    const createUser = (u: Omit<AppUser, "id">): string | null => {
      if (data.users.some((x) => x.username.toLowerCase() === u.username.trim().toLowerCase()))
        return "Ese usuario ya existe";
      const user: AppUser = { ...u, id: nextId(data.users), username: u.username.trim() };
      update("users", (items) => [...items, user]);
      void syncRow("users", user as unknown as Record<string, unknown>);
      return null;
    };
    const updateUser = (u: AppUser) => {
      update("users", (items) => items.map((x) => (x.id === u.id ? u : x)));
      void syncRow("users", u as unknown as Record<string, unknown>);
    };
    const deleteUser = (id: number) => {
      const u = data.users.find((x) => x.id === id);
      if (u?.role === "administrador") return;
      update("users", (items) => items.filter((x) => x.id !== id));
      if (u) void syncRow("users", u as unknown as Record<string, unknown>, true);
    };
    const saveMember = (m: Member) => {
      const item = m.id ? m : { ...m, id: nextId(data.members) };
      update("members", (items) => (m.id ? items.map((x) => (x.id === m.id ? item : x)) : [...items, item]));
      void syncRow("members", item as unknown as Record<string, unknown>);
    };
    const deleteMember = (id: number) => {
      update("members", (items) => items.filter((x) => x.id !== id));
      update("payments", (items) => items.filter((x) => x.memberId !== id));
      update("bookings", (items) => items.filter((x) => x.memberId !== id));
      update("assignments", (items) => items.filter((x) => x.memberId !== id));
      update("progress", (items) => items.filter((x) => x.memberId !== id));
      void syncRow("members", { id } as Record<string, unknown>, true);
    };
    const saveClass = (c: GymClass) => {
      const item = c.id ? c : { ...c, id: nextId(data.classes) };
      update("classes", (items) => (c.id ? items.map((x) => (x.id === c.id ? item : x)) : [...items, item]));
      void syncRow("classes", item as unknown as Record<string, unknown>);
    };
    const deleteClass = (id: number) => {
      update("classes", (items) => items.filter((x) => x.id !== id));
      update("bookings", (items) => items.filter((x) => x.classId !== id));
      void syncRow("classes", { id } as Record<string, unknown>, true);
    };
    const bookMember = (classId: number, memberId: number) => {
      const cls = data.classes.find((c) => c.id === classId);
      if (!cls) return;
      const booked = data.bookings.filter((b) => b.classId === classId).length;
      if (booked >= cls.capacity) return;
      if (data.bookings.some((b) => b.classId === classId && b.memberId === memberId)) return;
      const b: Booking = { id: nextId(data.bookings), classId, memberId, attended: null };
      update("bookings", (items) => [...items, b]);
      void syncRow("bookings", b as unknown as Record<string, unknown>);
    };
    const cancelBooking = (classId: number, memberId: number) => {
      const b = data.bookings.find((x) => x.classId === classId && x.memberId === memberId);
      update("bookings", (items) => items.filter((x) => !(x.classId === classId && x.memberId === memberId)));
      if (b) void syncRow("bookings", b as unknown as Record<string, unknown>, true);
    };
    const setAttendance = (bookingId: number, attended: boolean | null) => {
      update("bookings", (items) => items.map((x) => (x.id === bookingId ? { ...x, attended } : x)));
      const b = data.bookings.find((x) => x.id === bookingId);
      if (b) void syncRow("bookings", { ...b, attended } as unknown as Record<string, unknown>);
    };
    const savePayment = (p: Payment) => {
      const item = p.id ? p : { ...p, id: nextId(data.payments) };
      update("payments", (items) => (p.id ? items.map((x) => (x.id === p.id ? item : x)) : [...items, item]));
      void syncRow("payments", item as unknown as Record<string, unknown>);
    };
    const deletePayment = (id: number) => {
      update("payments", (items) => items.filter((x) => x.id !== id));
      void syncRow("payments", { id } as Record<string, unknown>, true);
    };
    const markPaid = (id: number) => {
      const today = new Date().toISOString().slice(0, 10);
      update("payments", (items) => items.map((x) => (x.id === id ? { ...x, paidDate: today } : x)));
      const p = data.payments.find((x) => x.id === id);
      if (p) void syncRow("payments", { ...p, paidDate: today } as unknown as Record<string, unknown>);
    };
    const saveExercise = (e: Exercise) => {
      const item = e.id ? e : { ...e, id: nextId(data.exercises) };
      update("exercises", (items) => (e.id ? items.map((x) => (x.id === e.id ? item : x)) : [...items, item]));
      void syncRow("exercises", item as unknown as Record<string, unknown>);
    };
    const deleteExercise = (id: number) => {
      update("exercises", (items) => items.filter((x) => x.id !== id));
      void syncRow("exercises", { id } as Record<string, unknown>, true);
    };
    const saveRoutine = (r: Routine) => {
      const item = r.id ? r : { ...r, id: nextId(data.routines) };
      update("routines", (items) => (r.id ? items.map((x) => (x.id === r.id ? item : x)) : [...items, item]));
      void syncRow("routines", item as unknown as Record<string, unknown>);
    };
    const deleteRoutine = (id: number) => {
      update("routines", (items) => items.filter((x) => x.id !== id));
      update("assignments", (items) => items.filter((x) => x.routineId !== id));
      void syncRow("routines", { id } as Record<string, unknown>, true);
    };
    const addRoutineDay = (routineId: number, title: string) => {
      update("routines", (items) =>
        items.map((r) => {
          if (r.id !== routineId) return r;
          const dayId = r.days.reduce((m, d) => Math.max(m, d.id), 0) + 1;
          const day: RoutineDay = { id: dayId, routineId, title, exercises: [] };
          const next = { ...r, days: [...r.days, day] };
          void syncRow("routines", next as unknown as Record<string, unknown>);
          return next;
        }),
      );
    };
    const deleteRoutineDay = (routineId: number, dayId: number) => {
      update("routines", (items) =>
        items.map((r) => {
          if (r.id !== routineId) return r;
          const next = { ...r, days: r.days.filter((d) => d.id !== dayId) };
          void syncRow("routines", next as unknown as Record<string, unknown>);
          return next;
        }),
      );
    };
    const addRoutineExercise = (routineId: number, dayId: number, ex: Omit<RoutineExercise, "id" | "routineDayId">) => {
      update("routines", (items) =>
        items.map((r) => {
          if (r.id !== routineId) return r;
          const next = {
            ...r,
            days: r.days.map((d) => {
              if (d.id !== dayId) return d;
              const exId = d.exercises.reduce((m, e) => Math.max(m, e.id), 0) + 1;
              return { ...d, exercises: [...d.exercises, { ...ex, id: exId, routineDayId: dayId }] };
            }),
          };
          void syncRow("routines", next as unknown as Record<string, unknown>);
          return next;
        }),
      );
    };
    const deleteRoutineExercise = (routineId: number, dayId: number, exId: number) => {
      update("routines", (items) =>
        items.map((r) => {
          if (r.id !== routineId) return r;
          const next = {
            ...r,
            days: r.days.map((d) => (d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) } : d)),
          };
          void syncRow("routines", next as unknown as Record<string, unknown>);
          return next;
        }),
      );
    };
    const assignRoutine = (memberId: number, routineId: number) => {
      const today = new Date().toISOString().slice(0, 10);
      update("assignments", (items) => [
        ...items.map((a) => (a.memberId === memberId ? { ...a, active: false } : a)),
        { id: nextId(data.assignments), memberId, routineId, startDate: today, active: true },
      ]);
    };
    const removeAssignment = (id: number) => {
      update("assignments", (items) => items.filter((x) => x.id !== id));
      void syncRow("assignments", { id } as Record<string, unknown>, true);
    };
    const saveProgress = (p: ProgressEntry) => {
      const item = p.id ? p : { ...p, id: nextId(data.progress) };
      update("progress", (items) => (p.id ? items.map((x) => (x.id === p.id ? item : x)) : [...items, item]));
      void syncRow("progress", item as unknown as Record<string, unknown>);
    };
    const deleteProgress = (id: number) => {
      update("progress", (items) => items.filter((x) => x.id !== id));
      void syncRow("progress", { id } as Record<string, unknown>, true);
    };

    return {
      data,
      loading,
      mode,
      currentUser,
      login,
      logout,
      setupAdmin,
      createUser,
      updateUser,
      deleteUser,
      saveMember,
      deleteMember,
      saveClass,
      deleteClass,
      bookMember,
      cancelBooking,
      setAttendance,
      savePayment,
      deletePayment,
      markPaid,
      saveExercise,
      deleteExercise,
      saveRoutine,
      deleteRoutine,
      addRoutineDay,
      deleteRoutineDay,
      addRoutineExercise,
      deleteRoutineExercise,
      assignRoutine,
      removeAssignment,
      saveProgress,
      deleteProgress,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading, currentUser]);

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}
