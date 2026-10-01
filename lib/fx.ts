import "server-only";

// Tipos de cambio (unidades de moneda local por 1 USD).
// Respaldo cargado el 01-10-2026 desde open.er-api.com. Se usa solo si la API diaria falla.
const FALLBACK: Record<string, number> = {
  USD: 1, ARS: 1517.52, BRL: 5.2, CAD: 1.42, CLP: 973.47, COP: 3333.96, CRC: 456.62,
  GTQ: 7.64, HNL: 26.85, JMD: 158.46, MXN: 18.08, NIO: 36.79, PYG: 5856.02, PEN: 3.44,
  DOP: 59.5, TTD: 6.76, UYU: 40.23,
};
export const FALLBACK_DATE = "2026-10-01";

export type FxResult = { rate: number; source: "diario" | "respaldo"; date: string };

export async function getUsdRate(currency: string): Promise<FxResult> {
  if (currency === "USD") return { rate: 1, source: "diario", date: new Date().toISOString().slice(0, 10) };
  try {
    // Se cachea 24 h en Vercel: una consulta al día como máximo.
    const res = await fetch(process.env.FX_API_URL || "https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_unix?: number };
    const rate = data.rates?.[currency];
    if (data.result !== "success" || !rate || !Number.isFinite(rate)) throw new Error("sin tasa");
    const date = data.time_last_update_unix
      ? new Date(data.time_last_update_unix * 1000).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    return { rate, source: "diario", date };
  } catch {
    const rate = FALLBACK[currency];
    if (!rate) throw new Error(`Moneda no soportada: ${currency}`);
    return { rate, source: "respaldo", date: FALLBACK_DATE };
  }
}
