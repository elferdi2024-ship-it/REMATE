'use client';

import { CartItem } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { encodeCartToURL } from '@/lib/cart-share';
import { useEffect, useState } from 'react';

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
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [qrValue, setQrValue] = useState('');
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isOpen && items.length > 0) {
      try {
        const encoded = encodeCartToURL(items);
        if (encoded) {
          setQrValue(`${window.location.origin}/catalogo?cart=${encoded}`);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen, items]);

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

        {/* QR Code for quick scan */}
        {qrValue && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px', marginBottom: '16px', padding: '16px', background: 'var(--bg2)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Código de Pedido (Para el Vendedor)
            </span>
            <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <QRCodeSVG value={qrValue} size={100} level="M" />
            </div>
          </div>
        )}

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
