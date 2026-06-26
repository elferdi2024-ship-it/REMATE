"use client";

import React from "react";
import Link from "next/link";

interface StepProcessProps {
  selectedSucursal: string;
}

export default function StepProcess({ selectedSucursal }: StepProcessProps) {
  const steps = [
    { step: "1", icono: "🛒", titulo: "ELEGÍ", desc: "Navegá por el catálogo y seleccioná tus productos" },
    { step: "2", icono: "📝", titulo: "ARMÁ", desc: "Revisá tu pedido y ajustá cantidades si es necesario" },
    { step: "3", icono: "📱", titulo: "ENVIÁ", desc: "Enviá tu pedido por WhatsApp y coordiná la entrega" },
  ];

  return (
    <section className="py-[80px] px-5 bg-white relative overflow-hidden">
      <div className="relative z-[2] max-w-[900px] mx-auto text-center">
        <span className="text-[11px] font-bold tracking-[4px] uppercase text-[#9C8570] block mb-2">
          Hacé tu pedido
        </span>
        <h2 className="font-bebas text-[clamp(2.5rem,6vw,4rem)] text-[#1A1410] tracking-[2px] mb-2">
          PEDÍ
          <span className="text-[#D62828]"> ¡ONLINE!</span>
        </h2>
        <p className="font-serif italic text-[1.15rem] text-[#5C4A35] leading-relaxed mb-10 max-w-[600px] mx-auto">
          Navegá por el catálogo, agregá lo que querés y enviá tu pedido por WhatsApp.
        </p>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white border border-[#DDD8D0] rounded-[16px] p-8 pb-7 relative shadow-[0_4px_16px_rgba(17,11,8,0.12)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(17,11,8,0.18)]"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E8302A] text-white w-8 h-8 rounded-full flex items-center justify-center font-bebas text-[1.2rem] shadow-[0_2px_8px_rgba(232,48,42,0.3)]">
                {step.step}
              </div>
              <div className="text-[2.8rem] mb-3.5 mt-2">{step.icono}</div>
              <h3 className="font-bebas text-[1.5rem] text-[#E8302A] tracking-[1px] mb-2.5 leading-tight">
                {step.titulo}
              </h3>
              <p className="text-[0.9rem] text-[#5C5550] leading-relaxed font-semibold">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[0.9rem] text-[#9C8570] mb-8">
          También podés visitarnos en cualquiera de nuestras 6 sucursales en Canelones.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href={selectedSucursal ? `/catalogo?sucursal=${selectedSucursal}` : "/seleccionar-sucursal"}
            className="inline-flex items-center gap-2 bg-[#D62828] text-white rounded-[12px] px-9 py-4 font-bebas text-[1.3rem] tracking-[2px] no-underline shadow-[0_4px_18px_rgba(214,40,40,0.35)] transition-all hover:bg-[#C4231E]"
          >
            🛒 IR AL CATÁLOGO
          </Link>
          <a
            href="https://wa.me/59899322325"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#1A7A42] text-white border border-white/20 rounded-[12px] px-8 py-4 font-body text-[1.05rem] font-extrabold no-underline shadow-[0_4px_20px_rgba(26,122,66,0.4),_0_0_0_1px_rgba(255,255,255,0.1)] transition-all hover:bg-[#145E33] hover:-translate-y-0.5 tracking-[0.5px]"
          >
            📱 CONSULTAR POR WHATSAPP
          </a>
        </div>
      </div>
    </section>
  );
}
