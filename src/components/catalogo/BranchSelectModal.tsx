// filepath: src/components/catalogo/BranchSelectModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { SUCURSALES } from '@/lib/sucursales';
import * as ls from '@/lib/ls';
import { useCart } from '@/lib/cart-context';

interface BranchSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSucursalId: string | null;
  onSelect: (id: string) => void;
}

export default function BranchSelectModal({
  isOpen,
  onClose,
  currentSucursalId,
  onSelect,
}: BranchSelectModalProps) {
  const { items: cartItems, clearCart } = useCart();
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isRendered) return null;

  const handleSelect = (id: string) => {
    // Si elige la misma sucursal, solo cerramos
    if (id === currentSucursalId) {
      onClose();
      return;
    }

    if (cartItems.length > 0) {
      const confirmacion = window.confirm(
        'Al cambiar de sucursal se vaciará tu carrito actual porque los precios y stock varían por zona. ¿Querés cambiar de sucursal?'
      );
      if (!confirmacion) return;
      clearCart();
    }

    ls.setSelectedSucursal(id);
    onSelect(id);
    onClose();
  };

  return (
    <div className={`branch-modal-overlay ${isAnimating ? 'open' : ''}`} onClick={onClose}>
      <div
        className={`branch-modal-box ${isAnimating ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="branch-modal-header">
          <h2 className="branch-modal-title">🏪 Elegí tu sucursal</h2>
          <button className="branch-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="branch-modal-body">
          <p className="branch-modal-desc">
            Para ver precios, ofertas y disponibilidad real en tu zona.
          </p>
          <div className="branch-modal-list">
            {SUCURSALES.map((sucursal) => {
              const isActive = sucursal.id === currentSucursalId;
              return (
                <button
                  key={sucursal.id}
                  className={`branch-modal-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelect(sucursal.id)}
                >
                  <div className="branch-modal-card-icon">
                    {isActive ? '✅' : '📍'}
                  </div>
                  <div className="branch-modal-card-info">
                    <strong>{sucursal.nombre}</strong>
                    <span>{sucursal.direccion}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
