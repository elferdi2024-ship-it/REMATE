"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import type { Producto } from "@/types";
import { SUCURSALES } from "@/lib/sucursales";
import { haptic } from "@/lib/haptic";
import { formatPrice } from "@/lib/format";

interface HeroProps {
  onOpenCart: () => void;
  cartQty: number;
  cartTotal: number;
  onOpenUser?: () => void;
  onShareCart?: () => void;
  isLoggedIn?: boolean;
  userDisplayName?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  suggestedProducts?: Producto[];
  recentSearches?: string[];
  onSelectSuggestion?: (query: string) => void;
  sucursalId?: string | null;
  onChangeBranch?: () => void;
}

const POPULAR_TAGS = [
  { label: "Mayonesa", query: "mayonesa" },
  { label: "Refrescos", query: "refresco" },
  { label: "Hamburguesas", query: "hamburguesa" },
  { label: "Helados", query: "helado" },
  { label: "Cerveza", query: "cerveza" },
  { label: "Aceites", query: "aceite" },
];

export default function Hero({
  onOpenCart,
  cartQty,
  cartTotal,
  onOpenUser,
  onShareCart,
  isLoggedIn = false,
  userDisplayName,
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  suggestedProducts = [],
  recentSearches = [],
  onSelectSuggestion,
  sucursalId = null,
  onChangeBranch,
}: HeroProps) {
  const sucursalObj = SUCURSALES.find((s) => s.id === sucursalId);
  const [inputValue, setInputValue] = useState(searchQuery || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sincronizar input cuando cambie la query externa
  useEffect(() => {
    setInputValue(searchQuery || "");
  }, [searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onSearchChange?.(val);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchCommit = (term: string) => {
    setIsSearchFocused(false);
    onSearchChange?.(term);
    if (onSearchSubmit) onSearchSubmit(term);
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-[#7F1D1D] via-[#450A0A] to-[#1F0404] text-white overflow-hidden border-b border-red-900/60 shadow-xl">
      {/* Background Image con mayor visibilidad y tinte rojo de marca */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/catalogo-hero.jpg"
          alt="Catálogo Mayorista El Remate"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-75"
        />
        {/* Overlays de gradiente rojo cálido para contraste y atmósfera de marca */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#450A0A]/90 via-[#7F1D1D]/75 to-[#1F0404]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F0404] via-transparent to-[#450A0A]/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex flex-col gap-4">
        {/* Top Contextual Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-white/15">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Inicio</span>
            </Link>

            <span className="text-slate-600">/</span>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase text-white bg-[#EF233C]/20 border border-[#EF233C]/40 px-2.5 py-0.5 rounded-full shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF233C] animate-pulse" />
              Mayorista Canelones
            </span>

            {sucursalObj && (
              <button
                type="button"
                onClick={onChangeBranch}
                className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-3 py-1 rounded-full transition-all active:scale-95 shadow-xs"
              >
                <span>🏪 {sucursalObj.nombre}</span>
                <span className="text-[#EF233C] text-[10px] font-black">· Cambiar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tutorial"
              className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full transition-all"
            >
              <span>🎙️ Guía Marti</span>
            </Link>

            {onOpenUser && (
              <button
                onClick={onOpenUser}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                  isLoggedIn
                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/60"
                    : "bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span className="truncate max-w-[140px]">
                  {isLoggedIn ? userDisplayName || "Mi Cuenta" : "Iniciar Sesión"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Main Header: Prominent Logo + Identity + Cart Quick Status */}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-5">
          {/* Logo & Headline */}
          <div className="flex items-center gap-4 sm:gap-6 text-left w-full md:w-auto">
            <Link href="/" className="shrink-0 transition-transform duration-200 hover:scale-105 focus:outline-none">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="El Remate Mayorista"
                  width={112}
                  height={112}
                  priority
                  className="object-contain w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                />
              </div>
            </Link>

            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#EF233C] leading-none mb-1">
                Distribuidora Mayorista
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display leading-tight">
                El Remate <span className="text-slate-400 font-normal">Canelones</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5 line-clamp-1">
                Precios directos de fábrica por bulto y unidad. Envío rápido o retiro.
              </p>
            </div>
          </div>

          {/* Cart CTA button */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={onOpenCart}
              className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
                cartQty > 0
                  ? "bg-[#EF233C] hover:bg-[#C01730] text-white shadow-[#EF233C]/30"
                  : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-700"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span>{cartQty > 0 ? "Ver Mi Pedido" : "Empezar Pedido"}</span>
              {cartQty > 0 && (
                <>
                  <span className="bg-white/25 px-2 py-0.5 rounded-full text-[11px] font-mono font-black">
                    {cartQty}
                  </span>
                  <span className="font-mono font-black text-sm ml-0.5">
                    {formatPrice(cartTotal)}
                  </span>
                </>
              )}
            </button>

            {onShareCart && cartQty > 0 && (
              <button
                onClick={onShareCart}
                title="Compartir pedido actual"
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Predictive Search Bar with Glow Focuser */}
        <div className="relative w-full max-w-4xl mx-auto mt-1" ref={searchContainerRef}>
          <div
            className={`relative flex items-center bg-slate-900/95 backdrop-blur-md border rounded-2xl transition-all shadow-xl ${
              isSearchFocused
                ? "border-[#EF233C] ring-2 ring-[#EF233C]/25 bg-slate-950"
                : "border-slate-700/80 hover:border-slate-600"
            }`}
          >
            <div className="pl-4 pr-2 text-slate-400 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Buscá entre 1900+ productos por nombre, marca o categoría..."
              value={inputValue}
              onChange={handleChange}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchCommit(inputValue);
                }
              }}
              aria-label="Buscar producto en el catálogo"
              className="w-full bg-transparent py-3.5 px-2 text-sm sm:text-base text-white placeholder-slate-400 font-semibold outline-none"
            />

            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue("");
                  onSearchChange?.("");
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSearchCommit(inputValue)}
              className="hidden sm:inline-flex items-center gap-1.5 mr-2 px-5 py-2.5 bg-[#EF233C] hover:bg-[#C01730] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
            >
              <span>Buscar</span>
            </button>
          </div>

          {/* Predictive Search Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {!searchQuery.trim() ? (
                <div className="p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Búsquedas Recientes
                  </div>
                  {recentSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            haptic.add();
                            setInputValue(term);
                            handleSearchCommit(term);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-950 px-3 py-1.5 rounded-full transition-colors"
                        >
                          <span className="opacity-50">🕒</span> {term}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-1">
                      Escribí para buscar productos o marcas en tiempo real.
                    </p>
                  )}
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                  {suggestedProducts.length > 0 ? (
                    suggestedProducts.map((p) => (
                      <button
                        key={p.codigo}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          haptic.add();
                          setInputValue(p.nombre);
                          handleSearchCommit(p.nombre);
                        }}
                        className="w-full flex items-center justify-between gap-3 p-3 hover:bg-slate-50 text-left transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden p-1">
                            {p.imagen ? (
                              <Image
                                src={p.imagen}
                                alt={p.nombre}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            ) : (
                              <span className="text-base">📦</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {p.nombre}
                            </div>
                            <div className="text-[10px] uppercase font-semibold text-slate-500">
                              {p.categoria}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm font-extrabold text-[#EF233C] font-mono shrink-0">
                          {formatPrice(p.precio)}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No encontramos sugerencias exactas para &quot;{searchQuery}&quot;. Presioná Enter para buscar en todo el catálogo.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Suggestion Tags */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Recomendados:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag.query}
              type="button"
              onClick={() => {
                haptic.add();
                setInputValue(tag.label);
                handleSearchCommit(tag.query);
              }}
              className="text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 px-3 py-1 rounded-full transition-all active:scale-95 shadow-xs"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
