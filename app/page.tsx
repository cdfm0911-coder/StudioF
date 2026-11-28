"use client";

import { useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/Login";
import { getSetting, useGym } from "@/lib/store";
import { DEFAULT_WHATSAPP_TEMPLATE, formatMXN, formatDateEs, formatMonthEs, monthStats, monthsWithPayments, paymentStatus, PAYMENT_STATUS_LABEL, paymentWhatsAppUrl, shiftMonth, todayISO } from "@/lib/utils";

export default function HoyPage() {
  const { data, loading, currentUser, markPaid, syncStatus } = useGym();
  const isAdmin = currentUser?.role === "administrador";
  const today = todayISO();
  const [month, setMonth] = useState(today.slice(0, 7));
  const stats = monthStats(data.payments, month);
  const pct = stats.expectedCents > 0 ? Math.round((stats.collectedCents / stats.expectedCents) * 100) : 0;
  const months = monthsWithPayments(data.payments).slice(-6);
  const todaysCheckIns = data.bookings
    .filter((b) => b.attended === true)
    .map((b) => ({
      b,
      c: data.classes.find((x) => x.id === b.classId) ?? null,
      m: data.members.find((x) => x.id === b.memberId) ?? null,
    }))
    .filter((x) => x.c && x.c.date === today)
    .sort((a, b) => (a.c?.startTime ?? "").localeCompare(b.c?.startTime ?? ""));
  // Solo falla la tabla de ajustes (migración pendiente): los datos principales sí se comparten.
  const settingsOnly =
    !syncStatus.usingSeed &&
    syncStatus.loadErrors.length > 0 &&
    syncStatus.loadErrors.every((t) => t === "settings");
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

        {(syncStatus.usingSeed || syncStatus.loadErrors.length > 0) && (!settingsOnly || isAdmin) && (
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                {syncStatus.usingSeed || syncStatus.loadErrors.some((t) => t !== "settings")
                  ? "Este dispositivo no está viendo la base compartida"
                  : "Los ajustes no se están compartiendo en este dispositivo"}
              </p>
              <p className="mt-1 text-sm text-amber-800">
                {syncStatus.usingSeed
                  ? "No se pudo cargar la base de datos compartida y se están mostrando datos de ejemplo. Los cambios que hagas aquí no se verán en los demás dispositivos."
                  : `No se pudieron cargar estas tablas: ${syncStatus.loadErrors.join(", ")}.`}
              </p>
              {syncStatus.loadErrors.includes("settings") && (
                <p className="mt-1 text-sm text-amber-800">
                  Falta la tabla de ajustes: corre supabase/migration-settings.sql en el SQL Editor de Supabase para
                  que el mensaje de WhatsApp y el número del gimnasio se compartan.
                </p>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                Recargar
              </button>
            </div>
          )}

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
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">Panel de control</h2>
              <span className="ml-auto flex items-center gap-1">
                <button onClick={() => setMonth((m) => shiftMonth(m, -1))} className="rounded-lg border border-gray-300 px-2 py-1 text-sm" aria-label="Mes anterior">‹</button>
                <span className="min-w-36 text-center text-sm font-medium capitalize">{formatMonthEs(month)}</span>
                <button onClick={() => setMonth((m) => shiftMonth(m, 1))} className="rounded-lg border border-gray-300 px-2 py-1 text-sm" aria-label="Mes siguiente">›</button>
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Cobrado</p>
                <p className="mt-1 text-2xl font-bold">{formatMXN(stats.collectedCents)}</p>
                <p className="text-xs text-gray-500">de {formatMXN(stats.expectedCents)} esperados</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">% cobrado</p>
                <p className="mt-1 text-2xl font-bold">{pct}%</p>
                <p className="text-xs text-gray-500">{stats.paidCount} pagos cobrados</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Clientes activos</p>
                <p className="mt-1 text-2xl font-bold">{stats.activeMembers}</p>
                <p className="text-xs text-gray-500">con pago este mes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendiente por cobrar</p>
                <p className="mt-1 text-2xl font-bold">{formatMXN(stats.pendingCents)}</p>
                <p className="text-xs text-gray-500">{stats.pendingCount} pagos pendientes</p>
              </div>
            </div>
            {months.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <h3 className="text-sm font-medium text-gray-700">Comparativa por mes</h3>
                <table className="mt-2 w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-1 pr-2 font-medium">Mes</th>
                      <th className="py-1 pr-2 font-medium">Cobrado</th>
                      <th className="py-1 pr-2 font-medium">Esperado</th>
                      <th className="py-1 pr-2 font-medium">% cobrado</th>
                      <th className="py-1 font-medium">Activos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((ym) => {
                      const s = monthStats(data.payments, ym);
                      const p = s.expectedCents > 0 ? Math.round((s.collectedCents / s.expectedCents) * 100) : 0;
                      return (
                        <tr key={ym} className={ym === month ? "bg-gray-100 font-semibold" : ""}>
                          <td className="py-1 pr-2 capitalize">{formatMonthEs(ym)}</td>
                          <td className="py-1 pr-2">{formatMXN(s.collectedCents)}</td>
                          <td className="py-1 pr-2">{formatMXN(s.expectedCents)}</td>
                          <td className="py-1 pr-2">{p}%</td>
                          <td className="py-1">{s.activeMembers}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

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
                const url = member ? paymentWhatsAppUrl(p, member.name, member.phone, getSetting(data.settings, "whatsapp_template", DEFAULT_WHATSAPP_TEMPLATE), getSetting(data.settings, "whatsapp_number", "")) : null;
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
                    <span className="ml-auto flex items-center gap-2">
                      <button onClick={() => markPaid(p.id)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700">
                        Pagado
                      </button>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">WhatsApp: falta el teléfono del cliente</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        )}

        {isAdmin && (
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Entradas de hoy</h2>
            <p className="text-sm text-gray-600">Clientes que registraron su entrada con el QR.</p>
            {todaysCheckIns.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">Aún no hay entradas registradas hoy.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {todaysCheckIns.map(({ b, c, m }) => (
                  <li key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                    <span className="font-medium">{m?.name ?? "Cliente"}</span>
                    <span className="text-gray-600">
                      entró a {c?.title} · {c?.startTime}
                    </span>
                  </li>
                ))}
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
