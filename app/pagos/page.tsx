"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/Login";
import { useGym } from "@/lib/store";
import { Payment } from "@/lib/types";
import { formatMXN, formatDateEs, paymentStatus, PAYMENT_STATUS_LABEL, paymentWhatsAppUrl, todayISO } from "@/lib/utils";

export default function PagosPage() {
  const { data, savePayment, deletePayment, markPaid } = useGym();
  const [memberId, setMemberId] = useState("1");
  const [concept, setConcept] = useState("Cuota mensual");
  const [amount, setAmount] = useState("550");
  const [dueDate, setDueDate] = useState(todayISO());
  const [method, setMethod] = useState("SPEI");

  const sorted = [...data.payments].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <RequireAuth roles={["administrador"]}>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Pagos</h1>
        <p className="mt-1 text-sm text-gray-500">Pendientes, vencidos y pagados · importes en pesos mexicanos (MXN).</p>

        <form
          className="mt-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault();
            savePayment({
              id: 0,
              memberId: Number(memberId),
              concept: concept.trim(),
              amountCents: Math.round(Number(amount) * 100),
              dueDate,
              paidDate: null,
              method,
            } as Payment);
          }}
        >
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
            {data.members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Concepto" className="rounded-lg border border-gray-300 px-3 py-2" required />
          <label className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2">
            <span className="text-sm text-gray-500">$ MXN</span>
            <input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full outline-none" required />
          </label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" required />
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
            <option>SPEI</option>
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Transferencia</option>
          </select>
          <button className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white">Registrar pago</button>
        </form>

        <ul className="mt-6 space-y-2">
          {sorted.map((p) => {
            const member = data.members.find((m) => m.id === p.memberId);
            const status = paymentStatus(p);
            const url = member && !p.paidDate ? paymentWhatsAppUrl(p, member.name, member.phone) : null;
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    status === "pagado" ? "bg-green-100 text-green-800" : status === "avisar-hoy" ? "bg-amber-500 text-white" : status === "vencido" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {PAYMENT_STATUS_LABEL[status]}
                </span>
                <span className="font-medium">{member?.name ?? "Cliente"}</span>
                <span className="text-sm text-gray-600">
                  {p.concept} · {formatMXN(p.amountCents)} · vence {formatDateEs(p.dueDate)}
                  {p.paidDate ? ` · pagado ${formatDateEs(p.paidDate)}` : ""} {p.method ? `· ${p.method}` : ""}
                </span>
                <span className="ml-auto flex gap-2">
                  {!p.paidDate && (
                    <>
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">WhatsApp: sin teléfono</span>
                      )}
                      <button onClick={() => markPaid(p.id)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white">
                        Marcar pagado
                      </button>
                    </>
                  )}
                  <button onClick={() => deletePayment(p.id)} className="text-sm text-red-600 hover:underline">Eliminar</button>
                </span>
              </li>
            );
          })}
          {sorted.length === 0 && <li className="text-sm text-gray-500">No hay pagos registrados.</li>}
        </ul>
        <p className="mt-4 text-xs text-gray-500">
          El botón de WhatsApp abre wa.me con el mensaje ya redactado (concepto, importe en MXN y fecha de
          vencimiento). El envío se confirma en WhatsApp; no es automático.
        </p>
      </main>
    </RequireAuth>
  );
}
