// filepath: src/components/catalogo/TopHeaderNav.tsx
// Lucian UX/UI Prompt #242 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#242
// Lucian UX/UI Prompt #092 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#092
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
  const sucursalObj = sucursalId ? SUCURSALES.find((s) => s.id === sucursalId) || null : null;
  const [inputValue, setInputValue] = useState(searchQuery || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sincronizar input cuando cambie externamente
  useEffect(() => {
    setInputValue(searchQuery || "");
  }, [searchQuery]);

  // Detectar scroll para aplicar sombra inteligente estilo Lucian #242
  useEffect(() => {
    const onScroll = () => {
      setIsStuck(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-centrar el chip activo en la barra horizontal estilo Lucian #242
  useEffect(() => {
    const rail = scrollRef.current;
    if (!rail) return;
    const activeChip = rail.querySelector<HTMLElement>('[aria-current="true"]');
    if (!activeChip) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetLeft = Math.max(
      0,
      Math.min(
        rail.scrollWidth - rail.clientWidth,
        activeChip.offsetLeft - (rail.clientWidth - activeChip.offsetWidth) / 2
      )
    );
    rail.scrollTo({
      left: targetLeft,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [activeCat, isOfertasActive, isFavoritosActive]);

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
    <header
      className={`ux sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-shadow duration-250 ${
        isStuck ? "shadow-[0_10px_28px_-14px_rgba(15,23,42,0.14)]" : "shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
      }`}
    >
      {/* ── Fila Superior: Contenedor Mobile-first con 2 filas claras en móvil y 1 sola fila en desktop ── */}
      <div className="mx-auto flex max-w-[1280px] flex-col md:flex-row md:items-center gap-2 md:gap-3 px-3 py-2 sm:px-5">
        {/* Fila 1 en Móvil: Barra superior con Menú + Logo a la izquierda, y Sucursal + Carrito a la derecha */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          {/* Lado Izquierdo: Menú Hamburguesa + Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Abrir menú"
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-900 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="4" y1="6.5" x2="20" y2="6.5" />
                <line x1="4" y1="12" x2="16" y2="12" />
                <line x1="4" y1="17.5" x2="20" y2="17.5" />
              </svg>
            </button>

            <Link href="/" className="flex items-center group no-underline shrink-0" aria-label="El Remate Mayorista">
              <div className="relative h-8 w-[105px] sm:h-9 sm:w-[130px] flex items-center">
                <Image
                  src="/logo.png"
                  alt="El Remate"
                  fill
                  sizes="(max-width: 640px) 105px, 130px"
                  priority
                  className="object-contain object-left group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
          </div>

          {/* Lado Derecho en Móvil: Selector Sucursal + Carrito juntos sin quebrar */}
          <div className="flex items-center gap-1.5 shrink-0 md:hidden">
            <button
              type="button"
              onClick={onOpenBranchModal}
              className="group flex items-center gap-1 pl-2 pr-2 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all border border-slate-200/90 active:scale-95"
              title="Cambiar sucursal"
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <svg
                className="w-3 h-3 text-[#EF233C] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span suppressHydrationWarning className="max-w-[70px] truncate tracking-tight">
                {sucursalObj ? sucursalObj.nombre : "Sucursal"}
              </span>
              <svg className="w-2.5 h-2.5 text-slate-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Ver carrito con ${cartQty} productos`}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
                cartQty > 0
                  ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                  : "border-slate-200/90 bg-white text-slate-900 shadow-2xs"
              }`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartQty > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[17px] items-center justify-center rounded-full bg-[#EF233C] px-1 text-[10px] font-extrabold text-white tabular-nums ring-2 ring-white"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {cartQty > 99 ? "99+" : cartQty}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Selector de Sucursal y Enlaces en Desktop (md:flex) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenBranchModal}
            className="group flex items-center gap-1.5 pl-2.5 pr-2.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-900 text-slate-800 hover:text-white text-[11px] font-bold transition-all border border-slate-200/80 hover:border-slate-900 active:scale-95"
            title="Cambiar sucursal de despacho"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <svg
              className="w-3.5 h-3.5 text-[#EF233C] group-hover:text-red-400 shrink-0 transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span suppressHydrationWarning className="max-w-[130px] truncate tracking-tight">
              {sucursalObj ? sucursalObj.nombre : "Elegir sucursal"}
            </span>
            <svg
              className="w-3 h-3 text-slate-400 group-hover:text-slate-300 shrink-0 transition-transform group-hover:translate-y-0.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>

          <nav className="hidden lg:flex items-center gap-1 ml-1" aria-label="Enlaces rápidos">
            <Link
              href="/"
              className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Catálogo
            </Link>
            <button
              type="button"
              onClick={onToggleOfertas}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                isOfertasActive
                  ? "bg-[#EF233C]/10 text-[#EF233C]"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#EF233C]" />
              <span>Ofertas</span>
            </button>
            <button
              type="button"
              onClick={onOpenBranchModal}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <span>Sucursales</span>
            </button>
          </nav>
        </div>

        {/* Buscador Central (en móvil es la Fila 2, en desktop es central flexible) */}
        <div
          ref={searchBoxRef}
          className="relative w-full md:flex-1 md:max-w-[540px] md:mx-auto"
        >
          <form onSubmit={handleSubmit} className="relative flex items-center w-full">
            <div className="relative flex w-full items-center rounded-xl border border-slate-200/90 bg-slate-50/80 transition-all focus-within:border-[#EF233C] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(239,35,60,0.12)]">
              <span className="pointer-events-none absolute left-3.5 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>

              <input
                id="header-search-input"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Buscar por producto, marca o código..."
                className="w-full rounded-xl py-2 sm:py-2.5 pl-10 pr-24 text-[13px] sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-semibold bg-transparent"
              />

              {!inputValue && !isSearchFocused && (
                <kbd
                  className="hidden sm:inline-flex pointer-events-none absolute right-12 h-5 items-center rounded border border-slate-200 bg-white px-1.5 text-[10px] font-bold text-slate-400"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  /
                </kbd>
              )}

              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Borrar búsqueda"
                  className="absolute right-11 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300 hover:text-slate-900 transition-transform active:scale-90"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3l-8 8" />
                  </svg>
                </button>
              )}

              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-1 top-1 bottom-1 flex w-8 sm:w-8.5 items-center justify-center rounded-lg bg-[#EF233C] hover:bg-[#C01730] text-white shadow-2xs transition-all active:scale-95"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </form>

          {/* Dropdown de Sugerencias Instantáneas */}
          {isSearchFocused && inputValue.trim().length >= 2 && suggestedProducts.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[390px] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_48px_-12px_rgba(15,23,42,0.18)] divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/90">
                <span>Resultados directos</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>Precios Mayoristas</span>
              </div>

              {suggestedProducts.slice(0, 5).map((p) => (
                <div
                  key={p.codigo}
                  onClick={() => handleSuggestionClick(p.nombre)}
                  className="flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200/70 bg-white flex items-center justify-center">
                      {p.imagen ? (
                        <Image
                          src={p.imagen}
                          alt={p.nombre}
                          fill
                          sizes="40px"
                          className="object-contain p-0.5"
                        />
                      ) : (
                        <span className="text-sm">{EMOJI_POR_CATEGORIA[p.categoria] || "📦"}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {p.nombre}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                        {p.categoria}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className="text-xs font-extrabold text-slate-900 tabular-nums"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatPrice(p.precio)}
                    </span>
                    {onQuickAddToCart && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAddToCart(p);
                        }}
                        className="rounded-lg bg-slate-900 hover:bg-[#EF233C] text-white font-bold text-[11px] px-2.5 py-1.5 transition-colors active:scale-95"
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

        {/* Carrito en Desktop (hidden en móvil, md:flex en fila principal) */}
        <div className="hidden md:flex shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Ver carrito con ${cartQty} productos`}
            className={`relative flex h-10 items-center justify-center gap-2 rounded-xl border px-3 transition-all active:scale-95 ${
              cartQty > 0
                ? "border-slate-900 bg-slate-900 text-white shadow-[0_6px_16px_-4px_rgba(15,23,42,0.28)] hover:bg-slate-800"
                : "border-slate-200/90 bg-white text-slate-900 shadow-2xs hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="hidden sm:inline text-xs font-bold tracking-tight">Pedido</span>
            {cartQty > 0 && (
              <span
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EF233C] px-1.5 text-[11px] font-extrabold text-white tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {cartQty > 99 ? "99+" : cartQty}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Fila Inferior: Barra Horizontal de Categorías estilo Lucian #242 ── */}
      <nav
        aria-label="Rubros y categorías"
        className="relative mx-auto max-w-[1280px] px-3 pb-2 pt-0.5 sm:px-5 w-full overflow-hidden border-t border-slate-100"
      >
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 scroll-smooth touch-pan-x pr-8"
        >
          {/* Píldora: Todos */}
          <button
            type="button"
            aria-current={isTodosActive ? "true" : "false"}
            onClick={() => {
              if (isOfertasActive) onToggleOfertas();
              if (isFavoritosActive) onToggleFavoritos();
              onSelectCategory("Todos");
            }}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-2xs ${
              isTodosActive
                ? "bg-slate-900 text-white shadow-[0_4px_12px_-2px_rgba(15,23,42,0.25)] border border-slate-900"
                : "border border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Todos</span>
          </button>

          {/* Píldora: Ofertas */}
          <button
            type="button"
            aria-current={isOfertasActive ? "true" : "false"}
            onClick={onToggleOfertas}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-2xs ${
              isOfertasActive
                ? "bg-[#EF233C] text-white shadow-[0_4px_12px_-2px_rgba(239,35,60,0.35)] border border-[#EF233C]"
                : "border border-red-200/80 bg-red-50/70 text-[#EF233C] hover:bg-red-100/70"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>Ofertas</span>
          </button>

          {/* Píldora: Favoritos */}
          <button
            type="button"
            aria-current={isFavoritosActive ? "true" : "false"}
            onClick={onToggleFavoritos}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-2xs ${
              isFavoritosActive
                ? "bg-[#EF233C] text-white shadow-[0_4px_12px_-2px_rgba(239,35,60,0.35)] border border-[#EF233C]"
                : "border border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill={isFavoritosActive ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isFavoritosActive ? "text-white" : "text-[#EF233C]"}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Favoritos</span>
            {favoritosCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none ${
                  isFavoritosActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-700"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {favoritosCount}
              </span>
            )}
          </button>

          {/* Separador vertical */}
          <div className="h-4 w-px bg-slate-200 shrink-0 mx-0.5" />

          {/* Píldoras de Categorías Oficiales */}
          {categorias.map((cat) => {
            const emoji = EMOJI_POR_CATEGORIA[cat] || "📦";
            const isSelected = !isOfertasActive && !isFavoritosActive && activeCat === cat;

            const cleanName = cat
              .toLowerCase()
              .replace(/artículos del /, "")
              .replace(/de la /, "");
            const titleCase = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

            return (
              <button
                key={cat}
                type="button"
                aria-current={isSelected ? "true" : "false"}
                onClick={() => {
                  if (isOfertasActive) onToggleOfertas();
                  if (isFavoritosActive) onToggleFavoritos();
                  onSelectCategory(cat);
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shadow-2xs ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-[0_4px_12px_-2px_rgba(15,23,42,0.22)] font-bold border border-slate-900"
                    : "border border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-[13px] leading-none">{emoji}</span>
                <span>{titleCase}</span>
              </button>
            );
          })}
        </div>

        {/* Desvanecimiento derecho sutil para sugerir scroll lateral */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />
      </nav>
    </header>
  );
}
