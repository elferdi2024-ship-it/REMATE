// filepath: src/components/catalogo/BranchBar.tsx
'use client';

import React from 'react';

interface BranchBarProps {
  sucursalName: string | null;
  onClick: () => void;
}

export default function BranchBar({ sucursalName, onClick }: BranchBarProps) {
  return (
    <button 
      type="button" 
      onClick={onClick}
      className={`relative z-10 w-full h-11 flex items-center justify-between px-4 transition-all duration-300 shadow-sm
        ${sucursalName 
          ? 'bg-gradient-to-r from-red-600 to-red-500 text-white' 
          : 'bg-zinc-800 text-zinc-100'}
      `}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-lg">🏪</span>
        <span suppressHydrationWarning className="text-[11px] sm:text-xs font-medium truncate tracking-wide">
          {sucursalName ? (
            <>Comprando en: <strong suppressHydrationWarning className="font-black ml-1">{sucursalName}</strong></>
          ) : (
            <>Seleccioná tu sucursal para ver precios</>
          )}
        </span>
      </div>
      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full shrink-0">
        {sucursalName ? 'Cambiar' : 'Elegir'}
      </span>
    </button>
  );
}
