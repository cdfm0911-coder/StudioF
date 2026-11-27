import { Payment } from "./types";

/** Dinero en pesos mexicanos, como en la app original. */
export function formatMXN(amountCents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amountCents / 100);
}

export function formatDateEs(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/** Fecha de hoy en YYYY-MM-DD (hora local). */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysUntil(iso: string): number {
  const today = new Date(todayISO() + "T12:00:00");
  const due = new Date(iso + "T12:00:00");
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

/**
 * Normaliza un teléfono a formato wa.me (México):
 * 10 dígitos → prefijo 52. Si ya empieza por 521, se cambia a 52.
 * Números internacionales (+44…) se dejan con su código de país.
 */
export function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return "52" + digits;
  if (digits.length === 12 && digits.startsWith("521")) return "52" + digits.slice(3);
  if (digits.length === 11 && digits.startsWith("52")) return digits;
  return digits;
}

export function paymentWhatsAppUrl(p: Payment, memberName: string, memberPhone: string): string | null {
  const wa = normalizePhoneForWhatsApp(memberPhone);
  if (!wa) return null;
  const days = daysUntil(p.dueDate);
  const when =
    days < 0 ? `venció el ${formatDateEs(p.dueDate)}` : days === 0 ? "vence hoy" : `vence el ${formatDateEs(p.dueDate)}`;
  const text = `Hola ${memberName}, te recordamos tu pago de Studio Functional Fitness: ${p.concept} por ${formatMXN(p.amountCents)}, que ${when}. ¿Te ayudamos con algo?`;
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
}

export type PaymentStatus = "pagado" | "vencido" | "vence-hoy" | "avisar-hoy" | "proximo" | "pendiente";

export function paymentStatus(p: Payment): PaymentStatus {
  if (p.paidDate) return "pagado";
  const days = daysUntil(p.dueDate);
  if (days < 0) return "vencido";
  if (days === 0) return "vence-hoy";
  if (days === 5) return "avisar-hoy";
  if (days > 0 && days <= 5) return "proximo";
  return "pendiente";
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pagado: "Pagado",
  vencido: "Vencido",
  "vence-hoy": "Vence hoy",
  "avisar-hoy": "Avisar hoy",
  proximo: "Próximo",
  pendiente: "Pendiente",
};
