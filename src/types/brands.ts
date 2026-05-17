// filepath: src/types/brands.ts

/** Nivel de prioridad de publicidad */
export type BrandTier = "bronce" | "plata" | "oro";

/** Asset individual de una marca */
export interface BrandAsset {
  id: string;
  type: "image" | "video" | "sponsored_product";
  src: string;
  alt: string;
  /** Categoría de producto asociada (para matching contextual) */
  category?: string;
  /** Solo para sponsored_product: código del producto en el catálogo */
  productCodigo?: string;
  /** Solo para sponsored_product: nombre visible */
  productName?: string;
  /** Solo para sponsored_product: precio a mostrar */
  productPrice?: number;
}

/** Configuración de una marca patrocinante */
export interface BrandConfig {
  id: string;
  name: string;
  slug: string;
  /** Color accent de la marca (hex) */
  color: string;
  /** URL del logo (Firebase Storage) */
  logo?: string;
  /** Categorías del catálogo que matchean con esta marca */
  categories: string[];
  /** Nivel de prioridad */
  tier: BrandTier;
  /** Activa o pausada */
  active: boolean;
  /** Assets publicitarios */
  assets: BrandAsset[];
  /** Timestamp de creación */
  createdAt?: string;
  /** Timestamp de última modificación */
  updatedAt?: string;
  /** Fecha de inicio de la campaña (ISO string). Opcional. */
  startAt?: string;
  /** Fecha de vencimiento de la campaña (ISO string). Si está en el pasado, la marca se desactiva automáticamente */
  expiresAt?: string;
  /** Número máximo de impresiones para esta campaña. null = sin límite. */
  impressionCap?: number | null;
  
  // --- V4 Nuevos Campos ---
  
  /** Titular del ad (ej: "Whisky Black Label") */
  headline?: string;
  /** Subtítulo (ej: "Para los que saben lo que quieren") */
  tagline?: string;
  /** URL logo cuadrado, para banners y badges */
  logoUrl?: string;
  /** ID de producto destacado para SponsoredProduct format */
  featuredProductId?: string;
  /** ["BEBIDAS", "LICORES"] - Categorías que esta marca patrocina */
  sponsoredCategories?: string[];
  /** Historia de marca para NativeStoryCard */
  story?: {
    title: string;
    body: string;
    imageUrl: string;
  };
  /** Oferta flash de la marca */
  flashDeal?: {
    productId: string;
    discount: number;
    expiresAt: string;
    description: string;
  };

  // --- V5 Banner Personalizable ---

  /** Chips/tags que aparecen en el SponsoredBanner (ej: "Precio mayorista", "Stock activo") */
  chips?: string[];
  /** Texto del badge superior del banner (ej: "PROMO ACTIVA HOY") */
  badgeText?: string;
  /** Texto CTA variante A del A/B test */
  ctaTextA?: string;
  /** Texto CTA variante B del A/B test */
  ctaTextB?: string;
}

/** Peso de frecuencia por tier */
export const TIER_WEIGHTS: Record<BrandTier, number> = {
  bronce: 1,
  plata: 2,
  oro: 3,
};

/** Colores UI por tier */
export const TIER_COLORS: Record<BrandTier, { bg: string; text: string; border: string }> = {
  bronce: { bg: "rgba(205,127,50,0.15)", text: "#CD7F32", border: "rgba(205,127,50,0.3)" },
  plata: { bg: "rgba(192,192,192,0.15)", text: "#C0C0C0", border: "rgba(192,192,192,0.3)" },
  oro: { bg: "rgba(255,215,0,0.15)", text: "#FFD700", border: "rgba(255,215,0,0.3)" },
};
