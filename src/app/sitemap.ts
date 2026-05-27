// filepath: src/app/sitemap.ts
import { MetadataRoute } from "next";
import { CATEGORIAS } from "@/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://distribuidoraelremate.uy";

  // Páginas principales
  const mainPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ofertas`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/publicitate`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }
  ];

  // Generar rutas dinámicas indexables para cada categoría
  const categoryPages = CATEGORIAS.map((cat) => ({
    url: `${baseUrl}/catalogo?categoria=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...mainPages, ...categoryPages];
}
