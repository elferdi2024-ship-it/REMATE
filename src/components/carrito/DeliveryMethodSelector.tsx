// filepath: src/components/carrito/DeliveryMethodSelector.tsx
'use client';

import { SUCURSALES, type Sucursal, type MetodoEntrega } from '@/lib/sucursales';

interface DeliveryMethodSelectorProps {
  metodo: MetodoEntrega;
  onMetodoChange: (m: MetodoEntrega) => void;
  sucursalId: string | null;
  onSucursalChange: (id: string) => void;
}

export default function DeliveryMethodSelector({
  metodo,
  onMetodoChange,
  sucursalId,
  onSucursalChange,
}: DeliveryMethodSelectorProps) {
  const selectedSucursal = SUCURSALES.find((s) => s.id === sucursalId) ?? null;

  return (
    <div className="delivery-method-wrapper">
      {/* ── Sucursal picker (siempre visible) ── */}
      <div className="branch-picker-compact">
        <label className="branch-picker-compact-label" htmlFor="branchSelect">
          📍 Sucursal
        </label>
        <select
          id="branchSelect"
          className="branch-select"
          value={sucursalId || ''}
          onChange={(e) => onSucursalChange(e.target.value)}
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
            <small>Pasá a buscar</small>
          </span>
        </button>
      </div>
    </div>
  );
}
