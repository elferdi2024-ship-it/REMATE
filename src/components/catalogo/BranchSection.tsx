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

  return (
    <section className="py-[80px] px-5 bg-[#F5F0E8]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-[48px]">
          <h2 className="font-bebas text-[clamp(2rem,5vw,3rem)] text-[#111111] tracking-[2px] mb-2">
            NUESTRAS SUCURSALES
          </h2>
          <p className="font-serif italic text-[1.1rem] text-[#5C4A35]">
            Encontranos en Canelones · Tocá una sucursal para ver su catálogo
          </p>
          {selectedSucursal && activeSucursal && (
            <div className="inline-flex items-center gap-2 bg-[#E8302A]/8 border border-[#E8302A]/25 rounded-[20px] px-5 py-2 mt-4 text-[0.85rem] font-bold text-[#E8302A] shadow-[0_2px_10px_rgba(232,48,42,0.08)]">
              🏪 SUCURSAL SELECCIONADA:{" "}
              <strong className="text-[#111111] uppercase">
                {activeSucursal.nombre}
              </strong>
            </div>
          )}
        </div>

        <div className="sucursales-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUCURSALES.map((sucursal) => {
            const isActive = selectedSucursal === sucursal.id;
            return (
              <div
                key={sucursal.id}
                onClick={() => onSelectSucursal(sucursal.id)}
                className={`bg-white rounded-[16px] p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                  isActive
                    ? "border-2 border-[#E8302A] shadow-[0_0_30px_rgba(232,48,42,0.25)] scale-[1.02]"
                    : "border border-[#DDD8D0] shadow-[0_4px_16px_rgba(17,11,8,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(17,11,8,0.18)] hover:border-[#E8302A]"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[2rem]">🏪</span>
                    {isActive && (
                      <span className="bg-[#E8302A] text-white text-[0.65rem] font-bold uppercase py-1 px-2.5 rounded tracking-[1px] shadow-[0_2px_8px_rgba(232,48,42,0.3)]">
                        SELECCIONADA
                      </span>
                    )}
                  </div>
                  <h3 className="font-bebas text-[1.6rem] text-[#111111] tracking-[1px] mb-4 leading-tight">
                    📍 {sucursal.nombre}
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    <p className="text-[0.95rem] text-[#111111] flex items-center gap-2 font-semibold leading-relaxed">
                      {sucursal.direccion}
                    </p>
                    <a
                      href={`https://wa.me/598${sucursal.telefono.replace(/\s/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[0.95rem] text-[#1A7A42] no-underline font-bold inline-flex items-center gap-2 py-1.5 px-2.5 rounded-[8px] transition-all bg-[#1A7A42]/5 hover:bg-[#1A7A42]/10 hover:text-[#145E33]"
                    >
                      📱 {sucursal.telefono}
                    </a>
                  </div>
                </div>

                <div className="mt-4.5 border-t border-[#DDD8D0] pt-3.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEnterCatalog) {
                        onEnterCatalog(sucursal.id);
                      } else {
                        onSelectSucursal(sucursal.id);
                      }
                    }}
                    className={`w-full border-0 rounded-[8px] py-2.5 px-3.5 font-bebas text-[1.05rem] tracking-[1.5px] cursor-pointer transition-all flex items-center justify-center gap-1.5 text-white ${
                      isActive
                        ? "bg-[#1A7A42] hover:bg-[#145E33] shadow-[0_2px_8px_rgba(26,122,66,0.2)]"
                        : "bg-[#E8302A] hover:bg-[#A31D1D] shadow-[0_2px_8px_rgba(232,48,42,0.2)]"
                    }`}
                  >
                    {isActive ? "INGRESAR AL CATÁLOGO ⚡" : "VER CATÁLOGO ➡️"}
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
