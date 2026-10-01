import "server-only";

// Envía cada consulta a un webhook (ej. Google Apps Script -> Google Sheets, Zapier, Make, HubSpot).
export async function registrarConsulta(payload: Record<string, unknown>) {
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
