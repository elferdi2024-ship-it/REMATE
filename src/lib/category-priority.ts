// filepath: src/lib/category-priority.ts
import type { Producto } from "@/types";

/**
 * Orden comercial de categorías optimizado para el consumo cotidiano
 * en hogares y comercios de Uruguay (de mayor rotación a menor rotación).
 */
export const URUGUAY_CATEGORY_ORDER: readonly string[] = [
  "YERBA, TÉ Y CAFÉ",
  "LÁCTEOS Y HUEVOS",
  "BEBIDAS SIN ALCOHOL",
  "CARNES Y EMBUTIDOS",
  "HARINAS, PASTAS Y CEREALES",
  "ACEITES Y GRASAS",
  "LIMPIEZA DEL HOGAR",
  "GOLOSINAS Y SNACKS",
  "BEBIDAS ALCOHÓLICAS",
  "CONGELADOS",
  "PANADERÍA Y REPOSTERÍA",
  "SALSAS Y ADEREZOS",
  "DULCES Y MERMELADAS",
  "CONSERVAS Y ENLATADOS",
  "HIGIENE PERSONAL",
  "CONDIMENTOS Y ESPECIAS",
  "MASCOTAS",
  "DESCARTABLES Y ART. DEL HOGAR",
  "FRUTAS Y VERDURAS",
  "ARTÍCULOS DEL HOGAR",
  "OTROS",
];

const CATEGORY_RANK_MAP = new Map<string, number>(
  URUGUAY_CATEGORY_ORDER.map((cat, idx) => [cat.toUpperCase(), idx])
);

export function getCategoryPriorityRank(category: string): number {
  const key = String(category || "").trim().toUpperCase();
  if (CATEGORY_RANK_MAP.has(key)) {
    return CATEGORY_RANK_MAP.get(key)!;
  }
  return URUGUAY_CATEGORY_ORDER.length - 1; // Antes de OTROS
}

export function sortCategoriesByUruguayPriority(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    const rankA = getCategoryPriorityRank(a);
    const rankB = getCategoryPriorityRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b, "es");
  });
}

// Marcas y productos de altísima rotación en casas uruguayas
const HOUSEHOLD_STAPLES = [
  "canarias",
  "baldo",
  "sara",
  "armonia",
  "la selva",
  "conaprole",
  "blancanuve",
  "coca cola",
  "coca-cola",
  "salus",
  "nativa",
  "pepsi",
  "sprite",
  "fanta",
  "paso de los toros",
  "optimo",
  "cañuelas",
  "canuelas",
  "saman",
  "blue patna",
  "cololo",
  "adria",
  "las acacias",
  "schneck",
  "centenario",
  "camposur",
  "ottonello",
  "cattaneo",
  "los nietitos",
  "portezuelo",
  "la trigueña",
  "nevex",
  "agua jane",
  "skip",
  "granby",
  "hellmann",
  "deambrosi",
  "patricia",
  "pilsen",
  "zillertal",
  "stella artois",
  "corona",
  "branca",
  "mccain",
  "crufi",
  "conaprole",
  "azucar",
  "leche entera",
  "leche descremada",
  "aceite girasol",
  "aceite de arroz",
  "huevo",
  "manteca",
  "muzzarella",
  "jamon",
  "pancho",
  "hamburguesa",
  "papel higienico",
  "detergente",
  "lavandina",
  "fideo",
  "arroz",
  "harina",
  "dulce de leche",
  "mermelada",
  "mayonesa",
  "alfajor",
];

// Formatos industriales/granel que siguen disponibles pero no deben tapar los envases familiares
const INDUSTRIAL_BULK_PATTERNS = [
  /\b(10|15|20|25|50)\s*(k|kg|kilo|kilos|l|lt|lts|litros)\b/i,
  /\bx\s*(10|15|20|25)\s*k/i,
  /\bcaja\s+blanca\b/i,
  /\bbalde\b/i,
  /\bgranel\b/i,
  /\bsuelto\b/i,
  /\bindustrial\b/i,
];

// Formatos clásicos de hogar uruguayo
const HOME_FORMAT_PATTERNS = [
  /\b(250|300|350|400|450|500|750|800|900)\s*(g|gr|ml|cc)\b/i,
  /\b(1|1\.5|2|2\.25|2\.5|3)\s*(k|kg|l|lt|litro|litros)\b/i,
];

/**
 * Puntúa un producto para priorizar los artículos más pedidos en hogares uruguayos
 * dentro de cada categoría (sin ocultar los mayoristas/industriales).
 */
export function scoreProductForUruguayHome(p: Producto): number {
  const name = String(p?.nombre || "").toLowerCase();
  let score = 0;

  // 1. Foto disponible y oferta/destacado
  if (p.imagen && p.imagen.trim() !== "") score += 35;
  if (p.destacado) score += 45;
  if (p.precioAnterior && p.precioAnterior > p.precio) score += 30;
  if (p.escalaPrecios && p.escalaPrecios.length > 0) score += 15;

  // 2. Coincidencia con básicos y marcas líderes de Uruguay
  for (const staple of HOUSEHOLD_STAPLES) {
    if (name.includes(staple)) {
      score += 40;
      break;
    }
  }

  // 3. Formato familiar vs caja industrial gigante
  if (HOME_FORMAT_PATTERNS.some((rx) => rx.test(name))) {
    score += 22;
  }
  if (INDUSTRIAL_BULK_PATTERNS.some((rx) => rx.test(name))) {
    score -= 48;
  }

  // 4. Rango de precio cotidiano (productos accesibles de consumo diario)
  if (p.precio > 0 && p.precio <= 450) {
    score += 12;
  }

  return score;
}

export function sortProductsInCategoryByUruguayPriority(products: Producto[]): Producto[] {
  return [...products].sort((a, b) => {
    const diff = scoreProductForUruguayHome(b) - scoreProductForUruguayHome(a);
    if (diff !== 0) return diff;
    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
  });
}
