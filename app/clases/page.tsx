"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/Login";
import { useGym } from "@/lib/store";
import { GymClass } from "@/lib/types";
import { formatDateEs, todayISO } from "@/lib/utils";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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
  const { data, saveClass, deleteClass, saveClassRule, deleteClassRule, restoreClassDay, setClassCoach, setRuleCoach, bookMember, cancelBooking, setAttendance, currentUser } = useGym();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("18:00");
  const [coach, setCoach] = useState("");
  const [capacity, setCapacity] = useState(12);
  const [bookMemberId, setBookMemberId] = useState("");
  const [isSeries, setIsSeries] = useState(false);
  const [seriesDays, setSeriesDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [editingCoachId, setEditingCoachId] = useState<number | null>(null);
  const [coachDraft, setCoachDraft] = useState("");
  const [coachScope, setCoachScope] = useState<"single" | "series">("single");
  const [editingRuleCoachId, setEditingRuleCoachId] = useState<number | null>(null);
  const [ruleCoachDraft, setRuleCoachDraft] = useState("");

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
            if (isSeries) {
              if (seriesDays.length === 0) return;
              saveClassRule({
                id: 0,
                title: title.trim(),
                type: "Sesión grupal",
                days: [...seriesDays].sort((a, b) => a - b),
                startDate: date,
                startTime,
                durationMin: 60,
                coach: coach.trim() || "—",
                capacity,
                notes: "",
                active: true,
              });
            } else {
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
            }
            setTitle("");
          }}
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (p. ej. Hyrox)" className="rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2" required />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" required />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" required />
          <input value={coach} onChange={(e) => setCoach(e.target.value)} placeholder="Entrenador" className="rounded-lg border border-gray-300 px-3 py-2" />
          <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-2" aria-label="Capacidad" />
          <div className="flex flex-wrap items-center gap-2 sm:col-span-6">
            <span className="text-sm font-medium">Repetir:</span>
            <button type="button" onClick={() => setIsSeries(false)} className={`rounded-full px-3 py-1 text-sm ${!isSeries ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>Solo este día</button>
            <button type="button" onClick={() => setIsSeries(true)} className={`rounded-full px-3 py-1 text-sm ${isSeries ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>En serie · cada semana</button>
            {isSeries && (
              <>
                <span className="flex flex-wrap items-center gap-1">
                  {DAY_NAMES.map((name, d) => (
                    <label key={d} className={`cursor-pointer rounded-full px-2 py-1 text-xs ${seriesDays.includes(d) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                      <input
                        type="checkbox"
                        checked={seriesDays.includes(d)}
                        onChange={() =>
                          setSeriesDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
                        }
                        className="hidden"
                      />
                      {name}
                    </label>
                  ))}
                </span>
                <span className="text-xs text-gray-500">Empieza el día elegido y se repite cada semana.</span>
              </>
            )}
          </div>
          <button className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white">{isSeries ? "Crear serie" : "Crear clase"}</button>
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
                            {c.virtual && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Semanal</span>
                            )}
                            <span className="text-sm text-gray-600">
                              {c.startTime} · {c.durationMin} min · {c.coach} · {bookings.length}/{c.capacity}
                            </span>
                            {isAdmin && editingCoachId !== c.id && (
                              <button onClick={() => { setEditingCoachId(c.id); setCoachDraft(c.coach); setCoachScope("single"); }} className="text-sm text-blue-700 hover:underline">
                                Cambiar entrenador
                              </button>
                            )}
                            {isAdmin && (
                              <button onClick={() => deleteClass(c.id)} className="ml-auto text-sm text-red-600 hover:underline">
                                {c.virtual ? "Cancelar este día" : "Eliminar"}
                              </button>
                            )}
                          </div>
                          {isAdmin && editingCoachId === c.id && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <input value={coachDraft} onChange={(e) => setCoachDraft(e.target.value)} placeholder="Nombre del entrenador" className="rounded-lg border border-gray-300 px-2 py-1 text-sm" />
                              {c.virtual && (
                                <span className="flex items-center gap-1">
                                  <button type="button" onClick={() => setCoachScope("single")} className={`rounded-full px-2 py-1 text-xs ${coachScope === "single" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>Solo esta clase</button>
                                  <button type="button" onClick={() => setCoachScope("series")} className={`rounded-full px-2 py-1 text-xs ${coachScope === "series" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}>Toda la serie</button>
                                </span>
                              )}
                              <button onClick={() => { if (c.virtual && coachScope === "series" && c.ruleId != null) setRuleCoach(c.ruleId, coachDraft); else setClassCoach(c.id, coachDraft); setEditingCoachId(null); }} className="rounded-lg bg-gray-900 px-3 py-1 text-sm text-white">Guardar</button>
                              <button onClick={() => setEditingCoachId(null)} className="text-sm text-gray-500 underline">Cancelar</button>
                              {c.virtual && coachScope === "single" && <span className="text-xs text-gray-500">Solo cambia este día; la serie sigue igual.</span>}
                              {c.virtual && coachScope === "series" && <span className="text-xs text-gray-500">Cambia el entrenador de toda la serie.</span>}
                            </div>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <select
                              value={bookMemberId}
                              onChange={(e) => setBookMemberId(e.target.value)}
                              className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                            >
                              <option value="">Reservar cliente…</option>
                              {data.members.filter((m) => m.status === "activo").map((m) => (
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

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Horarios semanales</h2>
          <p className="mt-1 text-sm text-gray-500">Clases en serie: se repiten cada semana hasta que se elimine la serie.</p>
          {data.classRules.filter((r) => r.active).length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No hay horarios semanales.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {data.classRules
                .filter((r) => r.active)
                .map((rule) => {
                  const skips = data.classRuleSkips.filter((s) => s.ruleId === rule.id);
                  return (
                    <li key={rule.id} className="rounded-lg border border-gray-100 p-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-medium">{rule.title}</span>
                        <span className="text-sm text-gray-600">
                          {rule.days.map((d) => DAY_NAMES[d]).join(" · ")} · {rule.startTime} · {rule.durationMin} min ·{" "}
                          {rule.coach} · {rule.capacity} plazas · desde {formatDateEs(rule.startDate)}
                        </span>
                        {isAdmin && editingRuleCoachId !== rule.id && (
                          <button onClick={() => { setEditingRuleCoachId(rule.id); setRuleCoachDraft(rule.coach); }} className="text-sm text-blue-700 hover:underline">
                            Cambiar entrenador
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => deleteClassRule(rule.id)} className="ml-auto text-sm text-red-600 hover:underline">
                            Eliminar serie
                          </button>
                        )}
                      </div>
                      {isAdmin && editingRuleCoachId === rule.id && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <input value={ruleCoachDraft} onChange={(e) => setRuleCoachDraft(e.target.value)} placeholder="Nombre del entrenador" className="rounded-lg border border-gray-300 px-2 py-1 text-sm" />
                          <button onClick={() => { setRuleCoach(rule.id, ruleCoachDraft); setEditingRuleCoachId(null); }} className="rounded-lg bg-gray-900 px-3 py-1 text-sm text-white">Guardar</button>
                          <button onClick={() => setEditingRuleCoachId(null)} className="text-sm text-gray-500 underline">Cancelar</button>
                          <span className="text-xs text-gray-500">Cambia el entrenador de toda la serie.</span>
                        </div>
                      )}
                      {skips.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                          Días cancelados:{" "}
                          {skips.map((s) => (
                            <span key={s.id} className="mr-2 inline-flex items-center gap-1">
                              {formatDateEs(s.date)}
                              {isAdmin && (
                                <button onClick={() => restoreClassDay(rule.id, s.date)} className="text-blue-700 underline">
                                  Restaurar
                                </button>
                              )}
                            </span>
                          ))}
                        </p>
                      )}
                    </li>
                  );
                })}
            </ul>
          )}
        </section>
      </main>
    </RequireAuth>
  );
}
