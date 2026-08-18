// filepath: src/lib/pricing.ts
import type { BulkPriceTier } from "@/types";

export interface PricingResult {
  precioUnitario: number;
  precioBase: number;
  subtotal: number;
  ahorroTotal: number;
  tierAplicado: BulkPriceTier | null;
  siguienteTier: BulkPriceTier | null;
  faltanParaSiguiente: number;
}

/**
 * Calcula el precio unitario y subtotal según la escala de precios por volumen.
 * Admite múltiples niveles (ej: 8 u -> $236, 24 u -> $225).
 */
export function calcularPrecioConEscala(
  precioBase: number,
  cantidad: number,
  escalaPrecios?: BulkPriceTier[]
): PricingResult {
  const qty = Math.max(1, cantidad || 1);
  if (!escalaPrecios || escalaPrecios.length === 0) {
    return {
      precioUnitario: precioBase,
      precioBase,
      subtotal: precioBase * qty,
      ahorroTotal: 0,
      tierAplicado: null,
      siguienteTier: null,
      faltanParaSiguiente: 0,
    };
  }

  // Ordenar tiers de menor a mayor cantidad mínima
  const tiersOrdenados = [...escalaPrecios].sort((a, b) => a.minCantidad - b.minCantidad);

  // Buscar el tier más alto que califique con la cantidad actual
  let tierAplicado: BulkPriceTier | null = null;
  for (const tier of tiersOrdenados) {
    if (qty >= tier.minCantidad) {
      tierAplicado = tier;
    }
  }

  // Buscar el siguiente tier por alcanzar
  const siguienteTier = tiersOrdenados.find((t) => qty < t.minCantidad) || null;
  const faltanParaSiguiente = siguienteTier ? siguienteTier.minCantidad - qty : 0;

  const precioUnitario = tierAplicado ? tierAplicado.precioUnitario : precioBase;
  const subtotal = precioUnitario * qty;
  const subtotalSinDescuento = precioBase * qty;
  const ahorroTotal = Math.max(0, subtotalSinDescuento - subtotal);

  return {
    precioUnitario,
    precioBase,
    subtotal,
    ahorroTotal,
    tierAplicado,
    siguienteTier,
    faltanParaSiguiente,
  };
}
