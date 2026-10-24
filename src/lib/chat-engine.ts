// filepath: src/lib/chat-engine.ts
import { calcularPrecioConEscala } from "./pricing";
import type { BulkPriceTier, Producto } from "@/types";
import { HALLOWEEN_PROMOS } from "./constants/ofertas";

function withSeasonalPromos(catalog: Producto[]): Producto[] {
  const seasonalProducts: Producto[] = HALLOWEEN_PROMOS.map((p) => ({
    codigo: `PROMO-${p.id}`,
    nombre: `${p.titulo} (Especial Halloween)`,
    precio: p.precio || 0,
    categoria: "Golosinas y Chocolates",
    imagen: p.imagen,
    destacado: true,
    escalaPrecios: p.escalaPrecios,
  }));
  const existingCodes = new Set(catalog.map((c) => c.codigo));
  const extra = seasonalProducts.filter((sp) => !existingCodes.has(sp.codigo));
  return [...extra, ...catalog];
}

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

export interface BusinessRubro {
  id: string;
  rubroName: string;
  terms: string[];
  keywords: string[];
  defaultQuantities?: Record<string, number>;
  humanAdvice: string;
  chips: string[];
}

export const BUSINESS_RUBROS: BusinessRubro[] = [
  {
    id: "pizzeria",
    rubroName: "Pizzería y Chivitería",
    terms: ["pizzeria", "pizzerias", "pizza", "pizzas", "muzzarella", "mozzarella", "faina", "faina", "chivito", "chivitos", "chiviteria"],
    keywords: ["muzza", "mozzarella", "salsa deambrosi", "pulpa de tomate", "harina canuelas", "aceitunas", "oregano dukita", "buby jamon", "panceta"],
    humanAdvice: "Para pizzería y minutas sugerí: muzzarella feteada por kilo, salsa pizzera Deambrosi o pulpa Cololo, harina Cañuelas especial pizza, orégano Dukita por kilo, aceitunas Gibur y jamón feteado. Explicá cómo rinden para elaboración continua.",
    chips: ["🍕 Sumar surtido al pedido", "🧀 Ver otras marcas de queso", "📦 Consultar por fardo cerrado", "🛵 Envíos a Canelones"],
  },
  {
    id: "panaderia",
    rubroName: "Panadería, Confitería y Masas",
    terms: ["panaderia", "panaderias", "pasteleria", "reposteria", "panadero", "masas", "facturas", "bizcochos", "torta", "tortas", "confiteria"],
    keywords: ["harina canuelas", "azucar 25kg", "levadura", "grasa cololo", "margarina cukin", "dulce de leche conaprole", "cacao en polvo", "polvo"],
    humanAdvice: "Para panaderías y obradores sugerí bolsas grandes: Harina Cañuelas 25kg, Azúcar 25kg, Grasa vacuna Cololo, Margarina 10kg y Dulce de Leche repostero x 5kg para maximizar rentabilidad.",
    chips: ["🥖 Sumar insumos al pedido", "📦 Consultar bolsas de 25kg", "🧁 Ver dulce de leche y chocolate", "💬 Hablar con asesor"],
  },
  {
    id: "rotiseria",
    rubroName: "Rotisería, Viandas y Gastronomía",
    terms: ["rotiseria", "rotiserias", "restaurante", "resto", "comedor", "viandas", "gastronomia", "minutas", "hamburgueseria", "food truck", "carro"],
    keywords: ["aceite canuelas 5l", "aceite de arroz saman", "mayonesa bqb", "ketchup", "aderezos", "hamburguesa", "canasta de carton con tapa", "arvejas"],
    humanAdvice: "Para gastronomía y viandas sugerí: Aceite en bidón de 5L (Cañuelas o Samán arroz), mayonesa BQB balde 2.75kg, aderezos, hamburguesas y descartables para delivery.",
    chips: ["🍗 Sumar combo de rotisería", "🛢️ Ver bidones de 5L", "📦 Bandejas para viandas", "🛵 Horarios de reparto"],
  },
  {
    id: "kiosco",
    rubroName: "Kiosco, Minimarket y Almacén",
    terms: ["kiosco", "quiosco", "kioscos", "almacen", "minimarket", "reventa", "revendedor", "despensa", "comercio", "negocio de barrio"],
    keywords: ["alfajor", "galletitas nestle", "caramelo", "yerba baldo", "snack delicius", "fideo", "refresco"],
    humanAdvice: "Para quiosco y reventa destacá productos de rotación rápida: alfajores por caja (Punta Ballena / Sol), galletitas, caramelos, yerba Baldo/Canarias y snacks Delicius.",
    chips: ["🍬 Sumar golosinas y snacks", "🧉 Ver yerbas mayoristas", "🍫 Consultar alfajores por caja", "💬 Atención revendedores"],
  },
  {
    id: "picada",
    rubroName: "Picada, Copetín y Cervecería",
    terms: ["picada", "picadas", "copetin", "cerveceria", "bar", "tragos", "after", "juntada", "tablita"],
    keywords: ["pack muza", "salame", "aceitunas gibur", "buby jamon", "snack delicius", "bastones de queso", "mayonesa"],
    humanAdvice: "Para picadas y copetín sugerí packs de fiambres feteados (salame + muzzarella), aceitunas Gibur, jamón cocido, bastones de queso Crufi y snacks para dip.",
    chips: ["🧀 Sumar tabla de picada", "🫒 Ver aceitunas rellenas", "🥩 Ver fiambres y salame", "🍻 Ver bebidas y refrescos"],
  },
  {
    id: "cumpleanos",
    rubroName: "Cumpleaños, Fiestas y Eventos",
    terms: ["cumpleanos", "cumpleanios", "cumple", "fiesta", "evento", "infantil", "agasajo", "bautismo", "reunion"],
    keywords: ["vasos copobras", "platos blancos", "servilletas fama", "alfajor", "snack delicius", "jugo"],
    humanAdvice: "Para eventos y festejos familiares armá un combo con: vasos descartables x100u, platos, servilletas, alfajores surtidos, snacks en bolsa grande y refrescos.",
    chips: ["🎈 Sumar combo de fiesta", "🥤 Ver vasos y descartables", "🧁 Ver golosinas y snacks", "🛵 Coordinar entrega"],
  },
  {
    id: "limpieza",
    rubroName: "Limpieza Institucional y Desinfección",
    terms: ["limpieza", "desinfeccion", "higiene", "institucional", "lavandina", "detergente", "cloro", "bactericida", "consorcio", "empresa"],
    keywords: ["lavandina artik 5l", "detergente aquafast", "suavizante aquafast", "desodorante ambiente", "papel higienico celeste", "bolsa"],
    humanAdvice: "Para higiene y limpieza institucional sugerí envases económicos: Lavandina Artik 5L, detergente, suavizante concentrado, desodorantes y papel higiénico institucional en pack cerrado.",
    chips: ["🧹 Sumar combo de limpieza", "🧴 Ver bidones de 5L", "🧻 Ver papel higiénico mayorista", "💬 Pedir factura con RUT"],
  },
  {
    id: "desayuno",
    rubroName: "Desayuno y Merienda (Comercios y Familias)",
    terms: ["desayuno", "merienda", "desayunos", "meriendas", "oficina", "merendero", "comedor escolar"],
    keywords: ["yerba baldo", "dulce de leche conaprole", "galletitas nestle", "los nietitos mermelada", "leche", "azucar"],
    humanAdvice: "Para desayunos y meriendas sugerí los clásicos infaltables: Yerba Baldo/Canarias 1kg, Dulce de Leche Conaprole, Mermeladas Los Nietitos, galletitas dulces y azúcar.",
    chips: ["☕ Sumar surtido de desayuno", "🧉 Ver yerbas uruguayas", "🥛 Ver lácteos y dulces", "🛒 Ver catálogo completo"],
  },
  {
    id: "asado",
    rubroName: "Parrillada y Asado",
    terms: ["asado", "parrillada", "parrilla", "carniceria", "carbon", "asador", "costillar", "chorizada"],
    keywords: ["sal gruesa", "adobo dukita", "chimichurri", "mayonesa bqb", "aceite de arroz"],
    humanAdvice: "Para asado y parrillada sugerí los infaltables: Sal gruesa Cololo, adobo y chimichurri Centenario/Dukita por kilo, mayonesa balde para ensaladas y aceite de arroz.",
    chips: ["🔥 Sumar condimentos de asado", "🥩 Ver mayonesas y salsas", "🥤 Ver bebidas frías", "🛵 Envíos para el finde"],
  },
  {
    id: "halloween",
    rubroName: "Especial Halloween y Golosinas en Oferta",
    terms: ["halloween", "haloween", "noche de brujas", "golosinas halloween", "caramelos florestal", "malvavisco", "chupetin ringring", "ringring", "ducrem", "cremitas ducrem", "paletas florestal"],
    keywords: ["caramelos florestal 500g", "paleta grande malvavisco", "chupetin ringring", "cremitas ducrem 18u", "paletas florestal pegadas"],
    humanAdvice: "Para Halloween destacá nuestras 5 promos dulces especiales: Caramelos Florestal 500g ($75), Paleta Grande Malvavisco ($35), Chupetín RingRing x20 ($210), Cremitas Ducrem 18u ($170) y Paletas Florestal ($75). El pack completo de las 5 promos queda en $565.",
    chips: ["🎃 Sumar las 5 promos ($565)", "🍬 Ver Caramelos y Chupetines", "👻 Ver Cremitas Ducrem", "🛒 Abrir mi carrito"],
  },
  {
    id: "descartables",
    rubroName: "Descartables, Envoltorios y Packaging",
    terms: ["descartables", "embalaje", "packaging", "delivery", "cajas", "bolsas", "film", "aluminio", "bobina"],
    keywords: ["film de pvc", "bandeja aluminio", "vaso espuma copobras", "plato grande blanco", "bolsa baguette"],
    humanAdvice: "Para packaging y delivery gastronómico ofrecé: Film de PVC x 700m, bandejas de aluminio Darnel, vasos térmicos con tapa y bolsas resistentes con visor.",
    chips: ["📦 Sumar descartables y film", "🍱 Ver bandejas térmicas", "🛍️ Ver bolsas para negocio", "💬 Cotización mayorista"],
  },
];

export function detectRubro(text: string): BusinessRubro | null {
  const norm = normText(text);
  for (const rubro of BUSINESS_RUBROS) {
    if (rubro.terms.some((term) => norm.includes(term))) {
      return rubro;
    }
  }
  return null;
}

export function extractRubroCandidates(
  catalog: Producto[],
  rubro: BusinessRubro,
  maxPerKeyword = 2
): Producto[] {
  const fullCatalog = withSeasonalPromos(catalog);
  const chosen = new Map<string, Producto>();

  // Iterar por cada keyword temática para garantizar que la selección sea representativa
  for (const kw of rubro.keywords) {
    const normKw = normText(kw);
    const matches = fullCatalog.filter((p) => {
      const pNorm = normText(p.nombre);
      return pNorm.includes(normKw) || normKw.split(" ").every((tk) => pNorm.includes(tk));
    });

    // Priorizar productos con precio mayor a 0 y que tengan foto o descuento por escala
    matches.sort((a, b) => {
      const aBonus = (a.imagen ? 20 : 0) + (a.escalaPrecios ? 15 : 0);
      const bBonus = (b.imagen ? 20 : 0) + (b.escalaPrecios ? 15 : 0);
      return bBonus - aBonus;
    });

    for (const p of matches.slice(0, maxPerKeyword)) {
      if (!chosen.has(p.codigo)) {
        chosen.set(p.codigo, p);
      }
    }
  }

  return Array.from(chosen.values());
}

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
    .replace(/Ã /g, "Á")
    .replace(/Ã‰/g, "É")
    .replace(/Ã /g, "Í")
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
  const fullProducts = withSeasonalPromos(products);
  const joinedQuery = tokens.join(" ");
  const hasCremaInQuery = tokens.some((t) => t.includes("crema"));
  const hasDulceInQuery = tokens.some((t) => t.includes("dulce"));
  const hasPolvoInQuery = tokens.some((t) => t.includes("polvo"));
  const hasLecheInQuery = tokens.some((t) => t.includes("leche"));

  const scored: Array<{ product: Producto; score: number }> = [];

  for (const p of fullProducts) {
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
 * Con empatía humana uruguaya y resolución comercial inmediata
 */
export function localChatFallback(rawMsg: string, catalog: Producto[]): ChatApiResponse {
  const nMsg = normText(rawMsg);

  // 1. Detección de código de rastreo (CN-XXXX o AT-XXXX)
  const orderCodeMatch = rawMsg.match(/\b((?:CN|AT)-[A-Z0-9]{3,10})\b/i);
  if (orderCodeMatch) {
    const code = orderCodeMatch[1].toUpperCase();
    return {
      reply: `📦 ¡Qué hacés! Ya estoy buscando el estado de tu pedido **${code}** en depósito… Podés consultar los avances acá mismo o hablar directamente con un asesor humano para coordinar la entrega:`,
      orderCard: {
        publicCode: code,
        status: "CONFIRMED",
        statusLabel: "En preparación en depósito 📦",
        totalApprox: 0,
      },
      suggestions: ["🛵 Horarios y zonas de reparto", "💬 Hablar con un asesor por WhatsApp", "🛒 Seguir comprando en el catálogo"],
      intent: "order_tracking",
    };
  }

  // 2. Horarios y envíos
  if (/\b(horario|horarios|reparto|envio|envios|zona|zonas|donde quedan|donde estan|direccion)\b/.test(nMsg)) {
    return {
      reply: `📍 **Horarios y Entregas — El Remate Canelones:**\n\n• **Atención Mayorista y Minorista:** Lunes a Sábados de 08:00 a 19:00 hs.\n• **Zonas de Reparto Directo:** Canelones Ciudad, Santa Lucía, Sauce, Las Piedras y zonas de influencia.\n• **Retiros en Local:** Podés confirmar tu pedido por la web y pasar a retirar ya embalado sin demoras.\n\n¿Querés armar una lista para coordinar entrega o pasar a retirar?`,
      suggestions: ["🛒 Armar una lista rápida", "🏷️ Ver ofertas y precios por volumen", "💬 Hablar con un asesor de ventas"],
      intent: "delivery_info",
    };
  }

  // 3. Solicitud explícita de asesor comercial
  if (/\b(vendedor|humano|asesor|comercio|reclamo|persona|ayuda|telefono|contacto)\b/.test(nMsg)) {
    return {
      reply: "¡Por supuesto, che! Completá tu nombre y WhatsApp acá abajo para que un asesor de ventas se comunique contigo con tu consulta y tu carrito listo, o escribinos directamente por WhatsApp:",
      showHandoffForm: true,
      suggestions: ["🏷️ Ver ofertas mientras tanto", "🛒 Armar mi lista de compra", "📦 Rastrear un pedido"],
      intent: "human_handoff",
    };
  }

  // 4. Corrección o descarte
  if (/\b(no es lo mismo|te equivocaste|te confundiste|eso no|no quiero|sacame|saca|quitar|elimina|borra)\b/i.test(nMsg)) {
    return {
      reply: "¡Uh, tenés toda la razón, disculpame la confusión! Decime exactamente qué producto querés que cambie o retire y te lo acomodo enseguida.",
      suggestions: ['🛒 Ejemplo: "2 yerba canarias, 1 aceite optimo"', "🏷️ Ver ofertas", "💬 Hablar con asesor"],
      intent: "correction",
    };
  }

  // 5. Detección Inteligente de Rubro Comercial (Pizzería, Panadería, Kiosco, etc.)
  const detectedRubro = detectRubro(rawMsg);
  if (detectedRubro) {
    const rubroCandidates = extractRubroCandidates(catalog, detectedRubro, 1).slice(0, 6);
    if (rubroCandidates.length > 0) {
      const items: ChatProductItem[] = rubroCandidates.map((p) => {
        const qty = 2;
        const escala = p.escalaPrecios as BulkPriceTier[] | undefined;
        const calc = calcularPrecioConEscala(p.precio, qty, escala);
        return {
          codigo: p.codigo,
          nombre: cleanEncoding(p.nombre),
          categoria: p.categoria,
          precio: p.precio,
          precioUnitarioAplicado: calc.precioUnitario,
          ahorroTotal: calc.ahorroTotal,
          unidad: (p as any).unidad || "u",
          escalaPrecios: escala,
          cantidadSugerida: qty,
          subtotalSugerido: Math.round(qty * calc.precioUnitario),
        };
      });

      const totalSurtido = items.reduce((acc, it) => acc + it.subtotalSugerido, 0);

      return {
        reply: `¡Qué hacés! Qué buena iniciativa para tu **${detectedRubro.rubroName}**. Te armé esta propuesta inicial con **${items.length} insumos esenciales** que más rinden en Canelones, por un total estimado de **$ ${totalSurtido.toLocaleString("es-UY")}**.\n\nPodés tocar **"Sumar los productos al pedido"** o agregar de a uno. ¿Querés que sumemos algún otro insumo o ajuste?`,
        isMultiList: true,
        totalListApprox: totalSurtido,
        products: items,
        suggestions: detectedRubro.chips,
        intent: "order_list",
      };
    }
  }

  // 6. Búsqueda y armado de lista por segmentos
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
        ? `¡Dale, te preparé la lista! Encontré **${matched.length} productos** en el catálogo por un total aproximado de **$ ${sum.toLocaleString("es-UY")}**. Podés sumarlos todos al carrito con un solo toque:`
        : `¡Encontré **${matched[0].nombre}** a **$ ${matched[0].precio.toLocaleString("es-UY")}**! Tocá en sumar para agregarlo a tu pedido:`,
      isMultiList: matched.length > 1,
      totalListApprox: sum,
      products: matched,
      suggestions: ["🛒 Sumar al carrito", "🏷️ Ver ofertas y descuentos por bulto", "💬 Hablar con un asesor"],
      intent: "order_list",
    };
  }

  // 7. Saludo inicial o consulta amigable
  const isGreeting = /\b(hola|buenas|buen dia|que tal|como andas|como va|saludos)\b/.test(nMsg);
  if (isGreeting) {
    return {
      reply: `¡Hola! Qué hacés, un gusto saludarte 👋\n\nAcá en **El Remate Canelones** tenemos más de 1.900 productos con precios directos mayoristas y minoristas.\n\nContame: ¿tenés algún comercio (pizzería, almacén, rotisería, panadería) o querés armar tu pedido con una lista de productos? Escribime lo que necesites y te lo resuelvo al toque.`,
      suggestions: [
        "🍕 Surtido para pizzería",
        "🥖 Harinas y panadería",
        "🍬 Golosinas para kiosco",
        "🛒 Ejemplo: 2 yerba, 1 aceite, 3 leches",
      ],
      intent: "greeting",
    };
  }

  return {
    reply: `No encontré una coincidencia exacta para *"${rawMsg}"* entre los **${catalog.length.toLocaleString("es-UY")} artículos** del catálogo. Probá escribiendo el producto directo (ej: *"yerba"*, *"aceite"*, *"muzzarella"*), tu rubro (ej: *"pizzería"*, *"rotisería"*) o consultanos con el formulario de abajo para que un asesor te pase precio al instante:`,
    showHandoffForm: true,
    suggestions: [
      "🍕 Surtido para pizzería",
      "🍬 Mercadería para kiosco",
      "🏷️ Ver ofertas y precios por bulto",
      "💬 Hablar con asesor humano",
    ],
    intent: "no_match",
  };
}
