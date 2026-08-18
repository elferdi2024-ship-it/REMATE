// filepath: src/components/carrito/CartItem.tsx
'use client';

import { useState } from 'react';
import type { CartItem } from '@/types';
import { EMOJI_POR_CATEGORIA } from '@/types';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import ProductSubstitutionSelector from './ProductSubstitutionSelector';

import { calcularPrecioConEscala } from '@/lib/pricing';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (codigo: string, delta: number) => void;
  onRemove: (codigo: string) => void;
}

export default function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  const [showNote, setShowNote] = useState(false);
  const emoji = resolveEmoji(item);
  const controls = useAnimation();

  const precioBase = item.precioBase ?? item.precio;
  const pricing = calcularPrecioConEscala(precioBase, item.cantidad, item.escalaPrecios);
  const subtotal = pricing.subtotal;

  // B2B Growth Hacker: Upsell a Bulto Cerrado
  let upsellBulto = 0;
  if (item.cantidad >= 3 && item.cantidad <= 5) upsellBulto = 6;
  if (item.cantidad >= 9 && item.cantidad <= 11) upsellBulto = 12;
  const missingForBulto = upsellBulto > 0 ? upsellBulto - item.cantidad : 0;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = -80; // pixels to trigger delete
    if (info.offset.x < threshold) {
      controls.start({ x: -window.innerWidth, opacity: 0, transition: { duration: 0.2 } }).then(() => {
        onRemove(item.codigo);
      });
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  return (
    <div className="relative w-full overflow-hidden mb-2 rounded-xl bg-red-100">
      {/* Background Delete Action */}
      <div className="absolute inset-0 flex items-center justify-end px-6 bg-red-500 text-white font-bold rounded-xl">
        <span>🗑️ Eliminar</span>
      </div>

      {/* Draggable Row */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0 }} // Solo permite estirar hacia la izquierda
        onDragEnd={handleDragEnd}
        animate={controls}
        className="cart-item relative z-10 bg-white border-none shadow-sm touch-pan-y touch-pinch-zoom"
      >
        <span className="cart-item-icon">{emoji}</span>
        <div className="cart-item-info">
          <div className="cart-item-name" title={item.nombre}>
            {item.nombre}
          </div>
          <div className="cart-item-price-qty">
            {pricing.tierAplicado ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 line-through">${precioBase.toLocaleString('es-UY')}</span>
                <span className="cart-item-unit-price text-emerald-700 font-extrabold">${pricing.precioUnitario.toLocaleString('es-UY')} c/u</span>
              </div>
            ) : (
              <span className="cart-item-unit-price">${pricing.precioUnitario.toLocaleString('es-UY')} c/u</span>
            )}
            <span className="cart-item-subtotal">${subtotal.toLocaleString('es-UY')}</span>
          </div>

          {/* Badge de Ahorro por Escala Aplicada */}
          {pricing.tierAplicado && pricing.ahorroTotal > 0 && (
            <div className="mt-1 inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
              <span>✨</span> {pricing.tierAplicado.etiqueta || 'Precio Mayorista'} (Ahorrás ${pricing.ahorroTotal.toLocaleString('es-UY')})
            </div>
          )}

          {/* Prompt para alcanzar siguiente escala por volumen */}
          {pricing.siguienteTier && (
            <button
              type="button"
              onClick={() => onUpdateQty(item.codigo, pricing.faltanParaSiguiente)}
              className="mt-1.5 flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-md w-fit transition-colors border border-amber-200"
            >
              <span>📦</span> Sumá {pricing.faltanParaSiguiente} más y pagá ${pricing.siguienteTier.precioUnitario} c/u ({pricing.siguienteTier.etiqueta || 'Precio Caja'})
            </button>
          )}

          {!pricing.siguienteTier && upsellBulto > 0 && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onClick={() => {
                onUpdateQty(item.codigo, missingForBulto);
                if (window.navigator && window.navigator.vibrate) {
                  window.navigator.vibrate([20, 30, 20]);
                }
              }}
              className="mt-1.5 flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md w-fit hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <span>📦</span> Completar bulto ({upsellBulto})
            </motion.button>
          )}

          {/* Selector de Sustitución de Faltantes (Instacart Standard) */}
          <ProductSubstitutionSelector
            itemCodigo={item.codigo}
            itemNombre={item.nombre}
            onChange={(code, policy, note) => {
              item.substitucion = policy;
              item.notaSubstitucion = note;
            }}
          />
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
            className="qty-val bg-transparent text-center"
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
      </motion.div>
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
