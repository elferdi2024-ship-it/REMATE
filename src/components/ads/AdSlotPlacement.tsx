"use client";

import { useMemo } from "react";
import { useBrands } from "@/hooks/useBrands";
import { getActiveBrands, getBrandForCategory, getImageAtIndex } from "@/lib/brands";
import SponsoredBanner from "./SponsoredBanner";
import BrandSpotlight from "./BrandSpotlight";
import SponsoredProduct from "./SponsoredProduct";

type AdSlot =
  | "hero"
  | "results"
  | "empty-search"
  | "cart-upsell";

interface AdSlotPlacementProps {
  slot: AdSlot;
  category?: string;
}

const TIER_SLOT_RULES: Record<string, AdSlot[]> = {
  oro: ["hero", "results", "empty-search", "cart-upsell"],
  plata: ["results", "empty-search", "cart-upsell"],
  bronce: ["results", "empty-search"],
};

export default function AdSlotPlacement({ slot, category }: AdSlotPlacementProps) {
  const { brands } = useBrands();

  const brand = useMemo(() => {
    const active = getActiveBrands(brands).filter((b) => {
      const allowed = TIER_SLOT_RULES[b.tier] || [];
      return allowed.includes(slot);
    });
    if (active.length === 0) return null;
    if (category) {
      return getBrandForCategory(active, category) || active[0];
    }
    return active[0];
  }, [brands, category, slot]);

  const imageAsset = useMemo(() => {
    if (!brand) return null;
    return getImageAtIndex(brand, slot.length);
  }, [brand, slot]);

  const sponsoredAsset = useMemo(() => {
    if (!brand) return null;
    return brand.assets.find((a) => a.type === "sponsored_product") || null;
  }, [brand]);

  if (!brand) return null;

  if (slot === "cart-upsell" && sponsoredAsset) {
    return (
      <div style={{ margin: "8px 16px 14px" }}>
        <SponsoredProduct brand={brand} asset={sponsoredAsset} />
      </div>
    );
  }

  if (!imageAsset) return null;

  if (slot === "empty-search") {
    return (
      <div style={{ marginTop: "10px" }}>
        <BrandSpotlight brand={brand} asset={imageAsset} layout="card" />
      </div>
    );
  }

  if (slot === "results") {
    return (
      <div style={{ marginTop: "10px" }}>
        <SponsoredBanner brand={brand} asset={imageAsset} variant="compact" slot={slot} />
      </div>
    );
  }

  return <SponsoredBanner brand={brand} asset={imageAsset} variant="full" slot={slot} />;
}
