// filepath: src/components/seo/ProductJsonLd.tsx
"use client";

import React from "react";
import type { Producto } from "@/types";

interface ProductJsonLdProps {
  producto: Producto;
  appUrl?: string;
}

export default function ProductJsonLd({ producto, appUrl = "https://elremate.com.uy" }: ProductJsonLdProps) {
  if (!producto) return null;

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: producto.nombre,
    image: producto.imagen ? [producto.imagen] : [],
    description: `${producto.nombre} - Distribuidora El Remate Canelones. Venta mayorista y minorista con envío a domicilio.`,
    sku: producto.codigo,
    mpn: producto.codigo,
    brand: {
      "@type": "Brand",
      name: producto.marca || "El Remate",
    },
    offers: {
      "@type": "Offer",
      url: `${appUrl}/catalogo?search=${encodeURIComponent(producto.nombre)}`,
      priceCurrency: "UYU",
      price: producto.precio,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: producto.deshabilitado
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Distribuidora El Remate",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "128",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
