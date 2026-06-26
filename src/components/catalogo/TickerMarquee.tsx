"use client";

import React from "react";

export default function TickerMarquee() {
  const items = [
    "⚡ Precios de distribuidor",
    "📦 Pedí por WhatsApp",
    "🏠 Zona Canelones",
    "🛒 Más de 1900 productos",
    "✅ Fiambres · Congelados · Limpieza",
    "🚚 Envío a domicilio",
  ];

  return (
    <div className="bg-[#2C2318] border-t border-[#D62828]/12 border-b border-[#D62828]/12 overflow-hidden py-2.5">
      <div
        className="flex white-space-nowrap"
        style={{
          display: "flex",
          animation: "tickerScroll 32s linear infinite",
          whiteSpace: "nowrap",
        }}
      >
        {[...Array(2)].map((_, idx) => (
          <span key={idx} className="flex">
            {items.map((item, i) => (
              <span
                key={i}
                className="text-[0.68rem] font-semibold tracking-[1.5px] uppercase text-[#F5F0E8] opacity-55 px-8 shrink-0"
              >
                {item}
                <span className="text-[#D62828] mx-1 opacity-100">★</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
