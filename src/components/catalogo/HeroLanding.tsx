"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SUCURSALES } from "@/lib/sucursales";

interface HeroLandingProps {
  selectedSucursal: string;
}

export default function HeroLanding({ selectedSucursal }: HeroLandingProps) {
  const sucursalNombre = SUCURSALES.find(s => s.id === selectedSucursal)?.nombre || "";

  return (
    <section className="bg-[#1A1410] relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Distribuidora El Remate"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Overlay oscuro cálido */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(17,11,8,0.97) 0%, rgba(17,11,8,0.92) 40%, rgba(17,11,8,0.70) 75%, rgba(17,11,8,0.40) 100%)",
          }}
        />
      </div>

      {/* Textura radial cálida animada */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 80% at -5% 50%, rgba(214,40,40,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 105% 20%, rgba(214,40,40,0.12) 0%, transparent 55%)
          `,
          backgroundSize: "200% 200%",
          animation: "animateHeroGradient 10s ease infinite",
        }}
      />

      {/* Contenido */}
      <div className="relative z-[2] w-full max-w-[1200px] mx-auto px-5 py-[80px] md:py-[60px] text-center">
        {/* Logo */}
        <div className="mb-7 flex justify-center">
          <Image
            src="/logo.png"
            alt="Distribuidora El Remate"
            width={180}
            height={180}
            className="object-contain max-w-[80vw] h-auto drop-shadow-[0_4px_20px_rgba(214,40,40,0.3)]"
            priority
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="bg-[#D62828] text-white text-[0.65rem] font-bold tracking-[2.5px] uppercase px-3 py-1 rounded shadow-[0_2px_8px_rgba(214,40,40,0.4)]">
            Mayorista
          </span>
          <span className="text-[0.7rem] font-semibold tracking-[3px] uppercase text-[#D62828] opacity-90">
            Distribuidora · Canelones
          </span>
        </div>

        {/* Título */}
        <h1 className="hero-title font-bebas text-[clamp(2.5rem,8vw,5.5rem)] tracking-[3px] leading-[0.9] text-white mb-5 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
          PRECIOS MAYORISTAS
          <span className="block text-[#D62828] drop-shadow-[0_0_30px_rgba(214,40,40,0.4)]">
            TODOS LOS DÍAS
          </span>
        </h1>

        {/* Descriptor */}
        <div className="flex items-start gap-3 max-w-[600px] mx-auto mb-8">
          <div className="w-1 min-h-[48px] bg-[#E8302A] rounded shrink-0 mt-0.5" />
          <p className="font-serif italic text-[clamp(0.95rem,2.5vw,1.15rem)] text-[#C8C3BC] leading-relaxed font-normal m-0 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
            Todo para tu negocio y tu casa: alimentos, insumos, bebidas y limpieza al mejor precio.
          </p>
        </div>

        {/* CTAs */}
        <div className="cta-buttons flex gap-3 flex-wrap justify-center mb-10">
          <Link
            href={selectedSucursal ? `/catalogo?sucursal=${selectedSucursal}` : "/seleccionar-sucursal"}
            className="bg-[#E8302A] text-white rounded-[12px] px-8 py-3.5 font-bebas text-[1.2rem] tracking-[2px] no-underline flex items-center gap-2 shadow-[0_4px_18px_rgba(232,48,42,0.35)] transition-all hover:bg-[#C4231E] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(232,48,42,0.5)]"
          >
            🛒 VER CATÁLOGO {selectedSucursal ? `(${sucursalNombre.toUpperCase()})` : ""}
          </Link>
          <a
            href="https://wa.me/59899322325"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1A7A42] text-white border border-white/20 rounded-[12px] px-7 py-3.5 font-body text-[1rem] font-extrabold no-underline flex items-center gap-2.5 shadow-[0_4px_20px_rgba(26,122,66,0.4),_0_0_0_1px_rgba(255,255,255,0.1)] transition-all hover:bg-[#145E33] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(26,122,66,0.5)] tracking-[0.5px]"
          >
            📱 WhatsApp
          </a>
          <Link
            href="/tutorial"
            className="bg-white/5 text-white border border-dashed border-white/20 rounded-[12px] px-7 py-3.5 font-body text-[1rem] font-extrabold no-underline flex items-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:bg-white/15 hover:-translate-y-0.5"
          >
            🎤 Guía con &quot;Marti&quot; 🔨
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats inline-flex border border-[#D62828]/30 rounded-[8px] overflow-hidden bg-[#1A1410]/50 backdrop-blur-md flex-wrap">
          {[
            { val: "1900+", lbl: "Productos" },
            { val: "6", lbl: "Sucursales" },
            { val: "wa", lbl: "Pedido Express" },
          ].map((stat, i) => (
            <div
              key={i}
              className="hero-stat px-6 py-3 text-center border-r border-[#D62828]/15 last:border-r-0"
            >
              <div className="font-bebas text-[1.8rem] text-[#D62828] tracking-[1px] leading-none drop-shadow-[0_0_12px_rgba(214,40,40,0.3)] flex items-center justify-center">
                {stat.val === "wa" ? (
                  <Image
                    src="/whatsapp-icon.png"
                    alt="WhatsApp"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  stat.val
                )}
              </div>
              <div className="text-[0.65rem] font-bold uppercase tracking-[1px] text-[#C8C3BC] mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                {stat.lbl}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
