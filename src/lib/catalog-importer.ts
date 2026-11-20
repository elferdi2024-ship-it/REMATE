// filepath: src/lib/catalog-importer.ts
import type { WorkBook } from "xlsx";
import * as XLSX from "xlsx";
import categoryData from "@/lib/categoria_mapping.json";
import { normalizeProductCategory } from "@/lib/category-normalizer";
import { CATEGORIAS } from "@/types";

const RAW_MAPPING =
  ((categoryData as unknown as { mapping?: Record<string, string> }).mapping ||
    (categoryData as unknown as Record<string, string>));

const CATEGORY_MAPPING: Record<string, string> = {};
Object.entries(RAW_MAPPING).forEach(([code, cat]) => {
  if (typeof cat === "string") {
    CATEGORY_MAPPING[code.trim()] = cat.trim().toUpperCase();
  }
});

export interface ImportedProductRow {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen?: string;
  marca?: string;
}

const KEYWORDS: Record<string, string[]> = {
  "ACEITES Y GRASAS": ["aceite", "grasa", "manteca"],
  "BEBIDAS ALCOHÓLICAS": ["cerveza", "vino", "fernet", "whisky", "sidra", "espumante"],
  "BEBIDAS SIN ALCOHOL": ["agua", "jugo", "gaseosa", "refresco", "pepsi", "coca", "sprite"],
  "CARNES Y EMBUTIDOS": ["jamon", "bondiola", "salchicha", "pancho", "chorizo", "morcilla", "fiambre", "carne", "arrollado", "mortadela"],
  "CONSERVAS Y ENLATADOS": ["atun", "sardina", "choclo", "arveja", "poroto", "lenteja", "garbanzo", "lomito", "grated"],
  "GOLOSINAS Y SNACKS": ["alfajor", "caramelo", "chocolate", "gomita", "chicle", "papas", "lay", "snack"],
  "HARINAS, PASTAS Y CEREALES": ["harina", "fideo", "arroz", "pasta", "polenta", "avena", "cereal", "copos"],
  "HIGIENE PERSONAL": ["jabon", "shampoo", "shampu", "dental", "afeitar", "desodorante", "pañal", "toallita"],
  "LÁCTEOS Y HUEVOS": ["leche", "queso", "yogur", "crema", "manteca", "huevo", "ricota", "muzzarel", "conaprole"],
  "LIMPIEZA DEL HOGAR": ["lavandina", "detergente", "limpiador", "suavizante", "jabon polvo", "desinfectante"],
  "PANADERÍA Y REPOSTERÍA": ["pan ", "tostada", "galleta", "bizcocho", "budin", "reposteria"],
  "YERBA, TÉ Y CAFÉ": ["yerba", "te ", "cafe", "nescafe", "bracafe"],
};

const VALID_CATEGORIAS = new Set<string>(CATEGORIAS);

export function categorizarProducto(codigo: string, nombre: string, explicitCat?: string): string {
  const cleanCode = codigo.trim();
  const explicitUpper = explicitCat?.trim().toUpperCase();
  if (explicitUpper && VALID_CATEGORIAS.has(explicitUpper)) {
    return explicitUpper;
  }

  const mappedBase = CATEGORY_MAPPING[cleanCode] || explicitUpper || "";

  const strict = normalizeProductCategory({
    codigo: cleanCode,
    nombre,
    precio: 1,
    categoria: mappedBase || "OTROS",
  });
  if (strict && strict !== "OTROS") {
    return strict;
  }

  const n = nombre.toLowerCase();
  for (const [cat, kws] of Object.entries(KEYWORDS)) {
    if (kws.some((k) => new RegExp(`\\b${k.trim()}`).test(n))) return cat;
  }

  return mappedBase || "OTROS";
}

function cleanString(str: string): string {
  return str.replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, "").trim();
}

export function cleanProductCode(str: string): string {
  return str.replace(/[\s\u00A0]+/g, "");
}

function parseNumericPrice(raw: unknown): number {
  const str = String(raw ?? "")
    .replace(/\$/g, "")
    .replace(/[\s\u00A0]+/g, "")
    .replace(",", ".");
  return parseFloat(str);
}

/**
 * Parsea un libro Excel (.xlsx/.xls) o CSV cargado con XLSX.read.
 * Soporta formato compacto (Código | Nombre | Precio [| Categoría])
 * y formato clásico de distribuidora de 6-7 columnas (Código | - | Nombre | - | - | Precio).
 */
export function parseCatalogWorkbook(workbook: WorkBook): ImportedProductRow[] {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const products: ImportedProductRow[] = [];

  let isCompactFormat = false;
  let startRow = 1;

  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (row && row.length >= 3) {
      const valCol0 = String(row[0] ?? "");
      const valCol1 = String(row[1] ?? "");
      const price2 = parseNumericPrice(row[2]);
      if (cleanProductCode(valCol0) && cleanString(valCol1) && !isNaN(price2)) {
        isCompactFormat = true;
        if (i === 0) startRow = 0;
        break;
      }
    }
  }

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;

    let codigo = "";
    let nombre = "";
    let precio = NaN;
    let explicitCat = "";

    if (isCompactFormat) {
      codigo = cleanProductCode(String(row[0] ?? ""));
      nombre = cleanString(String(row[1] ?? "")).toUpperCase();
      precio = parseNumericPrice(row[2]);
      if (row[3]) explicitCat = cleanString(String(row[3]));
    } else {
      if (row.length < 6) continue;
      codigo = cleanProductCode(String(row[0] ?? ""));
      nombre = cleanString(String(row[2] ?? "")).toUpperCase();
      precio = parseNumericPrice(row[5]);
      if (row[6]) explicitCat = cleanString(String(row[6]));
    }

    if (!nombre || isNaN(precio) || !codigo) continue;

    products.push({
      codigo,
      nombre,
      precio,
      categoria: categorizarProducto(codigo, nombre, explicitCat),
    });
  }

  return products;
}

/**
 * Parsea texto pegado manualmente por un administrador.
 * Acepta separadores `;`, `\t`, `|` o `,` con formato:
 *   CODIGO; NOMBRE; PRECIO [; CATEGORIA]
 */
export function parseManualProductLines(rawText: string): ImportedProductRow[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const products: ImportedProductRow[] = [];

  for (const line of lines) {
    const separator = line.includes(";")
      ? ";"
      : line.includes("\t")
      ? "\t"
      : line.includes("|")
      ? "|"
      : ",";

    const parts = line.split(separator).map((p) => cleanString(p));
    if (parts.length < 3) continue;

    const codigo = cleanProductCode(parts[0]);
    const nombre = parts[1].toUpperCase();
    const precio = parseNumericPrice(parts[2]);
    const explicitCat = parts[3] || "";

    // Saltar posible fila de encabezado
    if (
      codigo.toLowerCase() === "codigo" ||
      codigo.toLowerCase() === "código" ||
      isNaN(precio)
    ) {
      continue;
    }

    if (!codigo || !nombre) continue;

    products.push({
      codigo,
      nombre,
      precio,
      categoria: categorizarProducto(codigo, nombre, explicitCat),
    });
  }

  return products;
}
