// Lista pública de países (solo nombre y moneda). No contiene lógica de cálculo.
export type Country = { name: string; currency: string; currencyName: string };

export const COUNTRIES: Country[] = [
  { name: "Argentina", currency: "ARS", currencyName: "Peso argentino" },
  { name: "Brasil", currency: "BRL", currencyName: "Real" },
  { name: "Canadá", currency: "CAD", currencyName: "Dólar canadiense" },
  { name: "Chile", currency: "CLP", currencyName: "Peso chileno" },
  { name: "Colombia", currency: "COP", currencyName: "Peso colombiano" },
  { name: "Costa Rica", currency: "CRC", currencyName: "Colón" },
  { name: "Ecuador", currency: "USD", currencyName: "Dólar" },
  { name: "El Salvador", currency: "USD", currencyName: "Dólar" },
  { name: "Estados Unidos", currency: "USD", currencyName: "Dólar" },
  { name: "Guatemala", currency: "GTQ", currencyName: "Quetzal" },
  { name: "Honduras", currency: "HNL", currencyName: "Lempira" },
  { name: "Jamaica", currency: "JMD", currencyName: "Dólar jamaiquino" },
  { name: "México", currency: "MXN", currencyName: "Peso mexicano" },
  { name: "Nicaragua", currency: "NIO", currencyName: "Córdoba" },
  { name: "Panamá", currency: "USD", currencyName: "Dólar" },
  { name: "Paraguay", currency: "PYG", currencyName: "Guaraní" },
  { name: "Perú", currency: "PEN", currencyName: "Sol" },
  { name: "Puerto Rico", currency: "USD", currencyName: "Dólar" },
  { name: "República Dominicana", currency: "DOP", currencyName: "Peso dominicano" },
  { name: "Trinidad y Tobago", currency: "TTD", currencyName: "Dólar de Trinidad y Tobago" },
  { name: "Uruguay", currency: "UYU", currencyName: "Peso uruguayo" },
];
