// filepath: src/components/catalogo/FlashOffersRail.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { FlashOffer, OfertaProducto } from "@/types/ofertas";

interface FlashOffersRailProps {
  flashOffers?: FlashOffer[];
}

function FlashCountdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remaining <= 0) return <span className="text-red-500 font-black">¡EXPIRADA!</span>;

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  return (
    <div className="flex items-center gap-1 font-display">
      <span className="text-red-500 font-black mr-2 animate-pulse text-[11px] sm:text-[13px] tracking-wide">⚡ TERMINA EN</span>
      <div className="bg-red-600 text-white rounded-md px-1.5 py-0.5 text-xs font-bold min-w-[24px] text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
        {String(h).padStart(2, "0")}
      </div>
      <span className="text-red-500 font-bold text-xs">:</span>
      <div className="bg-red-600 text-white rounded-md px-1.5 py-0.5 text-xs font-bold min-w-[24px] text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
        {String(m).padStart(2, "0")}
      </div>
      <span className="text-red-500 font-bold text-xs">:</span>
      <div className="bg-red-600 text-white rounded-md px-1.5 py-0.5 text-xs font-bold min-w-[24px] text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
        {String(s).padStart(2, "0")}
      </div>
    </div>
  );
}

export default function FlashOffersRail({ flashOffers = [] }: FlashOffersRailProps) {
  const { addItem } = useCart();
  const toast = useToast();
  const railRef = useRef<HTMLDivElement>(null);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // Filter active and within date range flash offers
  const activeFlashOffers = flashOffers
    .filter((f) => f.activa)
    .filter((f) => {
      const now = Date.now();
      if (f.fechaInicio && new Date(f.fechaInicio).getTime() > now) return false;
      if (f.fechaFin && new Date(f.fechaFin).getTime() < now) return false;
      return true;
    });

  const scroll = (direction: "left" | "right") => {
    if (railRef.current) {
      const offset = direction === "left" ? -400 : 400;
      railRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleAddToCart = (producto: OfertaProducto) => {
    addItem({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precioOferta,
    });
    toast.success(`${producto.nombre} agregado al pedido`);
    setAddedMap((prev) => ({ ...prev, [producto.codigo]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [producto.codigo]: false }));
    }, 1200);
  };

  if (activeFlashOffers.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {activeFlashOffers.map((offer) => (
        <div
          key={offer.id}
          style={{
            background: "linear-gradient(180deg, #1e1b4b 0%, #0f0b29 100%)",
            borderRadius: "20px",
            border: `1.5px solid ${offer.colorAccent || "#F59E0B"}40`,
            padding: "24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
          }}
        >
          {/* Top banner background blur */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "10%",
              width: "120px",
              height: "120px",
              background: offer.colorAccent || "#F59E0B",
              filter: "blur(70px)",
              opacity: 0.15,
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              paddingBottom: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "20px" }}>⏰</span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.3rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {offer.titulo}
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                {offer.descripcion}
              </p>
            </div>
            <FlashCountdown expiresAt={offer.fechaFin} />
          </div>

          {/* Horizontal Rail of Products */}
          <div style={{ position: "relative" }}>
            {/* Scroll Buttons */}
            {offer.productos.length > 4 && (
              <>
                <button
                  onClick={() => scroll("left")}
                  style={{
                    position: "absolute",
                    left: "-12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(30,30,30,0.85)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => scroll("right")}
                  style={{
                    position: "absolute",
                    right: "-12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(30,30,30,0.85)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                >
                  ›
                </button>
              </>
            )}

            <div
              ref={railRef}
              style={{
                display: "flex",
                gap: "12px",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                paddingBottom: "8px",
              }}
            >
              {offer.productos.map((producto) => (
                <div
                  key={producto.codigo}
                  style={{
                    minWidth: "160px",
                    maxWidth: "180px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "14px",
                    padding: "12px",
                    flexShrink: 0,
                    scrollSnapAlign: "start",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  {/* Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "#EF4444",
                      color: "#fff",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      fontSize: "9px",
                      fontWeight: 900,
                    }}
                  >
                    ⚡ -{producto.descuento}%
                  </div>

                  <p
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.3)",
                      textTransform: "uppercase",
                      margin: "0 0 4px",
                    }}
                  >
                    {producto.categoria}
                  </p>

                  <h4
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#fff",
                      margin: "0 0 8px",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      height: "32px",
                    }}
                  >
                    {producto.nombre}
                  </h4>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "12px", marginTop: "auto" }}>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 900,
                        color: "#22C55E",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      ${producto.precioOferta.toLocaleString("es-UY")}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.25)",
                        textDecoration: "line-through",
                      }}
                    >
                      ${producto.precioOriginal.toLocaleString("es-UY")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(producto)}
                    disabled={addedMap[producto.codigo]}
                    style={{
                      width: "100%",
                      padding: "6px",
                      borderRadius: "8px",
                      border: "none",
                      background: addedMap[producto.codigo] ? "#22C55E" : (offer.colorAccent || "#EF4444"),
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    {addedMap[producto.codigo] ? "✓" : "Agregar"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
