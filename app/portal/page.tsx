"use client";

import { RequireAuth } from "@/components/Login";
import { Logo } from "@/components/Logo";
import { useGym } from "@/lib/store";
import { formatMXN, formatDateEs, paymentWhatsAppUrl, todayISO } from "@/lib/utils";

export default function PortalPage() {
  const { data, currentUser, bookMember, cancelBooking } = useGym();
  const member = currentUser?.memberId ? data.members.find((m) => m.id === currentUser.memberId) : null;
  const assignment = member ? data.assignments.find((a) => a.memberId === member.id && a.active) : null;
  const routine = assignment ? data.routines.find((r) => r.id === assignment.routineId) : null;
  const upcoming = data.classes
    .filter((c) => c.date >= todayISO())
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
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
          <h2 className="text-lg font-semibold">Próximas clases</h2>
          {upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">No hay clases próximas.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcoming.map((c) => {
                const booked = member ? data.bookings.some((b) => b.classId === c.id && b.memberId === member.id) : false;
                const count = data.bookings.filter((b) => b.classId === c.id).length;
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium">{c.title}</span>
                    <span className="text-gray-600">{formatDateEs(c.date)} · {c.startTime} · {c.coach} · {count}/{c.capacity}</span>
                    {member && booked ? (
                      <button onClick={() => cancelBooking(c.id, member.id)} className="ml-auto rounded-lg border border-gray-300 px-3 py-1">Cancelar mi plaza</button>
                    ) : (
                      member && (
                        <button onClick={() => bookMember(c.id, member.id)} disabled={count >= c.capacity} className="ml-auto rounded-lg bg-gray-900 px-3 py-1 text-white disabled:opacity-40">
                          Reservar
                        </button>
                      )
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Mis pagos</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {payments.map((p) => {
              const url = member && !p.paidDate ? paymentWhatsAppUrl(p, member.name, member.phone) : null;
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-3">
                  <span>{p.concept} · {formatMXN(p.amountCents)} · vence {formatDateEs(p.dueDate)} · {p.paidDate ? `pagado ${formatDateEs(p.paidDate)}` : "pendiente"}</span>
                  {url && (
                    <a href={url} target="_blank" rel="noreferrer" className="ml-auto rounded-lg bg-green-600 px-3 py-1 text-white">WhatsApp</a>
                  )}
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
