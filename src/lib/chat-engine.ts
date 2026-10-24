// filepath: src/lib/chat-engine.ts
import { calcularPrecioConEscala } from "./pricing";
import type { BulkPriceTier, Producto } from "@/types";

export interface ChatProductItem {
  codigo: string;
  nombre: string;
  categoria?: string;
  precio: number;
  precioUnitarioAplicado: number;
  ahorroTotal: number;
  unidad?: string;
  escalaPrecios?: BulkPriceTier[];
  cantidadSugerida: number;
  subtotalSugerido: number;
}

export interface OrderCardData {
  id?: string;
  publicCode: string;
  status: string;
  statusLabel: string;
  totalApprox: number;
  customerName?: string;
  items?: Array<{ name: string; quantity: number; unitPrice?: number }>;
}

export interface ChatApiResponse {
  reply: string;
  products?: ChatProductItem[];
  isMultiList?: boolean;
  totalListApprox?: number;
  suggestions?: string[];
  orderCard?: OrderCardData;
  showHandoffForm?: boolean;
  intent?: string;
}

export const STOP_WORDS = new Set([
  "hola", "buenas", "buenos", "dias", "tardes", "noches", "quiero", "quisiera",
  "necesito", "tenes", "tienen", "tendras", "hay", "precio", "precios", "cuanto",
  "sale", "esta", "estan", "el", "la", "los", "las", "un", "una", "unos", "unas",
  "de", "del", "por", "para", "con", "sin", "que", "me", "das", "dame", "agregar",
  "sumar", "comprar", "llevar", "encargar", "lista", "busco", "mostrar", "ver",
  "pasame", "mandame", "favor", "gracias", "che", "consulta", "consultar",
  "unidades", "unidad", "paquete", "paquetes", "botella", "botellas", "lata", "latas",
  "no", "es", "lo", "mismo", "te", "equivocaste", "confundiste", "otro", "otra",
]);

/**
 * Corrige errores comunes de codificación (Mojibake UTF-8 decodificado como Latin-1)
 */
export function cleanEncoding(str: string): string {
  if (!str) return "";
  return str
    .replace(/Ã¡/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã‘/g, "Ñ")
    .replace(/Ã/g, "Á")
    .replace(/Ã‰/g, "É")
    .replace(/Ã/g, "Í")
    .replace(/Ã“/g, "Ó")
    .replace(/Ãš/g, "Ú")
    .replace(/Â/g, "")
    .trim();
}

export function normText(str: string): string {
  return cleanEncoding(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatChatMarkdown(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

export function parseSegmentQuantityAndTerm(rawSegment: string) {
  let text = normText(rawSegment);
  if (!text) return null;

  let qty = 1;

  if (/\b(medio\s+kilo|1\/2\s*kg|medio\s+kg|0\.5\s*kg)\b/.test(text)) {
    qty = 0.5;
    text = text.replace(/\b(medio\s+kilo|1\/2\s*kg|medio\s+kg|0\.5\s*kg)\b/g, " ").trim();
  } else if (/\b(un\s+kilo\s+y\s+medio|1\.5\s*kg)\b/.test(text)) {
    qty = 1.5;
    text = text.replace(/\b(un\s+kilo\s+y\s+medio|1\.5\s*kg)\b/g, " ").trim();
  } else {
    const leadingQty = text.match(
      /^(\d+(?:[.,]\d+)?)\s*(?:x|un|u|unidades|paquetes|botellas|latas|fardos|kg|kilos|kilo)?\b\s+(.*)$/
    );
    if (leadingQty) {
      const parsedNum = parseFloat(leadingQty[1].replace(",", "."));
      const rest = leadingQty[2].trim();
      if (parsedNum > 0 && parsedNum <= 100 && rest.length >= 2) {
        qty = parsedNum;
        text = rest;
      }
    }
  }

  const tokens = text
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

  if (tokens.length === 0) return null;
  return { qty, rawQuery: text, tokens };
}

export function searchCatalogByTokens(
  products: Producto[],
  tokens: string[],
  maxResults = 4
): Producto[] {
  if (!tokens || tokens.length === 0 || !Array.isArray(products)) return [];
  const joinedQuery = tokens.join(" ");
  const hasCremaInQuery = tokens.some((t) => t.includes("crema"));
  const hasDulceInQuery = tokens.some((t) => t.includes("dulce"));
  const hasPolvoInQuery = tokens.some((t) => t.includes("polvo"));
  const hasLecheInQuery = tokens.some((t) => t.includes("leche"));

  const scored: Array<{ product: Producto; score: number }> = [];

  for (const p of products) {
    const pNameNorm = normText(p.nombre || "");
    const pSkuNorm = normText(p.codigo || "");
    const pCatNorm = normText(p.categoria || "");

    if (pSkuNorm === joinedQuery) {
      scored.push({ product: p, score: 1000 });
      continue;
    }

    let matchedTokens = 0;
    let score = 0;

    for (const tk of tokens) {
      if (pNameNorm.includes(tk)) {
        matchedTokens++;
        score += tk.length >= 4 ? 30 : 15;
        if (new RegExp(`\\b${tk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(pNameNorm)) {
          score += 20;
        }
      } else if (pCatNorm.includes(tk)) {
        matchedTokens += 0.5;
        score += 10;
      }
    }

    if (matchedTokens === 0) continue;
    const coverage = matchedTokens / tokens.length;
    if (tokens.length >= 2 && coverage < 0.6) continue;

    // Regla de Oro: Discriminar leche común de crema o dulce de leche
    if (hasLecheInQuery) {
      if (!hasCremaInQuery && pNameNorm.includes("crema")) score -= 90;
      if (!hasDulceInQuery && pNameNorm.includes("dulce")) score -= 90;
      if (!hasPolvoInQuery && pNameNorm.includes("polvo")) score -= 50;
      if (pNameNorm.startsWith("leche")) score += 40;
    }

    if (pNameNorm.includes(joinedQuery)) score += 45;
    const prevP = (p as any).precioAnterior || (p as any).precioAntes;
    if (prevP && prevP > p.precio) score += 6;

    scored.push({ product: p, score });
  }

  scored.sort((a, b) => b.score - a.score || a.product.precio - b.product.precio);
  return scored.slice(0, maxResults).map((s) => s.product);
}

/**
 * Motor de Fallback Local instantáneo (Client-Side / Offline < 5ms)
 */
export function localChatFallback(rawMsg: string, catalog: Producto[]): ChatApiResponse {
  const nMsg = normText(rawMsg);

  // 1. Detección de código de rastreo (CN-XXXX o AT-XXXX)
  const orderCodeMatch = rawMsg.match(/\b((?:CN|AT)-[A-Z0-9]{3,10})\b/i);
  if (orderCodeMatch) {
    const code = orderCodeMatch[1].toUpperCase();
    return {
      reply: `📦 Buscando el estado del pedido **${code}**… Podés ver su avance o consultar de inmediato con un asesor:`,
      orderCard: {
        publicCode: code,
        status: "CONFIRMED",
        statusLabel: "En preparación en depósito",
        totalApprox: 0,
      },
      suggestions: ["🛵 Horarios y envíos", "💬 Hablar con asesor", "🛒 Seguir comprando"],
    };
  }

  // 2. Horarios y envíos
  if (/\b(horario|horarios|reparto|envio|envios|zona|zonas|donde quedan|donde estan)\b/.test(nMsg)) {
    return {
      reply: `📍 **Horarios y Entregas — El Remate Canelones:**\n• **Atención:** Lunes a Sábados 08:00 a 19:00 hs.\n• **Repartos:** Canelones Ciudad, Santa Lucía, Sauce, Las Piedras y zonas aledañas.\n• **Retiros:** Podés coordinar retiro directo en nuestro local mayorista.`,
      suggestions: ["🛒 Ejemplo de lista", "🏷️ Ofertas y Mayorista", "💬 Hablar con asesor"],
    };
  }

  // 3. Solicitud explícita de asesor comercial
  if (/\b(vendedor|humano|asesor|comercio|reclamo|persona|ayuda)\b/.test(nMsg)) {
    return {
      reply: "Dejanos tu nombre y WhatsApp para derivar tu consulta y tu carrito actual a un asesor de ventas:",
      showHandoffForm: true,
      suggestions: ["🛒 Ejemplo de lista", "🏷️ Ofertas y Mayorista", "📦 Rastrear pedido"],
    };
  }

  // 4. Corrección o descarte
  if (/\b(no es lo mismo|te equivocaste|te confundiste|eso no|no quiero|sacame|saca|quitar|elimina|borra)\b/i.test(nMsg)) {
    return {
      reply: "¡Disculpá la confusión! Por favor decime exactamente qué producto querés cambiar o retirar y lo acomodamos enseguida.",
      suggestions: ['🛒 Ejemplo: "2 yerba canarias, 1 aceite optimo"', "🏷️ Ver ofertas", "💬 Hablar con asesor"],
    };
  }

  // 5. Búsqueda y armado de lista
  const segments = rawMsg.split(/[,;\n]+|\s+\+\s+/).map((s) => s.trim()).filter(Boolean);
  const matched: ChatProductItem[] = [];

  for (const seg of segments) {
    const parsed = parseSegmentQuantityAndTerm(seg);
    if (!parsed) continue;

    const hits = searchCatalogByTokens(catalog, parsed.tokens, 1);
    if (hits.length > 0) {
      const best = hits[0];
      const escala = best.escalaPrecios as BulkPriceTier[] | undefined;
      const calc = calcularPrecioConEscala(best.precio, parsed.qty, escala);

      matched.push({
        codigo: best.codigo,
        nombre: cleanEncoding(best.nombre),
        categoria: best.categoria,
        precio: best.precio,
        precioUnitarioAplicado: calc.precioUnitario,
        ahorroTotal: calc.ahorroTotal,
        unidad: (best as any).unidad || "u",
        escalaPrecios: escala,
        cantidadSugerida: parsed.qty,
        subtotalSugerido: Math.round(parsed.qty * calc.precioUnitario),
      });
    }
  }

  if (matched.length > 0) {
    const sum = matched.reduce((a, b) => a + b.subtotalSugerido, 0);
    return {
      reply: matched.length > 1
        ? `Armé tu lista con **${matched.length} productos** por un total aproximado de **$ ${sum.toLocaleString("es-UY")}**:`
        : `Encontré **${matched[0].nombre}** a **$ ${matched[0].precio.toLocaleString("es-UY")}**:`,
      isMultiList: matched.length > 1,
      totalListApprox: sum,
      products: matched,
      suggestions: ["🛒 Sumar al carrito", "🏷️ Ofertas y Mayorista", "💬 Hablar con asesor"],
    };
  }

  return {
    reply: `Busqué *"${rawMsg}"* en los **${catalog.length.toLocaleString("es-UY")} productos** del catálogo de Canelones. Probá escribir el nombre del producto (ej: *"yerba canarias"*, *"aceite"*) o tu lista separada por comas.`,
    showHandoffForm: true,
    suggestions: ["🛒 Ejemplo de lista", "🏷️ Ofertas y Mayorista", "📦 Rastrear pedido"],
  };
}
