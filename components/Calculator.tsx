"use client";

import { Isotipo } from "@/components/Logo";

import { useEffect, useMemo, useState } from "react";
import type { Country } from "@/lib/countries";

type Result = {
  moneda: string;
  tipoCambio: number;
  origenTipoCambio: "diario" | "respaldo";
  fechaTipoCambio: string;
  tarifaUsd: number;
  multiplicador: number;
  costoSpotTradicional: number;
  cpmRecomendado: number;
  costoSpotPdooh: number | null;
  diferencia: number | null;
};
type Lead = { nombre: string; empresa: string; email: string };

const LEAD_KEY = "la_lead";
const fmt = (n: number, d = 0) =>
  new Intl.NumberFormat("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const usd = (n: number, d = 2) => `US$ ${fmt(n, d)}`;
const digits = (s: string) => s.replace(/\D/g, "");
const decimal = (s: string) => {
  const clean = s.replace(/[^\d,]/g, "");
  const [a, ...b] = clean.split(",");
  return b.length ? `${a},${b.join("").slice(0, 2)}` : a;
};
const showInt = (raw: string) => (raw ? fmt(Number(raw)) : "");

function readLead(): Lead | null {
  try {
    const v = localStorage.getItem(LEAD_KEY);
    return v ? (JSON.parse(v) as Lead) : null;
  } catch {
    return null;
  }
}
function saveLead(l: Lead) {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify(l));
  } catch {}
}

export default function Calculator({ countries, requireLead }: { countries: Country[]; requireLead: boolean }) {
  const [pais, setPais] = useState("");
  const [tarifa, setTarifa] = useState("");
  const [descuento, setDescuento] = useState("");
  const [duracion, setDuracion] = useState("");
  const [anunciantes, setAnunciantes] = useState("");
  const [horas, setHoras] = useState("");
  const [audiencia, setAudiencia] = useState("");
  const [periodo, setPeriodo] = useState<"mensual" | "semanal">("mensual");
  const [cpm, setCpm] = useState("");

  const [lead, setLead] = useState<Lead | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadDraft, setLeadDraft] = useState<Lead>({ nombre: "", empresa: "", email: "" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => setLead(readLead()), []);

  const country = useMemo(() => countries.find((c) => c.name === pais), [countries, pais]);
  const complete = pais && tarifa && descuento !== "" && duracion && anunciantes && horas && audiencia;

  async function run(withLead: Lead | null) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pais,
          tarifa,
          descuento,
          duracionSpot: duracion,
          anunciantes,
          horas,
          audiencia,
          periodoAudiencia: periodo,
          cpmEvaluar: cpm ? cpm.replace(",", ".") : "",
          lead: withLead ?? undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 428) {
        setLeadOpen(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "No pudimos calcular. Intenta nuevamente.");
      setResult(data as Result);
      if (typeof window !== "undefined" && window.innerWidth < 900) {
        requestAnimationFrame(() => document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) {
      setError("Completa todos los datos obligatorios.");
      return;
    }
    if (requireLead && !lead) {
      setLeadOpen(true);
      return;
    }
    run(lead);
  }

  function onLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    const l = { nombre: leadDraft.nombre.trim(), empresa: leadDraft.empresa.trim(), email: leadDraft.email.trim() };
    if (!l.nombre || !l.empresa || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(l.email)) return;
    saveLead(l);
    setLead(l);
    setLeadOpen(false);
    run(l);
  }

  const diffPositive = result?.diferencia != null && result.diferencia >= 0;
  const maxSpot = result ? Math.max(result.costoSpotTradicional, result.costoSpotPdooh ?? 0) : 1;

  return (
    <div className="grid">
      <form className="card form" onSubmit={onSubmit} noValidate>
        <h2>Datos de tu pantalla</h2>

        <div className="field">
          <label htmlFor="pais">País</label>
          <select id="pais" value={pais} onChange={(e) => setPais(e.target.value)}>
            <option value="">Selecciona un país</option>
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="tarifa">Tarifa mensual por pantalla</label>
          <div className="affix">
            <input
              id="tarifa"
              inputMode="numeric"
              placeholder="1.500.000"
              value={showInt(tarifa)}
              onChange={(e) => setTarifa(digits(e.target.value))}
            />
            <span>{country?.currency ?? "Moneda local"}</span>
          </div>
          <small>Precio de lista que paga un anunciante por un mes.</small>
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="descuento">Descuento promedio</label>
            <div className="affix">
              <input
                id="descuento"
                inputMode="numeric"
                placeholder="30"
                value={descuento}
                onChange={(e) => setDescuento(digits(e.target.value).slice(0, 2))}
              />
              <span>%</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="duracion">Duración del anuncio</label>
            <div className="affix">
              <input
                id="duracion"
                inputMode="numeric"
                placeholder="10"
                value={duracion}
                onChange={(e) => setDuracion(digits(e.target.value).slice(0, 3))}
              />
              <span>seg</span>
            </div>
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="anunciantes">Máx. anunciantes por pantalla</label>
            <input
              id="anunciantes"
              inputMode="numeric"
              placeholder="6"
              value={anunciantes}
              onChange={(e) => setAnunciantes(digits(e.target.value).slice(0, 3))}
            />
          </div>
          <div className="field">
            <label htmlFor="horas">Horas de funcionamiento al día</label>
            <div className="affix">
              <input
                id="horas"
                inputMode="numeric"
                placeholder="18"
                value={horas}
                onChange={(e) => setHoras(digits(e.target.value).slice(0, 2))}
              />
              <span>h</span>
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="audiencia">Audiencia total de la pantalla</label>
          <div className="aud">
            <input
              id="audiencia"
              inputMode="numeric"
              placeholder="162.000"
              value={showInt(audiencia)}
              onChange={(e) => setAudiencia(digits(e.target.value))}
            />
            <div className="seg" role="radiogroup" aria-label="Período de la audiencia">
              {(["mensual", "semanal"] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  role="radio"
                  aria-checked={periodo === p}
                  className={periodo === p ? "on" : ""}
                  onClick={() => setPeriodo(p)}
                >
                  {p === "mensual" ? "Mensual" : "Semanal"}
                </button>
              ))}
            </div>
          </div>
          <small>Total de personas que ven la pantalla en el período, sumando todos los slots. Se reparte entre los anunciantes del loop.</small>
        </div>

        <div className="divider" />

        <div className="field">
          <label htmlFor="cpm">
            CPM a evaluar <em>opcional</em>
          </label>
          <div className="affix">
            <input
              id="cpm"
              inputMode="decimal"
              placeholder="8,00"
              value={cpm}
              onChange={(e) => setCpm(decimal(e.target.value))}
            />
            <span>USD</span>
          </div>
          <small>El CPM que te ofrecen o que quieres cobrar, para compararlo con tu venta tradicional.</small>
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="cta" type="submit" disabled={loading}>
          {loading ? "Calculando…" : "Calcular CPM"}
        </button>
      </form>

      <section id="resultado" className="results" aria-live="polite">
        {!result ? (
          <div className="empty">
            <div className="empty-mark"><Isotipo size={56} color="#218AE7" /></div>
            <h2>Tu CPM recomendado aparecerá aquí</h2>
            <p>Completa los datos de tu pantalla y presiona “Calcular CPM”.</p>
          </div>
        ) : (
          <>
            <div className="hero-metric">
              <span className="label">CPM programático recomendado</span>
              <span className="big">{usd(result.cpmRecomendado)}</span>
              <span className="sub">por cada mil impresiones · equivale a tu tarifa tradicional</span>
            </div>

            <div className="kpis">
              <div className="kpi">
                <span className="label">Multiplicador</span>
                <span className="val">{fmt(result.multiplicador, 1)}</span>
                <span className="sub">personas por spot (audiencia ÷ spots totales)</span>
              </div>
              <div className="kpi">
                <span className="label">Tarifa en USD</span>
                <span className="val">{usd(result.tarifaUsd)}</span>
                <span className="sub">precio de lista mensual</span>
              </div>
              <div className="kpi">
                <span className="label">Tipo de cambio</span>
                <span className="val">{fmt(result.tipoCambio, 2)}</span>
                <span className="sub">
                  {result.moneda} por USD ·{" "}
                  {result.origenTipoCambio === "diario" ? `al ${result.fechaTipoCambio.split("-").reverse().join("-")}` : "valor de respaldo"}
                </span>
              </div>
            </div>

            <div className="compare">
              <h3>Costo por spot</h3>
              <div className="bar-row">
                <span className="bar-label">Venta tradicional</span>
                <div className="bar-track">
                  <div className="bar trad" style={{ width: `${(result.costoSpotTradicional / maxSpot) * 100}%` }} />
                </div>
                <span className="bar-val">{usd(result.costoSpotTradicional, 4)}</span>
              </div>
              {result.costoSpotPdooh != null ? (
                <>
                  <div className="bar-row">
                    <span className="bar-label">PDOOH con CPM {usd(Number(cpm.replace(",", ".")))}</span>
                    <div className="bar-track">
                      <div className="bar pdooh" style={{ width: `${(result.costoSpotPdooh / maxSpot) * 100}%` }} />
                    </div>
                    <span className="bar-val">{usd(result.costoSpotPdooh, 4)}</span>
                  </div>
                  <div className={`verdict ${diffPositive ? "up" : "down"}`}>
                    <strong>
                      {diffPositive ? "+" : ""}
                      {fmt((result.diferencia ?? 0) * 100, 1)}%
                    </strong>
                    <span>
                      {diffPositive
                        ? "Con este CPM, cada spot en programático rinde más que en venta tradicional."
                        : "Con este CPM, cada spot en programático rinde menos que en venta tradicional."}
                    </span>
                  </div>
                </>
              ) : (
                <p className="hint">Ingresa un CPM a evaluar para comparar el costo por spot en programático.</p>
              )}
            </div>
          </>
        )}
      </section>

      {leadOpen && (
        <div className="modal-bg" role="dialog" aria-modal="true" aria-labelledby="lead-title">
          <form className="card modal" onSubmit={onLeadSubmit}>
            <h2 id="lead-title">Un paso antes de ver tu resultado</h2>
            <p>Déjanos tus datos para enviarte novedades y ayudarte a activar tus pantallas en programático.</p>
            <div className="field">
              <label htmlFor="l-nombre">Nombre</label>
              <input
                id="l-nombre"
                autoComplete="name"
                required
                value={leadDraft.nombre}
                onChange={(e) => setLeadDraft({ ...leadDraft, nombre: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="l-empresa">Empresa</label>
              <input
                id="l-empresa"
                autoComplete="organization"
                required
                value={leadDraft.empresa}
                onChange={(e) => setLeadDraft({ ...leadDraft, empresa: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="l-email">Email</label>
              <input
                id="l-email"
                type="email"
                autoComplete="email"
                required
                value={leadDraft.email}
                onChange={(e) => setLeadDraft({ ...leadDraft, email: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="ghost" onClick={() => setLeadOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="cta">
                Ver resultado
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
