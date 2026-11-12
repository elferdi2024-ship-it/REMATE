// filepath: src/lib/envio-config.ts

export type ZonaEnvio = 'canelones' | 'otras' | 'montevideo';

export const UMBRAL_ENVIO_GRATIS = 2500;
export const COSTO_ENVIO_CANELONES = 150;

export const COSTOS_ENVIO: Record<ZonaEnvio, { nombre: string; costo: number; aConsultar?: boolean }> = {
  canelones: {
    nombre: 'Canelones',
    costo: 150,
  },
  otras: {
    nombre: 'Otras Zonas',
    costo: 0,
    aConsultar: true,
  },
  montevideo: {
    nombre: 'Otras Zonas',
    costo: 0,
    aConsultar: true,
  },
};

export function calcularCostoEnvio(
  subtotal: number,
  metodo: 'envio' | 'retiro',
  zona: ZonaEnvio,
  umbralGratis: number = UMBRAL_ENVIO_GRATIS
): number {
  if (metodo === 'retiro') return 0;
  if (zona === 'otras' || zona === 'montevideo') return 0;
  const umbralEfectivo = Math.max(UMBRAL_ENVIO_GRATIS, Number(umbralGratis) || UMBRAL_ENVIO_GRATIS);
  if (subtotal >= umbralEfectivo) return 0;
  return COSTOS_ENVIO[zona]?.costo ?? COSTO_ENVIO_CANELONES;
}
