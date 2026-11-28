import type { Metadata } from "next";
import "./globals.css";
import { GymProvider } from "@/lib/store";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Gestión del Gym — Studio Functional Fitness",
  description: "Clientes, clases, pagos, rutinas y ejercicios de Studio Functional Fitness.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-900 text-gray-900">
        {/* Fondo de la app: foto del gimnasio con velo oscuro para que el contenido se lea bien. */}
        <div aria-hidden className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url(/fondo-gym.jpg)" }} />
        <div aria-hidden className="fixed inset-0 -z-10 bg-black/60" />
        <GymProvider>
          <Header />
          {children}
          <footer className="mx-auto max-w-6xl px-4 pb-8 pt-6 text-center text-xs text-gray-300">
            Studio Functional Fitness · Gestión del Gym
          </footer>
        </GymProvider>
      </body>
    </html>
  );
}
