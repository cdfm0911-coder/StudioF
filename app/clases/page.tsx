"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/Login";
import { useGym } from "@/lib/store";
import { GymClass } from "@/lib/types";
import { todayISO } from "@/lib/utils";

function weekDates(): string[] {
  const out: string[] = [];
  const d = new Date(todayISO() + "T12:00:00");
  // Semana: hoy + 6 días
  for (let i = 0; i < 7; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

export default function ClasesPage() {
  const { data, saveClass, deleteClass, bookMember, cancelBooking, setAttendance, currentUser } = useGym();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("18:00");
  const [coach, setCoach] = useState("");
  const [capacity, setCapacity] = useState(12);
  const [bookMemberId, setBookMemberId] = useState("");

  const days = weekDates();
  const isAdmin = currentUser?.role === "administrador";

  return (
    <RequireAuth roles={["administrador", "entrenador"]}>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Clases</h1>
        <p className="mt-1 text-sm text-gray-500">Vista semanal · plazas, reservas y asistencia.</p>

        <form
          className="mt-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            saveClass({
              id: 0,
              title: title.trim(),
              type: "Sesión grupal",
              date,
              startTime,
              durationMin: 60,
              coach: coach.trim() || "—",
              capacity,
              notes: "",
            } as GymClass);
            setTitle("");
          }}
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (p. ej. Hyrox)" className="rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2" required />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" required />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" required />
          <input value={coach} onChange={(e) => setCoach(e.target.value)} placeholder="Entrenador" className="rounded-lg border border-gray-300 px-3 py-2" />
          <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-2" aria-label="Capacidad" />
          <button className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white">Crear clase</button>
        </form>

        <div className="mt-6 space-y-4">
          {days.map((day) => {
            const classes = data.classes.filter((c) => c.date === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
            return (
              <section key={day} className="rounded-xl border border-gray-200 bg-white p-4">
                <h2 className="font-semibold">
                  {new Date(day + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" })}
                </h2>
                {classes.length === 0 ? (
                  <p className="mt-1 text-sm text-gray-500">Sin clases.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {classes.map((c) => {
                      const bookings = data.bookings.filter((b) => b.classId === c.id);
                      return (
                        <li key={c.id} className="rounded-lg border border-gray-100 p-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-medium">{c.title}</span>
                            <span className="text-sm text-gray-600">
                              {c.startTime} · {c.durationMin} min · {c.coach} · {bookings.length}/{c.capacity}
                            </span>
                            {isAdmin && (
                              <button onClick={() => deleteClass(c.id)} className="ml-auto text-sm text-red-600 hover:underline">
                                Eliminar
                              </button>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <select
                              value={bookMemberId}
                              onChange={(e) => setBookMemberId(e.target.value)}
                              className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                            >
                              <option value="">Reservar cliente…</option>
                              {data.members.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => bookMemberId && bookMember(c.id, Number(bookMemberId))}
                              className="rounded-lg bg-gray-900 px-3 py-1 text-sm text-white"
                            >
                              Reservar
                            </button>
                          </div>
                          {bookings.length > 0 && (
                            <ul className="mt-2 space-y-1 text-sm">
                              {bookings.map((b) => {
                                const m = data.members.find((x) => x.id === b.memberId);
                                return (
                                  <li key={b.id} className="flex flex-wrap items-center gap-2">
                                    <span>{m?.name ?? "Cliente"}</span>
                                    <span className="text-gray-500">
                                      {b.attended === true ? "· Asistió" : b.attended === false ? "· Faltó" : "· Sin marcar"}
                                    </span>
                                    <button onClick={() => setAttendance(b.id, true)} className="text-green-700 underline">Asistió</button>
                                    <button onClick={() => setAttendance(b.id, false)} className="text-red-700 underline">Faltó</button>
                                    <button onClick={() => cancelBooking(c.id, b.memberId)} className="text-gray-500 underline">Cancelar reserva</button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </RequireAuth>
  );
}
