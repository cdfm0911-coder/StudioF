"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/Login";
import { useGym } from "@/lib/store";
import { Routine } from "@/lib/types";

export default function RutinasPage() {
  const { data, saveRoutine, deleteRoutine, addRoutineDay, deleteRoutineDay, addRoutineExercise, deleteRoutineExercise, assignRoutine } = useGym();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Hyrox");
  const [selectedRoutine, setSelectedRoutine] = useState<number | null>(null);
  const [dayTitle, setDayTitle] = useState("");
  const [assignMember, setAssignMember] = useState("");

  const routine = data.routines.find((r) => r.id === selectedRoutine) || null;

  return (
    <RequireAuth roles={["administrador", "entrenador"]}>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Rutinas</h1>
        <p className="mt-1 text-sm text-gray-500">Crea rutinas con días y ejercicios, y asígnalas a clientes.</p>

        <form
          className="mt-5 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            saveRoutine({ id: 0, name: name.trim(), goal, level: "Intermedio", description: "", days: [] } as Routine);
            setName("");
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la rutina" className="flex-1 rounded-lg border border-gray-300 px-3 py-2" required />
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
            <option>Hyrox</option>
            <option>Fuerza</option>
            <option>Cardiovascular</option>
            <option>General</option>
          </select>
          <button className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white">Crear rutina</button>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            {data.routines.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoutine(r.id)}
                className={`w-full rounded-xl border p-3 text-left ${selectedRoutine === r.id ? "border-gray-900 bg-white" : "border-gray-200 bg-white"}`}
              >
                <span className="font-medium">{r.name}</span>
                <span className="block text-xs text-gray-500">{r.goal} · {r.days.length} días</span>
              </button>
            ))}
            {data.routines.length === 0 && <p className="text-sm text-gray-500">Aún no hay rutinas. Crea la primera arriba.</p>}
          </div>

          <div className="md:col-span-2">
            {!routine ? (
              <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">Selecciona una rutina para ver sus días y ejercicios.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                  <h2 className="text-lg font-semibold">{routine.name}</h2>
                  <span className="text-sm text-gray-500">{routine.goal}</span>
                  <button onClick={() => { deleteRoutine(routine.id); setSelectedRoutine(null); }} className="ml-auto text-sm text-red-600 hover:underline">Eliminar rutina</button>
                </div>

                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!dayTitle.trim()) return;
                    addRoutineDay(routine.id, dayTitle.trim());
                    setDayTitle("");
                  }}
                >
                  <input value={dayTitle} onChange={(e) => setDayTitle(e.target.value)} placeholder="Nuevo día (p. ej. Día 1 — Pierna)" className="flex-1 rounded-lg border border-gray-300 px-3 py-2" />
                  <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Añadir día</button>
                </form>

                {routine.days.map((day) => (
                  <section key={day.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{day.title}</h3>
                      <button onClick={() => deleteRoutineDay(routine.id, day.id)} className="ml-auto text-xs text-red-600 hover:underline">Eliminar día</button>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
                      {day.exercises.map((ex) => (
                        <li key={ex.id} className="flex flex-wrap gap-2">
                          <span className="font-medium">{ex.exerciseName}</span>
                          <span className="text-gray-600">{ex.sets} series · {ex.reps} reps · {ex.weight || "sin peso"} · descanso {ex.rest || "—"}</span>
                          <button onClick={() => deleteRoutineExercise(routine.id, day.id, ex.id)} className="text-xs text-red-600 hover:underline">Quitar</button>
                        </li>
                      ))}
                      {day.exercises.length === 0 && <li className="text-gray-500">Sin ejercicios todavía.</li>}
                    </ul>
                    <AddExerciseForm
                      onAdd={(name, sets, reps, weight, rest) =>
                        addRoutineExercise(routine.id, day.id, { exerciseId: null, exerciseName: name, sets, reps, weight, rest, notes: "" })
                      }
                    />
                  </section>
                ))}

                <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-4">
                  <select value={assignMember} onChange={(e) => setAssignMember(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
                    <option value="">Asignar a cliente…</option>
                    {data.members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => assignMember && assignRoutine(Number(assignMember), routine.id)}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
                  >
                    Asignar rutina
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}

function AddExerciseForm({ onAdd }: { onAdd: (name: string, sets: number, reps: string, weight: string, rest: string) => void }) {
  const { data } = useGym();
  const [exerciseId, setExerciseId] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");
  const [rest, setRest] = useState("60 s");
  return (
    <form
      className="mt-3 flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const ex = data.exercises.find((x) => x.id === Number(exerciseId));
        if (!ex) return;
        onAdd(ex.name, sets, reps, weight, rest);
      }}
    >
      <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-sm" required>
        <option value="">Ejercicio…</option>
        {data.exercises.map((x) => (
          <option key={x.id} value={x.id}>{x.name}</option>
        ))}
      </select>
      <input type="number" min={1} value={sets} onChange={(e) => setSets(Number(e.target.value))} className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm" aria-label="Series" />
      <input value={reps} onChange={(e) => setReps(e.target.value)} placeholder="Reps" className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm" />
      <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Peso" className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm" />
      <input value={rest} onChange={(e) => setRest(e.target.value)} placeholder="Descanso" className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm" />
      <button className="rounded-lg bg-gray-900 px-3 py-1 text-sm text-white">Añadir</button>
    </form>
  );
}
