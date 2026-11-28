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

/** Plantilla por defecto del aviso de pago por WhatsApp.
 *  Variables: {nombre}, {concepto}, {importe}, {vencimiento}, {numero_gym}, {link_pago}. */
export const DEFAULT_WHATSAPP_TEMPLATE =
  "Hola {nombre}, te recordamos tu pago de Studio Functional Fitness: {concepto} por {importe}, que {vencimiento}. ¿Te ayudamos con algo?";

/** Clave del ajuste con el link de Mercado Pago para un importe (en centavos). */
export function mercadopagoLinkKey(amountCents: number): string {
  return `mercadopago_${amountCents / 100}`;
}

export function renderWhatsAppTemplate(
  template: string,
  vars: { nombre: string; concepto: string; importe: string; vencimiento: string; numeroGym: string; linkPago: string }
): string {
  return (template || DEFAULT_WHATSAPP_TEMPLATE)
    .replaceAll("{nombre}", vars.nombre)
    .replaceAll("{concepto}", vars.concepto)
    .replaceAll("{importe}", vars.importe)
    .replaceAll("{vencimiento}", vars.vencimiento)
    .replaceAll("{numero_gym}", vars.numeroGym)
    .replaceAll("{link_pago}", vars.linkPago);
}

export function paymentWhatsAppUrl(
  p: Payment,
  memberName: string,
  memberPhone: string,
  template: string = DEFAULT_WHATSAPP_TEMPLATE,
  gymNumber: string = "",
  paymentLink: string = ""
): string | null {
  const wa = normalizePhoneForWhatsApp(memberPhone);
  if (!wa) return null;
  const days = daysUntil(p.dueDate);
  const when =
    days < 0 ? `venció el ${formatDateEs(p.dueDate)}` : days === 0 ? "vence hoy" : `vence el ${formatDateEs(p.dueDate)}`;
  const text = renderWhatsAppTemplate(template, {
    nombre: memberName,
    concepto: p.concept,
    importe: formatMXN(p.amountCents),
    vencimiento: when,
    numeroGym: gymNumber,
    linkPago: paymentLink,
  });
  return `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
}

export type PaymentStatus = "pagado" | "vencido" | "vence-hoy" | "avisar-hoy" | "proximo" | "pendiente";

/** "2026-11" a partir de una fecha YYYY-MM-DD. */
export function monthKey(iso: string): string {
  return iso ? iso.slice(0, 7) : "";
}

/** "noviembre de 2026" a partir de "2026-11". */
export function formatMonthEs(ym: string): string {
  if (!/^\d{4}-\d{2}$/.test(ym)) return ym;
  const d = new Date(`${ym}-01T12:00:00`);
  return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

/** Mes anterior/siguiente ("2026-11" → "2026-10" / "2026-12"). */
export function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export interface MonthStats {
  expectedCents: number;
  collectedCents: number;
  pendingCents: number;
  activeMembers: number;
  pendingCount: number;
  paidCount: number;
}

/** Estadísticas de un mes (YYYY-MM) a partir de los pagos.
 *  Esperado, activos y pendientes se cuentan por fecha de vencimiento; cobrado, por fecha de pago. */
export function monthStats(payments: Payment[], ym: string): MonthStats {
  const due = payments.filter((p) => monthKey(p.dueDate) === ym);
  const paid = payments.filter((p) => p.paidDate && monthKey(p.paidDate) === ym);
  const pending = due.filter((p) => !p.paidDate);
  return {
    expectedCents: due.reduce((s, p) => s + p.amountCents, 0),
    collectedCents: paid.reduce((s, p) => s + p.amountCents, 0),
    pendingCents: pending.reduce((s, p) => s + p.amountCents, 0),
    activeMembers: new Set(due.map((p) => p.memberId)).size,
    pendingCount: pending.length,
    paidCount: paid.length,
  };
}

/** Meses (YYYY-MM) que tienen al menos un pago (por vencimiento o por cobro), ordenados. */
export function monthsWithPayments(payments: Payment[]): string[] {
  const set = new Set<string>();
  for (const p of payments) {
    if (monthKey(p.dueDate)) set.add(monthKey(p.dueDate));
    if (p.paidDate && monthKey(p.paidDate)) set.add(monthKey(p.paidDate));
  }
  return [...set].sort();
}

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
