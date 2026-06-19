// filepath: src/components/catalogo/OfertasDestacadasRail.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { OfertaConfig, OfertaProducto } from "@/types/ofertas";

// ─── Compact Countdown ────────────────────────────────────────────
function MiniCountdown({ expiresAt }: { expiresAt: string }) {
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

  if (remaining <= 0) return null;

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const isUrgent = remaining < 3600;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: isUrgent ? "rgba(239,68,68,0.15)" : "rgba(248,150,30,0.12)",
        border: `1px solid ${isUrgent ? "rgba(239,68,68,0.3)" : "rgba(248,150,30,0.25)"}`,
        borderRadius: "8px",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: 800,
        color: isUrgent ? "#EF4444" : "#F59E0B",
        letterSpacing: "0.5px",
        fontFamily: "var(--font-display, monospace)",
        flexShrink: 0,
      }}
    >
      ⏱ {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ─── Compact Offer Card ──────────────────────────────────────────
function OfertaMiniCard({
  producto,
  onAdd,
}: {
  producto: OfertaProducto;
  onAdd: () => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      style={{
        minWidth: "180px",
        maxWidth: "200px",
        background: producto.destacado
          ? "linear-gradient(135deg, rgba(212,168,83,0.06), #1a1a1a)"
          : "#1a1a1a",
        borderRadius: "14px",
        border: producto.destacado
          ? "1.5px solid rgba(212,168,83,0.25)"
          : "1px solid rgba(255,255,255,0.06)",
        padding: "14px",
        flexShrink: 0,
        position: "relative",
        transition: "transform 0.15s, box-shadow 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Discount badge */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: producto.descuento >= 20 ? "#DC2626" : "#F59E0B",
          color: "#fff",
          padding: "2px 7px",
          borderRadius: "6px",
          fontSize: "10px",
          fontWeight: 900,
          letterSpacing: "0.3px",
        }}
      >
        {producto.descuento}%
      </div>

      {/* Destacado */}
      {producto.destacado && (
        <span
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            fontSize: "10px",
            color: "#D4A853",
          }}
        >
          ⭐
        </span>
      )}

      {/* Category */}
      <p
        style={{
          fontSize: "9px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "6px",
          marginTop: producto.destacado ? "4px" : 0,
        }}
      >
        {producto.categoria}
      </p>

      {/* Name */}
      <h4
        style={{
          fontSize: "13px",
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 8px",
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {producto.nombre}
      </h4>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "10px" }}>
        <span
          style={{
            fontSize: "18px",
            fontWeight: 900,
            color: "#22C55E",
            fontFamily: "var(--font-display)",
          }}
        >
          ${producto.precioOferta.toLocaleString("es-UY")}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.25)",
            textDecoration: "line-through",
          }}
        >
          ${producto.precioOriginal.toLocaleString("es-UY")}
        </span>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={added}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "10px",
          border: "none",
          background: added
            ? "#22C55E"
            : "linear-gradient(135deg, #E8302A, #D62828)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 800,
          cursor: added ? "default" : "pointer",
          transition: "all 0.15s",
          letterSpacing: "0.3px",
        }}
      >
        {added ? "✓ Listo" : "Agregar"}
      </button>
    </div>
  );
}

// ─── Main Rail Component ─────────────────────────────────────────
export default function OfertasDestacadasRail() {
  const [config, setConfig] = useState<OfertaConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "configuracion", "ofertas"));
        if (snap.exists()) {
          const data = snap.data() as OfertaConfig;
          if (data.activa && data.productos && data.productos.length > 0) {
            setConfig(data);
          }
        }
      } catch (e) {
        console.error("Error loading ofertas rail:", e);
      }
    }
    load();
  }, []);

  const handleAdd = (producto: OfertaProducto) => {
    addItem({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precioOferta,
    });
    toast.success(`${producto.nombre} agregado`);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 220;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Don't render if no active offers
  if (!config || config.productos.length === 0) return null;

  // Sort: destacados first, then by discount
  const sorted = [...config.productos].sort((a, b) => {
    if (a.destacado && !b.destacado) return -1;
    if (!a.destacado && b.destacado) return 1;
    return b.descuento - a.descuento;
  });

  return (
    <section
      style={{
        background: "linear-gradient(180deg, rgba(232,48,42,0.04) 0%, transparent 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.04)",
        padding: "20px 0 20px",
        marginBottom: "12px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                background: "rgba(232,48,42,0.15)",
                border: "1px solid rgba(232,48,42,0.3)",
                borderRadius: "6px",
                padding: "2px 8px",
                fontSize: "10px",
                fontWeight: 800,
                color: "#E8302A",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
              }}
            >
              🔥 Ofertas
            </span>
            <span>{config.titulo}</span>
          </h3>
          {config.expiresAt && <MiniCountdown expiresAt={config.expiresAt} />}
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.3)",
              fontWeight: 600,
            }}
          >
            {config.productos.length} producto{config.productos.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Scroll arrows */}
          <button
            onClick={() => scroll("left")}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.5)",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.5)",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            →
          </button>

          <Link
            href="/ofertas"
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#E8302A",
              textDecoration: "none",
              padding: "5px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(232,48,42,0.25)",
              background: "rgba(232,48,42,0.08)",
              transition: "all 0.15s",
              letterSpacing: "0.3px",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(232,48,42,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(232,48,42,0.08)";
            }}
          >
            Ver todas →
          </Link>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          padding: "0 20px 8px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {sorted.map((p) => (
          <OfertaMiniCard
            key={p.codigo}
            producto={p}
            onAdd={() => handleAdd(p)}
          />
        ))}

        {/* View all CTA card */}
        <Link
          href="/ofertas"
          style={{
            minWidth: "140px",
            borderRadius: "14px",
            border: "1.5px dashed rgba(232,48,42,0.25)",
            background: "rgba(232,48,42,0.04)",
            padding: "14px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232,48,42,0.1)";
            e.currentTarget.style.borderColor = "rgba(232,48,42,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(232,48,42,0.04)";
            e.currentTarget.style.borderColor = "rgba(232,48,42,0.25)";
          }}
        >
          <span style={{ fontSize: "28px" }}>🏷️</span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#E8302A",
              textAlign: "center",
              letterSpacing: "0.3px",
            }}
          >
            Ver todas
            <br />
            las ofertas
          </span>
        </Link>
      </div>

      {/* Hide scrollbar */}
      <style>{`
        div[style*="overflowX: auto"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
