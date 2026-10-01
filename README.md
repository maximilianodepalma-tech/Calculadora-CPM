# Calculadora de CPM programático · LatinAd

Herramienta web para que media owners calculen el CPM programático (USD) equivalente a su tarifa de venta tradicional.

- **El cálculo se hace en el servidor** (`lib/calc.ts` y `app/api/calcular`). El navegador solo envía los datos y recibe el resultado, así que la fórmula no queda expuesta.
- **Tipo de cambio diario** para 21 países, desde open.er-api.com, cacheado 24 h. Si la API falla, usa la tabla de respaldo de `lib/fx.ts`.
- **Formulario de contacto** (nombre, empresa y email) antes de mostrar el primer resultado.
- **Clave de acceso única + registro**: al entrar por primera vez se piden nombre completo, email, teléfono, empresa, cargo y la clave.
- **Registro de cada consulta** en una Google Sheet (u otro sistema) vía webhook.
- Página marcada como `noindex`: no aparece en Google.

---

## 1. Publicar en Vercel (unos 10 minutos)

1. Crea un repositorio **privado** en GitHub (por ejemplo `calculadora-cpm-latinad`) y sube el contenido de esta carpeta.
   - Sin usar la terminal: en GitHub, *Add file → Upload files* y arrastra todas las carpetas y archivos.
2. Entra a [vercel.com](https://vercel.com) → **Add New → Project** → importa el repositorio.
3. Vercel detecta Next.js solo. Presiona **Deploy**.
4. Listo: obtienes un link `https://calculadora-cpm-latinad.vercel.app`. En *Settings → Domains* puedes usar un subdominio propio, por ejemplo `cpm.latinad.com`.

> Uso comercial: el plan gratuito (Hobby) de Vercel es solo para uso personal. Para una herramienta de la empresa corresponde el plan **Pro**.

## 2. Configuración (Vercel → Settings → Environment Variables)

Todas son opcionales. Después de cambiarlas, haz **Redeploy**.

| Variable | Para qué sirve | Ejemplo |
|---|---|---|
| `REQUIRE_LEAD` | Pedir nombre, empresa y email antes del resultado. Por defecto `true`. | `true` |
| `LEADS_WEBHOOK_URL` | Adónde se envía cada consulta (ver punto 3). | `https://script.google.com/macros/s/.../exec` |
| `ACCESS_KEY` | Clave única de acceso. Activa la pantalla de registro. Si está vacía, el acceso es libre. | `LatinAdCPM2026` |

### Clave de acceso

Con `ACCESS_KEY` definida:

- Quien entra por primera vez ve un formulario: nombre completo, email, teléfono, empresa, cargo y clave de acceso (todos obligatorios).
- Si la clave es correcta, queda registrado (fila `tipo = registro` en la Google Sheet) y entra a la calculadora por 90 días desde ese navegador.
- Cada cálculo se registra como `tipo = consulta`, con los datos de la persona.
- Hay un freno de 8 intentos fallidos cada 15 minutos por IP.
- Para cortar el acceso a todos (por ejemplo si la clave se filtró), cambia `ACCESS_KEY` y haz Redeploy: todos deberán registrarse con la nueva clave.

## 3. Guardar las consultas en una Google Sheet

1. Crea una Google Sheet nueva y escribe en la fila 1:
   `tipo | fecha | acceso | nombre | empresa | email | telefono | cargo | pais | moneda | tarifaLocal | descuento | duracionSpot | anunciantes | horas | audiencia | periodoAudiencia | cpmEvaluar | tipoCambio | origenTipoCambio | cpmRecomendadoUsd | multiplicador | diferencia`
2. Menú **Extensiones → Apps Script**, borra lo que haya y pega:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  sheet.appendRow(headers.map(h => data[h] ?? ""));
  return ContentService.createTextOutput("ok");
}
```

3. **Implementar → Nueva implementación → Aplicación web**. En "Quién tiene acceso" elige **Cualquier usuario**, implementa y copia la URL.
4. Pega esa URL en `LEADS_WEBHOOK_URL` en Vercel y haz Redeploy.

Cada consulta también queda en *Vercel → Logs* (busca `[consulta]`).

## 4. Mantenimiento

- **Tipos de cambio de respaldo**: en `lib/fx.ts`, la constante `FALLBACK`. Solo se usan si la API diaria no responde.
- **Países**: en `lib/countries.ts` (nombre y moneda) y en `lib/fx.ts` (respaldo).
- **Logo**: `components/Logo.tsx` es una versión en SVG + Poppins. Para usar el archivo oficial, deja `logo-latinad.svg` (versión blanca) en `public/` y reemplaza el componente por `<img src="/logo-latinad.svg" alt="LatinAd" height={26} />`.
- **Modelo de cálculo**: `lib/calc.ts`. La audiencia ingresada es el total de la pantalla (todos los slots) y se reparte entre los anunciantes: CPM = tarifa neta USD × anunciantes ÷ audiencia mensual × 1.000. `npm test` verifica el modelo (ejemplo de Chile: CPM US$ 39,95 con TC 973,47).

## Desarrollo local (opcional)

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # verifica el modelo
```
