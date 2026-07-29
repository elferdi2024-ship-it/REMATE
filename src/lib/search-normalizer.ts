// filepath: src/lib/search-normalizer.ts
import type { Producto } from "@/types";

// Diccionario extendido de sinónimos para el mercado mayorista uruguayo
export const DICCIONARIO_SINONIMOS: Record<string, string[]> = {
  arroz: ["aros", "ros", "arros", "blue bonnet", "saman", "integral", "parboil"],
  aceite: ["aseite", "girasol", "oliva", "soja", "optimo", "tucani", "canola"],
  leche: ["leshe", "letche", "lacteo", "lactal", "deslactosada", "conaprole", "entera", "descremada"],
  manteca: ["mantequilla", "manteica", "maravilla"],
  mayonesa: ["maionesa", "mayo", "aderezo", "dánica", "hellmanns"],
  fideos: ["pastas", "tallarines", "spaghetti", "moñitas", "tirabuzon", "ravioles", "adria", "albufera"],
  harina: ["arina", "leudante", "000", "0000", "cañuelas", "trigo"],
  queso: ["keso", "kezos", "muzarella", "danbo", "magro", "cuartirolo", "sardo", "rallado"],
  jamon: ["hamon", "fiambre", "paleta", "sarubbi", "schneck"],
  pan: ["panaderia", "galletas", "crackers", "la banderita", "marseilles", "lactal"],
  detergente: ["jabón", "jabon", "limpieza", "jane", "nevex", "skip", "drive"],
  agua: ["bebida", "salus", "matutina", "mineral", "gasificada", "sin gas"],
  cerveza: ["cerveza", "pilsen", "patricia", "stella", "corona", "lata", "porrón"],
  refresco: ["gaseosa", "coca", "pepsi", "nix", "fanta", "sprite", "paso de los toros"],
  yerba: ["jerba", "yerba mate", "canarias", "baldo", "armonía", "sarandi", "moncayo"],
  azucar: ["asucar", "bella vista", "azúcar"],
  atun: ["atún", "pescado", "conserva", "desmenuzado", "lomo"],
};

/**
 * Normaliza una cadena de texto eliminando tildes y convirtiendo a minúsculas.
 */
export function normalizarTexto(str: string): string {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Calcula la distancia Levenshtein entre dos cadenas para tolerancia a typos.
 */
export function distanciaLevenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // sustitución
          matrix[i][j - 1] + 1,     // inserción
          matrix[i - 1][j] + 1      // borrado
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Expande los términos de búsqueda utilizando el diccionario de sinónimos.
 */
export function expandirSinonimos(term: string): string[] {
  const norm = normalizarTexto(term);
  const result: Set<string> = new Set([norm]);

  for (const [clave, sinonimos] of Object.entries(DICCIONARIO_SINONIMOS)) {
    const claveNorm = normalizarTexto(clave);
    if (claveNorm === norm || sinonimos.some((s) => normalizarTexto(s) === norm)) {
      result.add(claveNorm);
      sinonimos.forEach((s) => result.add(normalizarTexto(s)));
    }
  }

  return Array.from(result);
}

/**
 * Búsqueda inteligente de productos con tolerancia a typos y sinónimos.
 */
export function buscarProductosInteligente(
  productos: Producto[],
  query: string
): Producto[] {
  if (!query || !query.trim()) return productos;

  const queryNorm = normalizarTexto(query);
  const rawTerms = queryNorm.split(/\s+/).filter(Boolean);

  // 1. Coincidencia exacta o por subcadena enriquecida con sinónimos
  const expandedTerms = rawTerms.flatMap((t) => expandirSinonimos(t));

  const exactMatches = productos.filter((p) => {
    const searchableText = normalizarTexto(
      `${p.nombre} ${p.codigo} ${p.categoria} ${p.marca || ""}`
    );
    return rawTerms.every((term) =>
      expandedTerms.some((exp) => searchableText.includes(exp))
    );
  });

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  // 2. Fallback con Tolerancia a Typos (Levenshtein) si no hay coincidencias exactas
  return productos.filter((p) => {
    const palabrasProducto = normalizarTexto(`${p.nombre} ${p.marca || ""}`)
      .split(/\s+/)
      .filter((w) => w.length >= 3);

    return rawTerms.some((term) => {
      if (term.length < 3) return false;
      return palabrasProducto.some((word) => {
        const maxDist = term.length <= 4 ? 1 : 2;
        return distanciaLevenshtein(term, word) <= maxDist;
      });
    });
  });
}

/**
 * Extrae la unidad de medida y precio por unidad estandarizado ($/kg, $/L, $/u).
 */
export function obtenerPrecioPorUnidad(
  precio: number,
  nombre: string
): { precioUnitarioTexto: string; packSizeTexto: string } {
  if (!precio || precio <= 0) {
    return { precioUnitarioTexto: "", packSizeTexto: "Unidad" };
  }

  const norm = normalizarTexto(nombre);

  // Detección de peso en gramos o kilos (ej. 500g, 1kg, 2.5kg)
  const kgMatch = norm.match(/(\d+(?:[.,]\d+)?)\s*(kg|kilos|kilo|g|gr|gramos)/i);
  if (kgMatch) {
    let cantidadNum = parseFloat(kgMatch[1].replace(",", "."));
    const unidad = kgMatch[2].toLowerCase();

    if (unidad === "g" || unidad === "gr" || unidad === "gramos") {
      cantidadNum = cantidadNum / 1000;
    }

    if (cantidadNum > 0) {
      const precioPorKg = Math.round(precio / cantidadNum);
      return {
        precioUnitarioTexto: `$${precioPorKg.toLocaleString("es-UY")} / kg`,
        packSizeTexto: `${kgMatch[1]} ${kgMatch[2].toUpperCase()}`,
      };
    }
  }

  // Detección de volumen en ml o litros (ej. 900ml, 1L, 2.25L)
  const lMatch = norm.match(/(\d+(?:[.,]\d+)?)\s*(l|litro|litros|ml|cc)/i);
  if (lMatch) {
    let cantidadNum = parseFloat(lMatch[1].replace(",", "."));
    const unidad = lMatch[2].toLowerCase();

    if (unidad === "ml" || unidad === "cc") {
      cantidadNum = cantidadNum / 1000;
    }

    if (cantidadNum > 0) {
      const precioPorL = Math.round(precio / cantidadNum);
      return {
        precioUnitarioTexto: `$${precioPorL.toLocaleString("es-UY")} / L`,
        packSizeTexto: `${lMatch[1]} ${lMatch[2].toUpperCase()}`,
      };
    }
  }

  // Detección de unidades de bulto (ej. x6, x12, x24)
  const packMatch = norm.match(/x\s*(\d+)/i) || norm.match(/pack\s*(\d+)/i);
  if (packMatch) {
    const unidades = parseInt(packMatch[1], 10);
    if (unidades > 0) {
      const precioPorU = Math.round(precio / unidades);
      return {
        precioUnitarioTexto: `$${precioPorU.toLocaleString("es-UY")} / u.`,
        packSizeTexto: `Pack x ${unidades} u.`,
      };
    }
  }

  return {
    precioUnitarioTexto: `$${precio.toLocaleString("es-UY")} / u.`,
    packSizeTexto: "Unidad",
  };
}
