import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, accessKey, leerSesion } from "@/lib/session";

// Si ACCESS_KEY está definida, la calculadora exige clave + registro (pantalla /acceso).
// Si está vacía, el acceso es libre.
export async function middleware(req: NextRequest) {
  if (!accessKey()) return NextResponse.next();

  const url = req.nextUrl;
  if (url.pathname === "/api/acceso") return NextResponse.next();

  const perfil = await leerSesion(req.cookies.get(SESSION_COOKIE)?.value);
  if (perfil) return NextResponse.next();

  if (url.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Acceso no autorizado." }, { status: 401 });
  }
  const to = url.clone();
  to.pathname = "/acceso";
  to.search = "";
  return NextResponse.rewrite(to);
}

export const config = {
  matcher: ["/((?!_next/|acceso|favicon|icon|.*\\.(?:svg|png|ico|jpg|webp)$).*)"],
};
