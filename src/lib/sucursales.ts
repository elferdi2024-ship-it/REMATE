// filepath: src/lib/sucursales.ts

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
}

export type MetodoEntrega = 'envio' | 'retiro';

export const SUCURSALES: Sucursal[] = [
  {
    id: 'la-paz',
    nombre: 'La Paz',
    direccion: 'Ramón Álvarez 225',
    telefono: '094 358 830',
  },
  {
    id: 'las-piedras-herrera',
    nombre: 'Las Piedras',
    direccion: 'Luis Alberto de Herrera 487',
    telefono: '092 202 019',
  },
  {
    id: '18-de-mayo',
    nombre: '18 de Mayo',
    direccion: 'Maestro Julio Castro 15',
    telefono: '094 713 033',
  },
  {
    id: 'las-piedras-artigas',
    nombre: 'Las Piedras',
    direccion: 'Avenida Artigas 750',
    telefono: '099 013 272',
  },
  {
    id: 'canelones',
    nombre: 'Canelones',
    direccion: 'General Artigas 118',
    telefono: '094 611 400',
  },
  {
    id: 'el-dorado',
    nombre: 'El Dorado',
    direccion: 'Elías Regules esq. Honduras',
    telefono: '093 404 158',
  },
];
