// Clima de Jalpan de Serra (Querétaro) para la bienvenida del portal del cliente.
// Sin claves: Open-Meteo (5 días) como fuente principal y wttr.in (3 días) como respaldo.
// Si ambas fallan, el portal muestra solo la frase motivadora.

export interface ForecastDay {
  date: string; // YYYY-MM-DD
  maxC: number;
  minC: number;
  label: string; // condición en español
  icon: string; // símbolo del clima
}

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=21.23&longitude=-99.48&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=America%2FMexico_City&forecast_days=5";
const WTTR_URL = "https://wttr.in/Jalpan?format=j1";

// Código WMO (Open-Meteo) → [etiqueta, icono]
function wmoLabel(code: number): [string, string] {
  if (code === 0) return ["Despejado", "☀️"];
  if (code === 1) return ["Mayormente despejado", "🌤️"];
  if (code === 2) return ["Parcialmente nublado", "⛅"];
  if (code === 3) return ["Nublado", "☁️"];
  if (code === 45 || code === 48) return ["Niebla", "🌫️"];
  if (code >= 51 && code <= 57) return ["Llovizna", "🌦️"];
  if (code >= 61 && code <= 67) return ["Lluvia", "🌧️"];
  if (code >= 71 && code <= 77) return ["Nieve", "❄️"];
  if (code >= 80 && code <= 82) return ["Chubascos", "🌧️"];
  if (code >= 85 && code <= 86) return ["Chubascos de nieve", "🌨️"];
  if (code === 95) return ["Tormenta", "⛈️"];
  if (code === 96 || code === 99) return ["Tormenta con granizo", "⛈️"];
  return ["Variable", "🌤️"];
}

// Código wttr.in → [etiqueta, icono]
function wttrLabel(code: number): [string, string] {
  if (code === 113) return ["Despejado", "☀️"];
  if (code === 116) return ["Parcialmente nublado", "⛅"];
  if (code === 119 || code === 122) return ["Nublado", "☁️"];
  if (code === 143 || code === 248 || code === 260) return ["Niebla", "🌫️"];
  if ([176, 263, 266, 281, 293, 296, 353].includes(code)) return ["Lluvia ligera", "🌦️"];
  if ([299, 302, 305, 306, 308, 356, 359].includes(code)) return ["Lluvia", "🌧️"];
  if ([200, 386, 389].includes(code)) return ["Tormenta", "⛈️"];
  if ([227, 230, 323, 326, 329, 332, 335, 338, 368, 371, 392, 395].includes(code)) return ["Nieve", "❄️"];
  return ["Variable", "🌤️"];
}

async function fetchOpenMeteo(): Promise<ForecastDay[] | null> {
  const res = await fetch(OPEN_METEO_URL);
  if (!res.ok) return null;
  const j = await res.json();
  const d = j?.daily;
  if (!d || !Array.isArray(d.time)) return null;
  const days: ForecastDay[] = [];
  for (let i = 0; i < d.time.length; i++) {
    const max = d.temperature_2m_max?.[i];
    const min = d.temperature_2m_min?.[i];
    if (typeof max !== "number" || typeof min !== "number") continue;
    const [label, icon] = wmoLabel(d.weathercode?.[i] ?? -1);
    days.push({ date: d.time[i], maxC: Math.round(max), minC: Math.round(min), label, icon });
  }
  return days.length > 0 ? days : null;
}

async function fetchWttr(): Promise<ForecastDay[] | null> {
  const res = await fetch(WTTR_URL);
  if (!res.ok) return null;
  const j = await res.json();
  const w = j?.weather;
  if (!Array.isArray(w)) return null;
  const days: ForecastDay[] = [];
  for (const day of w) {
    const max = Number(day.maxtempC);
    const min = Number(day.mintempC);
    if (!day.date || Number.isNaN(max) || Number.isNaN(min)) continue;
    const midday = Array.isArray(day.hourly) ? day.hourly[4] ?? day.hourly[0] : null;
    const [label, icon] = wttrLabel(Number(midday?.weatherCode ?? -1));
    days.push({ date: day.date, maxC: max, minC: min, label, icon });
  }
  return days.length > 0 ? days : null;
}

export async function fetchForecast(): Promise<ForecastDay[] | null> {
  try {
    const primary = await fetchOpenMeteo();
    if (primary) return primary;
  } catch {
    // cae al respaldo
  }
  try {
    return await fetchWttr();
  } catch {
    return null;
  }
}

// Una frase motivadora distinta cada día de la semana.
export const HYROX_PHRASES = [
  "El HYROX no se gana en la carrera: se gana en cada entrenamiento.",
  "Hoy no tienes que ser el más rápido. Solo tienes que no parar.",
  "Cada estación es una oportunidad de demostrarte de lo que eres capaz.",
  "El cuerpo logra lo que la mente cree. Entrena los dos.",
  "Suda hoy, sonríe mañana: el HYROX es de los constantes.",
  "No entrenas para ser perfecto, entrenas para ser más fuerte que ayer.",
  "El trineo no se mueve solo: empújalo con todo.",
];

export function phraseForToday(date = new Date()): string {
  return HYROX_PHRASES[date.getDay() % HYROX_PHRASES.length];
}
