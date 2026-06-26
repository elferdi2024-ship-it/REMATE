"use client";

import React from "react";

const FEATURES = [
  {
    icono: "💰",
    titulo: "Precios Mayoristas",
    descripcion: "Todos los días los mejores precios para tu negocio o tu hogar",
  },
  {
    icono: "📦",
    titulo: "+1900 Productos",
    descripcion: "Variedad completa en alimentos, bebidas, limpieza e insumos",
  },
  {
    icono: "🚚",
    titulo: "Envío a Domicilio",
    descripcion: "Recibí tu pedido en la puerta de tu casa o comercio",
  },
  {
    icono: "📱",
    titulo: "Pedí por WhatsApp",
    descripcion: "Rápido, práctico y pensado para vos. Hacé tu pedido ahora",
  },
];

export default function FeatureCards() {
  return (
    <section className="py-[80px] px-5 bg-[#F5F0E8]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-[48px]">
          <h2 className="font-bebas text-[clamp(2rem,5vw,3rem)] text-[#1A1410] tracking-[2px] mb-2">
            COMPRÁ FÁCIL
          </h2>
          <p className="font-serif italic text-[1.1rem] text-[#5C4A35]">
            Rápido, práctico y pensado para vos
          </p>
        </div>

        <div className="features-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="premium-glass rounded-[16px] p-8 text-center shadow-[var(--shadow-premium)] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/20"
            >
              <div className="text-[3rem] mb-4">{feature.icono}</div>
              <h3 className="font-bebas text-[1.6rem] text-[#111111] tracking-[1px] mb-3 leading-tight">
                {feature.titulo}
              </h3>
              <p className="text-[0.95rem] text-[#5C5550] leading-relaxed font-semibold">
                {feature.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
