// filepath: src/components/catalogo/Hero.tsx
// Lucian UX/UI Prompt #216 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#216
// Lucian UX/UI Prompt #243 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#243
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Producto } from "@/types";
import { SUCURSALES } from "@/lib/sucursales";
import { haptic } from "@/lib/haptic";

interface HeroProps {
  onOpenCart?: () => void;
  cartQty?: number;
  cartTotal?: number;
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
  { label: "Limpieza", query: "limpieza" },
];

const WHOLESALE_PILLARS = [
  {
    id: "factory",
    title: "Precios directos de fábrica",
    subtitle: "Escalas por bulto y unidad sin intermediarios",
    accent: "#EF233C",
    delay: "0s",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      </svg>
    ),
  },
  {
    id: "stock",
    title: "Stock permanente",
    subtitle: "+1.900 referencias activas listas para despacho",
    accent: "#10B981",
    delay: "1.4s",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: "delivery",
    title: "Envío a domicilio",
    subtitle: "Confirmación inmediata directo por WhatsApp",
    accent: "#38BDF8",
    delay: "2.8s",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

export default function Hero({
  onOpenUser,
  isLoggedIn = false,
  userDisplayName,
  onSearchSubmit,
  onSelectSuggestion,
  sucursalId = null,
  onChangeBranch,
}: HeroProps) {
  const sucursalObj = SUCURSALES.find((s) => s.id === sucursalId);
  const sucursalNombre = sucursalObj ? sucursalObj.nombre : "Canelones";
  const [activePillar, setActivePillar] = useState<string | null>(null);

  const handleTagClick = (query: string) => {
    haptic.add();
    if (onSelectSuggestion) onSelectSuggestion(query);
    else if (onSearchSubmit) onSearchSubmit(query);
  };

  return (
    <section className="ux relative w-full bg-[#0B0F19] text-white border-b border-slate-800/90 overflow-hidden select-none">
      {/* Textura arquitectónica sutil sin blobs genéricos */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(239,35,60,0.55), transparent)",
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-3 sm:px-5 py-3.5 sm:py-5 flex flex-col gap-3">
        {/* Fila Principal: Identidad Mayorista, Propuesta de Valor y Accesos */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)] ring-1 ring-white/20 shrink-0">
              <Image
                src="/logo.png"
                alt="El Remate Mayorista"
                fill
                sizes="56px"
                priority
                className="object-contain p-0.5"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.08em] text-white bg-[#EF233C] px-2.5 py-0.5 rounded-full shadow-[0_2px_10px_rgba(239,35,60,0.4)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Distribuidora Mayorista
                </span>
                {onChangeBranch ? (
                  <button
                    type="button"
                    onClick={onChangeBranch}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white font-semibold transition-colors"
                  >
                    <span>Sucursal {sucursalNombre}</span>
                    <span className="text-[10px] text-slate-400 underline">cambiar</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-300 font-semibold hidden sm:inline">
                    Abastecimiento directo para comercios y familias
                  </span>
                )}
              </div>

              <h1
                className="text-xl sm:text-2xl md:text-[28px] font-black tracking-tight text-white mt-1 truncate leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                El Remate{" "}
                <span className="text-[#EF233C]">{sucursalNombre}</span>
              </h1>
            </div>
          </div>

          {/* Accesos Rápidos: Guía Marti & Mi Cuenta */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link
              href="/tutorial"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 px-3 py-1.5 rounded-xl transition-all active:scale-95 no-underline"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF233C" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="#EF233C" />
              </svg>
              <span>Cómo comprar</span>
            </Link>

            {onOpenUser && (
              <button
                onClick={onOpenUser}
                type="button"
                className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all active:scale-95 ${
                  isLoggedIn
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-white/[0.07] text-slate-200 border-white/12 hover:text-white hover:bg-white/[0.14]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLoggedIn ? "bg-emerald-400" : "bg-slate-400"}`} />
                <span className="truncate max-w-[130px]">
                  {isLoggedIn ? userDisplayName || "Mi Cuenta" : "Iniciar Sesión"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Pilares de Valor Mayorista interactivos con destello Lucian #243 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {WHOLESALE_PILLARS.map((pillar) => {
            const isExpanded = activePillar === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActivePillar(isExpanded ? null : pillar.id)}
                aria-pressed={isExpanded}
                className="group relative flex items-center gap-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 px-3 py-2 text-left overflow-hidden transition-all active:scale-[0.99]"
              >
                {/* Efecto de destello periódico Lucian #243 */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -skew-x-12"
                  style={{
                    animation: "u243-sh 6.5s ease-in-out infinite",
                    animationDelay: pillar.delay,
                  }}
                />
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10"
                  style={{
                    backgroundColor: `${pillar.accent}20`,
                    color: pillar.accent,
                  }}
                >
                  {pillar.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-white tracking-tight truncate">
                      {pillar.title}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                      ✓ Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300/85 font-medium truncate">
                    {pillar.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Fila de Búsquedas Frecuentes de Alto Volumen */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF233C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span className="hidden sm:inline">Alta rotación:</span>
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag.query}
              type="button"
              onClick={() => handleTagClick(tag.query)}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-[#EF233C] hover:text-white border border-white/10 hover:border-[#EF233C] px-3 py-1 rounded-full whitespace-nowrap transition-all active:scale-95 shrink-0"
            >
              <span>{tag.label}</span>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <path d="M5 11L11 5M11 5H6M11 5V10" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
