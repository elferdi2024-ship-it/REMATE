// filepath: src/components/carrito/DeliveryMethodSelector.tsx
'use client';

import React from 'react';
import { SUCURSALES, type Sucursal, type MetodoEntrega } from '@/lib/sucursales';
import { ZonaEnvio, COSTOS_ENVIO, UMBRAL_ENVIO_GRATIS } from '@/lib/envio-config';

interface DeliveryMethodSelectorProps {
  metodo: MetodoEntrega;
  onMetodoChange: (m: MetodoEntrega) => void;
  sucursalId: string | null;
  onSucursalChange: (id: string) => void;
  cartLength?: number;
  zonaEnvio?: ZonaEnvio;
  onZonaEnvioChange?: (zona: ZonaEnvio) => void;
  subtotal?: number;
}

export default function DeliveryMethodSelector({
  metodo,
  onMetodoChange,
  sucursalId,
  onSucursalChange,
  cartLength = 0,
  zonaEnvio = 'canelones',
  onZonaEnvioChange,
  subtotal = 0,
}: DeliveryMethodSelectorProps) {
  const selectedSucursal = SUCURSALES.find((s) => s.id === sucursalId) ?? null;
  const isFreeShipping = subtotal >= UMBRAL_ENVIO_GRATIS;

  const handleBranchChange = (newId: string) => {
    if (!newId || newId === sucursalId) return;
    if (cartLength > 0) {
      const confirmacion = window.confirm(
        "Al cambiar de sucursal los precios y disponibilidad varían por zona. ¿Deseas cambiar de sucursal?"
      );
      if (!confirmacion) return;
    }
    onSucursalChange(newId);
  };

  return (
    <div className="delivery-method-wrapper w-full flex flex-col gap-3">
      {/* ── Sucursal picker (siempre visible) ── */}
      <div className="branch-picker-compact">
        <label className="branch-picker-compact-label" htmlFor="branchSelect">
          📍 Sucursal de Referencia
        </label>
        <select
          id="branchSelect"
          className="branch-select"
          value={sucursalId || ''}
          onChange={(e) => handleBranchChange(e.target.value)}
        >
          <option value="" disabled>
            Elegí tu sucursal...
          </option>
          {SUCURSALES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} — {s.direccion}
            </option>
          ))}
        </select>
        {selectedSucursal && (
          <div className="branch-selected-compact">
            ✅ {selectedSucursal.nombre} · {selectedSucursal.direccion} · 📞 {selectedSucursal.telefono}
          </div>
        )}
      </div>

      {/* ── Toggle entrega ── */}
      <div className="w-full">
        <div className="delivery-method-label mb-1.5 text-xs font-bold text-slate-700">
          🚚 ¿Cómo recibís tu pedido?
        </div>
        <div className="flex items-stretch gap-2 w-full">
          <button
            type="button"
            className={`flex-1 min-w-0 delivery-toggle-btn ${metodo === 'envio' ? 'active' : ''}`}
            onClick={() => onMetodoChange('envio')}
          >
            <span className="delivery-toggle-icon">🏠</span>
            <span className="delivery-toggle-text min-w-0">
              <strong className="truncate">Envío a domicilio</strong>
              <small className="truncate">Te lo llevamos</small>
            </span>
          </button>

          <button
            type="button"
            className={`flex-1 min-w-0 delivery-toggle-btn ${metodo === 'retiro' ? 'active' : ''}`}
            onClick={() => onMetodoChange('retiro')}
          >
            <span className="delivery-toggle-icon">🏪</span>
            <span className="delivery-toggle-text min-w-0">
              <strong className="truncate">Retiro en local</strong>
              <small className="truncate">Sin costo</small>
            </span>
          </button>
        </div>
      </div>

      {/* ── Selector de Zona de Envío (solo visible para Envío a Domicilio) ── */}
      {metodo === 'envio' && onZonaEnvioChange && (
        <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl w-full">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            📍 Zona de Envío:
          </label>
          <div className="flex items-stretch gap-2 w-full">
            {(['canelones', 'otras'] as const).map((key) => {
              const isCanelones = key === 'canelones';
              const isSelected = isCanelones
                ? zonaEnvio === 'canelones'
                : (zonaEnvio === 'otras' || zonaEnvio === 'montevideo');
              const costoText = isCanelones
                ? (isFreeShipping ? '¡Gratis!' : `$${COSTOS_ENVIO.canelones.costo}`)
                : 'A consultar';

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onZonaEnvioChange(key)}
                  className={`flex-1 min-w-0 flex flex-col items-start p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                    isSelected
                      ? 'border-[#EF233C] bg-red-50/60 text-slate-900 shadow-2xs ring-1 ring-[#EF233C]/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-extrabold flex items-center gap-1 truncate w-full">
                    <span>{isCanelones ? '🏖️' : '📍'}</span>
                    <span className="truncate">{isCanelones ? 'Canelones' : 'Otras Zonas'}</span>
                  </span>
                  <span
                    className={`text-[11px] font-black mt-1 font-mono ${
                      isCanelones && isFreeShipping ? 'text-emerald-600' : 'text-[#EF233C]'
                    }`}
                  >
                    {costoText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Banner explicativo según zona */}
          {zonaEnvio === 'otras' || zonaEnvio === 'montevideo' ? (
            <div className="mt-2.5 rounded-xl bg-amber-50 border border-amber-200/80 p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
              <span className="text-sm shrink-0">💬</span>
              <span>
                <strong>Otras zonas:</strong> Coordinás y consultás el costo de envío directo por WhatsApp al enviar el pedido.
              </span>
            </div>
          ) : (
            <div className="mt-2.5 rounded-xl bg-slate-100/90 border border-slate-200/90 p-2.5 text-[11px] text-slate-700 flex items-start gap-2">
              <span className="text-sm shrink-0">🚚</span>
              <span>
                {isFreeShipping ? (
                  <strong className="text-emerald-700">¡Genial! Tu pedido supera los $2.500 y tiene envío bonificado ($0) en Canelones.</strong>
                ) : (
                  <span>Envíos en Canelones por <strong>$150</strong> (menores de $2.500). ¡Gratis a partir de $2.500!</span>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
