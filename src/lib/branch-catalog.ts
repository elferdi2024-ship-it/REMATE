// filepath: src/lib/branch-catalog.ts
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SUCURSALES } from "@/lib/sucursales";
import { CATEGORIAS, type Producto } from "@/types";
import categoriaMapping from "@/lib/categoria_mapping.json";
import { normalizeProductCategory } from "@/lib/category-normalizer";
import { enrichProductoWithExclusivePack } from "@/lib/constants/exclusive-packs";

const catMap: Record<string, string> =
  ((categoriaMapping as unknown as { mapping?: Record<string, string> }).mapping ||
    (categoriaMapping as unknown as Record<string, string>));

const VALID_CATEGORIAS = new Set<string>(CATEGORIAS);

export type CatalogItemsMap = Record<string, Producto>;

export interface BranchCatalogSummary {
  sucursalId: string;
  hasCustomCatalog: boolean;
  totalCount: number;
  activeCount: number;
  hiddenCount: number;
  updatedAt?: string;
}

export interface LoadedCatalogResult {
  productos: Producto[];
  source: "branch" | "global" | "json";
}

function isValidCatalogItem(item: unknown): item is Producto {
  if (!item || typeof item !== "object") return false;
  const p = item as Partial<Producto>;
  return (
    typeof p.codigo === "string" &&
    p.codigo.trim().length > 0 &&
    typeof p.nombre === "string" &&
    p.nombre.trim().length > 0 &&
    typeof p.precio === "number"
  );
}

/**
 * Normaliza la categoría del producto respetando categorías válidas ya asignadas manualmente.
 */
export function resolveProductCategory(
  producto: Producto,
  respectExistingValidCategory: boolean
): Producto {
  const currentCat = String(producto.categoria || "").trim().toUpperCase();
  if (respectExistingValidCategory && VALID_CATEGORIAS.has(currentCat) && currentCat !== "OTROS") {
    return { ...producto, categoria: currentCat };
  }

  const barcode = String(producto.codigo || "").trim();
  if (catMap[barcode]) {
    return { ...producto, categoria: catMap[barcode].trim().toUpperCase() };
  }

  const normalized = normalizeProductCategory(producto);
  return { ...producto, categoria: normalized };
}

/**
 * Carga el catálogo base maestro como mapa { [codigo]: Producto }.
 * Prioriza Firestore `catalogo_activo/productos` y hace fallback a `/productos.json`.
 */
export async function loadBaseCatalogMap(): Promise<{
  items: CatalogItemsMap;
  source: "global" | "json";
}> {
  if (db) {
    try {
      const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
      if (snap.exists()) {
        const rawItems = (snap.data().items || {}) as Record<string, unknown>;
        const clean: CatalogItemsMap = {};
        for (const [key, val] of Object.entries(rawItems)) {
          if (isValidCatalogItem(val)) {
            const code = val.codigo.trim() || key;
            clean[code] = enrichProductoWithExclusivePack(
              resolveProductCategory({ ...val, codigo: code }, true)
            );
          }
        }
        if (Object.keys(clean).length > 0) {
          return { items: clean, source: "global" };
        }
      }
    } catch (err) {
      console.warn("⚠️ Error leyendo catalogo_activo/productos:", err);
    }
  }

  const res = await fetch("/productos.json");
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: no se pudo cargar /productos.json`);
  }
  const arr = (await res.json()) as Producto[];
  const clean: CatalogItemsMap = {};
  for (const item of arr) {
    if (isValidCatalogItem(item)) {
      const code = item.codigo.trim();
      clean[code] = enrichProductoWithExclusivePack(
        resolveProductCategory({ ...item, codigo: code }, false)
      );
    }
  }
  return { items: clean, source: "json" };
}

/**
 * Carga el catálogo activo para una sucursal específica (para la tienda pública).
 * Si la sucursal tiene catálogo propio en `sucursales_catalogos/{sucursalId}`, lo usa;
 * si no existe todavía, usa el catálogo global / local JSON como fallback.
 */
export async function loadBranchCatalog(
  sucursalId: string | null
): Promise<LoadedCatalogResult> {
  if (sucursalId && db) {
    try {
      const branchSnap = await getDoc(doc(db, "sucursales_catalogos", sucursalId));
      if (branchSnap.exists()) {
        const branchData = branchSnap.data();
        const rawItems = (branchData.items || {}) as Record<string, unknown>;
        const rawEntries = Object.values(rawItems);

        if (rawEntries.length > 0 || branchData.strictEmpty === true) {
          const activeItems = rawEntries
            .filter(isValidCatalogItem)
            .filter((item) => !item.deshabilitado)
            .map((item) =>
              enrichProductoWithExclusivePack(resolveProductCategory(item, true))
            );

          if (activeItems.length > 0 || branchData.strictEmpty === true) {
            return { productos: activeItems, source: "branch" };
          }
        }
      }
    } catch (err) {
      console.error("❌ Error cargando catálogo de sucursal:", err);
    }
  }

  const { items, source } = await loadBaseCatalogMap();
  const activeItems = Object.values(items).filter((item) => !item.deshabilitado);
  return { productos: activeItems, source };
}

/**
 * Lee el mapa completo de una sucursal (incluyendo productos deshabilitados) para edición en Admin.
 */
export async function loadBranchCatalogForAdmin(sucursalId: string): Promise<{
  hasCustomCatalog: boolean;
  items: CatalogItemsMap;
  updatedAt?: string;
  strictEmpty?: boolean;
}> {
  if (!db) {
    return { hasCustomCatalog: false, items: {} };
  }
  const snap = await getDoc(doc(db, "sucursales_catalogos", sucursalId));
  if (!snap.exists()) {
    return { hasCustomCatalog: false, items: {} };
  }
  const data = snap.data();
  const rawItems = (data.items || {}) as Record<string, unknown>;
  const clean: CatalogItemsMap = {};
  for (const [key, val] of Object.entries(rawItems)) {
    if (isValidCatalogItem(val)) {
      const code = val.codigo.trim() || key;
      clean[code] = { ...val, codigo: code };
    }
  }
  return {
    hasCustomCatalog: true,
    items: clean,
    updatedAt: data.updatedAt || data.clonedAt,
    strictEmpty: Boolean(data.strictEmpty),
  };
}

/**
 * Guarda el catálogo independiente de una sucursal en Firestore.
 */
export async function saveBranchCatalog(
  sucursalId: string,
  items: CatalogItemsMap,
  extra?: { strictEmpty?: boolean; source?: string }
): Promise<void> {
  if (!db) throw new Error("Firestore no inicializado");

  // Sanitizar valores undefined (Firestore no acepta undefined en objetos)
  const sanitized: Record<string, Record<string, unknown>> = {};
  for (const [codigo, prod] of Object.entries(items)) {
    const entry: Record<string, unknown> = {
      codigo: prod.codigo,
      nombre: prod.nombre,
      precio: Number(prod.precio) || 0,
      categoria: prod.categoria || "OTROS",
    };
    if (prod.imagen) entry.imagen = prod.imagen;
    if (prod.marca) entry.marca = prod.marca;
    if (prod.contenido) entry.contenido = prod.contenido;
    if (prod.deshabilitado !== undefined) entry.deshabilitado = Boolean(prod.deshabilitado);
    if (prod.destacado !== undefined) entry.destacado = Boolean(prod.destacado);
    if (prod.precioAnterior !== undefined) entry.precioAnterior = Number(prod.precioAnterior);
    if (prod.escalaPrecios && prod.escalaPrecios.length > 0) {
      entry.escalaPrecios = prod.escalaPrecios;
    }
    sanitized[codigo] = entry;
  }

  const totalProductos = Object.keys(sanitized).length;
  await setDoc(doc(db, "sucursales_catalogos", sucursalId), {
    items: sanitized,
    totalProductos,
    updatedAt: new Date().toISOString(),
    strictEmpty: extra?.strictEmpty ?? totalProductos === 0,
    ...(extra?.source ? { source: extra.source } : {}),
  });
}

/**
 * Elimina el catálogo personalizado de una sucursal para volver al fallback global.
 */
export async function resetBranchCatalogToGlobal(sucursalId: string): Promise<void> {
  if (!db) throw new Error("Firestore no inicializado");
  await deleteDoc(doc(db, "sucursales_catalogos", sucursalId));
}

/**
 * Obtiene resumen del estado de los catálogos de las 6 sucursales + el catálogo base.
 */
export async function getAllBranchesCatalogSummary(): Promise<{
  baseActiveCount: number;
  baseTotalCount: number;
  branches: Record<string, BranchCatalogSummary>;
}> {
  let baseActiveCount = 0;
  let baseTotalCount = 0;
  try {
    const { items } = await loadBaseCatalogMap();
    const vals = Object.values(items);
    baseTotalCount = vals.length;
    baseActiveCount = vals.filter((p) => !p.deshabilitado && p.precio > 0).length;
  } catch (err) {
    console.warn("No se pudo obtener conteo base:", err);
  }

  const branches: Record<string, BranchCatalogSummary> = {};

  await Promise.all(
    SUCURSALES.map(async (s) => {
      if (!db) {
        branches[s.id] = {
          sucursalId: s.id,
          hasCustomCatalog: false,
          totalCount: baseTotalCount,
          activeCount: baseActiveCount,
          hiddenCount: Math.max(0, baseTotalCount - baseActiveCount),
        };
        return;
      }
      try {
        const snap = await getDoc(doc(db, "sucursales_catalogos", s.id));
        if (snap.exists()) {
          const data = snap.data();
          const vals = Object.values((data.items || {}) as Record<string, unknown>).filter(
            isValidCatalogItem
          );
          const activeCount = vals.filter((p) => !p.deshabilitado && p.precio > 0).length;
          branches[s.id] = {
            sucursalId: s.id,
            hasCustomCatalog: true,
            totalCount: vals.length,
            activeCount,
            hiddenCount: vals.length - activeCount,
            updatedAt: data.updatedAt || data.clonedAt,
          };
          return;
        }
      } catch (err) {
        console.warn(`Error leyendo resumen sucursal ${s.id}:`, err);
      }

      branches[s.id] = {
        sucursalId: s.id,
        hasCustomCatalog: false,
        totalCount: baseTotalCount,
        activeCount: baseActiveCount,
        hiddenCount: Math.max(0, baseTotalCount - baseActiveCount),
      };
    })
  );

  return { baseActiveCount, baseTotalCount, branches };
}

/**
 * Inicializa todas las sucursales con una copia independiente del catálogo base existente.
 * Si `overwriteExisting` es false, solo crea catálogo en sucursales que aún no tienen uno propio.
 */
export async function initAllBranchesFromBase(
  overwriteExisting: boolean = false
): Promise<{ initialized: string[]; skipped: string[]; totalProducts: number }> {
  if (!db) throw new Error("Firestore no inicializado");

  const { items: baseItems } = await loadBaseCatalogMap();
  const totalProducts = Object.keys(baseItems).length;
  if (totalProducts === 0) {
    throw new Error("El catálogo base está vacío; no hay productos para clonar.");
  }

  const initialized: string[] = [];
  const skipped: string[] = [];

  for (const s of SUCURSALES) {
    if (!overwriteExisting) {
      const snap = await getDoc(doc(db, "sucursales_catalogos", s.id));
      if (snap.exists()) {
        skipped.push(s.id);
        continue;
      }
    }
    const cloned: CatalogItemsMap = JSON.parse(JSON.stringify(baseItems));
    await saveBranchCatalog(s.id, cloned, {
      strictEmpty: false,
      source: "base_clone",
    });
    initialized.push(s.id);
  }

  return { initialized, skipped, totalProducts };
}
