// filepath: src/components/catalogo/BranchSection.tsx
"use client";

import React from "react";
import { SUCURSALES } from "@/lib/sucursales";

interface BranchSectionProps {
  selectedSucursal: string;
  onSelectSucursal: (id: string) => void;
  onEnterCatalog?: (id: string) => void;
}

export default function BranchSection({ 
  selectedSucursal, 
  onSelectSucursal, 
  onEnterCatalog 
}: BranchSectionProps) {
  const activeSucursal = SUCURSALES.find(s => s.id === selectedSucursal);

  const handleBranchClick = (id: string) => {
    if (onEnterCatalog) {
      onEnterCatalog(id);
    } else {
      onSelectSucursal(id);
    }
  };

  return (
    <section className="py-[80px] px-5 bg-[#F5F0E8] relative overflow-hidden" id="sucursales">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-[48px]">
          <span className="text-[11px] font-bold tracking-[4px] uppercase text-[#9C8570] block mb-2">
            Sucursales & Catálogos por Zona
          </span>
          <h2 className="font-bebas text-[clamp(2.2rem,5vw,3.2rem)] text-[#111111] tracking-[2px] mb-2 leading-none">
            ELEGÍ TU <span className="text-[#E8302A]">SUCURSAL Y CATÁLOGO</span>
          </h2>
          <p className="font-serif italic text-[1.1rem] text-[#5C4A35] max-w-[680px] mx-auto leading-relaxed">
            Cada sucursal cuenta con su propio stock, ofertas y precios mayoristas actualizados. Tocá la sucursal de tu zona para ingresar directo a su catálogo digital.
          </p>
          {selectedSucursal && activeSucursal && (
            <div className="inline-flex items-center gap-2 bg-[#E8302A]/10 border border-[#E8302A]/40 rounded-full px-6 py-2.5 mt-5 text-[0.85rem] font-bold text-[#E8302A] shadow-[0_4px_16px_rgba(232,48,42,0.12)] animate-fade-in">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8302A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E8302A]"></span>
              </span>
              <span>CATÁLOGO ACTIVO:</span>
              <strong className="text-[#111111] uppercase tracking-wide">
                SUCURSAL {activeSucursal.nombre} ({activeSucursal.direccion})
              </strong>
            </div>
          )}
        </div>

        <div className="sucursales-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUCURSALES.map((sucursal) => {
            const isActive = selectedSucursal === sucursal.id;
            return (
              <div
                key={sucursal.id}
                onClick={() => handleBranchClick(sucursal.id)}
                className={`bg-white rounded-[20px] p-7 transition-all duration-300 cursor-pointer flex flex-col justify-between relative group active:scale-95 ${
                  isActive
                    ? "border-2 border-[#E8302A] shadow-[0_8px_30px_rgba(232,48,42,0.25)] ring-2 ring-[#E8302A]/20"
                    : "border border-[#DDD8D0] shadow-[0_4px_20px_rgba(17,11,8,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(17,11,8,0.14)] hover:border-[#E8302A]"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F0E8] flex items-center justify-center text-2xl group-hover:bg-[#E8302A] group-hover:text-white transition-colors">
                      🏪
                    </div>
                    {isActive ? (
                      <span className="bg-[#E8302A] text-white text-[0.65rem] font-black uppercase py-1 px-3 rounded-full tracking-[1.5px] shadow-[0_2px_8px_rgba(232,48,42,0.3)]">
                        ✓ CATÁLOGO SELECCIONADO
                      </span>
                    ) : (
                      <span className="bg-[#F5F0E8] text-[#5C4A35] text-[0.65rem] font-bold uppercase py-1 px-3 rounded-full tracking-[1px] group-hover:bg-[#E8302A]/10 group-hover:text-[#E8302A]">
                        TOCÁ PARA SELECCIONAR
                      </span>
                    )}
                  </div>

                  <h3 className="font-bebas text-[1.85rem] text-[#111111] tracking-[1px] mb-2 leading-tight group-hover:text-[#E8302A] transition-colors">
                    Sucursal {sucursal.nombre}
                  </h3>

                  <div className="flex flex-col gap-2 mb-3">
                    <p className="text-[0.95rem] text-[#4A4238] flex items-center gap-2 font-semibold leading-relaxed">
                      📍 {sucursal.direccion}
                    </p>
                    <a
                      href={`https://wa.me/598${sucursal.telefono.replace(/\s/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[0.85rem] text-[#1A7A42] no-underline font-bold inline-flex items-center gap-2 py-1.5 px-3 rounded-[10px] transition-all bg-[#1A7A42]/10 hover:bg-[#1A7A42]/20 hover:text-[#145E33] w-max"
                    >
                      📱 {sucursal.telefono}
                    </a>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#DDD8D0] pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBranchClick(sucursal.id);
                    }}
                    className={`w-full border-0 rounded-[12px] py-3.5 px-4 font-bebas text-[1.15rem] tracking-[1.5px] cursor-pointer transition-all flex items-center justify-center gap-2 text-white ${
                      isActive
                        ? "bg-[#1A7A42] hover:bg-[#145E33] shadow-[0_4px_14px_rgba(26,122,66,0.3)]"
                        : "bg-[#E8302A] hover:bg-[#C4231E] shadow-[0_4px_14px_rgba(232,48,42,0.3)] group-hover:scale-[1.02]"
                    }`}
                  >
                    {isActive
                      ? "INGRESAR AL CATÁLOGO ⚡"
                      : `SELECCIONAR CATÁLOGO DE ${sucursal.nombre.toUpperCase()} ➡️`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
