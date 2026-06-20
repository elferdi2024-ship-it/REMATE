// filepath: src/app/ofertas/OfertasPageClient.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { OfertaConfig, OfertaProducto } from "@/types/ofertas";
import type { Producto } from "@/types";
import {
  BrandBannersRail,
  FlashOffersRail,
  CategoryOffersRail,
  SponsoredProductsRail,
} from "@/components/catalogo";

// ─── Countdown Hook ────────────────────────────────────────────────────────

function useCountdown(expiresAt?: string) {
  const [remaining, setRemaining] = useState(() => {
    if (!expiresAt) return -1;
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remaining < 0) return null;

  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  return {
    expired: remaining <= 0,
    days: d,
    hours: h,
    minutes: m,
    seconds: s,
    isUrgent: remaining < 3600,
  };
}

// ─── Countdown Display ─────────────────────────────────────────────────────

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const countdown = useCountdown(expiresAt);
  if (!countdown || countdown.expired) return null;

  const blocks = [
    { value: countdown.days, label: "días" },
    { value: countdown.hours, label: "hrs" },
    { value: countdown.minutes, label: "min" },
    { value: countdown.seconds, label: "seg" },
  ].filter((b) => b.value > 0 || b.label === "seg");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "16px 24px",
        background: countdown.isUrgent
          ? "linear-gradient(135deg, rgba(220,38,38,0.15), rgba(239,68,68,0.08))"
          : "linear-gradient(135deg, rgba(248,150,30,0.12), rgba(248,150,30,0.04))",
        border: `1.5px solid ${countdown.isUrgent ? "rgba(220,38,38,0.3)" : "rgba(248,150,30,0.2)"}`,
        borderRadius: "16px",
        margin: "0 auto 32px",
        maxWidth: "420px",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: countdown.isUrgent ? "#EF4444" : "#F8961E",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
        }}
      >
        {countdown.isUrgent ? "¡Última hora!" : "Vence en"}
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        {blocks.map((b) => (
          <div key={b.label} style={{ textAlign: "center" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "6px 10px",
                minWidth: "44px",
                fontFamily: "var(--font-display, monospace)",
                fontSize: "22px",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "1px",
              }}
            >
              {String(b.value).padStart(2, "0")}
            </div>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase" }}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────

function OfertaCard({
  producto,
  onAdd,
}: {
  producto: OfertaProducto;
  onAdd: () => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      style={{
        position: "relative",
        background: producto.destacado
          ? "linear-gradient(135deg, rgba(212,168,83,0.08), rgba(30,30,30,1))"
          : "#1a1a1a",
        borderRadius: "16px",
        border: producto.destacado
          ? "1.5px solid rgba(212,168,83,0.3)"
          : "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
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
          top: "12px",
          right: "12px",
          zIndex: 2,
          background: producto.descuento >= 20 ? "#DC2626" : "#F59E0B",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 900,
          letterSpacing: "0.5px",
        }}
      >
        {producto.descuento}% OFF
      </div>

      {/* Destacado badge */}
      {producto.destacado && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 2,
            background: "rgba(212,168,83,0.2)",
            border: "1px solid rgba(212,168,83,0.4)",
            color: "#D4A853",
            padding: "3px 8px",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          ⭐ Destacado
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "20px" }}>
        {/* Category */}
        <p
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: "8px",
            marginTop: producto.destacado ? "24px" : "16px",
          }}
        >
          {producto.categoria}
        </p>

        {/* Name */}
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 12px",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {producto.nombre}
        </h3>

        {/* Code */}
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "16px" }}>
          Cód: {producto.codigo}
        </p>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 900,
              color: "#22C55E",
              fontFamily: "var(--font-display)",
            }}
          >
            ${producto.precioOferta.toLocaleString("es-UY")}
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.3)",
              textDecoration: "line-through",
            }}
          >
            ${producto.precioOriginal.toLocaleString("es-UY")}
          </span>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAdd}
          disabled={added}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            background: added
              ? "#22C55E"
              : "linear-gradient(135deg, #E8302A, #D62828)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 800,
            cursor: added ? "default" : "pointer",
            transition: "all 0.2s",
            letterSpacing: "0.5px",
          }}
        >
          {added ? "✓ Agregado" : "Agregar al pedido"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page Client ───────────────────────────────────────────────────────

export default function OfertasPageClient() {
  const [config, setConfig] = useState<OfertaConfig | null>(null);
  const [catalogo, setCatalogo] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "configuracion", "ofertas"));
        if (snap.exists()) {
          const data = snap.data() as OfertaConfig;
          if (data.activa) {
            setConfig(data);

            // Fetch catalog if category offers exist to resolve product codes
            if (data.categoryOffers && data.categoryOffers.length > 0) {
              try {
                let catalogProds: Producto[] = [];
                const catSnap = await getDoc(doc(db, "catalogo_activo", "productos"));
                if (catSnap.exists()) {
                  catalogProds = Object.values(catSnap.data().items || {}) as Producto[];
                } else {
                  const res = await fetch("/productos.json");
                  if (res.ok) catalogProds = await res.json();
                }
                setCatalogo(catalogProds);
              } catch (err) {
                console.error("Error loading catalog for category offers:", err);
              }
            }
          }
        }
      } catch (e) {
        console.error("Error loading ofertas:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddToCart = (producto: OfertaProducto) => {
    addItem({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precioOferta,
    });
    toast.success(`${producto.nombre} agregado`);
  };

  // Sort: destacados first
  const sortedProducts = useMemo(() => {
    if (!config) return [];
    return [...config.productos].sort((a, b) => {
      if (a.destacado && !b.destacado) return -1;
      if (!a.destacado && b.destacado) return 1;
      return b.descuento - a.descuento;
    });
  }, [config]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid rgba(255,255,255,0.1)",
            borderTopColor: "#E8302A",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No active ofertas
  if (!config) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "64px", marginBottom: "24px" }}>🏷️</span>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 900,
            color: "#fff",
            marginBottom: "12px",
          }}
        >
          No hay ofertas activas
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "32px", maxWidth: "400px" }}>
          Las ofertas se actualizan periódicamente. Volvé pronto o explorá nuestro catálogo completo.
        </p>
        <Link
          href="/catalogo"
          style={{
            background: "linear-gradient(135deg, #E8302A, #D62828)",
            color: "#fff",
            padding: "14px 32px",
            borderRadius: "12px",
            fontWeight: 800,
            fontSize: "14px",
            textDecoration: "none",
            letterSpacing: "0.5px",
          }}
        >
          Ir al Catálogo →
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#fff",
      }}
    >
      {/* Hero */}
      <header
        style={{
          padding: "48px 20px 32px",
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(232,48,42,0.08) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <Link
          href="/catalogo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "rgba(255,255,255,0.4)",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: "20px",
          }}
        >
          ← Volver al catálogo
        </Link>

        <div
          style={{
            display: "inline-block",
            background: "rgba(232,48,42,0.15)",
            border: "1px solid rgba(232,48,42,0.3)",
            borderRadius: "8px",
            padding: "4px 12px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#E8302A", textTransform: "uppercase", letterSpacing: "2px" }}>
            🔥 Ofertas activas
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 900,
            margin: "0 0 8px",
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
          }}
        >
          {config.titulo}
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "500px",
            margin: "0 auto 24px",
          }}
        >
          {config.subtitulo}
        </p>

        {/* Countdown */}
        {config.expiresAt && <CountdownTimer expiresAt={config.expiresAt} />}

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
          {config.productos.length} producto{config.productos.length !== 1 ? "s" : ""} con descuento
        </p>
      </header>

      {/* Products Grid */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px 16px 64px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* 1. Custom Brand Banners */}
        {config.brandBanners && config.brandBanners.length > 0 && (
          <BrandBannersRail banners={config.brandBanners} />
        )}

        {/* 2. Flash Sales */}
        {config.flashOffers && config.flashOffers.length > 0 && (
          <FlashOffersRail flashOffers={config.flashOffers} />
        )}

        {/* 3. Sponsored Products */}
        {config.sponsoredProducts && config.sponsoredProducts.length > 0 && (
          <SponsoredProductsRail products={config.sponsoredProducts} />
        )}

        {/* 4. Category Themed Offers */}
        {config.categoryOffers && config.categoryOffers.length > 0 && (
          <CategoryOffersRail
            categoryOffers={config.categoryOffers}
            catalogo={catalogo}
            qtyMap={{}}
            onAddProduct={(p) => {
              addItem({
                codigo: p.codigo,
                nombre: p.nombre,
                precio: p.precio,
              });
              toast.success(`${p.nombre} agregado`);
            }}
            onQtyChange={(codigo, qty) => {
              // For public offers page, if they update qty we can use custom logic or let them add
              // In this simple grid we let them add. But to handle qty we can use useCart actions:
              // Since the cart hook handles quantity updates:
              if (qty === 0) {
                // remove
              } else {
                addItem({ codigo, nombre: "", precio: 0 }); // useCart will handle adding/updating
              }
            }}
          />
        )}

        {/* 5. Standard Offers Grid */}
        {sortedProducts.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px" }}>🏷️</span>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                }}
              >
                Ofertas de la Semana
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {sortedProducts.map((p) => (
                <OfertaCard
                  key={p.codigo}
                  producto={p}
                  onAdd={() => handleAddToCart(p)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <div
        style={{
          textAlign: "center",
          padding: "32px 20px 48px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "16px" }}>
          ¿Buscás algo más? Explorá el catálogo completo
        </p>
        <Link
          href="/catalogo"
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
        >
          Ver Catálogo Completo →
        </Link>
      </div>
    </div>
  );
}
