// filepath: src/app/catalogo/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogoPageClient from "./CatalogoPageClient";
import { ProductoSkeleton } from "@/components/catalogo/ProductoSkeleton";
import { SUCURSALES } from "@/lib/sucursales";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { sucursal?: string };
}): Promise<Metadata> {
  const sucursalObj = searchParams?.sucursal
    ? SUCURSALES.find((s) => s.id === searchParams.sucursal)
    : undefined;

  if (sucursalObj) {
    return {
      title: `Catálogo Sucursal ${sucursalObj.nombre} — El Remate`,
      description: `Catálogo mayorista de Sucursal ${sucursalObj.nombre} (${sucursalObj.direccion}). Hacé tu pedido online y envialo directo por WhatsApp.`,
    };
  }

  return {
    title: "Catálogo Mayorista — El Remate Canelones",
    description:
      "Más de 1900 productos al mejor precio. Elegí tu sucursal más cercana y enviá tu pedido por WhatsApp.",
  };
}

export default async function CatalogoPage() {
  return (
    <Suspense fallback={<ProductoSkeleton />}>
      <CatalogoPageClient />
    </Suspense>
  );
}
