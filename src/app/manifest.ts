// filepath: src/app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Distribuidora El Remate",
    short_name: "El Remate",
    description:
      "Catálogo mayorista de El Remate Canelones. Más de 1900 productos, precios al público, pedidos por WhatsApp.",
    id: "/",
    scope: "/",
    start_url: "/catalogo",
    lang: "es-UY",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1A1410",
    theme_color: "#E8302A",
    categories: ["shopping", "business", "food"],
    shortcuts: [
      {
        name: "Catálogo Mayorista",
        short_name: "Catálogo",
        url: "/catalogo",
        icons: [
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      {
        name: "Ofertas Especiales",
        short_name: "Ofertas",
        url: "/ofertas",
        icons: [
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    ],
    icons: [
      {
        src: "/icon-512x512.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/catalogo-hero.jpg",
        sizes: "1080x1920",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "Catálogo Mayorista El Remate Mobile",
      },
      {
        src: "/catalogo-hero.jpg",
        sizes: "1920x1080",
        type: "image/jpeg",
        form_factor: "wide",
        label: "Catálogo Mayorista El Remate Desktop",
      },
    ] as any,
  };
}
