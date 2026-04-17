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
  searchQuery = "",
  onSearchChange,
}: HeroProps) {
  return (
    <section className="hero" style={{ minHeight: "85vh", display: "flex", alignItems: "center" }}>
      {/* ── Fondo imagen ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "var(--oscuro, #111111)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/catalogo-hero.jpg"
          alt=""
          aria-hidden="true"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
          onError={(e) => {
            // Si la imagen falla, el fondo oscuro sigue visible
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Overlay oscuro cálido — contraste alto para texto claro */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(17,11,8,0.97) 0%, rgba(17,11,8,0.92) 40%, rgba(17,11,8,0.70) 75%, rgba(17,11,8,0.40) 100%)",
          }}
        />
      </div>

      {/* ── Glow rojo sutil a la izquierda ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 90% at -5% 50%, rgba(214,40,40,0.15) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── Contenido ── */}
      <div className="hero-inner" style={{ position: "relative", zIndex: 2 }}>

        {/* ════ IZQUIERDA: Marca ════ */}
        <div className="hero-brand">

          {/* Enlace volver */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "20px",
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              textDecoration: "none",
              padding: "5px 10px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.2s",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
          >
            ← Inicio
          </Link>

          {/* Eyebrow — pill roja única con separadores */}
          <div style={{ marginBottom: "18px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--rojo, #D62828)",
                color: "#fff",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                padding: "5px 14px",
                borderRadius: "4px",
                boxShadow: "0 2px 12px rgba(214,40,40,0.4)",
              }}
            >
              MAYORISTA · DISTRIBUIDORA · CANELONES
            </span>
          </div>

          {/* Título principal */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 9vw, 5rem)",
              letterSpacing: "2.5px",
              lineHeight: 0.88,
              marginBottom: "20px",
            }}
          >
            {/* EL REMATE — blanco */}
            <span
              style={{
                display: "block",
                color: "#fff",
                textShadow: "0 2px 16px rgba(0,0,0,0.4)",
              }}
            >
              EL REMATE
            </span>
            {/* CANELONES — rojo */}
            <span
              style={{
                display: "block",
                color: "var(--rojo, #D62828)",
                textShadow: "0 0 30px rgba(214,40,40,0.3)",
              }}
            >
              CANELONES
            </span>
          </h1>

          {/* Descriptor — DM Serif Display italic + barra roja vertical */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {/* Barra roja vertical 4px */}
            <div
              style={{
                width: "4px",
                minHeight: "48px",
                background: "var(--rojo, #D62828)",
                borderRadius: "2px",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                color: "var(--on-dark-mid, #C8C3BC)",
                lineHeight: 1.55,
                fontWeight: 400,
                margin: 0,
              }}
            >
              Más de 1.900 productos al mejor precio.
              <br />
              Pedí por WhatsApp, te lo llevamos.
            </p>
          </div>

          {/* Stats strip — fondo oscuro, borde rojo, texto claro */}
          <div
            className="hero-stats"
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
              { val: "WA", lbl: "Pedido Express" },
            ].map((stat, i) => (
              <div
                key={i}
                className="hero-stat"
                style={{
                  padding: "10px 18px",
                  textAlign: "center",
                  borderRight: i < 2 ? "1px solid rgba(214,40,40,0.15)" : "none",
                }}
              >
                <div
                  className="hero-stat-val"
                  style={{ color: "var(--rojo, #D62828)" }}
                >
                  {stat.val}
                </div>
                <div className="hero-stat-lbl" style={{ color: "var(--on-dark-mid, #C8C3BC)" }}>{stat.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ════ DERECHA: Controles ════ */}
        <div className="hero-controls">

          {/* Buscador — fondo translúcido claro, texto oscuro */}
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
          </div>

          {/* Acciones */}
          <div className="hero-actions">
            {/* Botón carrito — rojo, texto blanco, total visible */}
            <button
              className="btn-hero-cart"
              onClick={onOpenCart}
              aria-label="Abrir carrito"
              style={{ boxShadow: "0 4px 20px rgba(214,40,40,0.35)" }}
            >
              🛒 VER PEDIDO
              <span
                style={{
                  background: "rgba(0,0,0,0.22)",
                  borderRadius: "5px",
                  padding: "1px 8px",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "0",
                  marginLeft: "4px",
                }}
              >
                — {formatPrice(cartTotal)}
              </span>
              {cartQty > 0 && (
                <span className="cart-badge">{cartQty}</span>
              )}
            </button>

            {/* Compartir carrito */}
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

            {/* Usuario */}
            {onOpenUser && (
              <button
                className={`btn-hero-user${isLoggedIn ? " logged-in" : ""}`}
                onClick={onOpenUser}
                aria-label={isLoggedIn ? "Mi cuenta" : "Iniciar sesión"}
              >
                👤
                <span className="user-dot" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
