"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/Login";
import { useGym } from "@/lib/store";
import { Member, ProgressEntry } from "@/lib/types";
import { formatMXN, formatDateEs, todayISO } from "@/lib/utils";

export default function ClientesPage() {
  const { data, saveMember, deleteMember, saveProgress, deleteProgress, currentUser } = useGym();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState("Hyrox");
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

  const isAdmin = currentUser?.role === "administrador";
  const selected = data.members.find((m) => m.id === selectedId) || null;
  const activeRoutine = selected
    ? data.assignments.find((a) => a.memberId === selected.id && a.active)
    : null;
  const routine = activeRoutine ? data.routines.find((r) => r.id === activeRoutine.routineId) : null;
  const progress = selected ? data.progress.filter((p) => p.memberId === selected.id).sort((a, b) => a.date.localeCompare(b.date)) : [];
  const payments = selected ? data.payments.filter((p) => p.memberId === selected.id) : [];
  // Mensualidad del mes en curso (solo estado, sin importes): lo que ven los entrenadores.
  const currentMonth = todayISO().slice(0, 7);
  const monthlyPayment = payments.find((p) => p.dueDate.slice(0, 7) === currentMonth);
  const monthlyPaid = monthlyPayment ? Boolean(monthlyPayment.paidDate) : false;

  return (
    <RequireAuth roles={["administrador", "entrenador"]}>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="mt-1 text-sm text-gray-500">{isAdmin ? "Ficha completa, rutina actual, pagos y evolución de peso." : "Ficha completa, rutina actual, mensualidad y evolución de peso."}</p>

        <form
          className="mt-5 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            saveMember({ id: 0, name: name.trim(), phone: phone.trim(), email: "", plan: "Mensual", goal, startDate: todayISO(), status: "activo", notes: "" } as Member);
            setName(""); setPhone("");
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del cliente" className="flex-1 rounded-lg border border-gray-300 px-3 py-2" required />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono (WhatsApp)" className="rounded-lg border border-gray-300 px-3 py-2" />
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
            <option>Hyrox</option>
            <option>Fuerza</option>
            <option>Cardiovascular</option>
            <option>Spinning</option>
            <option>General</option>
          </select>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Añadir cliente</button>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            {[...data.members]
              .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "activo" ? -1 : 1))
              .map((m) => (
                <button key={m.id} onClick={() => setSelectedId(m.id)} className={`w-full rounded-xl border p-3 text-left ${selectedId === m.id ? "border-gray-900 bg-white" : "border-gray-200 bg-white"} ${m.status !== "activo" ? "opacity-60" : ""}`}>
                  <span className="font-medium">{m.name}</span>
                  {m.status !== "activo" && (
                    <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">Dado de baja</span>
                  )}
                  <span className="block text-xs text-gray-500">{m.plan} · {m.goal} · {m.status}</span>
                </button>
              ))}
          </div>
          <div className="md:col-span-2">
            {!selected ? (
              <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">Selecciona un cliente para ver su ficha.</p>
            ) : (
              <div className="space-y-4">
                <section className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {selected.name}
                        {selected.status !== "activo" && (
                          <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 align-middle text-xs font-semibold text-gray-600">Dado de baja</span>
                        )}
                      </h2>
                      <p className="text-sm text-gray-600">Tel. {selected.phone || "—"} · Plan {selected.plan} · Objetivo {selected.goal}</p>
                      <p className="text-sm text-gray-600">Desde {formatDateEs(selected.startDate)} · {selected.status}</p>
                    </div>
                    {isAdmin && (
                      <div className="ml-auto flex flex-col items-end gap-1">
                        <button
                          onClick={() => saveMember({ ...selected, status: selected.status === "activo" ? "inactivo" : "activo" })}
                          className="text-sm text-amber-700 hover:underline"
                        >
                          {selected.status === "activo" ? "Dar de baja" : "Reactivar"}
                        </button>
                        <button onClick={() => { deleteMember(selected.id); setSelectedId(null); }} className="text-sm text-red-600 hover:underline">Eliminar cliente</button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm"><strong>Rutina actual:</strong> {routine ? routine.name : "Sin rutina asignada"}</p>
                  {routine && (
                    <ul className="mt-1 text-sm text-gray-700">
                      {routine.days.map((d) => (
                        <li key={d.id}>{d.title} — {d.exercises.map((e) => e.exerciseName).join(", ") || "sin ejercicios"}</li>
                      ))}
                    </ul>
                  )}
                  {isAdmin ? (
                    <>
                      <p className="mt-2 text-sm"><strong>Pagos:</strong></p>
                      <ul className="text-sm text-gray-700">
                        {payments.map((p) => (
                          <li key={p.id}>{p.concept} · {formatMXN(p.amountCents)} · vence {formatDateEs(p.dueDate)} · {p.paidDate ? `pagado ${formatDateEs(p.paidDate)}` : "pendiente"}</li>
                        ))}
                        {payments.length === 0 && <li className="text-gray-500">Sin pagos.</li>}
                      </ul>
                    </>
                  ) : (
                    <p className="mt-2 text-sm">
                      <strong>Mensualidad:</strong>{" "}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${monthlyPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>
                        {monthlyPaid ? "Pagada" : "Pendiente"}
                      </span>
                    </p>
                  )}
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="font-semibold">Evolución de peso / progreso</h3>
                  <form
                    className="mt-3 flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveProgress({ id: 0, memberId: selected.id, date: todayISO(), weight, bodyFat: "", note } as ProgressEntry);
                      setWeight(""); setNote("");
                    }}
                  >
                    <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Peso (kg)" className="w-28 rounded-lg border border-gray-300 px-3 py-2" />
                    <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota" className="flex-1 rounded-lg border border-gray-300 px-3 py-2" />
                    <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Registrar</button>
                  </form>
                  <ul className="mt-3 space-y-1 text-sm">
                    {progress.map((p) => (
                      <li key={p.id} className="flex gap-2">
                        <span>{formatDateEs(p.date)}</span>
                        <span>{p.weight ? `${p.weight} kg` : ""}</span>
                        <span className="text-gray-600">{p.note}</span>
                        <button onClick={() => deleteProgress(p.id)} className="ml-auto text-xs text-red-600 hover:underline">Eliminar</button>
                      </li>
                    ))}
                    {progress.length === 0 && <li className="text-gray-500">Sin registros de progreso todavía.</li>}
                  </ul>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
