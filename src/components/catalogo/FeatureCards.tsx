// filepath: src/components/catalogo/FeatureCards.tsx
"use client";

import React from "react";

function PriceIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: PriceIcon,
    titulo: "Precios Mayoristas",
    descripcion: "Todos los días los mejores precios para tu negocio o tu hogar",
    accent: "#E8302A",
  },
  {
    icon: BoxIcon,
    titulo: "+1900 Productos",
    descripcion: "Variedad completa en alimentos, bebidas, limpieza e insumos",
    accent: "#D97706",
  },
  {
    icon: TruckIcon,
    titulo: "Envío a Domicilio",
    descripcion: "Recibí tu pedido en la puerta de tu casa o comercio",
    accent: "#1A7A42",
  },
  {
    icon: PhoneIcon,
    titulo: "Pedí por WhatsApp",
    descripcion: "Rápido, práctico y pensado para vos. Hacé tu pedido ahora",
    accent: "#1A7A42",
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
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group rounded-[16px] p-8 text-center flex flex-col items-center justify-center bg-white border border-[#DDD8D0] shadow-[0_1px_3px_rgba(17,11,8,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(17,11,8,0.14)] hover:border-[#C8C2B8]"
              >
                <div
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.accent}12`, color: feature.accent }}
                >
                  <Icon />
                </div>
                <h3 className="font-bebas text-[1.6rem] text-[#111111] tracking-[1px] mb-3 leading-tight">
                  {feature.titulo}
                </h3>
                <p className="text-[0.95rem] text-[#5C5550] leading-relaxed font-semibold">
                  {feature.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
