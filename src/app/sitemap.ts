// filepath: src/app/sitemap.ts
import { MetadataRoute } from "next";

const CATEGORIAS = [
  "ACEITES Y GRASAS",
  "ARTÍCULOS DEL HOGAR",
  "BEBIDAS ALCOHÓLICAS",
  "BEBIDAS SIN ALCOHOL",
  "CARNES Y EMBUTIDOS",
  "CONDIMENTOS Y ESPECIAS",
  "CONGELADOS",
  "CONSERVAS Y ENLATADOS",
  "DESCARTABLES Y ART. DEL HOGAR",
  "DULCES Y MERMELADAS",
  "FRUTAS Y VERDURAS",
  "GOLOSINAS Y SNACKS",
  "HARINAS, PASTAS Y CEREALES",
  "HIGIENE PERSONAL",
  "LÁCTEOS Y HUEVOS",
  "LIMPIEZA DEL HOGAR",
  "MASCOTAS",
  "PANADERÍA Y REPOSTERÍA",
  "SALSAS Y ADEREZOS",
  "YERBA, TÉ Y CAFÉ",
  "OTROS"
];

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
