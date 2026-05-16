import type { Producto } from "@/types";

const CATEGORY_ALIASES: Record<string, string> = {
  "Harinas, Pastas y Legumbres": "HARINAS, PASTAS Y CEREALES",
  "Golosinas y Dulces": "GOLOSINAS Y SNACKS",
  "Fiambres y Carnes": "CARNES Y EMBUTIDOS",
  "Descartables y Embalaje": "DESCARTABLES Y ART. DEL HOGAR",
  "Café, Té y Yerba": "YERBA, TÉ Y CAFÉ",
  "Aceites y Aderezos": "ACEITES Y GRASAS",
  "Especias y Condimentos": "CONDIMENTOS Y ESPECIAS",
  "Bebidas": "BEBIDAS SIN ALCOHOL",
  "Panadería": "PANADERÍA Y REPOSTERÍA",
  "Limpieza": "LIMPIEZA DEL HOGAR",
  "Mermeladas y Conservas Dulces": "DULCES Y MERMELADAS",
  "Conservas de Pescado": "CONSERVAS Y ENLATADOS",
  "Cereales y Granola": "HARINAS, PASTAS Y CEREALES",
  "Lácteos": "LÁCTEOS Y HUEVOS",
  "Papel e Higiene": "HIGIENE PERSONAL",
};

const KEYWORD_CORRECTIONS: Array<{ keyword: string; category: string }> = [
  { keyword: "ALFAJOR", category: "GOLOSINAS Y SNACKS" },
  { keyword: "PILAS", category: "ARTÍCULOS DEL HOGAR" },
  { keyword: "LAMPARA", category: "ARTÍCULOS DEL HOGAR" },
  { keyword: "SHAMPOO", category: "HIGIENE PERSONAL" },
  { keyword: "ACONDICIONADOR", category: "HIGIENE PERSONAL" },
  { keyword: "JABON TOCADOR", category: "HIGIENE PERSONAL" },
  { keyword: "DENTAL", category: "HIGIENE PERSONAL" },
  { keyword: "AFEITADORA", category: "HIGIENE PERSONAL" },
  { keyword: "ACEITUNAS", category: "CONSERVAS Y ENLATADOS" },
  { keyword: "CHOCLO", category: "CONSERVAS Y ENLATADOS" },
  { keyword: "ARVEJAS", category: "CONSERVAS Y ENLATADOS" },
  { keyword: "POROTOS", category: "CONSERVAS Y ENLATADOS" },
  { keyword: "LENTEJAS", category: "CONSERVAS Y ENLATADOS" },
  { keyword: "PAN DULCE", category: "PANADERÍA Y REPOSTERÍA" },
  { keyword: "BUDIN", category: "PANADERÍA Y REPOSTERÍA" },
];

export function normalizeCategoryName(category: string): string {
  return CATEGORY_ALIASES[category] || category;
}

export function normalizeProductCategory(producto: Producto): string {
  const byAlias = normalizeCategoryName(producto.categoria);
  const upperName = producto.nombre.toUpperCase();
  const match = KEYWORD_CORRECTIONS.find(({ keyword }) => upperName.includes(keyword));
  return match?.category || byAlias;
}
