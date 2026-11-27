"use client";

import { useState } from "react";
import { useGym } from "@/lib/store";
import { Logo } from "./Logo";

export function LoginScreen() {
  const { data, login, setupAdmin } = useGym();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [adminName, setAdminName] = useState("Carlos");
  const [adminUser, setAdminUser] = useState("carlos");
  const [adminPin, setAdminPin] = useState("");

  const hasAdmin = data.users.some((u) => u.role === "administrador");

  if (!hasAdmin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10 text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Crea tu cuenta de administrador</h1>
        <p className="mt-2 text-sm text-gray-600">
          Eres el único administrador. Crea tu usuario y PIN; después podrás crear las cuentas de entrenadores y
          clientes en Accesos.
        </p>
        <form
          className="mt-6 w-full space-y-3 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            const err = setupAdmin(adminName.trim() || "Carlos", adminUser, adminPin);
            setError(err || "");
          }}
        >
          <label className="block text-sm font-medium text-gray-700">
            Nombre
            <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Usuario
            <input value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            PIN (mínimo 4 dígitos)
            <input value={adminPin} onChange={(e) => setAdminPin(e.target.value)} type="password" inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" required />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800">
            Crear administrador y entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10 text-center">
      <Logo size="lg" />
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Gestión del Gym</h1>
      <p className="mt-2 text-sm text-gray-600">Studio Functional Fitness · Entra con tu usuario y PIN.</p>
      <form
        className="mt-6 w-full space-y-3 text-left"
        onSubmit={(e) => {
          e.preventDefault();
          const err = login(username, pin);
          setError(err || "");
        }}
      >
        <label className="block text-sm font-medium text-gray-700">
          Usuario
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" autoComplete="username" required />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          PIN
          <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" inputMode="numeric" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" autoComplete="current-password" required />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800">
          Entrar
        </button>
      </form>
    </div>
  );
}

export function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { currentUser, loading } = useGym();
  if (loading) return <p className="mx-auto max-w-6xl px-4 py-10 text-gray-500">Cargando…</p>;
  if (!currentUser) return <LoginScreen />;
  if (roles && !roles.includes(currentUser.role)) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-xl font-bold text-gray-900">Sin acceso</h1>
        <p className="mt-2 text-gray-600">Tu rol ({currentUser.role}) no tiene acceso a esta sección.</p>
      </main>
    );
  }
  return <>{children}</>;
}
