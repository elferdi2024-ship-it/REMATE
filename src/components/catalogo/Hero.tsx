// filepath: src/components/catalogo/Hero.tsx
"use client";

import React from "react";
import Link from "next/link";

interface HeroProps {
  onOpenCart: () => void;
  cartQty: number;
  cartTotal: number;
  onOpenUser?: () => void;
  onShareCart?: () => void;
  isLoggedIn?: boolean;
  userDisplayName?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function Hero({
  onOpenCart,
  cartQty,
  cartTotal,
  onOpenUser,
  onShareCart,
  isLoggedIn = false,
  userDisplayName,
  searchQuery = "",
  onSearchChange,
}: HeroProps) {
  return (
    <section className="hero hero-compact">
      {/* ── Fondo imagen ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "var(--oscuro, #111111)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/catalogo-hero.jpg"
          alt=""
          aria-hidden="true"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(17,11,8,0.97) 0%, rgba(17,11,8,0.92) 40%, rgba(17,11,8,0.72) 75%, rgba(17,11,8,0.45) 100%)",
          }}
        />
      </div>

      {/* Glow rojo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 55% 100% at -5% 50%, rgba(214,40,40,0.18) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── Contenido ── */}
      <div className="hero-inner hero-inner-v2" style={{ position: "relative", zIndex: 2 }}>

        {/* ════ IZQUIERDA: Marca ════ */}
        <div className="hero-brand">
          <Link
            href="/"
            className="hero-back-link"
          >
            ← Inicio
          </Link>

          {/* Eyebrow */}
          <div style={{ marginBottom: "10px" }}>
            <span className="hero-eyebrow-badge">
              MAYORISTA · DISTRIBUIDORA · CANELONES
            </span>
          </div>

          {/* Título */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 7vw, 4.2rem)",
              letterSpacing: "2px",
              lineHeight: 0.9,
              marginBottom: "16px",
            }}
          >
            <span style={{ display: "block", color: "#fff", textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}>
              EL REMATE
            </span>
            <span style={{ display: "block", color: "var(--rojo, #D62828)", textShadow: "0 0 30px rgba(214,40,40,0.3)" }}>
              CANELONES
            </span>
          </h1>

          {/* Descriptor */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "3px", minHeight: "36px", background: "var(--rojo)", borderRadius: "2px", flexShrink: 0, marginTop: "2px" }} />
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
                color: "var(--on-dark-mid, #C8C3BC)",
                lineHeight: 1.5,
                fontWeight: 400,
                margin: 0,
              }}
            >
              Más de 1.900 productos al mejor precio.
              <br />
              Pedí por WhatsApp, te lo llevamos.
            </p>
          </div>

          {/* Stats strip */}
          <div
            style={{
              background: "rgba(26,20,16,0.55)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(214,40,40,0.3)",
              borderRadius: "var(--r-sm, 8px)",
              overflow: "hidden",
              width: "fit-content",
              display: "flex",
            }}
          >
            {[
              { val: "1900+", lbl: "Productos" },
              { val: "17", lbl: "Categorías" },
              { val: "WA", lbl: "Express" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 16px",
                  textAlign: "center",
                  borderRight: i < 2 ? "1px solid rgba(214,40,40,0.15)" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    color: "var(--rojo, #D62828)",
                    letterSpacing: "-0.5px",
                    lineHeight: 1,
                    fontWeight: 800,
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    color: "var(--on-dark-mid, #C8C3BC)",
                    marginTop: "2px",
                  }}
                >
                  {stat.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ MEDIO: Logo ════ */}
        <div 
          className="hero-logo-center" 
          style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            padding: "20px 0"
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="El Remate Logo"
            width={150}
            height={85}
            style={{ 
              objectFit: "contain", 
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" 
            }}
          />
        </div>

        {/* ════ DERECHA: Controles ════ */}
        <div className="hero-controls-v2">

          {/* ── BOTÓN USUARIO — prominente ── */}
          {onOpenUser && (
            <button
              className={`btn-hero-user-v2${isLoggedIn ? " logged-in" : ""}`}
              onClick={onOpenUser}
              aria-label={isLoggedIn ? "Mi cuenta" : "Iniciar sesión"}
            >
              <div className="btn-hero-user-icon">
                {isLoggedIn ? "✓" : "👤"}
              </div>
              <div className="btn-hero-user-text">
                <span className="btn-hero-user-label">
                  {isLoggedIn ? "MI CUENTA" : "INICIAR SESIÓN"}
                </span>
                <span className="btn-hero-user-sub">
                  {isLoggedIn
                    ? (userDisplayName || "Mi perfil y pedidos")
                    : "Ver historial y repetir pedidos"}
                </span>
              </div>
              <span className="btn-hero-user-arrow">›</span>
            </button>
          )}

          {/* ── Buscador ── */}
          <div className="hero-search-wrap">
            <span className="hero-search-icon" style={{ color: "rgba(255,255,255,0.4)" }}>🔍</span>
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              aria-label="Buscar producto"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                color: "#fff",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.("")}
                style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "rgba(255,255,255,0.5)",
                  cursor: "pointer", fontSize: "0.9rem", lineHeight: 1,
                }}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* ── Carrito + compartir ── */}
          <div className="hero-actions">
            <button
              className="btn-hero-cart"
              onClick={onOpenCart}
              aria-label="Abrir carrito"
            >
              <span>🛒</span>
              <span>VER PEDIDO</span>
              <span
                style={{
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: "5px",
                  padding: "2px 10px",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  marginLeft: "2px",
                }}
              >
                {formatPrice(cartTotal)}
              </span>
              {cartQty > 0 && (
                <span className="cart-badge">{cartQty}</span>
              )}
            </button>

            {onShareCart && cartQty > 0 && (
              <button
                className="btn-hero-share"
                onClick={onShareCart}
                aria-label="Compartir carrito"
              >
                ✉
                <span className="share-tooltip">Compartir carrito</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
