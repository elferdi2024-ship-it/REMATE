// filepath: src/lib/product-image-finder.ts

export type ImageConfidence = "exact_ean" | "uruguay_store" | "web_search";

export interface ImageCandidate {
  url: string;
  thumbUrl: string;
  title: string;
  domain: string;
  source: "openfoodfacts" | "bing";
  confidence: ImageConfidence;
  width?: number;
  height?: number;
  score: number;
}

export interface FindImagesResult {
  candidates: ImageCandidate[];
  queryUsed: string;
  eanChecked: boolean;
}

const BLOCKED_DOMAINS = [
  "shutterstock.com",
  "istockphoto.com",
  "alamy.com",
  "dreamstime.com",
  "123rf.com",
  "vecteezy.com",
  "gettyimages.com",
  "depositphotos.com",
  "freepik.com",
  "pinterest.com",
  "pinimg.com",
  "tiktok.com",
  "youtube.com",
  "ytimg.com",
  "facebook.com",
  "fbcdn.net",
  "instagram.com",
];

const URUGUAY_PRIORITY_DOMAINS = [
  "gdu-multimedia.azurewebsites.net",
  "tiendainglesa.com.uy",
  "tata.com.uy",
  "disco.com.uy",
  "devoto.com.uy",
  "geant.com.uy",
  "elclon.com.uy",
  "macro.com.uy",
  "macromercado.com.uy",
  "camposur.com.uy",
  "conaprole.com.uy",
  "adu.org.uy",
  "cofas.com.uy",
  "quesur.com.uy",
  "tiendamia.com",
  "pedidosya.com",
  "rappi.com.uy",
  "supermercados",
  "distribuidora",
  "mlstatic.com",
  "openfoodfacts.org",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Limpia abreviaturas típicas de planillas Excel de distribuidora para mejorar
 * la precisión de búsqueda de fotos de productos uruguayos.
 */
export function cleanProductQuery(nombre: string): string {
  let q = String(nombre || "")
    .replace(/\([^)]*\)/g, " ") // elimina comentarios entre paréntesis ej: ( ENVASE DORADO)
    .replace(/[*•·]/g, " ")
    .replace(/\bSUELTO\b/gi, " ")
    .replace(/\bBULTO\b/gi, " ")
    .replace(/\bPACK\b/gi, " ")
    .replace(/\bDESC\.?\b/gi, "descartable")
    .replace(/\bP\.CAFE\b/gi, "cafe")
    .replace(/\bX\s*(\d+)/gi, "$1")
    .replace(/\b(\d+)\s*K\b/gi, "$1kg")
    .replace(/\b(\d+)\s*G\b/gi, "$1g")
    .replace(/\b(\d+)\s*L\b/gi, "$1L")
    .replace(/\s+/g, " ")
    .trim();

  if (q.length > 80) {
    q = q.slice(0, 80).trim();
  }
  return q;
}

export function isValidBarcode(codigo: string): boolean {
  const clean = String(codigo || "").replace(/\D/g, "");
  return clean.length >= 8 && clean.length <= 14;
}

function extractDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isBlockedDomain(domain: string): boolean {
  if (!domain) return true;
  return BLOCKED_DOMAINS.some((b) => domain === b || domain.endsWith(`.${b}`));
}

function isUruguayPriorityDomain(domain: string): boolean {
  if (!domain) return false;
  if (domain.endsWith(".uy")) return true;
  return URUGUAY_PRIORITY_DOMAINS.some((d) => domain.includes(d));
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/\\u0026/g, "&");
}

async function searchOpenFoodFacts(codigo: string): Promise<ImageCandidate | null> {
  const ean = String(codigo || "").replace(/\D/g, "");
  if (ean.length < 8 || ean.length > 14) return null;

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${ean}.json?fields=image_front_url,image_url,image_front_small_url,product_name`,
      {
        headers: { "User-Agent": "ElRemateDistribuidora/1.0 (Uruguay)" },
        signal: AbortSignal.timeout(4500),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.status !== 1 || !data?.product) return null;

    const url = data.product.image_front_url || data.product.image_url;
    if (!url || typeof url !== "string") return null;

    const thumbUrl = data.product.image_front_small_url || url;
    return {
      url,
      thumbUrl,
      title: data.product.product_name || `EAN ${ean}`,
      domain: "openfoodfacts.org",
      source: "openfoodfacts",
      confidence: "exact_ean",
      score: 1000,
    };
  } catch {
    return null;
  }
}

async function searchBingImages(query: string, limit = 14): Promise<ImageCandidate[]> {
  const params = new URLSearchParams({
    q: query,
    first: "1",
    count: String(limit),
    mmasync: "1",
    cc: "uy",
    setlang: "es",
  });

  try {
    const res = await fetch(`https://www.bing.com/images/async?${params.toString()}`, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "es-UY,es;q=0.9,en;q=0.5",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(6500),
    });

    if (!res.ok) return [];
    const html = await res.text();

    // Bing incluye metadata JSON dentro de atributos m="{...}" escapados en HTML
    const regex = /\bm="(\{[^"]*?murl[^"]*?\})"/g;
    const rawBlocks: RegExpExecArray[] = [];
    let regexMatch: RegExpExecArray | null;
    while ((regexMatch = regex.exec(html)) !== null) {
      rawBlocks.push(regexMatch);
    }
    const results: ImageCandidate[] = [];

    for (const match of rawBlocks) {
      try {
        const parsed = JSON.parse(decodeHtmlEntities(match[1]));
        const murl = typeof parsed.murl === "string" ? parsed.murl : "";
        const turl = typeof parsed.turl === "string" ? parsed.turl : murl;
        const purl = typeof parsed.purl === "string" ? parsed.purl : "";
        const title = typeof parsed.t === "string" ? parsed.t : "";

        if (!murl.startsWith("http")) continue;
        if (murl.endsWith(".svg") || murl.includes("data:image")) continue;

        const imgDomain = extractDomain(murl);
        const pageDomain = extractDomain(purl);
        const effectiveDomain = pageDomain || imgDomain;

        if (isBlockedDomain(imgDomain) || (pageDomain && isBlockedDomain(pageDomain))) {
          continue;
        }

        // Descartar banners promocionales (ej. "PROMO 2x$90", "lanzamiento", flyers) y proporciones extremas
        const lowerUrlAndTitle = `${murl} ${title}`.toLowerCase();
        if (
          /(promo|banner|oferta|lanzamiento|flyer|folleto|2x\$|2x\s*\d|3x2|descuento|cyber|black-?friday|cupon)/i.test(
            lowerUrlAndTitle
          )
        ) {
          continue;
        }

        const w = Number(parsed.w || 0) || undefined;
        const h = Number(parsed.h || 0) || undefined;

        // Descartar iconos diminutos o banners horizontales/verticales extremos (envases <= 1.85)
        if (w && h) {
          if (w < 140 || h < 140) continue;
          const ratio = Math.max(w / h, h / w);
          if (ratio > 1.85) continue;
        }

        const isUy = isUruguayPriorityDomain(imgDomain) || isUruguayPriorityDomain(pageDomain);
        let score = isUy ? 200 : 100;

        // Bonus por imágenes cuadradas / formato producto de e-commerce
        if (w && h) {
          const ratio = Math.max(w / h, h / w);
          if (ratio <= 1.35) score += 25;
          if (w >= 400 && w <= 1600) score += 20;
        }

        // Bonus extra para catálogos de supermercados uruguayos conocidos
        if (
          imgDomain.includes("gdu-multimedia") ||
          effectiveDomain.includes("tiendainglesa.com.uy") ||
          effectiveDomain.includes("tata.com.uy") ||
          effectiveDomain.includes("disco.com.uy") ||
          effectiveDomain.includes("devoto.com.uy") ||
          effectiveDomain.includes("geant.com.uy") ||
          effectiveDomain.includes("macromercado.com.uy") ||
          effectiveDomain.includes("elclon.com.uy")
        ) {
          score += 80;
        }

        results.push({
          url: murl,
          thumbUrl: turl || murl,
          title: title.slice(0, 120),
          domain: effectiveDomain || imgDomain,
          source: "bing",
          confidence: isUy ? "uruguay_store" : "web_search",
          width: w,
          height: h,
          score,
        });
      } catch {
        // Ignorar bloques malformados
      }
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Busca fotos reales de un producto en cascada gratuita ($0):
 * 1. Open Food Facts por código de barras EAN-13 (precisión exacta)
 * 2. Bing Images priorizando supermercados y distribuidoras de Uruguay (.uy)
 * 3. Fallback por código de barras en Bing si hubo pocos resultados
 */
export async function findProductImages(input: {
  codigo: string;
  nombre: string;
  customQuery?: string;
}): Promise<FindImagesResult> {
  const { codigo, nombre, customQuery } = input;
  const cleaned = customQuery?.trim() || cleanProductQuery(nombre);
  const queryUsed = customQuery?.trim()
    ? customQuery.trim()
    : `${cleaned} uruguay`;

  const eanChecked = isValidBarcode(codigo);

  // Ejecutar Open Food Facts y Bing en paralelo para mínima latencia
  const [offResult, bingResults] = await Promise.all([
    !customQuery && eanChecked ? searchOpenFoodFacts(codigo) : Promise.resolve(null),
    cleaned ? searchBingImages(queryUsed, 16) : Promise.resolve([]),
  ]);

  const combined: ImageCandidate[] = [];
  if (offResult) combined.push(offResult);
  combined.push(...bingResults);

  // Si hubo muy pocos resultados y tenemos EAN válido, buscar también por EAN
  if (combined.length < 3 && eanChecked && !customQuery) {
    const eanBing = await searchBingImages(`${codigo.replace(/\D/g, "")} producto`, 8);
    combined.push(...eanBing);
  }

  // Deduplicar por URL y ordenar por score descendente
  const seen = new Set<string>();
  const unique = combined
    .sort((a, b) => b.score - a.score)
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    })
    .slice(0, 8);

  return {
    candidates: unique,
    queryUsed,
    eanChecked,
  };
}
