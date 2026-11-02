// filepath: src/components/seasonal/HalloweenOverlay.tsx
"use client";

interface HalloweenOverlayProps {
  /** Controlado en vivo desde Admin (config/tienda -> modoHalloween) */
  enabled?: boolean;
  /** Cantidad de productos en el carrito para sincronizar posición con el FAB */
  cartQty?: number;
}

/**
 * Capa visual de Halloween desactivada completamente.
 */
export default function HalloweenOverlay(_props?: HalloweenOverlayProps) {
  return null;
}
