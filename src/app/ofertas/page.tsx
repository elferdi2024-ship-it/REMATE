import type { Metadata } from "next";
import OfertasPageClient from "./OfertasPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Ofertas Destacadas — El Remate Canelones",
    description: "Ahorrá al máximo con nuestras ofertas flash y promociones por cantidad. Precios mayoristas actualizados.",
  };
}

export default function OfertasPage() {
  return <OfertasPageClient />;
}
