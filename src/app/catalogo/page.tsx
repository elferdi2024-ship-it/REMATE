import type { Metadata } from "next";
import CatalogoPageClient from "./CatalogoPageClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Catálogo Mayorista — El Remate Canelones",
    description: "Más de 1900 productos al mejor precio. Navegá por categorías y enviá tu pedido por WhatsApp.",
  };
}

export default async function CatalogoPage() {
  return <CatalogoPageClient />;
}
