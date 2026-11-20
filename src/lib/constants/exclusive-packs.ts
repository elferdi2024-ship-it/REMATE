// filepath: src/lib/constants/exclusive-packs.ts
import type { Producto } from "@/types";

export interface ExclusivePackItem {
  cantidad: string;
  nombre: string;
}

export interface ExclusivePackConfig {
  id: string;
  codigo: string;
  matchNames: string[];
  tituloDisplay: string;
  eyebrow: string;
  subtitulo: string;
  badge: string;
  precioFallback: number;
  totalUnidades: number;
  items: ExclusivePackItem[];
}

export interface ResolvedExclusivePack {
  pack: ExclusivePackConfig;
  producto: Producto;
}

export const EXCLUSIVE_APP_PACKS: ExclusivePackConfig[] = [
  {
    id: "canasta-canario",
    codigo: "64164164164",
    matchNames: ["canasta canario", "canasta canarios"],
    tituloDisplay: "Canasta Canario",
    eyebrow: "Canasta Familiar",
    subtitulo: "La canasta de todos los uruguayos · 22 productos esenciales",
    badge: "Exclusivo App",
    precioFallback: 1998,
    totalUnidades: 39,
    items: [
      { cantidad: "2x", nombre: "Harina Farinel 0000 1kg" },
      { cantidad: "2x", nombre: "Azúcar por kilo" },
      { cantidad: "1x", nombre: "Sal Nilo 500g" },
      { cantidad: "2x", nombre: "Pulpa de tomate De Ley 1020g" },
      { cantidad: "4x", nombre: "Fideos Cololo 500g" },
      { cantidad: "1x", nombre: "Arroz Saman blanco 5kg" },
      { cantidad: "2x", nombre: "Aceite de soja Condesa 900ml" },
      { cantidad: "1x", nombre: "Papel higiénico Celeste 16R 30mt paq. azul" },
      { cantidad: "3x", nombre: "Arveja lata" },
      { cantidad: "2x", nombre: "Choclo 200g" },
      { cantidad: "3x", nombre: "Puré de papas Dukita 120g" },
      { cantidad: "1x", nombre: "Paté de hígado Oderich 100g" },
      { cantidad: "1x", nombre: "Toalla de cocina Artik x 2u" },
      { cantidad: "1x", nombre: "Dulce de leche El Reencuentro x 1kg" },
      { cantidad: "2x", nombre: "Grated sardina Dukita 170g" },
      { cantidad: "2x", nombre: "Grasa Comsa 400g" },
      { cantidad: "1x", nombre: "Maple huevos colorados x 30" },
      { cantidad: "3x", nombre: "Galletas Pilar 307g" },
      { cantidad: "1x", nombre: "Mayonesa Uruguay 500g" },
      { cantidad: "2x", nombre: "Jardinera lata 200g" },
      { cantidad: "1x", nombre: "Ketchup Cololo 200g" },
      { cantidad: "1x", nombre: "Mostaza Cololo 200g" },
    ],
  },
  {
    id: "pack-cumpleanos",
    codigo: "5151516144",
    matchNames: ["pack cumpleanos", "pack cumpleaños"],
    tituloDisplay: "Pack Cumpleaños",
    eyebrow: "Mega Pack Fiesta",
    subtitulo: "84 hamburguesas Schneck + 6 Coca-Cola 3L + snacks Ores",
    badge: "Exclusivo App",
    precioFallback: 5000,
    totalUnidades: 10,
    items: [
      { cantidad: "1x", nombre: "Caja 84 un. Hamburguesas Schneck" },
      { cantidad: "6x", nombre: "Coca-Cola 3L (unidad)" },
      { cantidad: "1x", nombre: "Papas fritas Ores 900g" },
      { cantidad: "1x", nombre: "Sopladitos Ores queso 500g" },
      { cantidad: "1x", nombre: "Paliores 1kg" },
    ],
  },
  {
    id: "pack-fin-de-semana",
    codigo: "657146614164",
    matchNames: ["pack fin de semana"],
    tituloDisplay: "Pack Fin de Semana",
    eyebrow: "Combo Finde",
    subtitulo: "Panchos, papas 2.5kg, aderezos, Coca-Cola 1.5L, vino y maní",
    badge: "Exclusivo App",
    precioFallback: 999,
    totalUnidades: 9,
    items: [
      { cantidad: "2x", nombre: "Pancho La Dolfina" },
      { cantidad: "1x", nombre: "Papas cong. Pomclaire 2.5kg 9m" },
      { cantidad: "1x", nombre: "Mayonesa Uruguay 500g" },
      { cantidad: "1x", nombre: "Ketchup Cololo 200g" },
      { cantidad: "1x", nombre: "Coca-Cola 1.5L (unidad)" },
      { cantidad: "1x", nombre: "Vino Faisán 1L" },
      { cantidad: "1x", nombre: "Maní Jazam 120g" },
      { cantidad: "1x", nombre: "Mostaza Cololo 200g" },
    ],
  },
];

const PACK_BY_CODE = new Map<string, ExclusivePackConfig>(
  EXCLUSIVE_APP_PACKS.map((pack) => [pack.codigo, pack])
);

function normalizeText(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatPackContenido(items: ExclusivePackItem[]): string {
  return items.map((item) => `• ${item.cantidad} ${item.nombre}`).join("\n");
}

export function getExclusivePackByProduct(
  producto: Pick<Producto, "codigo" | "nombre"> | null | undefined
): ExclusivePackConfig | null {
  if (!producto) return null;

  const code = String(producto.codigo || "").trim();
  const byCode = PACK_BY_CODE.get(code);
  if (byCode) return byCode;

  const normName = normalizeText(producto.nombre);
  if (!normName) return null;

  for (const pack of EXCLUSIVE_APP_PACKS) {
    if (pack.matchNames.some((term) => normName.includes(normalizeText(term)))) {
      return pack;
    }
  }

  return null;
}

export function enrichProductoWithExclusivePack(producto: Producto): Producto {
  const pack = getExclusivePackByProduct(producto);
  if (!pack) return producto;

  return {
    ...producto,
    contenido: producto.contenido?.trim()
      ? producto.contenido
      : formatPackContenido(pack.items),
    destacado: true,
    exclusivoApp: true,
  };
}

export function resolveExclusivePacksFromCatalog(
  productos: Producto[]
): ResolvedExclusivePack[] {
  const resolved: ResolvedExclusivePack[] = [];

  for (const pack of EXCLUSIVE_APP_PACKS) {
    const matched = productos.find((p) => {
      const byProduct = getExclusivePackByProduct(p);
      return byProduct?.id === pack.id;
    });

    if (matched) {
      if (matched.deshabilitado || (matched.precio || 0) <= 0) continue;
      resolved.push({
        pack,
        producto: enrichProductoWithExclusivePack(matched),
      });
    } else {
      resolved.push({
        pack,
        producto: {
          codigo: pack.codigo,
          nombre: pack.tituloDisplay,
          precio: pack.precioFallback,
          categoria: "OTROS",
          contenido: formatPackContenido(pack.items),
          destacado: true,
          exclusivoApp: true,
        },
      });
    }
  }

  return resolved;
}
