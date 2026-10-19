// filepath: src/components/catalogo/Ticker.tsx
"use client";

import React from "react";

const TICKER_ITEMS = [
  "PEDIDOS POR WHATSAPP",
  "PRECIO DIRECTO DE FÁBRICA",
  "ENVÍO A DOMICILIO",
  "DESPACHO BONIFICADO DESDE $3.500",
  "STOCK PERMANENTE",
];

function TickerItems({ repeats = 6 }: { repeats?: number }) {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < repeats; i++) {
    TICKER_ITEMS.forEach((text, j) => {
      items.push(
        <span key={`${i}-${j}`} className="inline-flex items-center gap-2.5 mx-3.5 text-[10.5px] sm:text-[11px] font-extrabold tracking-widest uppercase text-slate-700 shrink-0 select-none">
          <span>{text}</span>
          <span className="text-[#EF233C] text-[10px] font-black select-none">✦</span>
        </span>
      );
    });
  }
  return <>{items}</>;
}

export default function Ticker() {
  return (
    <div className="w-full overflow-hidden bg-slate-100/90 border-y border-slate-200/80 py-1.5 select-none" aria-hidden="true">
      <div className="ticker-track will-change-transform">
        <TickerItems repeats={6} />
        {/* Duplicate for seamless loop */}
        <TickerItems repeats={6} />
      </div>
    </div>
  );
}
