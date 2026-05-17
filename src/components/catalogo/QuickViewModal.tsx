"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { Producto } from "@/types";
import { EMOJI_POR_CATEGORIA } from "@/types";
import ProductoCard from "./ProductoCard";

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

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

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
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 ${isOpen && !isClosing ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleClose}
        style={{ backdropFilter: "blur(4px)" }}
      />

      {/* Modal / Bottom Sheet */}
      <div 
        className={`fixed z-[101] bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-white md:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen && !isClosing ? "translate-y-0 md:scale-100" : "translate-y-full md:translate-y-[-50%] md:scale-95 md:opacity-0"
        }`}
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
        }}
      >
        {/* Mobile handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1" onClick={handleClose}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Close Button (Desktop) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 z-10 hidden md:flex shadow-sm"
        >
          ✕
        </button>

        <div className="overflow-y-auto" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {/* Image Section */}
          <div className="relative w-full bg-gradient-to-b from-white to-gray-50 flex items-center justify-center" style={{ aspectRatio: "4/3", borderBottom: "1px solid var(--border)" }}>
            {producto.imagen ? (
              <Image 
                src={producto.imagen}
                alt={producto.nombre}
                fill
                className="object-contain p-8"
              />
            ) : (
              <span className="text-8xl">{emoji}</span>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide rounded mb-3">
              {producto.categoria}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-4" style={{ letterSpacing: "-0.5px" }}>
              {producto.nombre}
            </h2>
            
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-3xl font-black text-red-600 leading-none" style={{ fontFamily: "var(--font-display)" }}>
                  {formatPrice(producto.precio)}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">
                  Unidad IVA Incl.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              {isInCart ? (
                <>
                  <div className="flex items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-xl p-2">
                    <button 
                      onClick={() => onQtyChange(producto.codigo, Math.max(0, qty - 1))}
                      className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-2xl font-bold text-gray-700 active:scale-95 transition-transform"
                    >
                      −
                    </button>
                    <div className="flex flex-col items-center flex-1 mx-4">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">CANTIDAD</span>
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
                        className="w-20 text-center font-black text-2xl text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-red-600 outline-none pb-0.5"
                      />
                    </div>
                    <button 
                      onClick={() => onQtyChange(producto.codigo, qty + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm text-2xl font-bold text-red-600 active:scale-95 transition-transform"
                    >
                      +
                    </button>
                  </div>
                  
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mb-2">
                      ⚡ SUMAR POR PAQUETE / CAJA
                    </div>
                    <div className="flex justify-between gap-2">
                      {[6, 12, 24, 48].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => onQtyChange(producto.codigo, qty + preset)}
                          className="flex-1 py-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-400 border border-gray-200 rounded-xl text-xs font-black text-gray-800 transition-all active:scale-95 flex flex-col items-center"
                        >
                          <span className="text-[9px] font-bold text-gray-400 opacity-80">SUMAR</span>
                          <span>+{preset}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => onAdd(producto)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_20px_rgba(232,48,42,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">🛒</span> Agregar al Pedido
                  </button>
                  
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mb-2">
                      ⚡ LLEVAR DIRECTO POR CANTIDAD (B2B)
                    </div>
                    <div className="flex justify-between gap-2">
                      {[6, 12, 24, 48].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => {
                            onAdd(producto);
                            onQtyChange(producto.codigo, preset);
                          }}
                          className="flex-1 py-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-400 border border-gray-200 rounded-xl text-xs font-black text-gray-800 transition-all active:scale-95 flex flex-col items-center"
                        >
                          <span className="text-[9px] font-bold text-gray-400 opacity-80">LLEVAR</span>
                          <span>{preset} u.</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cross-Selling (Comprados Juntos) */}
          {relatedProducts.length > 0 && (
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Suelen llevarse juntos
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
                {relatedProducts.map(rel => (
                  <div key={rel.codigo} className="w-[160px] flex-shrink-0">
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
