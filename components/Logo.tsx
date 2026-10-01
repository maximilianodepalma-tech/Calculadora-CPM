// Logotipo oficial LatinAd, vectorizado desde el Manual de marca (06-2025).
// Variantes según "Uso del logo correcto":
//  - "color": isotipo azul #218AE7 + nombre gris oscuro #222222 (fondos blancos o claros)
//  - "white": logo completo en blanco (fondos azules, oscuros y degradados de marca)
// No modificar proporciones, colores ni agregar bordes o sombras.

const W = 256.00;
const H = 44.10;

const ISOTIPO = [
  "M14.7 14.67H29.41V29.38H14.7Z",
  "M36.77 36.74H44.13V44.1H36.77Z",
  "M7.34 14.67L-0.01 14.67L-0.01 44.1L29.41 44.1L29.41 36.74L7.34 36.74L7.34 14.67Z",
  "M-0.01 -0.04H7.35V7.32H-0.01Z",
  "M14.7 -0.04L14.7 7.32L36.77 7.32L36.77 29.38L44.12 29.38L44.12 -0.04L14.7 -0.04Z",
];

const NOMBRE = [
  "M57.86 38.81L57.86 6.65L61.61 6.65L61.61 35.33L80.38 35.33L80.38 38.81L57.86 38.81Z",
  "M97.69 14.26L97.26 14.26L90.45 29.16L90.18 29.64L104.82 29.64L104.55 29.16L97.69 14.26ZM97.05 6.65L97.9 6.65L113.77 38.81L109.48 38.81L106.64 33.24L88.36 33.24L85.52 38.81L81.29 38.81L97.05 6.65Z",
  "M111.31 6.65L137.63 6.65L137.63 10.13L126.32 10.13L126.32 38.81L122.56 38.81L122.56 10.13L111.31 10.13L111.31 6.65Z",
  "M143.04 6.65H146.79V38.81H143.04Z",
  "M184.1 38.81L182.98 38.81L159.77 14.53L159.77 38.81L156.01 38.81L156.01 6.65L157.14 6.65L180.35 30.82L180.35 6.65L184.1 6.65L184.1 38.81Z",
  "M205.55 20.26L205.12 20.26L201.15 28.68L200.67 29.54L210 29.54L209.51 28.68L205.55 20.26ZM204.74 6.65L206.03 6.65L222.92 38.81L214.12 38.81L212.35 35.01L198.36 35.01L196.65 38.81L187.91 38.81L204.74 6.65Z",
  "M233.37 13.35L233.37 32.11L238.35 32.11C243.93 32.11 247.95 28.95 247.95 22.73C247.95 16.51 243.93 13.35 238.35 13.35L233.37 13.35ZM238.94 38.81L225.6 38.81L225.6 6.65L238.94 6.65C249.67 6.65 255.99 13.51 255.99 22.73C255.99 31.95 249.67 38.81 238.94 38.81Z",
];

type Props = { height?: number; variant?: "color" | "white" };

export default function Logo({ height = 28, variant = "white" }: Props) {
  const iso = variant === "color" ? "#218AE7" : "#FFFFFF";
  const name = variant === "color" ? "#222222" : "#FFFFFF";
  return (
    <svg
      className="logo"
      viewBox={`0 0 ${W} ${H}`}
      height={height}
      width={(height * W) / H}
      role="img"
      aria-label="LatinAd"
    >
      <g fill={iso}>{ISOTIPO.map((d, i) => <path key={i} d={d} />)}</g>
      <g fill={name}>{NOMBRE.map((d, i) => <path key={i} d={d} />)}</g>
    </svg>
  );
}

// Solo el isotipo (para usos donde no cabe el logotipo completo)
export function Isotipo({ size = 56, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 44.1 44.1" width={size} height={size} aria-hidden="true">
      <g fill={color}>{ISOTIPO.map((d, i) => <path key={i} d={d} />)}</g>
    </svg>
  );
}
