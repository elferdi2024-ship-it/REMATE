// filepath: src/components/catalogo/BranchBar.tsx
'use client';

import React from 'react';

interface BranchBarProps {
  sucursalName: string | null;
  onClick: () => void;
}

export default function BranchBar({ sucursalName, onClick }: BranchBarProps) {
  return (
    <button type="button" className="branch-bar-sticky" onClick={onClick}>
      <div className="branch-bar-content">
        <span className="branch-bar-icon">🏪</span>
        <span className="branch-bar-text">
          {sucursalName ? (
            <>Estás comprando en: <strong>{sucursalName}</strong></>
          ) : (
            <>Seleccioná tu sucursal para ver stock y precios</>
          )}
        </span>
      </div>
      <span className="branch-bar-action">{sucursalName ? 'Cambiar' : 'Elegir'}</span>
    </button>
  );
}
