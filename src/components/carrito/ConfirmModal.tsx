'use client';

import { CartItem } from '@/types';

interface ConfirmModalProps {
  isOpen: boolean;
  items: CartItem[];
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  items,
  total,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const visible = items.slice(0, 3);
  const remaining = items.length - 3;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="confirm-modal-header">
          <span className="confirm-modal-emoji">📋</span>
          <h2 className="confirm-modal-title">¿Todo bien?</h2>
        </div>

        {/* Summary */}
        <div className="confirm-modal-summary">
          <span className="confirm-modal-count">
            {items.length} producto{items.length !== 1 ? 's' : ''}
          </span>
          <span className="confirm-modal-total">
            ${total.toLocaleString('es-UY')}
          </span>
        </div>

        {/* Item list */}
        <ul className="confirm-modal-items">
          {visible.map((item) => (
            <li key={item.codigo} className="confirm-modal-item">
              <span className="confirm-modal-item-qty">{item.cantidad}x</span>
              <span className="confirm-modal-item-name">{item.nombre}</span>
              <span className="confirm-modal-item-subtotal">
                ${(item.precio * item.cantidad).toLocaleString('es-UY')}
              </span>
            </li>
          ))}
          {remaining > 0 && (
            <li className="confirm-modal-more">+ {remaining} más</li>
          )}
        </ul>

        {/* Actions */}
        <div className="confirm-modal-actions">
          <button className="btn-continue-shopping" onClick={onCancel}>
            ← Seguir comprando
          </button>
          <button className="btn-confirm-send" onClick={onConfirm}>
            ✓ Sí, enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
