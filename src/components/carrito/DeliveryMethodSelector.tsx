// filepath: src/components/carrito/DeliveryMethodSelector.tsx
'use client';

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
    <div className="delivery-method-wrapper">
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
      <div className="delivery-method-label">🚚 ¿Cómo recibís tu pedido?</div>
      <div className="delivery-toggle-row">
        <button
          type="button"
          className={`delivery-toggle-btn ${metodo === 'envio' ? 'active' : ''}`}
          onClick={() => onMetodoChange('envio')}
        >
          <span className="delivery-toggle-icon">🏠</span>
          <span className="delivery-toggle-text">
            <strong>Envío a domicilio</strong>
            <small>Te lo llevamos</small>
          </span>
        </button>

        <button
          type="button"
          className={`delivery-toggle-btn ${metodo === 'retiro' ? 'active' : ''}`}
          onClick={() => onMetodoChange('retiro')}
        >
          <span className="delivery-toggle-icon">🏪</span>
          <span className="delivery-toggle-text">
            <strong>Retiro en local</strong>
            <small>Sin costo</small>
          </span>
        </button>
      </div>

      {/* ── Selector de Zona de Envío (solo visible para Envío a Domicilio) ── */}
      {metodo === 'envio' && onZonaEnvioChange && (
        <div className="mt-3 p-3 bg-stone-50 border border-stone-200/80 rounded-2xl">
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            📍 Zona de Envío:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(COSTOS_ENVIO) as ZonaEnvio[]).map((key) => {
              const zona = COSTOS_ENVIO[key];
              const isSelected = zonaEnvio === key;
              const costoText = isFreeShipping ? '¡Gratis!' : `$${zona.costo}`;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onZonaEnvioChange(key)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#E8302A] bg-red-50/40 text-stone-900 shadow-sm'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span className="text-xs font-black flex items-center gap-1">
                    {key === 'canelones' ? '🏖️' : '🏙️'} {zona.nombre}
                  </span>
                  <span className={`text-[11px] font-extrabold mt-0.5 ${isFreeShipping ? 'text-emerald-600' : 'text-[#E8302A]'}`}>
                    {costoText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
