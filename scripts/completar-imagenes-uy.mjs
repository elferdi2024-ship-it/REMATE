// filepath: scripts/completar-imagenes-uy.mjs
/**
 * Script masivo $0 para completar imágenes faltantes de productos uruguayos
 * en catalogo_activo/productos + public/productos.json:
 *   1. Open Food Facts (EAN-13 exacto)
 *   2. Bing Images Uruguay (.uy / Tata / Disco / Devoto / Géant / Tienda Inglesa / MLU)
 *   3. Compresión WebP (max 700px, q=80) vía Pillow (~20-40 KB por imagen)
 *   4. Subida a Firebase Storage con Cache-Control inmutable
 *   5. Escritura por lotes en Firestore (1 write cada 20 productos)
 *
 * Uso:
 *   node scripts/completar-imagenes-uy.mjs --limit=100
 *   node scripts/completar-imagenes-uy.mjs --limit=all --concurrency=4
 *   node scripts/completar-imagenes-uy.mjs --limit=20 --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ── Cargar .env.local si existe ──────────────────────────────────────────
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

// ── Argumentos CLI ───────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (prefix, fallback) => {
  const hit = args.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
};
const rawLimit = getArg("--limit=", "100");
const LIMIT = rawLimit === "all" ? Infinity : Math.max(1, Number(rawLimit) || 100);
const CONCURRENCY = Math.min(6, Math.max(1, Number(getArg("--concurrency=", "4")) || 4));
const DELAY_MS = Math.max(100, Number(getArg("--delay=", "250")) || 250);
const DRY_RUN = args.includes("--dry-run");
const ONLY_UY = args.includes("--only-uy");
const ONLY_ACTIVE = args.includes("--only-active");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const BLOCKED_DOMAINS = [
  "shutterstock.com", "istockphoto.com", "alamy.com", "dreamstime.com",
  "123rf.com", "vecteezy.com", "gettyimages.com", "depositphotos.com",
  "freepik.com", "pinterest.com", "pinimg.com", "tiktok.com",
  "youtube.com", "ytimg.com", "facebook.com", "fbcdn.net", "instagram.com",
];

const URUGUAY_PRIORITY = [
  "gdu-multimedia.azurewebsites.net", "tiendainglesa.com.uy", "tata.com.uy",
  "disco.com.uy", "devoto.com.uy", "geant.com.uy", "elclon.com.uy",
  "macromercado.com.uy", "camposur.com.uy", "conaprole.com.uy",
  "adu.org.uy", "cofas.com.uy", "quesur.com.uy", "mlstatic.com", "openfoodfacts.org",
];

function slugify(text) {
  return String(text || "producto")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .slice(0, 60);
}

function cleanProductQuery(nombre) {
  return String(nombre || "")
    .replace(/\([^)]*\)/g, " ")
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
    .trim()
    .slice(0, 80);
}

function decodeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/\\u0026/g, "&");
}

function getDomain(urlStr) {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

async function searchOFF(codigo) {
  const ean = String(codigo || "").replace(/\D/g, "");
  if (ean.length < 8 || ean.length > 14) return null;
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${ean}.json?fields=image_front_url,image_url`,
      { headers: { "User-Agent": "ElRemateDistribuidora/1.0 (Uruguay)" }, signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const d = await res.json();
    const url = d?.status === 1 ? d.product?.image_front_url || d.product?.image_url : null;
    return url ? { url, thumbUrl: url, confidence: "exact_ean", domain: "openfoodfacts.org", score: 1000 } : null;
  } catch {
    return null;
  }
}

async function searchBing(query) {
  const params = new URLSearchParams({
    q: query, first: "1", count: "12", mmasync: "1", cc: "uy", setlang: "es",
  });
  try {
    const res = await fetch(`https://www.bing.com/images/async?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "es-UY,es;q=0.9" },
      signal: AbortSignal.timeout(6500),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const blocks = [...html.matchAll(/\bm="(\{[^"]*?murl[^"]*?\})"/g)];
    const out = [];
    for (const m of blocks) {
      try {
        const p = JSON.parse(decodeHtml(m[1]));
        const murl = typeof p.murl === "string" ? p.murl : "";
        const turl = typeof p.turl === "string" ? p.turl : murl;
        const purl = typeof p.purl === "string" ? p.purl : "";
        if (!murl.startsWith("http") || murl.endsWith(".svg")) continue;
        const imgD = getDomain(murl);
        const pageD = getDomain(purl);
        if (BLOCKED_DOMAINS.some((b) => imgD.includes(b) || pageD.includes(b))) continue;
        const w = Number(p.w || 0);
        const h = Number(p.h || 0);
        if (w && h && (w < 120 || h < 120 || Math.max(w / h, h / w) > 2.6)) continue;
        const isUy =
          imgD.endsWith(".uy") ||
          pageD.endsWith(".uy") ||
          URUGUAY_PRIORITY.some((u) => imgD.includes(u) || pageD.includes(u));
        let score = isUy ? 220 : 100;
        if (
          imgD.includes("gdu-multimedia") ||
          pageD.includes("tiendainglesa.com.uy") ||
          pageD.includes("tata.com.uy") ||
          pageD.includes("disco.com.uy") ||
          pageD.includes("devoto.com.uy") ||
          pageD.includes("geant.com.uy")
        ) {
          score += 80;
        }
        out.push({
          url: murl,
          thumbUrl: turl || murl,
          confidence: isUy ? "uruguay_store" : "web_search",
          domain: pageD || imgD,
          score,
        });
      } catch {
        // ignore
      }
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Comprime cualquier imagen (JPG/PNG/WebP/AVIF) a WebP optimizado <= 700px (q=80)
 * usando Pillow en stdin/stdout (sin archivos temporales).
 */
function compressToWebp(inputBuffer) {
  const pyCode = [
    "import sys, io",
    "from PIL import Image",
    "data = sys.stdin.buffer.read()",
    "im = Image.open(io.BytesIO(data))",
    "if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGBA')",
    "im.thumbnail((700, 700), Image.Resampling.LANCZOS)",
    "out = io.BytesIO()",
    "im.save(out, format='WEBP', quality=80, method=4)",
    "sys.stdout.buffer.write(out.getvalue())",
  ].join("; ");

  const res = spawnSync("python", ["-c", pyCode], {
    input: inputBuffer,
    maxBuffer: 10 * 1024 * 1024,
    timeout: 6000,
  });

  if (res.status === 0 && res.stdout && res.stdout.length > 500) {
    return { buffer: res.stdout, contentType: "image/webp", ext: "webp" };
  }
  return null;
}

async function downloadAndOptimize(candidate) {
  for (const target of [candidate.url, candidate.thumbUrl].filter(Boolean)) {
    try {
      const res = await fetch(target, {
        headers: { "User-Agent": USER_AGENT, Accept: "image/webp,image/jpeg,image/png,image/*,*/*;q=0.8" },
        signal: AbortSignal.timeout(7000),
      });
      if (!res.ok) continue;
      const ct = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      if (!ct.startsWith("image/")) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1024 || buf.length > 8 * 1024 * 1024) continue;

      const optimized = compressToWebp(buf);
      if (optimized) return optimized;

      const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
      return { buffer: buf, contentType: ct, ext };
    } catch {
      // try fallback thumb
    }
  }
  return null;
}

async function main() {
  console.log(`\n🚀 Completar Imágenes Uruguay ($0) | limit=${LIMIT} | concurrency=${CONCURRENCY} | onlyUy=${ONLY_UY} | dryRun=${DRY_RUN}\n`);

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("Faltan variables NEXT_PUBLIC_FIREBASE_* en .env.local");
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  const email = process.env.ADMIN_EMAIL || "adminremate1@elremate.com";
  const password = process.env.ADMIN_PASSWORD || "pedidosremate";
  await signInWithEmailAndPassword(auth, email, password);
  console.log(`🔐 Sesión iniciada como ${email}`);

  const snap = await getDoc(doc(db, "catalogo_activo", "productos"));
  if (!snap.exists()) {
    throw new Error("No existe catalogo_activo/productos en Firestore.");
  }

  const itemsMap = snap.data()?.items || {};
  const allProducts = Object.values(itemsMap);
  let missing = allProducts.filter((p) => !p.imagen || String(p.imagen).trim() === "");

  if (ONLY_ACTIVE) {
    missing = missing.filter((p) => Number(p.precio || 0) > 0);
  } else {
    // Priorizar activos (precio > 0) primero
    missing.sort((a, b) => (Number(b.precio || 0) > 0 ? 1 : 0) - (Number(a.precio || 0) > 0 ? 1 : 0));
  }

  const batch = missing.slice(0, Number.isFinite(LIMIT) ? LIMIT : missing.length);
  console.log(`📦 Catálogo Firestore: ${allProducts.length} total | ${missing.length} sin imagen | Procesando: ${batch.length}\n`);

  if (batch.length === 0) {
    console.log("✨ Todos los productos ya tienen imagen.");
    process.exit(0);
  }

  let cursor = 0;
  let okCount = 0;
  let skipCount = 0;
  let totalBytesUploaded = 0;
  let pendingFirestoreUpdates = {};
  let pendingCount = 0;
  const updatedUrlsByCode = new Map();

  async function flushFirestore(force = false) {
    if (DRY_RUN) return;
    if (pendingCount === 0) return;
    if (!force && pendingCount < 20) return;

    const toWrite = pendingFirestoreUpdates;
    const count = pendingCount;
    pendingFirestoreUpdates = {};
    pendingCount = 0;

    try {
      await setDoc(doc(db, "catalogo_activo", "productos"), { items: toWrite }, { merge: true });
      console.log(`💾 [Firestore] Guardado lote de ${count} imágenes (Total OK: ${okCount}, Omitidos: ${skipCount})`);
    } catch (err) {
      console.error("❌ Error guardando lote en Firestore:", err.message);
      Object.assign(pendingFirestoreUpdates, toWrite);
      pendingCount += count;
    }
  }

  async function worker(workerId) {
    while (true) {
      const idx = cursor++;
      if (idx >= batch.length) break;
      const prod = batch[idx];

      try {
        const query = `${cleanProductQuery(prod.nombre)} uruguay`;
        const [off, bing] = await Promise.all([searchOFF(prod.codigo), searchBing(query)]);
        let candidates = [...(off ? [off] : []), ...bing].sort((a, b) => b.score - a.score);

        if (ONLY_UY) {
          candidates = candidates.filter((c) => c.confidence === "exact_ean" || c.confidence === "uruguay_store");
        }

        if (candidates.length === 0) {
          skipCount++;
          continue;
        }

        if (DRY_RUN) {
          okCount++;
          if (idx < 15) {
            console.log(`[DRY ${idx + 1}/${batch.length}] ${prod.nombre} -> ${candidates[0].confidence} (${candidates[0].domain})`);
          }
          continue;
        }

        let uploaded = false;
        for (const cand of candidates.slice(0, 3)) {
          const img = await downloadAndOptimize(cand);
          if (!img) continue;

          const fileName = `productos/${slugify(prod.nombre)}-${prod.codigo}.${img.ext}`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, new Uint8Array(img.buffer), {
            contentType: img.contentType,
            cacheControl: "public, max-age=31536000, immutable",
          });
          const downloadURL = await getDownloadURL(storageRef);

          pendingFirestoreUpdates[String(prod.codigo)] = { imagen: downloadURL };
          pendingCount++;
          updatedUrlsByCode.set(String(prod.codigo), downloadURL);
          totalBytesUploaded += img.buffer.length;
          okCount++;
          uploaded = true;

          if (okCount % 10 === 0 || okCount <= 5) {
            console.log(`[${idx + 1}/${batch.length}] ✅ ${prod.nombre.slice(0, 42)} (${Math.round(img.buffer.length / 1024)}KB · ${cand.domain})`);
          }
          break;
        }

        if (!uploaded) {
          skipCount++;
        }

        if (pendingCount >= 20) {
          await flushFirestore(false);
        }
      } catch (e) {
        skipCount++;
      }

      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));
  await flushFirestore(true);

  // Sincronizar también imágenes faltantes en catálogos por sucursal (1 write por sucursal)
  if (!DRY_RUN && updatedUrlsByCode.size > 0) {
    const branchIds = [
      "la-paz",
      "las-piedras-herrera",
      "18-de-mayo",
      "las-piedras-artigas",
      "canelones",
      "el-dorado",
    ];
    for (const branchId of branchIds) {
      try {
        const bRef = doc(db, "sucursales_catalogos", branchId);
        const bSnap = await getDoc(bRef);
        if (!bSnap.exists()) continue;
        const bItems = bSnap.data()?.items || {};
        const branchUpdates = {};
        let count = 0;
        for (const [code, prod] of Object.entries(bItems)) {
          if (prod && (!prod.imagen || String(prod.imagen).trim() === "")) {
            const newUrl = updatedUrlsByCode.get(code) || itemsMap[code]?.imagen;
            if (newUrl) {
              branchUpdates[code] = { imagen: newUrl };
              count++;
            }
          }
        }
        if (count > 0) {
          await setDoc(bRef, { items: branchUpdates }, { merge: true });
          console.log(`🏪 Sucursal ${branchId}: sincronizadas ${count} imágenes.`);
        }
      } catch (e) {
        console.warn(`⚠️ No se pudo sincronizar sucursal ${branchId}:`, e.message);
      }
    }
  }

  // Sincronizar también public/productos.json con TODAS las imágenes de Firestore
  if (!DRY_RUN && updatedUrlsByCode.size > 0) {
    try {
      const jsonPath = path.resolve(process.cwd(), "public", "productos.json");
      if (fs.existsSync(jsonPath)) {
        const localArr = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        let syncedJson = 0;
        const nextArr = localArr.map((p) => {
          const code = String(p.codigo);
          const url = updatedUrlsByCode.get(code) || itemsMap[code]?.imagen;
          if (url) {
            syncedJson++;
            return { ...p, imagen: url };
          }
          return p;
        });
        fs.writeFileSync(jsonPath, JSON.stringify(nextArr, null, 2), "utf8");
        console.log(`📄 public/productos.json actualizado (${syncedJson} productos con imagen).`);
      }
    } catch (e) {
      console.warn("⚠️ No se pudo actualizar public/productos.json:", e.message);
    }
  }

  const mb = (totalBytesUploaded / (1024 * 1024)).toFixed(2);
  console.log(`\n🏁 Finalizado: ${okCount} imágenes subidas (${mb} MB totales), ${skipCount} omitidos.\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err.message || err);
  process.exit(1);
});
