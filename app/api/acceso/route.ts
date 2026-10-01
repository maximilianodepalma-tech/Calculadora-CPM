import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, accessKey, claveValida, crearSesion } from "@/lib/session";
import { registrarConsulta } from "@/lib/log";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const txt = (v: unknown, max = 120) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

// Intentos fallidos por IP (en memoria de la instancia; freno básico contra fuerza bruta).
const fallos = new Map<string, { n: number; t: number }>();
const VENTANA = 15 * 60 * 1000;
const MAX_FALLOS = 8;

export async function POST(req: NextRequest) {
  if (!accessKey()) return NextResponse.json({ ok: true });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "anon";
  const f = fallos.get(ip);
  if (f && Date.now() - f.t < VENTANA && f.n >= MAX_FALLOS) {
    return NextResponse.json({ error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const perfil = {
    nombre: txt(body.nombre),
    email: txt(body.email, 160).toLowerCase(),
    telefono: txt(body.telefono, 40),
    empresa: txt(body.empresa),
    cargo: txt(body.cargo),
  };
  if (perfil.nombre.split(" ").length < 2) return NextResponse.json({ error: "Ingresa tu nombre y apellido." }, { status: 400 });
  if (!EMAIL.test(perfil.email)) return NextResponse.json({ error: "Ingresa un email válido." }, { status: 400 });
  if (perfil.telefono.replace(/\D/g, "").length < 8) return NextResponse.json({ error: "Ingresa un teléfono válido (con código de área)." }, { status: 400 });
  if (!perfil.empresa) return NextResponse.json({ error: "Ingresa tu empresa." }, { status: 400 });
  if (!perfil.cargo) return NextResponse.json({ error: "Ingresa tu cargo." }, { status: 400 });

  if (!(await claveValida(String(body.clave ?? "")))) {
    const prev = f && Date.now() - f.t < VENTANA ? f.n : 0;
    fallos.set(ip, { n: prev + 1, t: prev ? f!.t : Date.now() });
    return NextResponse.json({ error: "La clave de acceso no es correcta." }, { status: 401 });
  }
  fallos.delete(ip);

  await registrarConsulta({ tipo: "registro", fecha: new Date().toISOString(), acceso: "Clave general", ...perfil });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await crearSesion(perfil), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE,
  });
  return res;
}
