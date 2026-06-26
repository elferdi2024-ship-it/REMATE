"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { Producto } from "@/types";
import { EMOJI_POR_CATEGORIA } from "@/types";
import ProductoCard from "./ProductoCard";
import AdSlotPlacement from "@/components/ads/AdSlotPlacement";

interface QuickViewModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (producto: Producto) => void;
  qty: number;
  onQtyChange: (codigo: string, qty: number) => void;
  relatedProducts: Producto[]; // For cross-selling
  getQty: (codigo: string) => number; // Function to get qty for related products
  onQuickView?: (producto: Producto) => void;
}

import { formatPrice } from "@/lib/format";


export default function QuickViewModal({
  producto,
  isOpen,
  onClose,
  onAdd,
  qty,
  onQtyChange,
  relatedProducts,
  getQty,
  onQuickView
}: QuickViewModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!producto && !isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // match transition duration
  };

  if (!producto) return null;

  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const isInCart = qty > 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-[#090D1A]/40 z-[100] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen && !isClosing ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none pointer-events-none"}`}
        onClick={handleClose}
      />

      {/* Modal / Bottom Sheet */}
      <div 
        className={`fixed z-[101] bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-white md:rounded-[28px] rounded-t-[32px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen && !isClosing ? "translate-y-0 md:scale-100 opacity-100" : "translate-y-full md:translate-y-[-50%] md:scale-[0.97] opacity-0"
        }`}
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "92vh",
        }}
      >
        {/* Mobile handle & Close Button */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between p-4 md:p-5 pointer-events-none">
          <div className="md:hidden flex-1 flex justify-center pt-1 pointer-events-auto" onClick={handleClose}>
            <div className="w-12 h-1.5 bg-black/10 rounded-full" />
          </div>
          <button 
            onClick={handleClose}
            className="pointer-events-auto bg-white/60 hover:bg-white/90 backdrop-blur-md border border-black/5 w-9 h-9 rounded-full flex items-center justify-center text-gray-800 transition-all active:scale-95 shadow-sm absolute right-4 md:right-5 top-4 md:top-5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto w-full h-full pb-8 md:pb-0" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {/* Image Section */}
          <div className="relative w-full bg-gradient-to-br from-gray-50 to-[#F8F9FA] flex items-center justify-center pt-12 pb-8 md:py-16 border-b border-gray-100" style={{ aspectRatio: "4/3" }}>
            {/* Subtle glow behind product */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
               <div className="w-3/4 h-3/4 bg-white rounded-full blur-3xl" />
            </div>

            {producto.imagen ? (
              <div className="relative w-full h-full p-8 md:p-12 drop-shadow-2xl transition-transform duration-500 hover:scale-105">
                <Image 
                  src={producto.imagen}
                  alt={producto.nombre}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-9xl drop-shadow-lg transition-transform duration-500 hover:scale-105">{emoji}</span>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 bg-white">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100/80 border border-gray-200/50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-lg mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              {producto.categoria}
            </div>
            
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 leading-[1.1] mb-5 tracking-tight">
              {producto.nombre}
            </h2>
            
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-gray-100">
              <div>
                <p className="text-4xl md:text-5xl font-bebas text-red-600 leading-none bg-gradient-to-br from-red-600 to-red-500 bg-clip-text text-transparent">
                  {formatPrice(producto.precio)}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                  Unidad IVA Incl.
                </p>
              </div>
              <div className="text-right">
                 <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">CÓDIGO</p>
                 <p className="font-mono text-sm text-gray-500">{producto.codigo}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              {isInCart ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between bg-gray-50/50 border border-gray-200/60 rounded-[20px] p-2.5 mb-4 shadow-sm">
                    <button 
                      onClick={() => onQtyChange(producto.codigo, Math.max(0, qty - 1))}
                      className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 rounded-2xl shadow-sm text-2xl font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      −
                    </button>
                    <div className="flex flex-col items-center flex-1 mx-4 relative group">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1.5 transition-colors group-focus-within:text-red-500">EN CARRITO</span>
                      <input
                        type="number"
                        min="0"
                        value={qty || ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 0) {
                            onQtyChange(producto.codigo, val);
                          } else if (e.target.value === "") {
                            onQtyChange(producto.codigo, 0);
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-24 text-center font-display font-bold text-4xl text-gray-900 bg-transparent outline-none pb-1 transition-all"
                      />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gray-200 rounded-full group-focus-within:bg-red-500 group-focus-within:w-full transition-all" />
                    </div>
                    <button 
                      onClick={() => onQtyChange(producto.codigo, qty + 1)}
                      className="w-14 h-14 flex items-center justify-center bg-red-50 border border-red-100 rounded-2xl shadow-sm text-2xl font-bold text-red-600 hover:bg-red-100 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">📦</span>
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Añadir bulto / pack</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[6, 12, 24, 48].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => onQtyChange(producto.codigo, qty + preset)}
                          className="py-3 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-sm border border-gray-200 rounded-[14px] text-sm font-black text-gray-700 transition-all active:scale-95 flex flex-col items-center"
                        >
                          <span className="text-[9px] font-bold text-gray-400 mb-0.5 group-hover:text-red-400">SUMAR</span>
                          <span>+{preset}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <button 
                    onClick={() => onAdd(producto)}
                    className="group relative overflow-hidden w-full bg-gray-900 hover:bg-black text-white font-bold text-lg py-4 md:py-5 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="text-xl group-hover:scale-110 transition-transform">🛒</span> 
                    <span>AGREGAR AL PEDIDO</span>
                  </button>
                  
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">⚡</span>
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Compra rápida (Bulto cerrado)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[6, 12, 24, 48].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            onAdd(producto);
                            onQtyChange(producto.codigo, preset);
                          }}
                          className="py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-[14px] text-sm font-black text-gray-800 transition-all active:scale-95 flex flex-col items-center"
                        >
                          <span className="text-[9px] font-bold text-gray-400 mb-0.5">LLEVAR</span>
                          <span>{preset} u.</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contextual Ads - Retail Media */}
          <div className="px-6 md:px-8 pb-4 bg-white">
            <AdSlotPlacement slot="results" category={producto.categoria} />
          </div>

          {/* Cross-Selling (Comprados Juntos) */}
          {relatedProducts.length > 0 && (
            <div className="bg-[#F8F9FA] p-6 md:p-8 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                  Comprados Juntos
                </h3>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:-mx-8 md:px-8 snap-x" style={{ scrollbarWidth: "none" }}>
                {relatedProducts.map(rel => (
                  <div key={rel.codigo} className="w-[180px] flex-shrink-0 snap-start">
                    <ProductoCard
                      producto={rel}
                      qty={getQty(rel.codigo)}
                      onAdd={onAdd}
                      onQtyChange={onQtyChange}
                      onQuickView={onQuickView}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
