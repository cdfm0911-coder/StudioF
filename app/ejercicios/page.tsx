"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/Login";
import { useGym } from "@/lib/store";
import { Exercise } from "@/lib/types";

export default function EjerciciosPage() {
  const { data, saveExercise, deleteExercise } = useGym();
  const [filter, setFilter] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Fuerza");
  const [editing, setEditing] = useState<Exercise | null>(null);

  const list = data.exercises.filter(
    (e) => !filter || e.name.toLowerCase().includes(filter.toLowerCase()) || e.category.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <RequireAuth roles={["administrador", "entrenador"]}>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Ejercicios</h1>
        <p className="mt-1 text-sm text-gray-500">Biblioteca de {data.exercises.length} ejercicios · editable.</p>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar por nombre o categoría…" className="mt-4 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2" />

        <form
          className="mt-4 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            saveExercise({ id: 0, name: name.trim(), category, muscleGroup: "", equipment: "", description: "" } as Exercise);
            setName("");
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nuevo ejercicio" className="flex-1 rounded-lg border border-gray-300 px-3 py-2" required />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
            <option>Fuerza</option>
            <option>HYROX</option>
            <option>Cardiovascular</option>
            <option>Core</option>
            <option>Movilidad</option>
          </select>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Añadir</button>
        </form>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((ex) => (
            <article key={ex.id} className="rounded-xl border border-gray-200 bg-white p-4">
              {editing?.id === ex.id ? (
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveExercise(editing);
                    setEditing(null);
                  }}
                >
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-1" />
                  <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-1" />
                  <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-2 py-1" />
                  <button className="rounded-lg bg-gray-900 px-3 py-1 text-sm text-white">Guardar</button>
                </form>
              ) : (
                <>
                  <h2 className="font-semibold">{ex.name}</h2>
                  <p className="text-xs text-gray-500">{ex.category} · {ex.muscleGroup}</p>
                  <p className="mt-1 text-sm text-gray-600">{ex.description}</p>
                  <p className="mt-1 text-xs text-gray-500">{ex.equipment}</p>
                  <div className="mt-2 flex gap-3 text-sm">
                    <button onClick={() => setEditing(ex)} className="text-blue-700 hover:underline">Editar</button>
                    <button onClick={() => deleteExercise(ex.id)} className="text-red-600 hover:underline">Eliminar</button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </main>
    </RequireAuth>
  );
}
