"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/Login";
import { useGym } from "@/lib/store";
import { formatMXN, formatDateEs, formatMonthEs, todayISO } from "@/lib/utils";

// Verificación por QR: el entrenador escanea el código del cliente con la cámara
// de su teléfono y esta página muestra si pagó la mensualidad del mes en curso.
// Los entrenadores solo ven el estado (pagada/pendiente), sin importes;
// el administrador además ve el importe y puede marcar el pago como pagado.
export default function VerificarPage() {
  const { data, loading, currentUser, markPaid } = useGym();
  const [memberId, setMemberId] = useState<number | null>(null);
  const isAdmin = currentUser?.role === "administrador";

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("m");
    setMemberId(m ? Number(m) : null);
  }, []);

  const member = memberId ? data.members.find((x) => x.id === memberId) ?? null : null;
  const currentMonth = todayISO().slice(0, 7);
  const monthlyPayment = member
    ? data.payments.find((p) => p.memberId === member.id && p.dueDate.slice(0, 7) === currentMonth)
    : null;
  const monthlyPaid = monthlyPayment ? Boolean(monthlyPayment.paidDate) : false;

  return (
    <RequireAuth roles={["administrador", "entrenador"]}>
      <main className="mx-auto max-w-md px-4 py-10 text-center">
        <h1 className="text-2xl font-bold">Verificar mensualidad</h1>
        <p className="mt-1 text-sm text-gray-500">Escanea el código QR del cliente para verificar su pago.</p>

        {loading ? (
          <p className="mt-8 text-gray-500">Cargando…</p>
        ) : !member ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-lg font-semibold">Código no válido</p>
            <p className="mt-2 text-sm text-gray-600">
              Este código no corresponde a ningún cliente. Pídele al cliente que abra su código QR en su portal.
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-xl font-bold">{member.name}</p>
            <p className="mt-1 text-sm text-gray-600">
              Plan {member.plan} · {member.goal} · {member.status === "activo" ? "Activo" : "Dado de baja"}
            </p>
            {member.status !== "activo" && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Este cliente está dado de baja.
              </p>
            )}
            <p className="mt-4 text-sm text-gray-500">
              Mensualidad de <span className="font-medium capitalize text-gray-700">{formatMonthEs(currentMonth)}</span>
            </p>
            <p
              className={`mx-auto mt-3 inline-block rounded-full px-5 py-2 text-lg font-bold ${
                monthlyPaid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {monthlyPaid ? "✓ Pagada" : "Pendiente"}
            </p>
            {monthlyPaid && monthlyPayment?.paidDate && (
              <p className="mt-2 text-sm text-gray-600">Pagado el {formatDateEs(monthlyPayment.paidDate)}</p>
            )}
            {!monthlyPaid && monthlyPayment && (
              <p className="mt-2 text-sm text-gray-600">Vence el {formatDateEs(monthlyPayment.dueDate)}</p>
            )}
            {!monthlyPaid && !monthlyPayment && (
              <p className="mt-2 text-sm text-gray-600">No hay un pago registrado para este mes.</p>
            )}
            {isAdmin && monthlyPayment && (
              <div className="mt-5 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  Importe: <strong>{formatMXN(monthlyPayment.amountCents)}</strong>
                </p>
                {!monthlyPaid && (
                  <button
                    onClick={() => markPaid(monthlyPayment.id)}
                    className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                  >
                    Marcar pagado
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </RequireAuth>
  );
}
