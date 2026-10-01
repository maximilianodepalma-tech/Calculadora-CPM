// Links personalizados: ACCESS_CODES="codigo1:Nombre 1,codigo2:Nombre 2"
export function parseAccessCodes(raw: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!raw) return map;
  for (const part of raw.split(",")) {
    const [code, ...rest] = part.split(":");
    const c = code?.trim();
    if (c) map.set(c, rest.join(":").trim() || c);
  }
  return map;
}
export const ACCESS_COOKIE = "la_acceso";
