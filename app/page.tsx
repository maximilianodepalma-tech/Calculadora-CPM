import Calculator from "@/components/Calculator";
import Logo from "@/components/Logo";
import { COUNTRIES } from "@/lib/countries";

export default function Home() {
  return (
    <div className="page">
      <header className="topbar">
        <div className="wrap topbar-inner">
          <Logo height={26} variant="white" />
          <span className="tag">Herramienta para media owners</span>
        </div>
      </header>
      <main className="wrap">
        <section className="hero">
          <h1>Calculadora de CPM programático</h1>
          <p>
            Ingresa los datos de venta tradicional de tu pantalla y obtén el CPM en USD que equivale a lo que hoy cobras.
          </p>
        </section>
        <Calculator countries={COUNTRIES} requireLead={!process.env.ACCESS_KEY?.trim() && process.env.REQUIRE_LEAD !== "false"} />
      </main>
      <footer className="wrap foot">
        <span>© {new Date().getFullYear()} LatinAd</span>
        <span>Resultados referenciales. El CPM es neto para el media owner y no incluye comisiones de plataforma.</span>
      </footer>
    </div>
  );
}
