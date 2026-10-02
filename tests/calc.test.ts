// Verifica el modelo: la audiencia es el total de la pantalla (todos los slots).
import { calcular } from "../lib/calc.ts";
import assert from "node:assert/strict";

const close = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

const base = {
  tarifaLocal: 1_500_000, descuento: 0.3, duracionSpot: 10, anunciantes: 6, horas: 18,
  audiencia: 162_000, periodoAudiencia: "mensual" as const, cpmEvaluar: 8, tipoCambio: 973.47,
};
const r = calcular(base);
const neta = (1_500_000 / 973.47) * 0.7;          // 1.078,6157 USD
close(r.tarifaUsd, 1540.87953403803);
close(r.multiplicador, 162_000 / 194_400);        // 0,8333 personas por spot (32.400 spots × 6 slots)
close(r.costoSpotTradicional, neta / 32_400);     // 0,03329 USD por spot del anunciante
close(r.cpmRecomendado, (neta * 6 / 162_000) * 1000); // 39,9487 USD
close(r.cpmRecomendado, 39.9487286602452);
close(r.costoSpotPdooh!, 8 * (162_000 / 194_400) / 1000);
close(r.diferencia!, 8 / r.cpmRecomendado - 1);

// Audiencia semanal equivalente (162.000 mensual = 37.800 semanal)
const s = calcular({ ...base, audiencia: 37_800, periodoAudiencia: "semanal", cpmEvaluar: null });
close(s.cpmRecomendado, r.cpmRecomendado);
assert.equal(s.costoSpotPdooh, null);

// Más anunciantes compartiendo la misma audiencia => CPM proporcionalmente mayor
close(calcular({ ...base, anunciantes: 12 }).cpmRecomendado, r.cpmRecomendado * 2);
// Duración y horas no cambian el CPM (solo cuántos spots recibe el anunciante)
close(calcular({ ...base, duracionSpot: 30, horas: 12 }).cpmRecomendado, r.cpmRecomendado);

// Audiencia por anunciante: se aplica completa (sin dividir por anunciantes)
const a = calcular({ ...base, tipoAudiencia: "anunciante" });
close(a.cpmRecomendado, (neta / 162_000) * 1000);   // 6,6581 USD
close(a.cpmRecomendado, r.cpmRecomendado / 6);
close(a.multiplicador, 162_000 / 32_400);            // 5 personas por spot del anunciante
close(a.diferencia!, 8 / a.cpmRecomendado - 1);
// 27.000 por anunciante equivale a 162.000 total con 6 anunciantes
close(calcular({ ...base, tipoAudiencia: "anunciante", audiencia: 27_000 }).cpmRecomendado, r.cpmRecomendado);
// Con audiencia por anunciante, la cantidad de anunciantes no cambia el CPM
close(calcular({ ...base, tipoAudiencia: "anunciante", anunciantes: 12 }).cpmRecomendado, a.cpmRecomendado);

console.log("OK: modelo con audiencia total de la pantalla y por anunciante");
