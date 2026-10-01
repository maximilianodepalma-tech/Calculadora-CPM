// Verifica que el modelo web entregue lo mismo que el Excel (pestaña Ejemplo).
import { calcular } from "../lib/calc.ts";
import assert from "node:assert/strict";

const close = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

const r = calcular({
  tarifaLocal: 1_500_000, descuento: 0.3, duracionSpot: 10, anunciantes: 6, horas: 18,
  audiencia: 162_000, periodoAudiencia: "mensual", cpmEvaluar: 8, tipoCambio: 973.47,
});
close(r.tarifaUsd, 1540.87953403803);
close(r.multiplicador, 5);
close(r.costoSpotTradicional, 0.033290607216871);
close(r.cpmRecomendado, 6.6581214433742);
close(r.costoSpotPdooh!, 0.04);
close(r.diferencia!, 0.201540114285714);

// Audiencia semanal equivalente (162.000 mensual = 37.800 semanal)
const s = calcular({
  tarifaLocal: 1_500_000, descuento: 0.3, duracionSpot: 10, anunciantes: 6, horas: 18,
  audiencia: 37_800, periodoAudiencia: "semanal", cpmEvaluar: null, tipoCambio: 973.47,
});
close(s.cpmRecomendado, 6.6581214433742);
assert.equal(s.costoSpotPdooh, null);
console.log("OK: el modelo web coincide con el Excel");
