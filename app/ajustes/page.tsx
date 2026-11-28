"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/Login";
import { getSetting, useGym } from "@/lib/store";
import { DEFAULT_WHATSAPP_TEMPLATE, renderWhatsAppTemplate } from "@/lib/utils";

const VARS = ["{nombre}", "{concepto}", "{importe}", "{vencimiento}", "{numero_gym}", "{link_pago}"];

const MP_LINKS = [
  { key: "mercadopago_550", label: "Link de pago $550", hint: "Mensualidad 1 persona" },
  { key: "mercadopago_750", label: "Link de pago $750", hint: "Mensualidad combinada" },
  { key: "mercadopago_1100", label: "Link de pago $1,100", hint: "Mensualidad 2 personas" },
] as const;

export default function AjustesPage() {
  const { data, currentUser, saveSetting } = useGym();
  const isAdmin = currentUser?.role === "administrador";
  const template = getSetting(data.settings, "whatsapp_template", DEFAULT_WHATSAPP_TEMPLATE);
  const gymNumber = getSetting(data.settings, "whatsapp_number", "");
  const [templateDraft, setTemplateDraft] = useState(template);
  const [numberDraft, setNumberDraft] = useState(gymNumber);
  const [mpDrafts, setMpDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(MP_LINKS.map((l) => [l.key, getSetting(data.settings, l.key, "")]))
  );
  const [saved, setSaved] = useState(false);

  // Sincronizar los borradores cuando cargan los ajustes guardados.
  useEffect(() => {
    setTemplateDraft(template);
    setNumberDraft(gymNumber);
    setMpDrafts(Object.fromEntries(MP_LINKS.map((l) => [l.key, getSetting(data.settings, l.key, "")])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.settings]);

  const preview = renderWhatsAppTemplate(templateDraft, {
    nombre: "Alexia",
    concepto: "Cuota mensual",
    importe: "$550.00",
    vencimiento: "vence el 4 dic 2026",
    numeroGym: numberDraft || "441 100 0000",
    linkPago: mpDrafts["mercadopago_550"] || "https://mpago.la/ejemplo",
  });

  return (
    <RequireAuth>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="mt-1 text-sm text-gray-500">Solo el administrador puede cambiar estos ajustes.</p>

        {!isAdmin ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Solo el administrador puede cambiar los ajustes.
          </p>
        ) : (
          <>
            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Mensaje de WhatsApp</h2>
              <p className="mt-1 text-sm text-gray-500">
                Este es el texto que se manda a los clientes al avisarles de un pago. Puedes usar estas variables:
              </p>
              <p className="mt-2 flex flex-wrap gap-1">
                {VARS.map((v) => (
                  <code key={v} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {v}
                  </code>
                ))}
              </p>
              <textarea
                value={templateDraft}
                onChange={(e) => {
                  setTemplateDraft(e.target.value);
                  setSaved(false);
                }}
                rows={4}
                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-700">Vista previa</h3>
                <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{preview}</p>
              </div>
            </section>

            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Número de WhatsApp del gimnasio</h2>
              <p className="mt-1 text-sm text-gray-500">
                Aparece dentro del mensaje donde pongas {"{numero_gym}"}. El mensaje se envía desde el WhatsApp del
                teléfono que lo manda.
              </p>
              <input
                type="tel"
                value={numberDraft}
                onChange={(e) => {
                  setNumberDraft(e.target.value);
                  setSaved(false);
                }}
                placeholder="441 100 0000"
                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-64"
              />
            </section>

            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Links de pago — Mercado Pago</h2>
              <p className="mt-1 text-sm text-gray-500">
                Crea un link de pago por importe en la app de Mercado Pago (Cobrar → Link de pago, monto fijo) y
                pégalo aquí. Con el link guardado, cada cliente verá un botón de <strong>Pagar</strong> junto a sus
                pagos pendientes en su portal, y la variable {"{link_pago}"} del mensaje de WhatsApp se rellena con
                el link de ese importe.
              </p>
              <div className="mt-3 space-y-3">
                {MP_LINKS.map((l) => (
                  <div key={l.key}>
                    <label className="text-sm font-medium text-gray-700">
                      {l.label} <span className="font-normal text-gray-500">· {l.hint}</span>
                    </label>
                    <input
                      type="url"
                      value={mpDrafts[l.key] ?? ""}
                      onChange={(e) => {
                        setMpDrafts((prev) => ({ ...prev, [l.key]: e.target.value }));
                        setSaved(false);
                      }}
                      placeholder="https://mpago.la/…"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  saveSetting("whatsapp_template", templateDraft);
                  saveSetting("whatsapp_number", numberDraft);
                  for (const l of MP_LINKS) saveSetting(l.key, mpDrafts[l.key] ?? "");
                  setSaved(true);
                }}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
              >
                Guardar ajustes
              </button>
              {saved && <span className="text-sm text-green-700">Guardado ✓</span>}
            </div>
          </>
        )}
      </main>
    </RequireAuth>
  );
}
