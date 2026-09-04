// filepath: src/components/catalogo/TopHeaderNav.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Producto } from "@/types";
import { EMOJI_POR_CATEGORIA } from "@/types";
import { SUCURSALES } from "@/lib/sucursales";
import { formatPrice } from "@/lib/format";

interface TopHeaderNavProps {
  onOpenMenu: () => void;
  onOpenCart: () => void;
  cartQty: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  suggestedProducts?: Producto[];
  onSelectSuggestion?: (query: string) => void;
  onQuickAddToCart?: (producto: Producto) => void;
  activeCat: string;
  onSelectCategory: (cat: string) => void;
  isOfertasActive: boolean;
  onToggleOfertas: () => void;
  isFavoritosActive: boolean;
  onToggleFavoritos: () => void;
  favoritosCount: number;
  sucursalId?: string | null;
  onOpenBranchModal: () => void;
  categorias: readonly string[];
}

export default function TopHeaderNav({
  onOpenMenu,
  onOpenCart,
  cartQty,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  suggestedProducts = [],
  onSelectSuggestion,
  onQuickAddToCart,
  activeCat,
  onSelectCategory,
  isOfertasActive,
  onToggleOfertas,
  isFavoritosActive,
  onToggleFavoritos,
  favoritosCount,
  sucursalId,
  onOpenBranchModal,
  categorias,
}: TopHeaderNavProps) {
  const sucursalObj = SUCURSALES.find((s) => s.id === sucursalId) || SUCURSALES[0];
  const [inputValue, setInputValue] = useState(searchQuery || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sincronizar input cuando cambie externamente
  useEffect(() => {
    setInputValue(searchQuery || "");
  }, [searchQuery]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onSearchChange(val);
  };

  const handleClear = () => {
    setInputValue("");
    onSearchChange("");
    setIsSearchFocused(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    onSearchSubmit(inputValue.trim());
  };

  const handleSuggestionClick = (title: string) => {
    setInputValue(title);
    setIsSearchFocused(false);
    if (onSelectSuggestion) onSelectSuggestion(title);
    else onSearchSubmit(title);
  };

  const isTodosActive = !isOfertasActive && !isFavoritosActive && (activeCat === "Todos" || !activeCat);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E6E6E0] bg-white shadow-xs">
      {/* ── Fila Superior: Hamburguesa, Logo, Sucursal, Enlaces, Buscador, Carrito ── */}
      <div className="mx-auto flex max-w-[1240px] flex-wrap md:flex-nowrap items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4">
        {/* Botón Hamburguesa */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-[#E6E6E0] bg-white text-[#1B2620] shadow-2xs transition hover:border-[#1B2620] hover:bg-[#F6F6F3] active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        {/* Logo de El Remate + Sucursal */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group no-underline">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#EF233C] to-[#C01730] text-white shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-bebas text-lg leading-none">R</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bebas text-base sm:text-xl tracking-wide text-[#1B2620] leading-none">
                EL REMATE
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-[#7A8179] tracking-wider uppercase leading-none">
                Distribuidora
              </span>
            </div>
          </Link>

          {/* Chip interactivo de sucursal en el Header */}
          <button
            type="button"
            onClick={onOpenBranchModal}
            className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-red-50 hover:bg-red-100 text-[#EF233C] text-[10px] sm:text-[11px] font-bold transition-all border border-red-200/70 shadow-2xs active:scale-95"
            title="Cambiar sucursal"
          >
            <span className="text-xs">🏪</span>
            <span suppressHydrationWarning className="max-w-[70px] sm:max-w-none truncate">{sucursalObj.nombre}</span>
            <span className="text-[9px] text-red-700 underline font-extrabold hidden sm:inline">cambiar</span>
          </button>
        </div>

        {/* Enlaces de Navegación de Escritorio (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 ml-2 shrink-0" aria-label="Enlaces rápidos">
          <Link
            href="/"
            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1B2620] hover:bg-[#F6F6F3] transition-colors"
          >
            Inicio
          </Link>
          <button
            type="button"
            onClick={onToggleOfertas}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
              isOfertasActive ? "bg-[#EF233C]/10 text-[#EF233C]" : "text-[#1B2620] hover:bg-[#F6F6F3]"
            }`}
          >
            Ofertas
          </button>
          <button
            type="button"
            onClick={onOpenBranchModal}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#7A8179] hover:text-[#1B2620] hover:bg-[#F6F6F3] transition-colors"
          >
            <span>Sucursales</span>
            <span className="text-[10px] text-[#EF233C] font-black">▾</span>
          </button>
        </nav>

        {/* Botón de Carrito con Badge Contador (en móvil a la derecha de la primera fila) */}
        <div className="ml-auto md:ml-0 md:order-last shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Ver carrito con ${cartQty} productos`}
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#E6E6E0] bg-white text-[#1B2620] shadow-2xs transition hover:border-[#1B2620] hover:bg-[#F6F6F3] active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EF233C] px-1 font-mono text-[11px] font-extrabold text-white ring-2 ring-white">
                {cartQty > 99 ? "99+" : cartQty}
              </span>
            )}
          </button>
        </div>

        {/* Buscador Central Expandido con Botón Rojo (en móvil ocupa el ancho completo en fila 2) */}
        <div
          ref={searchBoxRef}
          className="relative w-full md:w-auto md:flex-1 md:max-w-[540px] md:ml-auto order-last md:order-none mt-1 md:mt-0"
        >
          <form onSubmit={handleSubmit} className="relative flex items-center w-full">
            <div className="relative flex w-full items-center rounded-xl border border-[#E6E6E0] bg-white shadow-2xs transition-all focus-within:border-[#EF233C] focus-within:ring-2 focus-within:ring-[#EF233C]/15">
              <span className="pointer-events-none absolute left-3.5 text-[#7A8179]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>

              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="¿Qué estás buscando hoy?"
                className="w-full rounded-xl py-2 pl-10 pr-20 text-xs sm:text-sm text-[#1B2620] placeholder-[#9BA099] outline-none font-medium bg-transparent"
              />

              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Borrar búsqueda"
                  className="absolute right-12 flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F0EB] text-xs font-bold text-[#656D65] hover:bg-[#E2E2DC] hover:text-[#1B2620] transition"
                >
                  ✕
                </button>
              )}

              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-1 top-1 bottom-1 flex w-9 items-center justify-center rounded-lg bg-[#EF233C] hover:bg-[#C01730] text-white shadow-2xs transition active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </form>

          {/* Dropdown de Sugerencias Instantáneas */}
          {isSearchFocused && inputValue.trim().length >= 2 && suggestedProducts.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[380px] overflow-y-auto rounded-2xl border border-[#E6E6E0] bg-white shadow-xl animate-in fade-in slide-in-from-top-1 divide-y divide-[#F2F2EE]">
              <div className="flex items-center justify-between px-3.5 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A8179] bg-[#FAF9F6]">
                <span>Sugerencias de catálogo</span>
                <span>Precios x mayor</span>
              </div>

              {suggestedProducts.slice(0, 5).map((p) => (
                <div
                  key={p.codigo}
                  onClick={() => handleSuggestionClick(p.nombre)}
                  className="flex items-center justify-between p-3 hover:bg-[#F7F7F2] cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center">
                      {p.imagen ? (
                        <Image
                          src={p.imagen}
                          alt={p.nombre}
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-base">{EMOJI_POR_CATEGORIA[p.categoria] || "📦"}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1B2620] truncate">
                        {p.nombre}
                      </p>
                      <span className="text-[10px] font-semibold text-[#7A8179]">
                        {p.categoria}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-[#EF233C] tabular-nums">
                      {formatPrice(p.precio)}
                    </span>
                    {onQuickAddToCart && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAddToCart(p);
                        }}
                        className="rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2 py-1 transition"
                      >
                        + Agregar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Fila Inferior: Barra Horizontal Deslizable de Píldoras de Rubros (.h-cats) ── */}
      <nav
        aria-label="Rubros y categorías"
        className="relative mx-auto max-w-[1240px] px-3 pb-2 pt-0.5 sm:px-4 w-full overflow-hidden"
      >
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth"
        >
          {/* Píldora: Todos */}
          <button
            type="button"
            onClick={() => {
              if (isOfertasActive) onToggleOfertas();
              if (isFavoritosActive) onToggleFavoritos();
              onSelectCategory("Todos");
            }}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
              isTodosActive
                ? "bg-[#1B2620] text-white shadow-xs"
                : "border border-[#E6E6E0] bg-white text-[#1B2620] hover:border-[#1B2620]"
            }`}
          >
            <span>🛒</span>
            <span>Todos</span>
          </button>

          {/* Píldora: Ofertas */}
          <button
            type="button"
            onClick={onToggleOfertas}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
              isOfertasActive
                ? "bg-[#EF233C] text-white shadow-xs"
                : "border border-[#E6E6E0] bg-white text-[#1B2620] hover:border-[#EF233C]"
            }`}
          >
            <span>🏷️</span>
            <span>Ofertas</span>
          </button>

          {/* Píldora: Favoritos */}
          <button
            type="button"
            onClick={onToggleFavoritos}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
              isFavoritosActive
                ? "bg-[#EF233C] text-white shadow-xs"
                : "border border-[#E6E6E0] bg-white text-[#1B2620] hover:border-[#EF233C]"
            }`}
          >
            <span>❤️</span>
            <span>Favoritos</span>
            {favoritosCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                isFavoritosActive ? "bg-white/20 text-white" : "bg-slate-100 text-[#7A8179]"
              }`}>
                {favoritosCount}
              </span>
            )}
          </button>

          {/* Separador sutil */}
          <div className="h-4 w-px bg-[#E6E6E0] shrink-0 my-auto" />

          {/* Píldoras de Categorías Oficiales */}
          {categorias.map((cat) => {
            const emoji = EMOJI_POR_CATEGORIA[cat] || "📦";
            const isSelected = !isOfertasActive && !isFavoritosActive && activeCat === cat;

            // Formateo de nombre de píldora
            const cleanName = cat
              .toLowerCase()
              .replace(/artículos del /, "")
              .replace(/de la /, "");
            const titleCase = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  if (isOfertasActive) onToggleOfertas();
                  if (isFavoritosActive) onToggleFavoritos();
                  onSelectCategory(cat);
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                  isSelected
                    ? "bg-[#1B2620] text-white shadow-xs font-bold"
                    : "border border-[#E6E6E0] bg-white text-[#1B2620] hover:border-[#1B2620]"
                }`}
              >
                <span>{emoji}</span>
                <span>{titleCase}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
