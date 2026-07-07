"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { BrandStrip, BrandShowcase, NativeStoryCard } from "@/components/ads";
import { useBrands } from "@/hooks/useBrands";
import { SUCURSALES } from "@/lib/sucursales";
import * as ls from "@/lib/ls";
import { useToast } from "@/lib/toast-context";
import { useCart } from "@/lib/cart-context";

// Subcomponentes extraídos
import HeroLanding from "@/components/catalogo/HeroLanding";
import TickerMarquee from "@/components/catalogo/TickerMarquee";
import FeatureCards from "@/components/catalogo/FeatureCards";
import StepProcess from "@/components/catalogo/StepProcess";
import BranchSection from "@/components/catalogo/BranchSection";
import BottomNavBar from "@/components/catalogo/BottomNavBar";

const CATEGORIAS = [
  { icono: "🫗", nombre: "ACEITES Y GRASAS", titulo: "Aceites y Grasas" },
  { icono: "🏠", nombre: "ARTÍCULOS DEL HOGAR", titulo: "Hogar" },
  { icono: "🍺", nombre: "BEBIDAS ALCOHÓLICAS", titulo: "Bebidas Alcohólicas" },
  { icono: "🥤", nombre: "BEBIDAS SIN ALCOHOL", titulo: "Bebidas sin Alcohol" },
  { icono: "🥩", nombre: "CARNES Y EMBUTIDOS", titulo: "Fiambres y Carnes" },
  { icono: "🌿", nombre: "CONDIMENTOS Y ESPECIAS", titulo: "Especias" },
  { icono: "🧊", nombre: "CONGELADOS", titulo: "Congelados" },
  { icono: "🥫", nombre: "CONSERVAS Y ENLATADOS", titulo: "Conservas" },
  { icono: "📦", nombre: "DESCARTABLES Y ART. DEL HOGAR", titulo: "Descartables" },
  { icono: "🍯", nombre: "DULCES Y MERMELADAS", titulo: "Dulces y Mermeladas" },
  { icono: "🍎", nombre: "FRUTAS Y VERDURAS", titulo: "Frutas y Verduras" },
  { icono: "🍬", nombre: "GOLOSINAS Y SNACKS", titulo: "Golosinas y Snacks" },
  { icono: "🌾", nombre: "HARINAS, PASTAS Y CEREALES", titulo: "Harinas y Pastas" },
  { icono: "🧴", nombre: "HIGIENE PERSONAL", titulo: "Higiene Personal" },
  { icono: "🥛", nombre: "LÁCTEOS Y HUEVOS", titulo: "Lácteos y Huevos" },
  { icono: "🧹", nombre: "LIMPIEZA DEL HOGAR", titulo: "Limpieza" },
  { icono: "🐾", nombre: "MASCOTAS", titulo: "Mascotas" },
  { icono: "🥖", nombre: "PANADERÍA Y REPOSTERÍA", titulo: "Panadería" },
  { icono: "🥫", nombre: "SALSAS Y ADEREZOS", titulo: "Salsas y Aderezos" },
  { icono: "☕", nombre: "YERBA, TÉ Y CAFÉ", titulo: "Yerba, Té y Café" },
  { icono: "📦", nombre: "OTROS", titulo: "Otros" },
];

export default function LandingPage() {
  const router = useRouter();
  const toast = useToast();
  const [configCats, setConfigCats] = useState<Record<string, string>>({});
  const [selectedSucursal, setSelectedSucursal] = useState<string>("");
  const { brands } = useBrands();
  const { items: cartItems, clearCart, totalQty } = useCart();

  const handleSelectSucursal = (id: string) => {
    const sucursal = SUCURSALES.find(s => s.id === id);
    const nombre = sucursal ? sucursal.nombre : "";

    if (id === selectedSucursal) {
      handleEnterCatalog(id);
      return;
    }

    if (cartItems.length > 0) {
      const confirmacion = confirm(
        "Al cambiar de sucursal se vaciará tu carrito actual porque los catálogos y precios varían por zona. ¿Deseas cambiar de sucursal?"
      );
      if (!confirmacion) return;
      clearCart();
    }

    ls.setSelectedSucursal(id);
    setSelectedSucursal(id);
    toast.success(`🏪 Seleccionada: ${nombre}. Ahora podés navegar por categorías o ingresar al catálogo.`);
  };

  const handleEnterCatalog = (id: string) => {
    const sucursal = SUCURSALES.find(s => s.id === id);
    const nombre = sucursal ? sucursal.nombre : "";

    if (cartItems.length > 0 && id !== selectedSucursal) {
      const confirmacion = confirm(
        "Al cambiar de sucursal se vaciará tu carrito actual porque los catálogos y precios varían por zona. ¿Deseas cambiar de sucursal?"
      );
      if (!confirmacion) return;
      clearCart();
    }

    ls.setSelectedSucursal(id);
    setSelectedSucursal(id);
    toast.success(`🏪 Cargando catálogo de ${nombre}...`);
    router.push(`/catalogo?sucursal=${id}`);
  };

  useEffect(() => {
    setSelectedSucursal(ls.getSelectedSucursal());

    async function load() {
      try {
        const snap = await getDoc(doc(db, "configuracion", "categorias"));
        if (snap.exists()) {
          setConfigCats(snap.data());
        }
      } catch (e) {
        console.error("Error cargando config de categorías:", e);
      }
    }
    load();
  }, []);

  return (
    <div className="font-body text-[#111111] bg-[#F5F2EE]">
      {/* Hero Landing Section */}
      <HeroLanding selectedSucursal={selectedSucursal} />

      {/* Marquee Ticker */}
      <TickerMarquee />

      {/* Banner Especial Cumpleaños */}
      <section className="py-6 px-5 max-w-[1200px] mx-auto">
        <Link 
          href="/fiesta" 
          className="relative block w-full rounded-[24px] overflow-hidden bg-[#0A0A0A] text-white shadow-[0_10px_40px_rgba(229,57,53,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(229,57,53,0.25)] border border-[#E53935]/30 group"
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-10" />
          
          {/* Imagen de fondo */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-transform duration-700 group-hover:scale-105" />
          
          {/* Elementos Decorativos Neon */}
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#E53935] blur-[100px] rounded-full opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity" />
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#FFB300] blur-[100px] rounded-full opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />

          <div className="relative z-20 p-8 md:p-12 flex flex-col justify-center h-full min-h-[220px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E53935] text-white text-[10px] md:text-xs font-bold tracking-[2px] uppercase rounded-full w-max mb-4 shadow-[0_0_15px_rgba(229,57,53,0.5)]">
              <span className="animate-pulse">🔥</span> NUEVO
            </span>
            <h2 className="font-bebas text-[clamp(2.5rem,5vw,4rem)] leading-[0.85] tracking-[1px] mb-3">
              ARMÁ TU CUMPLEAÑOS <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB300] to-[#E53935]">
                A PRECIO MAYORISTA
              </span>
            </h2>
            <p className="text-white/70 text-sm md:text-[1.1rem] font-light max-w-[450px] mb-6 leading-relaxed">
              Combos explosivos de hamburguesas, bebidas frías y hielo. La mejor fiesta sin fundirte.
            </p>
            <div className="flex items-center gap-3 font-bebas text-xl md:text-2xl text-white group-hover:text-[#FFB300] transition-colors w-max bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
              VER OFERTAS <span className="text-2xl leading-none">→</span>
            </div>
          </div>
        </Link>
      </section>

      {/* Brand Strip (Ads) */}
      <BrandStrip brands={brands} title="Marcas que nos acompañan" dark />

      {/* Feature Cards (Comprá Fácil) */}
      <FeatureCards />

      {/* Brand Showcase */}
      <BrandShowcase brands={brands} />

      {/* Native Stories */}
      {brands && brands.filter(b => b.active && b.story).length > 0 && (
        <section className="py-[60px] px-5 bg-[#F5F0E8]">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold tracking-[4px] uppercase text-[#9C8570] block mb-2">
                Retail Media · Novedades
              </span>
              <h2 className="font-bebas text-[clamp(1.8rem,5vw,2.8rem)] text-[#1A1410] tracking-[3px] margin-0">
                HISTORIAS DE <span className="text-[#D62828]">NUESTRAS MARCAS</span>
              </h2>
            </div>
            <div className="flex flex-col gap-6">
              {brands.filter(b => b.active && b.story).slice(0, 3).map((brand) => (
                <NativeStoryCard
                  key={brand.id}
                  brand={brand}
                  onBrandFilter={(brandName) => router.push(`/catalogo?search=${encodeURIComponent(brandName)}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorías */}
      <section className="py-[80px] px-5 bg-[#F5F0E8]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[48px]">
            <span className="text-[11px] font-bold tracking-[4px] uppercase text-[#9C8570] block mb-2">
              Catálogo
            </span>
            <h2 className="font-bebas text-[clamp(2rem,5vw,3rem)] text-[#1A1410] tracking-[2px] mb-2">
              VARIEDAD DE PRODUCTOS
            </h2>
            <p className="font-serif italic text-[1.1rem] text-[#5C4A35]">
              Todo lo que necesitás en un solo lugar
            </p>
          </div>

          <div className="categorias-grid grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {CATEGORIAS.map((cat, i) => (
              <Link
                key={i}
                href={
                  selectedSucursal
                    ? `/catalogo?categoria=${encodeURIComponent(cat.nombre)}&sucursal=${selectedSucursal}`
                    : `/catalogo?categoria=${encodeURIComponent(cat.nombre)}`
                }
                className="bg-white rounded-[12px] border border-[#DDD8D0] hover:border-[#C8C2B8] p-6 md:p-3 text-center no-underline transition-all duration-150 flex flex-col items-center gap-2.5 shadow-[0_1px_3px_rgba(17,11,8,0.08)] hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(17,11,8,0.12)]"
              >
                <div className="relative w-[45px] h-[45px] flex items-center justify-center">
                  {configCats[cat.nombre] ? (
                    <Image
                      src={configCats[cat.nombre]}
                      alt={cat.titulo}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-[2.2rem]">{cat.icono}</span>
                  )}
                </div>
                <span className="text-[0.75rem] font-bold text-[#111111] tracking-[0.3px] leading-tight">
                  {cat.titulo}
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href={selectedSucursal ? `/catalogo?sucursal=${selectedSucursal}` : "/catalogo"}
              className="inline-flex items-center gap-2 bg-[#1A1410] text-white rounded-[12px] px-8 py-3.5 font-bebas text-[1.2rem] tracking-[2px] no-underline transition-all duration-150 hover:bg-[#2C2318]"
            >
              VER CATÁLOGO COMPLETO →
            </Link>
          </div>
        </div>
      </section>

      {/* Step Process */}
      <StepProcess selectedSucursal={selectedSucursal} />

      {/* Branch Section */}
      <BranchSection
        selectedSucursal={selectedSucursal}
        onSelectSucursal={handleSelectSucursal}
        onEnterCatalog={handleEnterCatalog}
      />

      {/* Contacto */}
      <section className="py-[60px] px-5 bg-[#1A1410] text-center relative overflow-hidden">
        {/* Glow decorativo cálido */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(214,40,40,0.12) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-[600px] mx-auto relative z-10">
          <h2 className="font-bebas text-[clamp(2rem,5vw,3rem)] text-white tracking-[2px] mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] leading-tight">
            ¿TENÉS DUDAS O QUERÉS HACER UN PEDIDO?
          </h2>
          <p className="text-[1.05rem] text-[#C8C3BC] mb-8 font-semibold drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
            Contactanos por WhatsApp y te respondemos al instante
          </p>
          <a
            href="https://wa.me/59899322325"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#1A7A42] text-white rounded-[12px] px-9 py-4.5 font-bebas text-[1.4rem] tracking-[2px] no-underline shadow-[0_6px_24px_rgba(26,122,66,0.5),_0_0_0_2px_rgba(255,255,255,0.15)] transition-all hover:bg-[#145E33] hover:-translate-y-1 hover:scale-[1.02] border border-white/20"
          >
            📱 099 322 325
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1410] py-8 px-5 text-center border-t border-[#3D3226]">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-4">
            <Image
              src="/logo.png"
              alt="Distribuidora El Remate"
              width={60}
              height={60}
              className="object-contain opacity-60 mx-auto"
            />
          </div>
          <p className="text-[0.75rem] text-white/35 mb-1.5">
            Copyright © {new Date().getFullYear()} Distribuidora El Remate. Todos los derechos reservados.
          </p>
          <p className="text-[0.65rem] text-white/20">
            Powered by Dafna y Mateo Asencio
          </p>
        </div>
      </footer>

      {/* Navigation Bar (Mobile) */}
      <BottomNavBar
        activeTab="inicio"
        onTabSelect={(tab: string) => {
          if (tab === "buscar") {
            router.push("/catalogo?focusSearch=true");
          } else if (tab === "favoritos") {
            router.push("/catalogo?tab=favoritos");
          } else if (tab === "inicio") {
            router.push("/");
          }
        }}
        cartQty={totalQty}
        onOpenCart={() => router.push("/catalogo?openCart=true")}
        onOpenUser={() => router.push("/cuenta")}
      />
    </div>
  );
}
