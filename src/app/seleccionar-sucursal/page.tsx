// filepath: src/app/seleccionar-sucursal/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SUCURSALES } from "@/lib/sucursales";
import * as ls from "@/lib/ls";
import { useCart } from "@/lib/cart-context";

export default function SeleccionarSucursalPage() {
  const router = useRouter();
  const [currentSucursal, setCurrentSucursal] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);
  const { items: cartItems, clearCart } = useCart();

  useEffect(() => {
    setMounted(true);
    setCurrentSucursal(ls.getSelectedSucursal());
  }, []);

  const handleSelect = (id: string) => {
    if (cartItems.length > 0) {
      const confirmacion = confirm(
        "Al cambiar de sucursal se vaciará tu carrito actual porque los catálogos y precios varían por zona. ¿Deseas cambiar de sucursal?"
      );
      if (!confirmacion) return;
      clearCart();
    }

    ls.setSelectedSucursal(id);
    const params = new URLSearchParams(window.location.search);
    params.set("sucursal", id);
    router.push(`/catalogo?${params.toString()}`);
  };

  const filteredSucursales = SUCURSALES.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.direccion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSavedSucursalName = () => {
    const found = SUCURSALES.find((s) => s.id === currentSucursal);
    return found ? found.nombre : "";
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0B09]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E8302A] border-t-transparent"></div>
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
            radial-gradient(circle 600px at 0% 0%, rgba(232, 48, 42, 0.12) 0%, transparent 100%),
            radial-gradient(circle 500px at 100% 100%, rgba(232, 48, 42, 0.08) 0%, transparent 100%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 md:py-20 flex flex-col min-h-screen justify-between">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-8 hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="Distribuidora El Remate"
              width={150}
              height={150}
              className="object-contain filter drop-shadow-[0_4px_12px_rgba(232,48,42,0.3)]"
              priority
            />
          </Link>

          <span className="rounded-full bg-[#E8302A]/10 border border-[#E8302A]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#E8302A] shadow-[0_2px_10px_rgba(232,48,42,0.15)] mb-4">
            Bienvenido a Distribuidora El Remate
          </span>

          <h1 className="font-bebas text-4xl sm:text-6xl tracking-wider text-white mb-3">
            SELECCIONA TU <span className="text-[#E8302A]">SUCURSAL</span> CERCANA
          </h1>
          
          <p className="max-w-xl text-sm sm:text-base text-gray-400 font-medium">
            Para ver el catálogo de productos disponibles y coordinar tus pedidos de forma personalizada, por favor elige una de nuestras 6 sucursales.
          </p>
        </header>

        {/* Current Active Banner */}
        {currentSucursal && (
          <div className="mx-auto max-w-md w-full mb-8 rounded-2xl border border-[#1A7A42]/30 bg-[#1A7A42]/5 backdrop-blur-md p-4 text-center">
            <p className="text-xs sm:text-sm font-semibold text-gray-300">
              🏪 Tu sucursal activa: <span className="text-white font-bold">{getSavedSucursalName()}</span>
            </p>
            <button
              onClick={() => router.push(`/catalogo?sucursal=${currentSucursal}`)}
              className="mt-3 w-full rounded-xl bg-[#1A7A42] hover:bg-[#145E33] text-white py-2 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(26,122,66,0.3)] hover:-translate-y-0.5"
            >
              Ir al Catálogo Directamente ⚡
            </button>
          </div>
        )}

        {/* Search Filter */}
        <div className="mx-auto max-w-md w-full mb-10 relative">
          <input
            type="text"
            placeholder="Buscar sucursal por zona o calle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.08] px-4 py-3 pl-11 text-white placeholder-gray-500 focus:border-[#E8302A] focus:outline-none focus:ring-1 focus:ring-[#E8302A] transition-all"
          />
          <span className="absolute left-4 top-3.5 text-gray-500">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3.5 text-gray-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Grid Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 flex-1 items-stretch justify-center">
          {filteredSucursales.map((sucursal) => {
            const isActive = currentSucursal === sucursal.id;
            return (
              <div
                key={sucursal.id}
                onClick={() => handleSelect(sucursal.id)}
                className={`group cursor-pointer flex flex-col justify-between rounded-2xl border p-6 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md transition-all duration-300 hover:scale-[1.03] ${
                  isActive
                    ? "border-[#E8302A] shadow-[0_0_30px_rgba(232,48,42,0.25)]"
                    : "border-white/5 hover:border-[#E8302A]/50 hover:shadow-[0_0_25px_rgba(232,48,42,0.15)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">🏪</span>
                    {isActive && (
                      <span className="rounded-full bg-[#E8302A] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
                        ACTIVA
                      </span>
                    )}
                  </div>

                  <h3 className="font-bebas text-2xl tracking-wider text-white mb-2 group-hover:text-[#E8302A] transition-colors">
                    {sucursal.nombre}
                  </h3>

                  <p className="text-sm text-gray-300 font-semibold mb-2">
                    📍 {sucursal.direccion}
                  </p>
                  
                  <p className="text-xs text-gray-400 font-medium">
                    📞 Teléfono: {sucursal.telefono}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(sucursal.id);
                    }}
                    className={`w-full rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-[#E8302A] text-white shadow-[0_4px_14px_rgba(232,48,42,0.4)]"
                        : "bg-white/5 text-white border border-white/10 group-hover:bg-[#E8302A] group-hover:text-white group-hover:border-[#E8302A] group-hover:shadow-[0_4px_14px_rgba(232,48,42,0.4)]"
                    }`}
                  >
                    Ingresar al Catálogo ➡️
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredSucursales.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="font-bebas text-2xl text-white tracking-wider mb-2">No se encontraron sucursales</h3>
              <p className="text-gray-400 text-sm">Prueba buscando con otro término.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-gray-500 font-semibold flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Distribuidora El Remate. Todos los derechos reservados.</p>
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
