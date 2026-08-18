// filepath: src/components/catalogo/QuickViewModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { Producto } from "@/types";
import { EMOJI_POR_CATEGORIA } from "@/types";
import ProductoCard from "./ProductoCard";
import AdSlotPlacement from "@/components/ads/AdSlotPlacement";
import { formatPrice } from "@/lib/format";
import { obtenerPrecioPorUnidad } from "@/lib/search-normalizer";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { calcularPrecioConEscala } from "@/lib/pricing";
import { haptic } from "@/lib/haptic";
import BulkSavingsCallout from "./BulkSavingsCallout";

interface QuickViewModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (producto: Producto) => void;
  qty: number;
  onQtyChange: (codigo: string, qty: number) => void;
  relatedProducts: Producto[];
  getQty: (codigo: string) => number;
  onQuickView?: (producto: Producto) => void;
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
  onQuickView,
}: QuickViewModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedQty, setSelectedQty] = useState<number>(1);

  // Sincronizar cantidad cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = "hidden";
      setSelectedQty(qty > 0 ? qty : 1);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, qty]);

  if (!producto && !isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 280);
  };

  if (!producto) return null;

  const emoji = EMOJI_POR_CATEGORIA[producto.categoria] || "📦";
  const hasEscala = Boolean(producto.escalaPrecios && producto.escalaPrecios.length > 0);
  const boxTier = hasEscala ? producto.escalaPrecios![0] : null;

  // Calcular precio con escala para la cantidad seleccionada en el modal
  const pricing = calcularPrecioConEscala(
    producto.precio,
    selectedQty,
    producto.escalaPrecios
  );

  const handleSetExactQty = (targetQty: number) => {
    haptic.add();
    setSelectedQty(Math.max(1, targetQty));
  };

  const handleConfirmCart = () => {
    haptic.add();
    onQtyChange(producto.codigo, selectedQty);
    handleClose();
  };

  const handleRemoveFromCart = () => {
    haptic.add();
    onQtyChange(producto.codigo, 0);
    handleClose();
  };

  const isBoxActive = boxTier && selectedQty >= boxTier.minCantidad;

  return (
    <>
      <ProductJsonLd producto={producto} />

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-[#090D1A]/50 z-[100] transition-all duration-300 ease-out ${
          isOpen && !isClosing
            ? "opacity-100 backdrop-blur-sm"
            : "opacity-0 backdrop-blur-none pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Modal Card / Bottom Sheet */}
      <div
        className={`fixed z-[101] bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 bg-white md:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl ring-1 ring-black/10 transition-transform duration-300 ease-out flex flex-col ${
          isOpen && !isClosing
            ? "translate-y-0 md:scale-100 opacity-100"
            : "translate-y-full md:translate-y-[-50%] md:scale-[0.97] opacity-0"
        }`}
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "92vh",
        }}
      >
        {/* Mobile handle & Close Button */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between p-3.5 sm:p-4 pointer-events-none">
          <div
            className="md:hidden flex-1 flex justify-center pt-1 pointer-events-auto cursor-pointer"
            onClick={handleClose}
          >
            <div className="w-12 h-1.5 bg-black/15 rounded-full" />
          </div>
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            className="pointer-events-auto bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-slate-700 transition-all active:scale-95 shadow-xs absolute right-4 top-3.5"
          >
            ✕
          </button>
        </div>

        <div
          className="overflow-y-auto w-full h-full pb-6 md:pb-0"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {/* Imagen Ampliada */}
          <div className="relative w-full bg-gradient-to-br from-[#ffffff] via-[#faf8f5] to-[#f2ede6] flex items-center justify-center pt-8 pb-3 px-4 border-b border-slate-100">
            {producto.imagen ? (
              <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[310px] drop-shadow-md transition-transform duration-300 hover:scale-105">
                <Image
                  src={producto.imagen}
                  alt={producto.nombre}
                  fill
                  sizes="(max-width: 640px) 280px, 310px"
                  className="object-contain rounded-2xl"
                  priority
                />
              </div>
            ) : (
              <span className="text-8xl drop-shadow-md py-6">{emoji}</span>
            )}
          </div>

          {/* Información del Producto */}
          <div className="p-5 sm:p-6 bg-white">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                {producto.categoria}
              </span>
              {producto.codigo.startsWith("PROMO-") && (
                <span className="px-2.5 py-0.5 bg-[#EF233C] text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
                  🔥 OFERTA DESTACADA
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-950 leading-snug tracking-tight mb-3">
              {producto.nombre}
            </h2>

            {/* Selector de Presentación (Individual vs Caja) */}
            {hasEscala && boxTier && (
              <div className="mb-4">
                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Elegí la presentación:
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Opción 1: Individual */}
                  <button
                    type="button"
                    onClick={() => handleSetExactQty(1)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      !isBoxActive
                        ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/30 shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-80"
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase text-slate-500">
                      Por Unidad
                    </div>
                    <div className="text-base font-black text-slate-950 font-mono leading-tight mt-0.5">
                      ${producto.precio}
                    </div>
                    <div className="text-[10px] font-medium text-slate-600 mt-1">
                      1 a {boxTier.minCantidad - 1} unidades
                    </div>
                  </button>

                  {/* Opción 2: Caja Mayorista */}
                  <button
                    type="button"
                    onClick={() => handleSetExactQty(boxTier.minCantidad)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isBoxActive
                        ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30 shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800">
                        📦 Caja ({boxTier.minCantidad} u.)
                      </span>
                      {isBoxActive && (
                        <span className="text-[10px] font-black text-emerald-700">✓</span>
                      )}
                    </div>
                    <div className="text-base font-black text-emerald-700 font-mono leading-tight mt-0.5">
                      ${boxTier.precioUnitario} <span className="text-[10px] font-medium text-emerald-900">c/u</span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-800 mt-1">
                      Ahorrás ${(boxTier.minCantidad * (producto.precio - boxTier.precioUnitario)).toLocaleString("es-UY")}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Banner animado especial de ahorro por caja */}
            {hasEscala && (
              <BulkSavingsCallout
                precioBase={producto.precio}
                cantidad={selectedQty}
                escalaPrecios={producto.escalaPrecios}
                onApplyTier={(target) => handleSetExactQty(target)}
              />
            )}

            {/* Stepper de Cantidad */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 flex items-center justify-between shadow-xs">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Cantidad:
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSetExactQty(selectedQty - 1)}
                  disabled={selectedQty <= 1}
                  aria-label="Restar una unidad"
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-black text-xl flex items-center justify-center shadow-xs active:scale-95 transition-all"
                >
                  −
                </button>

                <input
                  type="number"
                  min="1"
                  value={selectedQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) {
                      setSelectedQty(val);
                    }
                  }}
                  className="w-14 text-center font-mono font-black text-2xl text-slate-950 bg-transparent outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleSetExactQty(selectedQty + 1)}
                  aria-label="Sumar una unidad"
                  className="w-10 h-10 rounded-xl bg-[#EF233C] hover:bg-[#C01730] text-white font-black text-xl flex items-center justify-center shadow-xs active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Desglose de Precios */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
                <span>Precio Unitario Aplicado:</span>
                <span className="font-mono font-bold text-white">
                  ${pricing.precioUnitario.toLocaleString("es-UY")} c/u
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Total por {selectedQty} {selectedQty === 1 ? "unidad" : "unidades"}:
                  </div>
                  {pricing.ahorroTotal > 0 && (
                    <div className="text-[10px] font-bold text-emerald-400">
                      ✨ Ahorro total: ${pricing.ahorroTotal.toLocaleString("es-UY")}
                    </div>
                  )}
                </div>

                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight leading-none">
                  ${pricing.subtotal.toLocaleString("es-UY")}
                </div>
              </div>
            </div>

            {/* Botón Principal de Acción */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmCart}
                className="w-full bg-[#EF233C] hover:bg-[#C01730] text-white font-black text-base py-4 px-6 rounded-2xl shadow-lg shadow-[#EF233C]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>🛒</span>
                <span>
                  {qty > 0 ? "ACTUALIZAR EN EL PEDIDO" : "AGREGAR AL PEDIDO"} — ${pricing.subtotal.toLocaleString("es-UY")}
                </span>
              </button>

              {qty > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveFromCart}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors text-center"
                >
                  Quitar este producto del carrito
                </button>
              )}
            </div>
          </div>

          {/* Contextual Ads */}
          <div className="px-5 sm:px-6 pb-3 bg-white">
            <AdSlotPlacement slot="results" category={producto.categoria} />
          </div>

          {/* Cross-Selling */}
          {relatedProducts.length > 0 && (
            <div className="bg-[#F8F9FA] p-5 sm:p-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Comprados Juntos
                </h3>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div
                className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 sm:-mx-6 sm:px-6 snap-x no-scrollbar"
                style={{ scrollbarWidth: "none" }}
              >
                {relatedProducts.map((rel) => (
                  <div key={rel.codigo} className="w-[160px] flex-shrink-0 snap-start">
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
