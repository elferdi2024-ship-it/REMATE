// filepath: src/components/carrito/CartFooter.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import type { MetodoEntrega } from '@/lib/sucursales';
import type { ZonaEnvio } from '@/lib/envio-config';

interface CartFooterProps {
  total: number;
  subtotal?: number;
  costoEnvio?: number;
  zonaEnvio?: ZonaEnvio;
  onZonaEnvioChange?: (zona: ZonaEnvio) => void;
  alias: string;
  onAliasChange: (alias: string) => void;
  onSendWA: () => void;
  onShare: () => void;
  onClear: () => void;
  shareLink: string | null;
  onCopyShareLink: () => void;
  telefono: string;
  onTelefonoChange: (tel: string) => void;
  clientNotes?: string;
  onClientNotesChange?: (notes: string) => void;
  direccion?: string;
  onDireccionChange?: (dir: string) => void;
  onSaveLista?: () => void;
  isProcessing?: boolean;
  metodoEntrega: MetodoEntrega;
  onMetodoEntregaChange: (m: MetodoEntrega) => void;
  sucursalId: string | null;
  onSucursalChange: (id: string) => void;
  isTiendaCerrada?: boolean;
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.507 3.932 1.395 5.608L0 24l6.538-1.373A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.923 0-3.728-.5-5.287-1.375l-.378-.225-3.88.816.824-3.787-.248-.39A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

export default function CartFooter({
  total,
  subtotal,
  costoEnvio = 0,
  zonaEnvio = 'canelones',
  onZonaEnvioChange,
  alias,
  onAliasChange,
  onSendWA,
  onShare,
  onClear,
  shareLink,
  onCopyShareLink,
  telefono,
  onTelefonoChange,
  clientNotes,
  onClientNotesChange,
  direccion,
  onDireccionChange,
  onSaveLista,
  isProcessing,
  metodoEntrega,
  onMetodoEntregaChange,
  sucursalId,
  onSucursalChange,
  isTiendaCerrada = false,
}: CartFooterProps) {
  const sub = subtotal ?? (total - costoEnvio);

  return (
    <div className="cart-checkout-form w-full flex flex-col gap-3 pb-2">
      <div className="cart-section-title text-sm font-extrabold text-slate-900">
        Completá tu pedido
      </div>

      {/* Selector de método de entrega + sucursal + zona de envío */}
      <DeliveryMethodSelector
        metodo={metodoEntrega}
        onMetodoChange={onMetodoEntregaChange}
        sucursalId={sucursalId}
        onSucursalChange={onSucursalChange}
        zonaEnvio={zonaEnvio}
        onZonaEnvioChange={onZonaEnvioChange}
        subtotal={sub}
      />

      {/* Banner informativo de método */}
      {metodoEntrega === 'retiro' ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-2.5 text-xs text-emerald-900 flex items-center gap-2">
          <span className="text-base shrink-0">🏪</span>
          <span>Retiro inmediato en el mostrador de la sucursal (sin costo de envío).</span>
        </div>
      ) : (
        <div className="rounded-xl bg-blue-50 border border-blue-200/80 p-2.5 text-xs text-blue-900 flex items-center gap-2">
          <span className="text-base shrink-0">🚚</span>
          <span>Coordinás día y hora exacta de entrega por WhatsApp al enviar el pedido.</span>
        </div>
      )}

      {/* Fila nombre + teléfono */}
      <div className="flex flex-col sm:flex-row gap-2.5 w-full">
        <div className="flex-1 min-w-0">
          <label className="field-label text-xs font-bold text-slate-700 block mb-1" htmlFor="clientName">
            👤 Nombre / Negocio <span className="text-[#EF233C]">*</span>
          </label>
          <input
            id="clientName"
            type="text"
            className="field-input w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#EF233C]"
            placeholder="Ej: Don Pepe"
            autoComplete="name"
            enterKeyHint="next"
            required
            value={alias}
            onChange={(e) => onAliasChange(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="field-label text-xs font-bold text-slate-700 block mb-1" htmlFor="clientTel">
            📱 Teléfono
          </label>
          <input
            id="clientTel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="field-input w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#EF233C]"
            placeholder="099..."
            value={telefono}
            onChange={(e) => onTelefonoChange(e.target.value)}
          />
        </div>
      </div>

      {/* Campo dirección — solo para envío a domicilio */}
      {metodoEntrega === 'envio' && onDireccionChange && (
        <div className="w-full">
          <label className="field-label text-xs font-bold text-slate-700 block mb-1" htmlFor="clientDir">
            📍 Dirección de entrega <span className="text-[#EF233C]">*</span>
          </label>
          <input
            id="clientDir"
            type="text"
            className="field-input w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#EF233C]"
            placeholder="Calle, Barrio, Ciudad..."
            autoComplete="street-address"
            required
            value={direccion || ''}
            onChange={(e) => onDireccionChange(e.target.value)}
          />
        </div>
      )}

      {/* Notas */}
      {onClientNotesChange && (
        <div className="w-full">
          <label className="field-label text-xs font-bold text-slate-700 block mb-1" htmlFor="clientNotes">
            📝 Notas (opcional)
          </label>
          <textarea
            id="clientNotes"
            className="field-input w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#EF233C]"
            placeholder="Horario preferido, instrucciones..."
            value={clientNotes || ''}
            onChange={(e) => onClientNotesChange(e.target.value)}
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </div>
      )}

      {/* Aviso Legal de Privacidad en el Formulario de la Tienda */}
      <div className="text-[11px] text-slate-500 text-center leading-normal mt-1">
        Al realizar el pedido, aceptás nuestra{' '}
        <Link
          href="/politica-de-privacidad"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#EF233C] underline font-bold"
        >
          Política de Privacidad
        </Link>.
      </div>

      {/* Fila de acciones: compartir + vaciar */}
      <div className="flex items-center gap-2 w-full mt-1">
        <button
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all active:scale-95 text-center cursor-pointer shadow-2xs"
          onClick={onShare}
          type="button"
        >
          🔗 Compartir
        </button>
        <button
          className="flex-1 py-2 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#EF233C] text-xs font-bold transition-all active:scale-95 text-center cursor-pointer shadow-2xs"
          onClick={onClear}
          type="button"
        >
          🗑️ Vaciar
        </button>
      </div>
    </div>
  );
}
