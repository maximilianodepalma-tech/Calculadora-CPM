import "server-only";

// Envía cada consulta a un webhook (ej. Google Apps Script -> Google Sheets, Zapier, Make, HubSpot).
// Evita que Google Sheets interprete textos como fórmulas (ej. "+56 9..." o "=HYPERLINK(...)").
function comoTexto(payload: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = typeof v === "string" && /^[=+\-@]/.test(v) ? `'${v}` : v;
  }
  return out;
}

export async function registrarConsulta(raw: Record<string, unknown>) {
  const payload = comoTexto(raw);
  const url = process.env.LEADS_WEBHOOK_URL;
  console.log("[consulta]", JSON.stringify(payload)); // visible en Vercel > Logs
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });
  } catch (e) {
    console.error("[consulta] webhook falló", e);
  }
}
