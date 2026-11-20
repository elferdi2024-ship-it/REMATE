// filepath: src/lib/sucursales.ts

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  zona: string;
  horario: string;
  lat: number;
  lng: number;
}

export type MetodoEntrega = 'envio' | 'retiro';

export const SUCURSALES: Sucursal[] = [
  {
    id: 'la-paz',
    nombre: 'La Paz',
    direccion: 'Ramón Álvarez 225',
    telefono: '094 358 830',
    zona: 'La Paz · Canelones',
    horario: 'Lun a Sáb · 08:00 a 19:00 hs',
    lat: -34.7617,
    lng: -56.2236,
  },
  {
    id: 'las-piedras-herrera',
    nombre: 'Las Piedras (Herrera)',
    direccion: 'Luis Alberto de Herrera 487',
    telefono: '092 202 019',
    zona: 'Las Piedras Centro',
    horario: 'Lun a Sáb · 08:00 a 19:00 hs',
    lat: -34.7289,
    lng: -56.2194,
  },
  {
    id: '18-de-mayo',
    nombre: '18 de Mayo',
    direccion: 'Maestro Julio Castro 15',
    telefono: '094 713 033',
    zona: '18 de Mayo · Las Piedras',
    horario: 'Lun a Sáb · 08:00 a 19:00 hs',
    lat: -34.7025,
    lng: -56.2267,
  },
  {
    id: 'las-piedras-artigas',
    nombre: 'Las Piedras (Artigas)',
    direccion: 'Avenida Artigas 750',
    telefono: '099 013 272',
    zona: 'Las Piedras · Av. Artigas',
    horario: 'Lun a Sáb · 08:00 a 19:00 hs',
    lat: -34.7261,
    lng: -56.2231,
  },
  {
    id: 'canelones',
    nombre: 'Canelones',
    direccion: 'General Artigas 118',
    telefono: '094 611 400',
    zona: 'Canelones Ciudad',
    horario: 'Lun a Sáb · 08:00 a 19:00 hs',
    lat: -34.5228,
    lng: -56.2778,
  },
  {
    id: 'el-dorado',
    nombre: 'El Dorado',
    direccion: 'Elías Regules esq. Honduras',
    telefono: '093 404 158',
    zona: 'El Dorado · Las Piedras',
    horario: 'Lun a Sáb · 08:00 a 19:00 hs',
    lat: -34.7145,
    lng: -56.2080,
  },
];

/**
 * Calcula distancia aproximada en kilómetros usando fórmula de Haversine.
 */
export function calcularDistanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
