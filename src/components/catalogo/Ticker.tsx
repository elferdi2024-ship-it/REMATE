"use client";

import React from "react";

const TICKER_TEXT =
  "PRECIO AL P\u00daBLICO \u2605 ENV\u00cdO A DOMICILIO \u2605 STOCK PERMANENTE \u2605 PEDIDOS POR WHATSAPP \u2605";

/**
 * Renders the text repeated enough times to fill wide screens,
 * duplicated so the CSS infinite-scroll loop has seamless content.
 */
function TickerItems({ repeats = 8 }: { repeats?: number }) {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < repeats; i++) {
    const parts = TICKER_TEXT.split("\u2605");
    parts.forEach((part, j) => {
      const trimmed = part.trim();
      if (trimmed) {
        items.push(
          <span key={`${i}-${j}`} className="ticker-item">
            {trimmed}
            {j < parts.length - 1 && trimmed && <span className="sep">\u2605</span>}
          </span>
        );
      }
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
