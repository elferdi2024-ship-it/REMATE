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
      <div className="delivery-method-label">🚚 ¿Cómo recibís tu pedido?</div>

      {/* ── Toggle buttons ── */}
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

      {/* ── Branch picker (only when retiro) ── */}
      {metodo === 'retiro' && (
        <div className="branch-picker-wrapper">
          <div className="branch-picker-label">📍 Elegí tu sucursal</div>

          <div className="branch-picker-grid">
            {SUCURSALES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`branch-card ${sucursalId === s.id ? 'selected' : ''}`}
                onClick={() => onSucursalChange(s.id)}
              >
                <span className="branch-card-name">{s.nombre}</span>
                <span className="branch-card-addr">{s.direccion}</span>
                <span className="branch-card-tel">📞 {s.telefono}</span>
              </button>
            ))}
          </div>

          {selectedSucursal && (
            <div className="branch-selected-badge">
              ✅ Retiro en <strong>{selectedSucursal.nombre}</strong> — {selectedSucursal.direccion}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
