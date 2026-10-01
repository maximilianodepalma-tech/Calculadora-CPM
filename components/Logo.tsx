// Logotipo LatinAd (aproximación en SVG + texto). Reemplazar por el archivo oficial si se desea:
// basta con cambiar este componente por <img src="/logo-latinad.svg" alt="LatinAd" />.
export default function Logo({ height = 28 }: { height?: number }) {
  return (
    <span className="logo" style={{ height }} aria-label="LatinAd">
      <svg viewBox="0 0 100 100" height={height} width={height} aria-hidden="true">
        <g fill="currentColor">
          <rect x="0" y="0" width="17" height="17" />
          <rect x="30" y="0" width="70" height="17" />
          <rect x="83" y="0" width="17" height="70" />
          <rect x="83" y="83" width="17" height="17" />
          <rect x="0" y="30" width="17" height="70" />
          <rect x="0" y="83" width="70" height="17" />
          <rect x="36" y="36" width="28" height="28" />
        </g>
      </svg>
      <span className="logo-word" style={{ fontSize: height * 0.98 }}>
        <span className="logo-latin">LATIN</span>
        <span className="logo-ad">AD</span>
      </span>
    </span>
  );
}
