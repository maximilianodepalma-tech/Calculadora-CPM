import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, parseAccessCodes } from "@/lib/access";

export function middleware(req: NextRequest) {
  const codes = parseAccessCodes(process.env.ACCESS_CODES);
  if (codes.size === 0) return NextResponse.next(); // acceso libre

  const url = req.nextUrl;
  const k = url.searchParams.get("k");
  if (k && codes.has(k)) {
    const clean = url.clone();
    clean.searchParams.delete("k");
    const res = NextResponse.redirect(clean);
    res.cookies.set(ACCESS_COOKIE, k, {
      httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 90,
    });
    return res;
  }

  const cookie = req.cookies.get(ACCESS_COOKIE)?.value;
  if (cookie && codes.has(cookie)) return NextResponse.next();

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
