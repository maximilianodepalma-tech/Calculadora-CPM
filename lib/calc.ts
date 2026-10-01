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

export function calcular(i: CalcInput): CalcOutput {
  const tarifaUsd = i.tarifaLocal / i.tipoCambio;
  const tarifaNetaUsd = tarifaUsd * (1 - i.descuento);
  const loop = i.duracionSpot * i.anunciantes;
  const spotsMes = ((i.horas * 3600) / loop) * DIAS_MES;
  const audienciaMes = i.periodoAudiencia === "semanal" ? i.audiencia * (DIAS_MES / 7) : i.audiencia;
  const multiplicador = audienciaMes / spotsMes;
  const costoSpotTradicional = tarifaNetaUsd / spotsMes;
  const cpmRecomendado = (costoSpotTradicional / multiplicador) * 1000;
  const tieneCpm = i.cpmEvaluar != null && i.cpmEvaluar > 0;
  const costoSpotPdooh = tieneCpm ? ((i.cpmEvaluar as number) * multiplicador) / 1000 : null;
  const diferencia = costoSpotPdooh != null ? costoSpotPdooh / costoSpotTradicional - 1 : null;
  return { tarifaUsd, multiplicador, costoSpotTradicional, cpmRecomendado, costoSpotPdooh, diferencia };
}
