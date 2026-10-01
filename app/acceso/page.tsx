import Logo from "@/components/Logo";
import AccessForm from "@/components/AccessForm";

export default function Acceso() {
  return (
    <div className="page center">
      <div className="card gate">
        <div className="gate-logo"><Logo height={30} variant="color" /></div>
        <h1>Calculadora de CPM programático</h1>
        <p>Para ingresar por primera vez, completa tus datos y la clave de acceso.</p>
        <AccessForm />
      </div>
    </div>
  );
}
