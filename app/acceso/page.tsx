import Logo from "@/components/Logo";

export default function Acceso() {
  return (
    <div className="page center">
      <div className="card gate">
        <div className="gate-logo"><Logo height={26} /></div>
        <h1>Acceso restringido</h1>
        <p>Esta calculadora está disponible solo con un link de invitación. Pide el tuyo a tu contacto en LatinAd.</p>
      </div>
    </div>
  );
}
