"use client";

import React from "react";

const TICKER_ITEMS = [
  "PEDIDOS POR WHATSAPP",
  "PRECIO AL PÚBLICO",
  "ENVÍO A DOMICILIO",
  "STOCK PERMANENTE",
];

function TickerItems({ repeats = 8 }: { repeats?: number }) {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < repeats; i++) {
    TICKER_ITEMS.forEach((text, j) => {
      items.push(
        <span key={`${i}-${j}`} className="ticker-item">
          {text}
          <span className="sep">&nbsp;&mdash;&nbsp;</span>
        </span>
      );
    });
  }
  return <>{items}</>;
}

export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        <TickerItems repeats={8} />
        {/* Duplicate for seamless loop */}
        <TickerItems repeats={8} />
      </div>
    </div>
  );
}
