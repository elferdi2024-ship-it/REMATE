// filepath: src/app/sitemap.ts
import { MetadataRoute } from "next";
import { SUCURSALES } from "@/lib/sucursales";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://elremate.com.uy";

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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/fiesta`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/seleccionar-sucursal`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/politica-de-privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Sucursales dinámicas
  SUCURSALES.forEach((s) => {
    routes.push({
      url: `${BASE_URL}/catalogo?sucursal=${s.id}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    });
  });

  // Categorías dinámicas
  CATEGORIAS.forEach((cat) => {
    routes.push({
      url: `${BASE_URL}/catalogo?categoria=${encodeURIComponent(cat)}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  });

  return routes;
}
