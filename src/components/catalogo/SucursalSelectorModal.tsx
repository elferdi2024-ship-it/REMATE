// filepath: src/components/catalogo/SucursalSelectorModal.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SUCURSALES, Sucursal } from "@/lib/sucursales";

interface SucursalSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSucursal: (sucursalId: string) => void;
  selectedSucursal?: string;
  categoryName?: string;
}

export default function SucursalSelectorModal({
  isOpen,
  onClose,
  onSelectSucursal,
  selectedSucursal = "",
  categoryName,
}: SucursalSelectorModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredSucursales = SUCURSALES.filter(
    (s) =>
      s.nombre.toLowerCase().includes(search.toLowerCase()) ||
      s.direccion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#110D0A] border border-[#E8302A]/40 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Decorativo */}
        <div 
          className="absolute -top-24 -right-24 w-60 h-60 bg-[#E8302A]/20 rounded-full blur-3xl pointer-events-none"
        />
        <div 
          className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#FFB300]/15 rounded-full blur-3xl pointer-events-none"
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8302A]/15 border border-[#E8302A]/40 text-[#FF4D47] text-[10px] md:text-xs font-bold tracking-[2px] uppercase rounded-full mb-2">
              🏪 SELECCIÓN DE CATÁLOGO
            </span>
            <h2 className="font-bebas text-2xl md:text-4xl text-white tracking-wider leading-none">
              ELEGÍ TU <span className="text-[#E8302A]">SUCURSAL</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1 font-medium">
              {categoryName ? (
                <>Para ver los productos de <strong className="text-white">{categoryName}</strong>, seleccioná la sucursal de tu zona:</>
              ) : (
                <>Cada sucursal cuenta con su stock y precios actualizados. Tocá una sucursal para ingresar a su catálogo:</>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors shrink-0 text-lg font-bold"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4 relative z-10 shrink-0">
          <input
            type="text"
            placeholder="Buscar por zona, barrio o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/15 focus:border-[#E8302A] rounded-xl py-2.5 px-4 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none transition-colors"
          />
          <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* List of Sucursales */}
        <div className="overflow-y-auto pr-1 space-y-3 relative z-10 flex-1 custom-scrollbar">
          {filteredSucursales.map((sucursal) => {
            const isActive = selectedSucursal === sucursal.id;
            return (
              <div
                key={sucursal.id}
                onClick={() => {
                  onSelectSucursal(sucursal.id);
                  onClose();
                }}
                className={`group cursor-pointer rounded-2xl p-4 md:p-5 border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isActive
                    ? "bg-[#E8302A]/15 border-[#E8302A] shadow-[0_0_20px_rgba(232,48,42,0.25)]"
                    : "bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-[#E8302A]/60 hover:shadow-[0_4px_16px_rgba(232,48,42,0.15)]"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    isActive ? "bg-[#E8302A] text-white" : "bg-white/10 text-white group-hover:bg-[#E8302A]/20"
                  }`}>
                    🏪
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bebas text-xl md:text-2xl text-white tracking-wide group-hover:text-[#E8302A] transition-colors">
                        Sucursal {sucursal.nombre}
                      </h3>
                      {isActive && (
                        <span className="bg-[#E8302A] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                          CATÁLOGO SELECCIONADO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 font-semibold flex items-center gap-1 mt-0.5">
                      📍 {sucursal.direccion}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      📞 WhatsApp: {sucursal.telefono}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end md:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSucursal(sucursal.id);
                      onClose();
                    }}
                    className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-bebas text-sm md:text-base tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isActive
                        ? "bg-[#1A7A42] hover:bg-[#145E33] text-white shadow-[0_4px_12px_rgba(26,122,66,0.3)]"
                        : "bg-[#E8302A] hover:bg-[#C4231E] text-white shadow-[0_4px_12px_rgba(232,48,42,0.3)] group-hover:scale-105"
                    }`}
                  >
                    {isActive ? "INGRESAR AL CATÁLOGO ⚡" : `VER CATÁLOGO (${sucursal.nombre.toUpperCase()}) ➡️`}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredSucursales.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-sm font-semibold">No encontramos sucursales para esa búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
