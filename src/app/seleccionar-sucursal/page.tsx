// filepath: src/app/seleccionar-sucursal/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SUCURSALES, calcularDistanciaKm, type Sucursal } from "@/lib/sucursales";
import {
  getAllBranchesCatalogSummary,
  type BranchCatalogSummary,
} from "@/lib/branch-catalog";
import * as ls from "@/lib/ls";
import { useCart } from "@/lib/cart-context";
import { haptic } from "@/lib/haptic";

interface SucursalConDistancia extends Sucursal {
  distanceKm?: number;
}

export default function SeleccionarSucursalPage() {
  const router = useRouter();
  const [currentSucursal, setCurrentSucursal] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);
  const [summaries, setSummaries] = useState<Record<string, BranchCatalogSummary>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<boolean>(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { items: cartItems, clearCart } = useCart();

  useEffect(() => {
    setMounted(true);
    setCurrentSucursal(ls.getSelectedSucursal());
    SUCURSALES.forEach((s) => {
      router.prefetch(`/catalogo?sucursal=${s.id}`);
    });

    let cancelled = false;
    getAllBranchesCatalogSummary()
      .then((res) => {
        if (!cancelled) {
          setSummaries(res.branches);
        }
      })
      .catch((err) => {
        console.warn("No se pudo cargar el resumen de catálogos por sucursal:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingSummaries(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalización.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError("No pudimos acceder a tu ubicación. Elegí tu sucursal de la lista.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleSelect = (id: string) => {
    if (cartItems.length > 0 && currentSucursal && id !== currentSucursal) {
      const confirmacion = window.confirm(
        "Al cambiar de sucursal se vaciará tu carrito actual porque los catálogos y precios varían por zona. ¿Deseas cambiar de sucursal?"
      );
      if (!confirmacion) return;
      clearCart();
    }

    haptic.add();
    ls.setSelectedSucursal(id);
    const params = new URLSearchParams(window.location.search);
    params.set("sucursal", id);
    router.push(`/catalogo?${params.toString()}`);
  };

  const orderedSucursales: SucursalConDistancia[] = useMemo(() => {
    const queryLower = searchQuery.trim().toLowerCase();
    const list: SucursalConDistancia[] = SUCURSALES.map((s) => {
      if (!userCoords) return s;
      return {
        ...s,
        distanceKm: calcularDistanciaKm(userCoords.lat, userCoords.lng, s.lat, s.lng),
      };
    }).filter(
      (s) =>
        !queryLower ||
        s.nombre.toLowerCase().includes(queryLower) ||
        s.direccion.toLowerCase().includes(queryLower) ||
        s.zona.toLowerCase().includes(queryLower)
    );

    if (userCoords) {
      list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return list;
  }, [searchQuery, userCoords]);

  const nearestId = userCoords && orderedSucursales.length > 0 ? orderedSucursales[0].id : null;

  const savedSucursalObj = useMemo(
    () => SUCURSALES.find((s) => s.id === currentSucursal) || null,
    [currentSucursal]
  );

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0B09]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EF233C] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0D0B09] font-body text-gray-200">
      {/* Background warm glows */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle 650px at 10% 0%, rgba(239, 35, 60, 0.14) 0%, transparent 100%),
            radial-gradient(circle 550px at 90% 100%, rgba(239, 35, 60, 0.09) 0%, transparent 100%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:py-14 flex flex-col min-h-screen justify-between">
        <div>
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/[0.1] hover:text-white transition-all no-underline"
            >
              <span>←</span>
              <span>Volver al inicio</span>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              6 Sucursales Activas · Canelones
            </span>
          </div>

          {/* Header */}
          <header className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="mb-6 hover:opacity-90 transition-opacity">
              <Image
                src="/logo.png"
                alt="Distribuidora El Remate"
                width={140}
                height={140}
                className="object-contain filter drop-shadow-[0_4px_16px_rgba(239,35,60,0.3)]"
                priority
              />
            </Link>

            <span className="rounded-full bg-[#EF233C]/15 border border-[#EF233C]/35 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#FF5A6E] shadow-[0_2px_10px_rgba(239,35,60,0.18)] mb-4">
              Paso 1 · Catálogos Independientes por Sucursal
            </span>

            <h1 className="font-bebas text-4xl sm:text-6xl tracking-wider text-white mb-3 leading-none">
              SELECCIONA TU <span className="text-[#EF233C]">SUCURSAL MÁS CERCANA</span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-gray-400 font-medium leading-relaxed">
              Cada sucursal cuenta con su propio catálogo actualizado, disponibilidad de stock y número directo de atención por WhatsApp.
            </p>
          </header>

          {/* Current Active Banner */}
          {savedSucursalObj && (
            <div className="mx-auto max-w-xl w-full mb-7 rounded-2xl border border-emerald-500/35 bg-emerald-950/30 backdrop-blur-md p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  ✓ Tu última sucursal seleccionada
                </p>
                <p className="text-sm font-bold text-white">
                  Sucursal {savedSucursalObj.nombre} · {savedSucursalObj.direccion}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelect(savedSucursalObj.id)}
                className="w-full sm:w-auto shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-5 text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer"
              >
                Entrar al Catálogo ⚡
              </button>
            </div>
          )}

          {/* Search Filter & Nearest Location Button */}
          <div className="mx-auto max-w-2xl w-full mb-9 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar sucursal por ciudad, zona o calle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] px-4 py-3 pl-11 text-sm text-white placeholder-gray-500 focus:border-[#EF233C] focus:outline-none focus:ring-1 focus:ring-[#EF233C] transition-all"
              />
              <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-white"
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EF233C]/40 bg-[#EF233C]/15 hover:bg-[#EF233C] text-white px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all shrink-0 cursor-pointer disabled:opacity-60"
            >
              <span>{locating ? "⏳" : "📍"}</span>
              <span>{locating ? "Ubicando..." : "Detectar más cercana"}</span>
            </button>
          </div>

          {locationError && (
            <p className="text-center text-xs text-amber-400 mb-6 -mt-5 font-semibold">
              ⚠️ {locationError}
            </p>
          )}

          {/* Grid Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {orderedSucursales.map((sucursal) => {
              const isActive = currentSucursal === sucursal.id;
              const isNearest = nearestId === sucursal.id;
              const summary = summaries[sucursal.id];

              return (
                <div
                  key={sucursal.id}
                  onClick={() => handleSelect(sucursal.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(sucursal.id);
                    }
                  }}
                  className={`group cursor-pointer flex flex-col justify-between rounded-2xl border p-6 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${
                    isNearest
                      ? "border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.22)] ring-1 ring-emerald-400/30"
                      : isActive
                      ? "border-[#EF233C] shadow-[0_0_30px_rgba(239,35,60,0.25)]"
                      : "border-white/10 hover:border-[#EF233C]/60 hover:shadow-[0_0_25px_rgba(239,35,60,0.18)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-2xl group-hover:bg-[#EF233C]/20 group-hover:border-[#EF233C]/40 transition-colors">
                          🏪
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          {sucursal.zona}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {isNearest && (
                          <span className="rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider shadow-sm">
                            📍 MÁS CERCANA
                          </span>
                        )}
                        {isActive && (
                          <span className="rounded-full bg-[#EF233C] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                            SELECCIONADA
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="font-bebas text-3xl tracking-wider text-white mb-2 group-hover:text-[#FF5A6E] transition-colors">
                      Sucursal {sucursal.nombre}
                    </h2>

                    <div className="space-y-1.5 text-sm">
                      <p className="text-gray-200 font-semibold flex items-center gap-2">
                        <span>📍</span>
                        <span>{sucursal.direccion}</span>
                      </p>
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                        <span>⏰</span>
                        <span>{sucursal.horario}</span>
                      </p>
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                        <span>📞</span>
                        <span>WhatsApp: {sucursal.telefono}</span>
                      </p>
                      {sucursal.distanceKm !== undefined && (
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-2 pt-0.5">
                          <span>🧭</span>
                          <span>A aprox. {sucursal.distanceKm.toFixed(1)} km de tu ubicación</span>
                        </p>
                      )}
                    </div>

                    {/* Catalog badge */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                      {loadingSummaries ? (
                        <span className="text-gray-500 animate-pulse">Verificando catálogo...</span>
                      ) : summary ? (
                        <>
                          <span className="text-gray-300 font-semibold">
                            📦 <strong className="text-white">{summary.activeCount}</strong> productos disponibles
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              summary.hasCustomCatalog
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-white/10 text-gray-300"
                            }`}
                          >
                            {summary.hasCustomCatalog ? "Catálogo Propio" : "Catálogo Activo"}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">📦 Catálogo mayorista completo</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(sucursal.id);
                      }}
                      className={`w-full rounded-xl py-3.5 px-4 font-bebas text-lg tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isNearest
                          ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
                          : isActive
                          ? "bg-[#EF233C] text-white shadow-[0_4px_16px_rgba(239,35,60,0.4)]"
                          : "bg-white/10 text-white border border-white/10 group-hover:bg-[#EF233C] group-hover:border-[#EF233C] group-hover:shadow-[0_4px_16px_rgba(239,35,60,0.4)]"
                      }`}
                    >
                      <span>VER CATÁLOGO {sucursal.nombre}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {orderedSucursales.length === 0 && (
              <div className="col-span-full py-16 text-center rounded-2xl border border-white/10 bg-white/[0.02]">
                <span className="text-5xl mb-4 block">🔍</span>
                <h3 className="font-bebas text-2xl text-white tracking-wider mb-2">
                  No se encontraron sucursales
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Probá buscando otra zona o limpiando el filtro.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl bg-[#EF233C] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white"
                >
                  Mostrar todas las sucursales
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-14 pt-6 border-t border-white/10 text-center text-xs text-gray-500 font-semibold flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Distribuidora El Remate · Canelones, Uruguay.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Volver al inicio 🏠
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
