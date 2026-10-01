"use client";

import { useState } from "react";

const CAMPOS = [
  { id: "nombre", label: "Nombre completo", type: "text", auto: "name", ph: "Ej. María González" },
  { id: "email", label: "Email", type: "email", auto: "email", ph: "nombre@empresa.com" },
  { id: "telefono", label: "Teléfono", type: "tel", auto: "tel", ph: "+56 9 1234 5678" },
  { id: "empresa", label: "Empresa", type: "text", auto: "organization", ph: "" },
  { id: "cargo", label: "Cargo", type: "text", auto: "organization-title", ph: "Ej. Gerente comercial" },
] as const;

type Datos = Record<(typeof CAMPOS)[number]["id"] | "clave", string>;

export default function AccessForm() {
  const [d, setD] = useState<Datos>({ clave: "", nombre: "", email: "", telefono: "", empresa: "", cargo: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (Object.values(d).some((v) => !v.trim())) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No pudimos validar tu acceso.");
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setLoading(false);
    }
  }

  return (
    <form className="gate-form" onSubmit={onSubmit} noValidate>
      {CAMPOS.map((c) => (
        <div className="field" key={c.id}>
          <label htmlFor={`g-${c.id}`}>{c.label}</label>
          <input
            id={`g-${c.id}`}
            type={c.type}
            autoComplete={c.auto}
            placeholder={c.ph}
            required
            value={d[c.id]}
            onChange={(e) => setD({ ...d, [c.id]: e.target.value })}
          />
        </div>
      ))}
      <div className="divider" />
      <div className="field">
        <label htmlFor="g-clave">Clave de acceso</label>
        <input
          id="g-clave"
          type="password"
          autoComplete="off"
          required
          value={d.clave}
          onChange={(e) => setD({ ...d, clave: e.target.value })}
        />
        <small>Te la entrega tu contacto en LatinAd.</small>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="cta" disabled={loading}>
        {loading ? "Validando…" : "Ingresar a la calculadora"}
      </button>
    </form>
  );
}
