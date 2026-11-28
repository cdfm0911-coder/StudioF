"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGym } from "@/lib/store";
import { Logo } from "./Logo";

const NAV_ADMIN = [
  { href: "/", label: "Hoy" },
  { href: "/clases", label: "Clases" },
  { href: "/pagos", label: "Pagos" },
  { href: "/rutinas", label: "Rutinas" },
  { href: "/ejercicios", label: "Ejercicios" },
  { href: "/clientes", label: "Clientes" },
  { href: "/accesos", label: "Accesos" },
  { href: "/ajustes", label: "Ajustes" },
];

const NAV_TRAINER = [
  { href: "/", label: "Hoy" },
  { href: "/clases", label: "Clases" },
  { href: "/rutinas", label: "Rutinas" },
  { href: "/ejercicios", label: "Ejercicios" },
  { href: "/clientes", label: "Clientes" },
];

const NAV_CLIENT = [{ href: "/portal", label: "Mi portal" }];

export function Header() {
  const { currentUser, logout, mode, syncStatus } = useGym();
  const pathname = usePathname();
  const nav =
    currentUser?.role === "administrador" ? NAV_ADMIN : currentUser?.role === "entrenador" ? NAV_TRAINER : NAV_CLIENT;
  const connected =
    mode === "supabase" &&
    !syncStatus.usingSeed &&
    !syncStatus.loadErrors.some((t) => t !== "settings");
  // La tabla settings puede faltar (migración pendiente) sin que eso signifique
  // que el dispositivo no ve la base compartida: clientes, clases y pagos sí se comparten.

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href={currentUser?.role === "cliente" ? "/portal" : "/"} className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="leading-tight">
            <span className="block text-base font-bold text-gray-900">Gestión del Gym</span>
            <span className="block text-xs text-gray-500">Studio Functional Fitness</span>
          </span>
        </Link>
        {currentUser && (
          <nav className="ml-auto flex flex-wrap items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  pathname === item.href ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <span className="ml-2 text-xs text-gray-500">
              {currentUser.name} · {currentUser.role}
              {" · "}
              <span className={connected ? "font-medium text-green-700" : "font-medium text-amber-700"}>
                {connected ? "● Base compartida" : "● Datos locales"}
              </span>
            </span>
            <button
              onClick={logout}
              className="ml-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Salir
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
