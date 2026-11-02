// filepath: src/components/seasonal/HalloweenPromosSection.tsx
"use client";

import type { Producto } from "@/types";

interface HalloweenPromosSectionProps {
  enabled?: boolean;
  qtyMap?: Record<string, number>;
  onAddPromo?: (producto: Producto, e?: React.MouseEvent) => void;
  onQtyChange?: (codigo: string, qty: number) => void;
  onSelectPromo?: (producto: Producto) => void;
}

/**
 * Sección de ofertas de Halloween desactivada completamente.
 */
export default function HalloweenPromosSection(_props?: HalloweenPromosSectionProps) {
  return null;
}
