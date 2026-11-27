"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/Login";
import { useGym } from "@/lib/store";
import { Role } from "@/lib/types";

export default function AccesosPage() {
  const { data, createUser, deleteUser } = useGym();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<Role>("entrenador");
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");

  return (
    <RequireAuth roles={["administrador"]}>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Accesos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Solo el administrador gestiona las cuentas. Los entrenadores ven el panel diario sin Pagos ni importes y no
          pueden eliminar clientes. Los clientes solo ven su propio portal.
        </p>

        <form
          className="mt-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            const err = createUser({
              name: name.trim(),
              username: username.trim(),
              role,
              memberId: role === "cliente" && memberId ? Number(memberId) : null,
              pin,
            });
            setError(err || "");
            if (!err) { setName(""); setUsername(""); setPin(""); }
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="rounded-lg border border-gray-300 px-3 py-2" required />
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" className="rounded-lg border border-gray-300 px-3 py-2" required />
          <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" inputMode="numeric" placeholder="PIN (mín. 4)" className="rounded-lg border border-gray-300 px-3 py-2" required />
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-lg border border-gray-300 px-3 py-2">
            <option value="entrenador">Entrenador</option>
            <option value="cliente">Cliente</option>
          </select>
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" disabled={role !== "cliente"}>
            <option value="">Vincular a ficha…</option>
            {data.members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white sm:col-span-5">Crear cuenta</button>
          {error && <p className="text-sm text-red-600 sm:col-span-5">{error}</p>}
        </form>

        <ul className="mt-6 space-y-2">
          {data.users.map((u) => {
            const member = u.memberId ? data.members.find((m) => m.id === u.memberId) : null;
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <span className="font-medium">{u.name}</span>
                <span className="text-sm text-gray-600">@{u.username} · {u.role}{member ? ` · ${member.name}` : ""}</span>
                {u.role !== "administrador" && (
                  <button onClick={() => deleteUser(u.id)} className="ml-auto text-sm text-red-600 hover:underline">Eliminar cuenta</button>
                )}
              </li>
            );
          })}
          {data.users.length === 0 && <li className="text-sm text-gray-500">No hay cuentas todavía.</li>}
        </ul>
      </main>
    </RequireAuth>
  );
}
