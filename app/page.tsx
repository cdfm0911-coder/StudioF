"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/Login";
import { useGym } from "@/lib/store";
import { formatMXN, formatDateEs, paymentStatus, PAYMENT_STATUS_LABEL, paymentWhatsAppUrl, todayISO } from "@/lib/utils";

export default function HoyPage() {
  const { data, loading, currentUser } = useGym();
  const isAdmin = currentUser?.role === "administrador";
  const today = todayISO();
  const activeClients = data.members.filter((m) => m.status === "activo").length;
  const todaysClasses = data.classes.filter((c) => c.date === today);
  const todaysBookings = data.bookings.filter((b) => todaysClasses.some((c) => c.id === b.classId)).length;
  const pending = data.payments.filter((p) => !p.paidDate);
  const pendingTotal = pending.reduce((s, p) => s + p.amountCents, 0);
  const alerts = data.payments
    .filter((p) => !p.paidDate)
    .map((p) => ({ p, status: paymentStatus(p) }))
    .filter(({ status }) => ["avisar-hoy", "proximo", "vence-hoy", "vencido"].includes(status))
    .sort((a, b) => a.p.dueDate.localeCompare(b.p.dueDate));

  return (
    <RequireAuth roles={["administrador", "entrenador"]}>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Hoy</h1>
        <p className="mt-1 text-sm text-gray-500">{formatDateEs(today)}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Clientes activos</p>
            <p className="mt-1 text-3xl font-bold">{loading ? "…" : activeClients}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Clases y reservas de hoy</p>
            <p className="mt-1 text-3xl font-bold">
              {todaysClasses.length} · {todaysBookings} reservas
            </p>
          </div>
          {isAdmin && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Pendiente de cobro</p>
              <p className="mt-1 text-3xl font-bold">{formatMXN(pendingTotal)}</p>
              <p className="text-xs text-gray-500">{pending.length} pagos pendientes</p>
            </div>
          )}
        </div>

        {isAdmin && (
          <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-lg font-semibold">Avisos de pago</h2>
          <p className="text-sm text-gray-600">
            Pagos que vencen en los próximos 5 días, hoy o ya vencidos. Los que vencen en exactamente 5 días se
            destacan como «avisar hoy».
          </p>
          {alerts.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">No hay avisos de pago. Nada vence en los próximos 5 días.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {alerts.map(({ p, status }) => {
                const member = data.members.find((m) => m.id === p.memberId);
                const url = member ? paymentWhatsAppUrl(p, member.name, member.phone) : null;
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-amber-100">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        status === "avisar-hoy"
                          ? "bg-amber-500 text-white"
                          : status === "vencido"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {PAYMENT_STATUS_LABEL[status]}
                    </span>
                    <span className="font-medium">{member?.name ?? "Cliente"}</span>
                    <span className="text-sm text-gray-600">
                      {p.concept} · {formatMXN(p.amountCents)} · vence {formatDateEs(p.dueDate)}
                    </span>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                      >
                        WhatsApp
                      </a>
                    ) : (
                      <span className="ml-auto text-xs text-gray-500">WhatsApp: falta el teléfono del cliente</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        )}

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Clases de hoy</h2>
          {todaysClasses.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              No hay clases hoy. <Link href="/clases" className="text-blue-700 underline">Ver semana</Link>
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {todaysClasses.map((c) => (
                <li key={c.id} className="flex flex-wrap gap-2 text-sm">
                  <span className="font-medium">{c.title}</span>
                  <span className="text-gray-600">
                    {c.startTime} · {c.durationMin} min · {c.coach} ·{" "}
                    {data.bookings.filter((b) => b.classId === c.id).length}/{c.capacity} plazas
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </RequireAuth>
  );
}
