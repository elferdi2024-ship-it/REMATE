// filepath: scripts/corregir-categorias-y-banners.mjs
/**
 * Corrige categorías mal asignadas en Firestore (catalogo_activo + 6 sucursales)
 * usando las reglas estrictas de src/lib/category-normalizer.ts, y reemplaza
 * fotos promocionales tipo banner (ej. COCA COLA 473 2x$90) por fotos limpias del producto.
 */
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { normalizeProductCategory } from "../src/lib/category-normalizer.ts";
import { findProductImages } from "../src/lib/product-image-finder.ts";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const env = {};
for (const l of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const i = l.indexOf("=");
  if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const auth = getAuth(app);
await signInWithEmailAndPassword(auth, "adminremate1@elremate.com", "pedidosremate");
const db = getFirestore(app);
const storage = getStorage(app);

function compressToWebp(buf) {
  const pyCode = [
    "import sys, io",
    "from PIL import Image",
    "im = Image.open(io.BytesIO(sys.stdin.buffer.read()))",
    "if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGBA')",
    "im.thumbnail((700, 700), Image.Resampling.LANCZOS)",
    "out = io.BytesIO()",
    "im.save(out, format='WEBP', quality=82, method=4)",
    "sys.stdout.buffer.write(out.getvalue())",
  ].join("; ");
  const py = spawnSync("python", ["-c", pyCode], { input: buf, maxBuffer: 10 * 1024 * 1024 });
  return py.status === 0 && py.stdout.length > 500 ? py.stdout : buf;
}

const masterRef = doc(db, "catalogo_activo", "productos");
const mSnap = await getDoc(masterRef);
const mItems = mSnap.data()?.items || {};

let catFixed = 0;
const masterUpdates = {};
const replacedImages = new Map();

for (const [code, prod] of Object.entries(mItems)) {
  if (!prod || !prod.nombre) continue;

  const fixedCat = normalizeProductCategory(prod);
  if (fixedCat !== prod.categoria) {
    masterUpdates[code] = { ...(masterUpdates[code] || {}), categoria: fixedCat };
    catFixed++;
  }

  // Reemplazar foto de COCA COLA 473 (tenía banner promocional 2x$90)
  if (/COCA\s+COLA\s+473/i.test(prod.nombre)) {
    const found = await findProductImages({
      codigo: code,
      nombre: "COCA COLA LATA 473ML",
      customQuery: "coca cola lata 473ml original",
    });
    for (const c of found.candidates.slice(0, 5)) {
      try {
        const res = await fetch(c.url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(7000),
        });
        if (!res.ok) continue;
        const ct = (res.headers.get("content-type") || "").split(";")[0].trim();
        if (!ct.startsWith("image/")) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        const finalBuf = compressToWebp(buf);
        const sRef = ref(storage, `productos/coca-cola-473-${code}.webp`);
        await uploadBytes(sRef, new Uint8Array(finalBuf), {
          contentType: "image/webp",
          cacheControl: "public, max-age=31536000, immutable",
        });
        const newUrl = await getDownloadURL(sRef);
        masterUpdates[code] = { ...(masterUpdates[code] || {}), imagen: newUrl };
        replacedImages.set(code, newUrl);
        console.log(`✅ Nueva foto limpia COCA COLA 473 (${code}): ${c.domain}`);
        break;
      } catch {
        // try next
      }
    }
  }
}

if (Object.keys(masterUpdates).length > 0) {
  await setDoc(masterRef, { items: masterUpdates }, { merge: true });
  console.log(`💾 Master actualizado: ${catFixed} categorías corregidas, ${replacedImages.size} fotos reemplazadas.`);
}

const branches = [
  "la-paz",
  "las-piedras-herrera",
  "18-de-mayo",
  "las-piedras-artigas",
  "canelones",
  "el-dorado",
];
for (const b of branches) {
  const bRef = doc(db, "sucursales_catalogos", b);
  const bSnap = await getDoc(bRef);
  if (!bSnap.exists()) continue;
  const bItems = bSnap.data()?.items || {};
  const bUpd = {};
  let bCount = 0;
  for (const [code, prod] of Object.entries(bItems)) {
    if (!prod || !prod.nombre) continue;
    const fixedCat = normalizeProductCategory(prod);
    if (fixedCat !== prod.categoria) {
      bUpd[code] = { ...(bUpd[code] || {}), categoria: fixedCat };
      bCount++;
    }
    if (replacedImages.has(code)) {
      bUpd[code] = { ...(bUpd[code] || {}), imagen: replacedImages.get(code) };
    }
  }
  if (Object.keys(bUpd).length > 0) {
    await setDoc(bRef, { items: bUpd }, { merge: true });
    console.log(`🏪 Sucursal ${b}: ${bCount} categorías corregidas + fotos sincronizadas.`);
  }
}

console.log("🏁 Corrección finalizada.");
process.exit(0);
