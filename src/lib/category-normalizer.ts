// filepath: src/lib/category-normalizer.ts
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

/**
 * Reglas estrictas con límites de palabra (\b) ordenadas por prioridad de seguridad y especificidad.
 * Evita falsos positivos clásicos de substrings (ej: "AGUA JANE" en bebidas, "DOÑA COCA" en bebidas,
 * "PULPA DE TOMATE" o "PATE" o "ENERGIZANTE" en té/yerba, "MAGGI JUGOSO" en jugos).
 */
const STRICT_CATEGORY_RULES: Array<{ pattern: RegExp; category: string }> = [
  // 1. LIMPIEZA DEL HOGAR (Prioridad máxima: químicos/peligrosos nunca pueden caer en alimentos/bebidas)
  {
    pattern:
      /\b(AGUA\s+JANE|LAVANDINA|DETERGENTE|DETER\b|DESINFECTANTE|DESINF\.?|SUAVIZANTE|LIMPIADOR|CLORO|DESOD\.?\s*AMB|DESODO\.?\s*AMB|AROMATIZADOR|JABON\s+(EN\s+POLVO|LIQ|LIQUIDO|LAVARROPA)|PERLAS\s+POTENCIADORAS|INSECTICIDA|RAID|FUYI|TOALLA\s+CELESTE|PAÑO|PAÑOS|TRAPO|ESPONJA|ESCOBA|BOLSAS?\s+(RESIDUO|CONSORCIO))\b/i,
    category: "LIMPIEZA DEL HOGAR",
  },

  // 2. HIGIENE PERSONAL
  {
    pattern:
      /\b(SHAMPOO|SHAMPU|ACONDICIONADOR|COLGATE|PASTA\s*DENTAL|DENTAL|CEPILLO\s+DENTAL|JABON\s+TOCADOR|AFEITADORA|CREMA\s+DE\s+AFEITAR|PAÑAL|PAÑALES|TOALLITA|HISOPO|HISOPOS|REPELENTE|PAÑUELO|PAPEL\s+HIGIENICO|ALCOHOL\s+EN\s+GEL)\b/i,
    category: "HIGIENE PERSONAL",
  },

  // 3. CARNES Y EMBUTIDOS (incluye marca DOÑA COCA / PANCHOS / JAMON antes que Bebidas)
  {
    pattern:
      /\b(JAMON|PANCHO|PANCHOS|FRANKFURTER|SALCHICHA|CHORIZO|SALAME|MORTADELA|BONDIOLA|PANCETA|MATAMBRE|FIAMBRE|LEBERWURST|CHICHARRON|CHICHARRONES|DOÑA\s+COCA|DONA\s+COCA)\b/i,
    category: "CARNES Y EMBUTIDOS",
  },

  // 4. BEBIDAS ALCOHÓLICAS
  {
    pattern:
      /\b(CERVEZA|PILSEN|PATRICIA|ZILLERTAL|CORONA\b|STELLA\s+ARTOIS|HEINEKEN|BRAHMA|SKOL|NORTEÑA|VINO\b|MALBEC|CABERNET|TANNAT|MERLOT|CHARDONNAY|SIDRA|CHAMPAGNE|ESPUMANTE|FERNET|BRANCA|WHISKY|WHISKEY|VODKA|GIN\b|GRAPPA|GRAPA|CAÑA\b|LICOR|SANGRIA|DAMAJUANA|CAMPARI|APEROL|VERMOUTH|CINZANO|GANCIA|FRIZZE)\b/i,
    category: "BEBIDAS ALCOHÓLICAS",
  },

  // 5. CONGELADOS
  {
    pattern:
      /\b(HIELO\b|HELADO|CRUFI|PAPAS?\s+CONG|MCCAIN|POMCLAIRE|HAMBURGUESA|MILANGUESA|NUGGET|CEBOLLA\s+CONG)\b/i,
    category: "CONGELADOS",
  },

  // 6. SALSAS Y ADEREZOS (antes que Yerba/Té para evitar "TOMATE" / "PICANTE")
  {
    pattern:
      /\b(PULPA\s+DE\s+TOMATE|SALSA\b|MAYONESA|KETCHUP|MOSTAZA|ADEREZO|CHIMICHURRI|VINAGRE|ACETO)\b/i,
    category: "SALSAS Y ADEREZOS",
  },

  // 7. CONSERVAS Y ENLATADOS (incluye PATE para evitar que caiga en "TE ")
  {
    pattern:
      /\b(PATE\b|ATUN|LOMITOS?\s+ATUN|SARDINA|ACEITUNA|ACEITUNAS|CHOCLO|ARVEJA|ARVEJAS|POROTO|POROTOS|LENTEJA|LENTEJAS|GARBANZO|DURAZNO\s+EN\s+ALMIBAR)\b/i,
    category: "CONSERVAS Y ENLATADOS",
  },

  // 8. DULCES Y MERMELADAS
  {
    pattern:
      /\b(MERMELADA|DULCE\s+DE\s+MEMBRILLO|DULCE\s+DE\s+BATATA|CREME\s+CHOLATTE|JALEA)\b/i,
    category: "DULCES Y MERMELADAS",
  },

  // 9. CONDIMENTOS Y ESPECIAS (incluye MAGGI JUGOSO para evitar que caiga en "JUGO")
  {
    pattern:
      /\b(MAGGI\s+JUGOSO|CALDO\b|OREGANO|PIMENTON|ADOBO|COMINO|CANELA|CURRY|PROVENZAL|SAL\s+FINA|SAL\s+GRUESA|CONDIMENTO|EDULCORANTE)\b/i,
    category: "CONDIMENTOS Y ESPECIAS",
  },

  // 10. LÁCTEOS Y HUEVOS
  {
    pattern:
      /\b(LECHE\b|CHOCOLATADA|DULCE\s+DE\s+LECHE|QUESO|MUZZARELLA|MUZARELLA|MOZZARELLA|PROVOLETA|YOGUR|MANTECA|CREMA\s+DE\s+LECHE|RICOTA|HUEVO|HUEVOS|CHANTILLY)\b/i,
    category: "LÁCTEOS Y HUEVOS",
  },

  // 11. BEBIDAS SIN ALCOHOL (después de Limpieza, Carnes, Alcohol y Condimentos)
  {
    pattern:
      /\b(COCA\s+COLA|COCA-COLA|PEPSI|SPRITE|FANTA|7UP|MIRINDA|SALUS|NATIVA|SIRTE|CRISTALINA|PASO\s+DE\s+LOS\s+TOROS|SCHWEPPES|NIX\b|LIMOL|GATORADE|POWERADE|ENERGIZANTE|RED\s+BULL|MONSTER|BALY|KONG\s+473|JUGO\b|BAGGIO|ADES\b|TANG\b|CLIGHT|REFRESCO|REFRESCANTE|GASEOSA|AGUA\s+(MINERAL|SIN\s+GAS|CON\s+GAS|BIDON|SABORIZADA))\b/i,
    category: "BEBIDAS SIN ALCOHOL",
  },

  // 12. GOLOSINAS Y SNACKS
  {
    pattern:
      /\b(ALFAJOR|TURRON|OREO|CARAMELO|CARAMELOS|CHUPETIN|GOMITA|GOMITAS|BOMBONES|PRINGLES|LAYS|MANI\b|PACOQUINHA|SNACK|GELADINHO)\b/i,
    category: "GOLOSINAS Y SNACKS",
  },

  // 13. PANADERÍA Y REPOSTERÍA
  {
    pattern:
      /\b(PAN\s+DULCE|BUDIN|MAGDALENA|MAGDALENAS|BIZCOCHO|GALLETA|GALLETAS|GALLETITA|GALLETITAS|TOSTADA|TOSTADAS|GRISIN|PIONONO|PASTA\s+FROLA|TORTILLA|TAPAS?\s+(AVANTI|EMPANADA|PASCUALINA))\b/i,
    category: "PANADERÍA Y REPOSTERÍA",
  },

  // 14. DESCARTABLES Y ART. DEL HOGAR
  {
    pattern:
      /\b(CASQUETE|VASO\b|VASOS\b|TENEDOR\s+DESC|CUCHILLO\s+DESC|BANDEJA\s+F\d|MANGA\s+PASTELERA|ROLLO\s+SERVILLETA|SERVILLETA|FILM\s+DE\s+PVC)\b/i,
    category: "DESCARTABLES Y ART. DEL HOGAR",
  },

  // 15. ARTÍCULOS DEL HOGAR
  {
    pattern: /\b(PILAS\b|LAMPARA|VENTILADOR|LA\s+GOTITA)\b/i,
    category: "ARTÍCULOS DEL HOGAR",
  },
];

export function normalizeCategoryName(category: string): string {
  if (!category) return "OTROS";
  return CATEGORY_ALIASES[category] || category.toUpperCase();
}

export function normalizeProductCategory(producto: Producto): string {
  const byAlias = normalizeCategoryName(producto.categoria);
  const upperName = String(producto.nombre || "").toUpperCase();
  const match = STRICT_CATEGORY_RULES.find(({ pattern }) => pattern.test(upperName));
  return match?.category || byAlias;
}
