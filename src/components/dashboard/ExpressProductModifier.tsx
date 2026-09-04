// filepath: src/components/dashboard/ExpressProductModifier.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { EMOJI_POR_CATEGORIA } from "@/types";

export interface ProductRow {
  codigo: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen?: string;
}

interface ExpressProductModifierProps {
  loadingProducts: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filteredProducts: ProductRow[];
  editingProduct: ProductRow | null;
  setEditingProduct: (p: ProductRow | null) => void;
  editPrice: string;
  setEditPrice: (s: string) => void;
  editCategory: string;
  setEditCategory: (s: string) => void;
  savingProduct: boolean;
  onSaveProduct: () => Promise<void>;
  categoriasDisponibles: readonly string[];
  formatCurrency: (value: number) => string;
}

export default function ExpressProductModifier({
  loadingProducts,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  editingProduct,
  setEditingProduct,
  editPrice,
  setEditPrice,
  editCategory,
  setEditCategory,
  savingProduct,
  onSaveProduct,
  categoriasDisponibles,
  formatCurrency,
}: ExpressProductModifierProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Focus en el input de precio cuando se abre la edición inline
  useEffect(() => {
    if (editingProduct && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [editingProduct]);

  const handleSelectProduct = (p: ProductRow) => {
    setEditingProduct(p);
    setEditPrice(p.precio ? String(p.precio) : "0");
    setEditCategory(p.categoria || categoriasDisponibles[0]);
  };

  const handleKeyDownEdit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSaveProduct();
    } else if (e.key === "Escape") {
      setEditingProduct(null);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-sm transition-all duration-300 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h2 className="font-bebas text-2xl tracking-wide text-[var(--admin-text-hi)] md:text-3xl">
              MODIFICADOR EXPRESS DE CATÁLOGO
            </h2>
          </div>
          <p className="text-xs text-[var(--admin-text-lo)] font-medium">
            Ajuste instantáneo de precio unitario o rubro sin necesidad de subir planillas
          </p>
        </div>
      </div>

      {loadingProducts ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-6 text-sm text-[var(--admin-text-lo)]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--admin-border)] border-t-[var(--admin-accent)]" />
          <span>Sincronizando catálogo de productos desde base de datos...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Input de Búsqueda con atajo */}
          <div className="relative">
            <span className="absolute left-4 top-3 text-sm text-[var(--admin-text-lo)]">
              🔍
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por código de barras o nombre del artículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] pl-11 pr-10 py-3 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)] focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-3 h-6 w-6 rounded-full bg-[var(--admin-border)]/40 hover:bg-[var(--admin-border)] text-xs font-bold text-[var(--admin-text-hi)] flex items-center justify-center transition"
              >
                ✕
              </button>
            )}
          </div>

          {/* Resultados de Búsqueda Rápida */}
          {searchTerm.trim() && filteredProducts.length > 0 && (
            <div className="divide-y divide-[var(--admin-border)] rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] overflow-hidden shadow-xs">
              <div className="bg-[var(--admin-card-bg)] px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--admin-text-lo)] flex justify-between">
                <span>Coincidencias ({filteredProducts.length})</span>
                <span>Tocá para editar</span>
              </div>
              {filteredProducts.map((p) => {
                const isSelected = editingProduct?.codigo === p.codigo;
                const emoji = EMOJI_POR_CATEGORIA[p.categoria] || "📦";

                return (
                  <div
                    key={p.codigo}
                    onClick={() => handleSelectProduct(p)}
                    className={`group flex items-center justify-between p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[var(--admin-accent)]/10 border-l-4 border-l-[var(--admin-accent)]"
                        : "hover:bg-[var(--admin-input-bg)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-lg shadow-2xs">
                        {emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--admin-text-hi)] group-hover:text-[var(--admin-accent)] transition-colors">
                          {p.nombre}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] font-bold text-[var(--admin-accent)] bg-[var(--admin-accent)]/10 px-2 py-0.5 rounded-md">
                            #{p.codigo}
                          </span>
                          <span className="text-[10px] bg-[var(--admin-border)] px-2 py-0.5 rounded-md text-[var(--admin-text-mid)] uppercase font-semibold">
                            {p.categoria}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right pl-4">
                      <p className="font-mono font-bold text-sm sm:text-base text-[var(--admin-text-hi)] tabular-nums">
                        {formatCurrency(p.precio)}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--admin-accent)] opacity-80 group-hover:opacity-100">
                        Editar ✏️
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {searchTerm.trim() && filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-bg)]/50 p-6 text-center text-xs text-[var(--admin-text-lo)] font-medium">
              🔍 No se encontraron productos con el término &ldquo;{searchTerm}&rdquo; en el catálogo activo.
            </div>
          )}

          {/* Formulario de Edición de Producto Inline */}
          {editingProduct && (
            <div className="rounded-2xl border border-[var(--admin-accent)]/30 bg-[var(--admin-accent)]/[0.04] p-5 md:p-6 space-y-4 animate-in slide-in-from-top-2 duration-300 shadow-sm">
              <div className="flex items-start justify-between gap-2 border-b border-[var(--admin-border)] pb-3">
                <div>
                  <span className="rounded-full bg-[var(--admin-accent)]/15 text-[var(--admin-accent)] text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 tracking-wider">
                    Modificación Rápida
                  </span>
                  <h4 className="font-bold text-base text-[var(--admin-text-hi)] mt-1">
                    {editingProduct.nombre}
                  </h4>
                  <span className="font-mono text-xs text-[var(--admin-text-lo)]">
                    Código: #{editingProduct.codigo}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-full h-7 w-7 flex items-center justify-center text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)] hover:bg-[var(--admin-border)]/50 transition"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)] mb-1">
                    Nuevo Precio Unitario ($ UYU)
                  </label>
                  <input
                    ref={priceInputRef}
                    type="number"
                    min="0"
                    step="0.5"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    onKeyDown={handleKeyDownEdit}
                    className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3.5 py-2.5 font-mono text-base font-bold text-[var(--admin-text-hi)] tabular-nums focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                  />
                  <span className="text-[10px] text-[var(--admin-text-lo)] mt-1 block">
                    Precio anterior: {formatCurrency(editingProduct.precio)}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--admin-text-lo)] mb-1">
                    Categoría de Catálogo
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3.5 py-2.5 text-sm text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                  >
                    {categoriasDisponibles.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--admin-border)]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl border border-[var(--admin-border)] bg-transparent px-4 py-2 text-xs font-semibold text-[var(--admin-text-lo)] hover:bg-[var(--admin-input-bg)] active:scale-95 transition"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  disabled={savingProduct || !editPrice || isNaN(Number(editPrice))}
                  onClick={onSaveProduct}
                  className="rounded-xl bg-[var(--admin-accent)] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center gap-2"
                >
                  {savingProduct ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Confirmar Cambio</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
