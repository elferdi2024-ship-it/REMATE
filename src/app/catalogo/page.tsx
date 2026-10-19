import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogoPageClient from "./CatalogoPageClient";
import { ProductoSkeleton } from "@/components/catalogo/ProductoSkeleton";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Catálogo Mayorista — El Remate Canelones",
    description: "Más de 1900 productos al mejor precio. Navegá por categorías y enviá tu pedido por WhatsApp.",
  };
}

export default async function CatalogoPage() {
  return (
    <Suspense fallback={<ProductoSkeleton />}>
      <CatalogoPageClient />
    </Suspense>
  );
}
