// filepath: src/lib/brands.ts
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import type { BrandConfig, BrandAsset, BrandTier } from "@/types/brands";

const FIRESTORE_DOC = "configuracion";
const FIRESTORE_KEY = "publicidad";

// ─── Default brands (seed data) ─────────────────────────────────────────────
export const DEFAULT_BRANDS: BrandConfig[] = [
  {
    id: "centenario",
    name: "Centenario",
    slug: "centenario",
    color: "#1B4332",
    categories: ["BEBIDAS ALCOHÓLICAS", "BEBIDAS SIN ALCOHOL"],
    tier: "oro",
    active: true,
    assets: [
      ...Array.from({ length: 32 }, (_, i) => ({
        id: `cen-img-${i + 1}`,
        type: "image" as const,
        src: `/marcas/centenario/images/centenario-${i + 1}.jpg`,
        alt: `Centenario producto ${i + 1}`,
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `cen-vid-${i + 1}`,
        type: "video" as const,
        src: `/marcas/centenario/videos/centenario-video-${i + 1}.mp4`,
        alt: `Centenario video ${i + 1}`,
      })),
    ],
  },
  {
    id: "cololo",
    name: "Cololo",
    slug: "cololo",
    color: "#B91C1C",
    categories: ["CONSERVAS Y ENLATADOS", "HARINAS, PASTAS Y CEREALES"],
    tier: "plata",
    active: true,
    assets: [
      // Images — actual filenames
      { id: "col-img-1", type: "image", src: "/marcas/cololo/images/cololo-arroz-1.jpg", alt: "Cololo Arroz 1" },
      { id: "col-img-2", type: "image", src: "/marcas/cololo/images/cololo-arroz-2.webp", alt: "Cololo Arroz 2" },
      { id: "col-img-3", type: "image", src: "/marcas/cololo/images/cololo-conservas-3.jpg", alt: "Cololo Conservas 3" },
      { id: "col-img-4", type: "image", src: "/marcas/cololo/images/cololo-conservas-4.jpg", alt: "Cololo Conservas 4" },
      { id: "col-img-5", type: "image", src: "/marcas/cololo/images/cololo-conservas-5.jpg", alt: "Cololo Conservas 5" },
      { id: "col-img-6", type: "image", src: "/marcas/cololo/images/cololo-conservas-6.jpg", alt: "Cololo Conservas 6" },
      { id: "col-img-7", type: "image", src: "/marcas/cololo/images/cololo-enlatados-7.jpg", alt: "Cololo Enlatados 7" },
      { id: "col-img-8", type: "image", src: "/marcas/cololo/images/cololo-enlatados-8.jpg", alt: "Cololo Enlatados 8" },
      { id: "col-img-9", type: "image", src: "/marcas/cololo/images/cololo-enlatados-9.jpg", alt: "Cololo Enlatados 9" },
      { id: "col-img-10", type: "image", src: "/marcas/cololo/images/cololo-enlatados-10.jpg", alt: "Cololo Enlatados 10" },
      { id: "col-img-11", type: "image", src: "/marcas/cololo/images/cololo-enlatados-11.jpg", alt: "Cololo Enlatados 11" },
      { id: "col-img-12", type: "image", src: "/marcas/cololo/images/cololo-pastas-fideos-12.jpg", alt: "Cololo Pastas 12" },
      { id: "col-img-13", type: "image", src: "/marcas/cololo/images/cololo-pastas-fideos-13.jpg", alt: "Cololo Pastas 13" },
      { id: "col-img-14", type: "image", src: "/marcas/cololo/images/cololo-pastas-fideos-14.jpg", alt: "Cololo Pastas 14" },
      { id: "col-img-15", type: "image", src: "/marcas/cololo/images/cololo-pastas-fideos-15.jpg", alt: "Cololo Pastas 15" },
      // Videos
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `col-vid-${i + 1}`,
        type: "video" as const,
        src: `/marcas/cololo/videos/cololo-video-${i + 1}.mp4`,
        alt: `Cololo video ${i + 1}`,
      })),
    ],
  },
  {
    id: "dona-coca",
    name: "Doña Coca",
    slug: "dona-coca",
    color: "#DC2626",
    logo: "/marcas/dona-coca/logo.png",
    categories: ["CARNES Y EMBUTIDOS", "CONGELADOS"],
    tier: "plata",
    active: true,
    assets: [
      ...Array.from({ length: 12 }, (_, i) => ({
        id: `dc-img-${i + 1}`,
        type: "image" as const,
        src: `/marcas/dona-coca/images/dona-coca-embutidos-${i + 1}.jpg`,
        alt: `Doña Coca embutidos ${i + 1}`,
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `dc-vid-${i + 1}`,
        type: "video" as const,
        src: `/marcas/dona-coca/videos/dona-coca-video-${i + 1}.mp4`,
        alt: `Doña Coca video ${i + 1}`,
      })),
    ],
  },
];

// ─── Firebase CRUD ──────────────────────────────────────────────────────────

/** Load brands from Firestore, fallback to defaults */
export async function loadBrands(): Promise<BrandConfig[]> {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_DOC, FIRESTORE_KEY));
    if (snap.exists()) {
      const data = snap.data();
      const brands = data.brands as BrandConfig[] | undefined;
      if (brands && brands.length > 0) {
        return brands;
      }
    }
  } catch (e) {
    console.warn("⚠️ Error loading brands from Firestore, using defaults:", e);
  }
  return DEFAULT_BRANDS;
}

/** Save brands to Firestore */
export async function saveBrands(brands: BrandConfig[]): Promise<void> {
  await setDoc(
    doc(db, FIRESTORE_DOC, FIRESTORE_KEY),
    { brands, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

/** Upload a brand asset (image/video) to Firebase Storage */
export async function uploadBrandAsset(
  brandSlug: string,
  file: File,
  type: "image" | "video",
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext = file.name.split(".").pop() || (type === "video" ? "mp4" : "jpg");
  const fileName = `${brandSlug}-${Date.now()}.${ext}`;
  const path = `marcas/${brandSlug}/${type === "video" ? "videos" : "images"}/${fileName}`;
  const storageRef = ref(storage, path);
  
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

// ─── Selection Logic (weighted by tier) ─────────────────────────────────────

const TIER_WEIGHT_VALUES: Record<BrandTier, number> = {
  bronce: 1,
  plata: 2,
  oro: 3,
};

/** Get active brands sorted by tier weight (highest first) */
export function getActiveBrands(brands: BrandConfig[]): BrandConfig[] {
  const now = new Date();
  return brands
    .filter((b) => {
      if (!b.active || b.assets.length === 0) return false;
      // Verificar fecha de inicio
      if (b.startAt && new Date(b.startAt) > now) return false;
      // Verificar fecha de vencimiento
      if (b.expiresAt && new Date(b.expiresAt) < now) return false;
      return true;
    })
    .sort((a, b) => TIER_WEIGHT_VALUES[b.tier] - TIER_WEIGHT_VALUES[a.tier]);
}

/** Get a brand that matches a specific category (exact or partial) */
export function getBrandForCategory(
  brands: BrandConfig[], 
  category: string
): BrandConfig | null {
  const active = getActiveBrands(brands);
  const catNormalized = category.toUpperCase().trim();
  
  // 1. Primero: match exacto (ya existía)
  const exact = active.find((b) =>
    b.categories.some((c) => c.toUpperCase().trim() === catNormalized)
  );
  if (exact) return exact;
  
  // 2. Match parcial: si alguna palabra clave de la categoría del brand 
  //    aparece en la categoría del producto
  const partial = active.find((b) =>
    b.categories.some((c) => {
      const keywords = c.toUpperCase().split(/[\s,&]+/).filter(w => w.length > 4);
      return keywords.some(kw => catNormalized.includes(kw));
    })
  );
  return partial || null;
}

/** Get a deterministic image asset from a brand based on an index */
export function getImageAtIndex(brand: BrandConfig, index: number): BrandAsset | null {
  const images = brand.assets.filter((a) => a.type === "image");
  if (images.length === 0) return null;
  return images[index % images.length];
}

/** Get a deterministic video asset from a brand based on an index */
export function getVideoAtIndex(brand: BrandConfig, index: number): BrandAsset | null {
  const videos = brand.assets.filter((a) => a.type === "video");
  if (videos.length === 0) return null;
  return videos[index % videos.length];
}

/**
 * Build a deterministic ad sequence for a list of category indices.
 * Uses Fisher-Yates shuffle for better distribution instead of round-robin.
 */
export function buildAdSequence(brands: BrandConfig[], slots: number): BrandConfig[] {
  const active = getActiveBrands(brands);
  if (active.length === 0) return [];

  // Build weighted pool
  const pool: BrandConfig[] = [];
  for (const brand of active) {
    const weight = TIER_WEIGHT_VALUES[brand.tier];
    for (let i = 0; i < weight; i++) pool.push(brand);
  }

  // Fisher-Yates shuffle — distributivo en lugar de secuencial
  function shuffle(arr: BrandConfig[]): BrandConfig[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const sequence: BrandConfig[] = [];
  while (sequence.length < slots) {
    sequence.push(...shuffle(pool));
  }
  return sequence.slice(0, slots);
}

/**
 * Build ad sequence with minimum distance between same brand.
 */
export function buildAdSequenceWithCooldown(
  brands: BrandConfig[], 
  slots: number,
  cooldown = 2
): BrandConfig[] {
  const sequence = buildAdSequence(brands, slots * 2); // generar extra
  const result: BrandConfig[] = [];
  const recent: string[] = []; // últimos N brand ids

  for (const brand of sequence) {
    if (result.length >= slots) break;
    
    // Si el brand apareció recientemente, saltear
    if (recent.slice(-cooldown).includes(brand.id)) continue;
    
    result.push(brand);
    recent.push(brand.id);
  }

  // Fallback if we didn't get enough (e.g., too few brands)
  if (result.length < slots) {
      const remaining = buildAdSequence(brands, slots - result.length);
      result.push(...remaining);
  }

  return result;
}
