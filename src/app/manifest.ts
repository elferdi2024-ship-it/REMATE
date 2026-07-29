// filepath: src/app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Distribuidora El Remate",
    short_name: "El Remate",
    description: "Distribuidora mayorista y supermercado en Canelones y Montevideo. Envíos express a domicilio.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F2EE",
    theme_color: "#E8302A",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
