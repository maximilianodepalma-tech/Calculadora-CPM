// Modelo de cálculo LatinAd. Este archivo solo se ejecuta en el servidor
// (se importa desde la API), nunca se envía al navegador.

export type CalcInput = {
  tarifaLocal: number;      // tarifa mensual por pantalla, 1 anunciante, moneda local
  descuento: number;        // 0..0.95
  duracionSpot: number;     // segundos
  anunciantes: number;      // máximo por pantalla
  horas: number;            // horas de funcionamiento al día
  audiencia: number;        // personas que ven la pantalla
  periodoAudiencia: "mensual" | "semanal";
  tipoAudiencia?: "pantalla" | "anunciante"; // por defecto "pantalla"
  cpmEvaluar?: number | null; // USD, opcional
  tipoCambio: number;       // moneda local por 1 USD
};

export type CalcOutput = {
  tarifaUsd: number;
  multiplicador: number;
  costoSpotTradicional: number;
  cpmRecomendado: number;
  costoSpotPdooh: number | null;
  diferencia: number | null;
};

const DIAS_MES = 30;

// Metodología según el tipo de audiencia que tenga el media owner:
//  - "pantalla": la audiencia es el total de la pantalla (todos los slots). Se reparte
//    entre los anunciantes: CPM = tarifa neta USD × anunciantes / audiencia mensual × 1.000.
//  - "anunciante": la audiencia ya es la que recibe cada anunciante. Se aplica completa:
//    CPM = tarifa neta USD / audiencia mensual × 1.000.

export function calcular(i: CalcInput): CalcOutput {
  const tarifaUsd = i.tarifaLocal / i.tipoCambio;
  const tarifaNetaUsd = tarifaUsd * (1 - i.descuento);
  // Duración de la rotación completa (loop): todos los anunciantes pasan una vez.
  const loop = i.duracionSpot * i.anunciantes;
  // Spots que recibe UN anunciante al mes (una salida por loop).
  const spotsMes = ((i.horas * 3600) / loop) * DIAS_MES;
  // Spots totales que emite la pantalla al mes (todos los slots).
  const spotsTotalesMes = spotsMes * i.anunciantes;
  const audienciaMes = i.periodoAudiencia === "semanal" ? i.audiencia * (DIAS_MES / 7) : i.audiencia;
  // Personas por spot:
  //  - pantalla: la audiencia se reparte entre TODOS los spots de la pantalla.
  //  - anunciante: la audiencia se reparte solo entre los spots de ese anunciante.
  const porAnunciante = i.tipoAudiencia === "anunciante";
  const multiplicador = audienciaMes / (porAnunciante ? spotsMes : spotsTotalesMes);
  const costoSpotTradicional = tarifaNetaUsd / spotsMes;
  const cpmRecomendado = (costoSpotTradicional / multiplicador) * 1000;
  const tieneCpm = i.cpmEvaluar != null && i.cpmEvaluar > 0;
  const costoSpotPdooh = tieneCpm ? ((i.cpmEvaluar as number) * multiplicador) / 1000 : null;
  const diferencia = costoSpotPdooh != null ? costoSpotPdooh / costoSpotTradicional - 1 : null;
  return { tarifaUsd, multiplicador, costoSpotTradicional, cpmRecomendado, costoSpotPdooh, diferencia };
}
