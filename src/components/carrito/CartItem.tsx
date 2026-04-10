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
        <div className="cart-item-subtotal">
          ${subtotal.toLocaleString('es-UY')}
        </div>
        <button
          className="cart-note-toggle"
          onClick={() => setShowNote(!showNote)}
        >
          {showNote ? '▲' : '▼'} Nota
        </button>
        {showNote && (
          <input
            type="text"
            className="field-input cart-note-input"
            placeholder="Ej: sin golpes, entrega en depósito..."
          />
        )}
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
          aria-label="Reducir cantidad"
        >
          −
        </button>
        <span className="qty-val">{item.cantidad}</span>
        <button
          className="qty-btn"
          onClick={() => onUpdateQty(item.codigo, 1)}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      <button
        className="cart-item-remove"
        onClick={() => onRemove(item.codigo)}
        aria-label="Eliminar producto"
      >
        ✕
      </button>
    </div>
  );
}

/* ── Emoji resolution ── */
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
