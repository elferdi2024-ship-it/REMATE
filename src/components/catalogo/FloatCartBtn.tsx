"use client";

import React from "react";

interface FloatCartBtnProps {
  totalQty: number;
  total: number;
  onClick: () => void;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Floating cart button — fixed position bottom-center.
 * Slides up when cart has items.
 */
export default function FloatCartBtn({
  totalQty,
  total,
  onClick,
}: FloatCartBtnProps) {
  const hasItems = totalQty > 0;

  return (
    <button
      className={`float-cart ${hasItems ? "has-items" : ""}`}
      onClick={onClick}
      aria-label="Abrir carrito"
    >
      <span>&#128722; Pedido</span>
      {hasItems && <span className="float-qty">{totalQty}</span>}
      {hasItems && <span className="float-total">{formatPrice(total)}</span>}
    </button>
  );
}
