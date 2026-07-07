// filepath: src/components/carrito/CartItem.tsx
'use client';

import { useState } from 'react';
import type { CartItem } from '@/types';
import { EMOJI_POR_CATEGORIA } from '@/types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (codigo: string, delta: number) => void;
  onRemove: (codigo: string) => void;
}

export default function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  const [showNote, setShowNote] = useState(false);
  const subtotal = item.precio * item.cantidad;
  const emoji = resolveEmoji(item);

  return (
    <div className="cart-item">
      <span className="cart-item-icon">{emoji}</span>
      <div className="cart-item-info">
        <div className="cart-item-name" title={item.nombre}>
          {item.nombre}
        </div>
        <div className="cart-item-price-qty">
          <span className="cart-item-unit-price">${item.precio.toLocaleString('es-UY')} c/u</span>
          <span className="cart-item-subtotal">${subtotal.toLocaleString('es-UY')}</span>
        </div>
      </div>
      <div className="cart-item-qty">
        <button
          className="qty-btn"
          onClick={() => {
            if (item.cantidad <= 1) {
              onRemove(item.codigo);
            } else {
              onUpdateQty(item.codigo, -1);
            }
          }}
          aria-label={item.cantidad <= 1 ? 'Eliminar producto' : 'Reducir cantidad'}
        >
          {item.cantidad <= 1 ? '🗑' : '−'}
        </button>
        <input
          type="number"
          className="qty-val"
          value={item.cantidad || ''}
          onChange={(e) => {
            if (e.target.value === '') {
              onUpdateQty(item.codigo, -item.cantidad);
              return;
            }
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 0) {
              if (val === 0) onRemove(item.codigo);
              else onUpdateQty(item.codigo, val - item.cantidad);
            }
          }}
          onFocus={(e) => e.target.select()}
        />
        <button
          className="qty-btn"
          onClick={() => onUpdateQty(item.codigo, 1)}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ── Resolución de emoji por categoría ── */
const KEYWORD_MAP: Record<string, string[]> = {
  'Aceites y Aderezos': ['aceite', 'aceituna', 'aderezo', 'mayonesa', 'ketchup', 'mostaza', 'barbacoa', 'vinagre', 'salsa'],
  'Bebidas': ['agua', 'jugo', 'gaseosa', 'cerveza', 'vino', 'refresco', 'bebida', 'sidra', 'fernet', 'whisky', 'sprite', 'pepsi', 'coca'],
  'Café, Té y Yerba': ['cafe', 'te ', 'yerba', 'bracafe', 'nescafe'],
  'Cereales y Granola': ['avena', 'copos', 'granola', 'cereal'],
  'Congelados': ['cong', 'mccain', 'boreal', 'nugget', 'espinaca', 'brocoli'],
  'Conservas de Pescado': ['atun', 'sardina', 'lomito', 'pescado', 'grated'],
  'Descartables y Embalaje': ['descart', 'tenedor', 'cuchara', 'vaso plast', 'bandeja', 'caja', 'bolsa'],
  'Especias y Condimentos': ['sal ', 'azucar', 'oregano', 'pimenton', 'adobo', 'ajo', 'caldo', 'condimento', 'harina '],
  'Fiambres y Carnes': ['jamon', 'mortadela', 'salchicha', 'pancho', 'chorizo', 'bondiola', 'morcilla', 'fiambre', 'carne', 'arrollado'],
  'Golosinas y Dulces': ['alfajor', 'caramelo', 'chocolate', 'gomita', 'chicle', 'dulce de membrillo', 'galleta rellena', 'fini', 'barrita'],
  'Harinas, Pastas y Legumbres': ['harina', 'faina', 'fideo', 'arroz', 'lenteja', 'garbanzo', 'almidon', 'pasta', 'polenta'],
  'Lácteos': ['leche', 'queso', 'yogur', 'crema de leche', 'manteca', 'ricota', 'dulce de leche', 'muzzarel', 'conaprole'],
  'Limpieza': ['jabon en polvo', 'jabon liquido', 'lavandina', 'desinfectante', 'limpiador', 'detergente', 'amoniaco'],
  'Mermeladas y Conservas Dulces': ['mermelada', 'anana en alm', 'membrillo', 'miel', 'dulce de fruta', 'conserva'],
  'Panadería': ['pan de molde', 'pan catalan', 'pan de viena', 'pan rallado', 'tostada'],
  'Papel e Higiene': ['papel higien', 'servilleta', 'toalla de cocina', 'rollo'],
  'Higiene Personal': ['jabon de manos', 'afeitar', 'desodorante', 'shampoo', 'pañal', 'toallita'],
};

function resolveEmoji(item: CartItem): string {
  const nombre = item.nombre.toLowerCase();
  for (const [cat, kws] of Object.entries(KEYWORD_MAP)) {
    if (kws.some((kw) => nombre.includes(kw))) {
      return EMOJI_POR_CATEGORIA[cat] || '📦';
    }
  }
  return '📦';
}
