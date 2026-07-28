// filepath: src/components/catalogo/RecipeComboModal.tsx
"use client";

import React from "react";
import Image from "next/image";
import type { Producto } from "@/types";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { haptic } from "@/lib/haptic";

export interface RecipeCombo {
  id: string;
  title: string;
  emoji: string;
  description: string;
  products: Producto[];
}

interface RecipeComboModalProps {
  combo: RecipeCombo;
  isOpen: boolean;
  onClose: () => void;
  onAddAllProducts: (products: Producto[]) => void;
}

export default function RecipeComboModal({
  combo,
  isOpen,
  onClose,
  onAddAllProducts,
}: RecipeComboModalProps) {
  if (!isOpen) return null;

  const totalComboPrice = combo.products.reduce((acc, p) => acc + p.precio, 0);

  const handleAddAll = () => {
    haptic.send();
    onAddAllProducts(combo.products);
    toast.success(`Combo "${combo.title}" agregado al carrito!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl overflow-hidden border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-lg p-1 transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{combo.emoji}</span>
          <div>
            <h3 className="font-extrabold text-base text-stone-900 leading-tight">
              {combo.title}
            </h3>
            <p className="text-xs text-stone-500">{combo.description}</p>
          </div>
        </div>

        {/* Lista de productos del combo */}
        <div className="my-4 space-y-2 max-h-[260px] overflow-y-auto pr-1 border-y border-stone-100 py-3">
          {combo.products.map((p) => (
            <div
              key={p.codigo}
              className="flex items-center gap-3 p-2 bg-stone-50/80 rounded-xl border border-stone-100"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden relative shrink-0 border border-stone-200">
                {p.imagen ? (
                  <Image
                    src={p.imagen}
                    alt={p.nombre}
                    fill
                    sizes="40px"
                    className="object-contain p-1"
                  />
                ) : (
                  <span className="text-base">📦</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-stone-800 truncate">{p.nombre}</div>
                <div className="text-[10px] text-stone-500 font-semibold">{p.categoria}</div>
              </div>
              <div className="text-xs font-black text-[#E8302A]">{formatPrice(p.precio)}</div>
            </div>
          ))}
        </div>

        {/* Total y CTA de agregar combo completo */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400">Total del Combo</div>
            <div className="text-xl font-black text-stone-900">{formatPrice(totalComboPrice)}</div>
          </div>
          <button
            type="button"
            onClick={handleAddAll}
            className="bg-[#E8302A] hover:bg-[#c9241f] text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-md shadow-[#E8302A]/20 active:scale-95 transition-all"
          >
            🛒 AGREGAR TODO AL CARRITO
          </button>
        </div>
      </div>
    </div>
  );
}
