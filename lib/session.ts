// Sesión de acceso firmada (HMAC-SHA256 con ACCESS_KEY). Funciona en Edge (middleware) y Node (API).
// Si se cambia ACCESS_KEY, todas las sesiones anteriores quedan inválidas y todos deben volver a ingresar.

export const SESSION_COOKIE = "la_sesion";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 días

export type Perfil = { nombre: string; email: string; telefono: string; empresa: string; cargo: string };

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode("la-session:" + secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data))));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function accessKey(): string {
  return (process.env.ACCESS_KEY ?? "").trim();
}

/** Compara la clave ingresada con ACCESS_KEY en tiempo constante (vía HMAC). */
export async function claveValida(ingresada: string): Promise<boolean> {
  const k = accessKey();
  if (!k) return false;
  return safeEqual(await hmac(k, "clave:" + ingresada.trim()), await hmac(k, "clave:" + k));
}

export async function crearSesion(p: Perfil): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ ...p, iat: Date.now() })));
  return `${payload}.${await hmac(accessKey(), payload)}`;
}

export async function leerSesion(token: string | undefined): Promise<Perfil | null> {
  const k = accessKey();
  if (!k || !token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (!safeEqual(sig, await hmac(k, payload))) return null;
  try {
    const d = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (typeof d.iat !== "number" || Date.now() - d.iat > SESSION_MAX_AGE * 1000) return null;
    return { nombre: d.nombre, email: d.email, telefono: d.telefono, empresa: d.empresa, cargo: d.cargo };
  } catch {
    return null;
  }
}
