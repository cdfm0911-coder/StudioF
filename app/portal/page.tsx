"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { RequireAuth } from "@/components/Login";
import { Logo } from "@/components/Logo";
import { getSetting, useGym } from "@/lib/store";
import { DEFAULT_WHATSAPP_TEMPLATE, formatMXN, formatDateEs, paymentWhatsAppUrl, todayISO } from "@/lib/utils";
import { fetchForecast, phraseForToday, type ForecastDay } from "@/lib/weather";

export default function PortalPage() {
  const { data, currentUser, bookMember, cancelBooking } = useGym();
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [forecastFailed, setForecastFailed] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const member = currentUser?.memberId ? data.members.find((m) => m.id === currentUser.memberId) : null;
  const assignment = member ? data.assignments.find((a) => a.memberId === member.id && a.active) : null;
  const routine = assignment ? data.routines.find((r) => r.id === assignment.routineId) : null;
  const upcoming = data.classes
    .filter((c) => c.date >= todayISO())
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  useEffect(() => {
    let alive = true;
    fetchForecast().then((days) => {
      if (!alive) return;
      if (days) setForecast(days);
      else setForecastFailed(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  // Código QR del cliente: abre la página de verificación de su mensualidad.
  useEffect(() => {
    if (!member) return;
    let alive = true;
    const url = `${window.location.origin}/verificar?m=${member.id}`;
    QRCode.toDataURL(url, { width: 220, margin: 1 }).then((dataUrl) => {
      if (alive) setQrUrl(dataUrl);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id]);
  // --- Calendario de reserva: dos semanas (esta y la próxima), lunes a domingo,
  // con el día de la semana en cada columna y las horas como filas. ---
  const WEEKDAYS_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const WEEKDAYS_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const parseDay = (iso: string) => new Date(iso + "T12:00:00");
  const toISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDaysISO = (iso: string, n: number) => {
    const d = parseDay(iso);
    d.setDate(d.getDate() + n);
    return toISODate(d);
  };
  const mondayOf = (iso: string) => {
    const d = parseDay(iso);
    const diff = (d.getDay() + 6) % 7; // lunes = 0
    d.setDate(d.getDate() - diff);
    return toISODate(d);
  };
  const weekdayLongEs = (iso: string) => WEEKDAYS_LONG[parseDay(iso).getDay()];
  const weekdayShortEs = (iso: string) => WEEKDAYS_SHORT[parseDay(iso).getDay()];
  const today = todayISO();
  const weeks = [0, 1].map((w) => {
    const monday = addDaysISO(mondayOf(today), w * 7);
    const sunday = addDaysISO(monday, 6);
    const days = Array.from({ length: 7 }, (_, i) => addDaysISO(monday, i));
    const weekClasses = upcoming.filter((c) => c.date >= monday && c.date <= sunday);
    const times = [...new Set(weekClasses.map((c) => c.startTime))].sort();
    return { monday, sunday, days, weekClasses, times, label: w === 0 ? "Esta semana" : "Próxima semana" };
  });
  const payments = member ? data.payments.filter((p) => p.memberId === member.id) : [];
  const progress = member ? data.progress.filter((p) => p.memberId === member.id).sort((a, b) => a.date.localeCompare(b.date)) : [];

  return (
    <RequireAuth roles={["cliente"]}>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-wrap items-center gap-4">
          <Logo size="md" />
          <div>
            <h1 className="text-2xl font-bold">Hola, {member?.name ?? currentUser?.name}</h1>
            <p className="text-sm text-gray-500">Tu portal · Studio Functional Fitness</p>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-xl bg-gray-900 text-white">
          <div className="p-5">
            <p className="text-sm text-gray-300">Bienvenido a Studio Functional Fitness · Jalpan</p>
            <p className="mt-2 text-xl font-semibold leading-snug">“{phraseForToday()}”</p>
          </div>
          <div className="border-t border-gray-700 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Clima en Jalpan · próximos días</p>
            {forecast ? (
              <div className={`mt-3 grid gap-2 text-center ${forecast.length >= 5 ? "grid-cols-5" : "grid-cols-3"}`}>
                {forecast.map((d, i) => (
                  <div key={d.date}>
                    <p className="text-xs capitalize text-gray-300">{i === 0 ? "Hoy" : weekdayShortEs(d.date)}</p>
                    <p className="mt-1 text-2xl">{d.icon}</p>
                    <p className="mt-1 text-sm font-semibold">{d.maxC}° / {d.minC}°</p>
                    <p className="text-[11px] leading-tight text-gray-400">{d.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                {forecastFailed ? "El clima no está disponible por ahora." : "Cargando el clima…"}
              </p>
            )}
          </div>
        </section>

        {member && (
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4 text-center">
            <h2 className="text-lg font-semibold">Mi código QR</h2>
            <p className="mt-1 text-sm text-gray-600">
              Muestra este código a tu entrenador para verificar tu mensualidad.
            </p>
            {qrUrl ? (
              <img src={qrUrl} alt="Código QR de verificación" width={220} height={220} className="mx-auto mt-3" />
            ) : (
              <p className="mt-3 text-sm text-gray-500">Generando código…</p>
            )}
          </section>
        )}

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Mi rutina</h2>
          {!routine ? (
            <p className="mt-2 text-sm text-gray-600">Aún no tienes una rutina asignada. Pregunta a tu entrenador.</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">{routine.name} · {routine.goal}</p>
              {routine.days.map((d) => (
                <div key={d.id} className="mt-3">
                  <h3 className="font-medium">{d.title}</h3>
                  <ul className="mt-1 space-y-1 text-sm text-gray-700">
                    {d.exercises.map((e) => (
                      <li key={e.id}>{e.exerciseName} — {e.sets} series · {e.reps} reps · {e.weight || "sin peso"} · descanso {e.rest || "—"}</li>
                    ))}
                    {d.exercises.length === 0 && <li className="text-gray-500">Sin ejercicios.</li>}
                  </ul>
                </div>
              ))}
            </>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Calendario de clases</h2>
          <p className="mt-1 text-sm text-gray-500">Reserva tu plaza en la tabla: cada columna es un día de la semana.</p>
          {member && member.status !== "activo" && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Tu cuenta está dada de baja. Si quieres volver a entrenar, habla con el gimnasio para reactivarla.
            </p>
          )}
          {upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">No hay clases próximas.</p>
          ) : (
            weeks.map((week) => (
              <div key={week.monday} className="mt-4">
                <h3 className="font-medium">
                  {week.label} · {formatDateEs(week.monday)} – {formatDateEs(week.sunday)}
                </h3>
                {week.weekClasses.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">Sin clases esta semana.</p>
                ) : (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[680px] border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left">Hora</th>
                          {week.days.map((day) => {
                            const isToday = day === today;
                            const isPast = day < today;
                            return (
                              <th
                                key={day}
                                className={`border border-gray-200 px-2 py-2 text-center ${isToday ? "bg-gray-900 text-white" : "bg-gray-50"} ${isPast ? "text-gray-400" : ""}`}
                              >
                                <span className="block font-semibold capitalize">{weekdayLongEs(day)}</span>
                                <span className="block text-xs font-normal">{formatDateEs(day)}</span>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {week.times.map((time) => (
                          <tr key={time}>
                            <td className="border border-gray-200 px-2 py-2 font-medium">{time}</td>
                            {week.days.map((day) => {
                              const c = week.weekClasses.find((x) => x.date === day && x.startTime === time);
                              if (!c) {
                                return (
                                  <td key={day} className="border border-gray-200 px-2 py-2 text-center text-gray-300">
                                    —
                                  </td>
                                );
                              }
                              const booked = member
                                ? data.bookings.some((b) => b.classId === c.id && b.memberId === member.id)
                                : false;
                              const count = data.bookings.filter((b) => b.classId === c.id).length;
                              return (
                                <td key={day} className="border border-gray-200 px-2 py-2 align-top">
                                  <div className="font-medium">{c.title}</div>
                                  <div className="text-xs text-gray-600">
                                    {c.coach} · {count}/{c.capacity}
                                  </div>
                                  {member && booked ? (
                                    <button
                                      onClick={() => cancelBooking(c.id, member.id)}
                                      className="mt-1 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                                    >
                                      Cancelar mi plaza
                                    </button>
                                  ) : (
                                    member && member.status === "activo" && (
                                      <button
                                        onClick={() => bookMember(c.id, member.id)}
                                        disabled={count >= c.capacity}
                                        className="mt-1 rounded-lg bg-gray-900 px-2 py-1 text-xs text-white disabled:opacity-40"
                                      >
                                        Reservar
                                      </button>
                                    )
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Mis pagos</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {payments.map((p) => {
              const url = member && !p.paidDate ? paymentWhatsAppUrl(p, member.name, member.phone, getSetting(data.settings, "whatsapp_template", DEFAULT_WHATSAPP_TEMPLATE), getSetting(data.settings, "whatsapp_number", "")) : null;
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-3">
                  <span>{p.concept} · {formatMXN(p.amountCents)} · vence {formatDateEs(p.dueDate)} · {p.paidDate ? `pagado ${formatDateEs(p.paidDate)}` : "pendiente"}</span>
                  <span className="ml-auto flex items-center gap-2">
                    {url && (
                      <a href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-green-600 px-3 py-1 text-white">WhatsApp</a>
                    )}
                  </span>
                </li>
              );
            })}
            {payments.length === 0 && <li className="text-gray-500">Sin pagos.</li>}
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Mi progreso</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {progress.map((p) => (
              <li key={p.id}>{formatDateEs(p.date)} · {p.weight ? `${p.weight} kg` : ""} · {p.note}</li>
            ))}
            {progress.length === 0 && <li className="text-gray-500">Sin registros todavía.</li>}
          </ul>
        </section>
      </main>
    </RequireAuth>
  );
}
