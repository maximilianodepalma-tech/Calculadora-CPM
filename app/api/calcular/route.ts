import { NextRequest, NextResponse } from "next/server";
import { calcular } from "@/lib/calc";
import { getUsdRate } from "@/lib/fx";
import { COUNTRIES } from "@/lib/countries";
import { registrarConsulta } from "@/lib/log";
import { ACCESS_COOKIE, parseAccessCodes } from "@/lib/access";

export const runtime = "nodejs";

const num = (v: unknown) => (typeof v === "number" ? v : Number(String(v ?? "").replace(",", ".")));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Solicitud inválida.");
  }

  const country = COUNTRIES.find((c) => c.name === body.pais);
  if (!country) return bad("Selecciona un país.");

  const tarifaLocal = num(body.tarifa);
  const descuento = num(body.descuento) / 100;
  const duracionSpot = num(body.duracionSpot);
  const anunciantes = num(body.anunciantes);
  const horas = num(body.horas);
  const audiencia = num(body.audiencia);
  const periodoAudiencia = body.periodoAudiencia === "semanal" ? "semanal" : "mensual";
  const cpmRaw = body.cpmEvaluar;
  const cpmEvaluar = cpmRaw === "" || cpmRaw == null ? null : num(cpmRaw);

  if (!(tarifaLocal > 0)) return bad("Ingresa la tarifa mensual.");
  if (!(descuento >= 0 && descuento < 0.96)) return bad("El descuento debe estar entre 0% y 95%.");
  if (!(duracionSpot > 0 && duracionSpot <= 300)) return bad("Revisa la duración del anuncio.");
  if (!(anunciantes >= 1 && anunciantes <= 100)) return bad("Revisa la cantidad de anunciantes.");
  if (!(horas > 0 && horas <= 24)) return bad("Las horas de funcionamiento deben estar entre 1 y 24.");
  if (!(audiencia > 0)) return bad("Ingresa la audiencia de la pantalla.");
  if (cpmEvaluar != null && !(cpmEvaluar > 0)) return bad("Revisa el CPM a evaluar.");

  // Contacto (lead)
  const requireLead = process.env.REQUIRE_LEAD !== "false";
  const lead = (body.lead ?? {}) as Record<string, unknown>;
  const nombre = String(lead.nombre ?? "").trim().slice(0, 120);
  const empresa = String(lead.empresa ?? "").trim().slice(0, 120);
  const email = String(lead.email ?? "").trim().slice(0, 160);
  if (requireLead && (!nombre || !empresa || !EMAIL.test(email))) {
    return NextResponse.json({ error: "lead_requerido" }, { status: 428 });
  }

  let fx;
  try {
    fx = await getUsdRate(country.currency);
  } catch {
    return bad("No hay tipo de cambio disponible para este país.", 502);
  }

  const r = calcular({
    tarifaLocal, descuento, duracionSpot, anunciantes, horas, audiencia,
    periodoAudiencia, cpmEvaluar, tipoCambio: fx.rate,
  });

  const codes = parseAccessCodes(process.env.ACCESS_CODES);
  const code = req.cookies.get(ACCESS_COOKIE)?.value;
  const acceso = code ? codes.get(code) ?? null : null;

  await registrarConsulta({
    fecha: new Date().toISOString(),
    acceso,
    nombre, empresa, email,
    pais: country.name, moneda: country.currency,
    tarifaLocal, descuento, duracionSpot, anunciantes, horas, audiencia, periodoAudiencia, cpmEvaluar,
    tipoCambio: fx.rate, origenTipoCambio: fx.source,
    cpmRecomendadoUsd: Number(r.cpmRecomendado.toFixed(2)),
    multiplicador: Number(r.multiplicador.toFixed(2)),
    diferencia: r.diferencia == null ? null : Number(r.diferencia.toFixed(4)),
  });

  return NextResponse.json({
    moneda: country.currency,
    tipoCambio: fx.rate,
    origenTipoCambio: fx.source,
    fechaTipoCambio: fx.date,
    ...r,
  }, { headers: { "Cache-Control": "no-store" } });
}
