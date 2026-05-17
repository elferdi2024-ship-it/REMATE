"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import type { Producto } from "@/types";

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
  suggestedProducts?: Producto[];
  recentSearches?: string[];
  onSelectSuggestion?: (query: string) => void;
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
  suggestedProducts = [],
  recentSearches = [],
  onSelectSuggestion,
}: HeroProps) {
  const trustItems = ["Precios mayoristas reales", "Pedido en minutos", "Atencion por WhatsApp"];
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="hero hero-compact">
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "var(--oscuro, #111111)", overflow: "hidden" }}>
        <Image
          src="/catalogo-hero.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
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

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 55% 100% at -5% 50%, rgba(214,40,40,0.18) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div className="hero-inner hero-inner-v2" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-brand">
          <Link href="/" className="hero-back-link">
            Inicio
          </Link>

          <div style={{ marginBottom: "10px" }}>
            <span className="hero-eyebrow-badge">MAYORISTA · DISTRIBUIDORA · CANELONES</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
            <div
              style={{ width: "3px", minHeight: "36px", background: "var(--rojo)", borderRadius: "2px", flexShrink: 0, marginTop: "2px" }}
            />
            <p
              style={{
                fontFamily: "var(--font-display, 'Arial Black', sans-serif)",
                fontStyle: "normal",
                fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
                color: "#fff",
                lineHeight: 1.35,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Pedi tu surtido
              <br />
              <span style={{ color: "var(--rojo, #D62828)" }}>y olvidate del resto</span>
            </p>
          </div>

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
              { val: "21", lbl: "Categorias" },
              { val: "wa", lbl: "Express" },
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {stat.val === "wa" ? (
                    <Image src="/whatsapp-icon.png" alt="WhatsApp" width={24} height={24} style={{ objectFit: "contain" }} />
                  ) : (
                    stat.val
                  )}
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

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
            {trustItems.map((item) => (
              <span
                key={item}
                style={{
                  fontSize: "0.66rem",
                  fontWeight: 700,
                  letterSpacing: "0.9px",
                  textTransform: "uppercase",
                  color: "var(--on-dark-mid, #C8C3BC)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "999px",
                  padding: "5px 10px",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-logo-center" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="El Remate Logo"
              width={280}
              height={150}
              priority
              style={{
                width: "100%",
                maxWidth: "280px",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.6)) drop-shadow(0 0 15px rgba(214,40,40,0.25))",
                cursor: "pointer",
              }}
            />
          </Link>
        </div>

        <div className="hero-controls-v2">
          {onOpenUser && (
            <button
              className={`btn-hero-user-v2${isLoggedIn ? " logged-in" : ""}`}
              onClick={onOpenUser}
              aria-label={isLoggedIn ? "Mi cuenta" : "Iniciar sesion"}
            >
              <div className="btn-hero-user-icon">{isLoggedIn ? "OK" : "ID"}</div>
              <div className="btn-hero-user-text">
                <span className="btn-hero-user-label">{isLoggedIn ? "MI CUENTA" : "INICIAR SESION"}</span>
                <span className="btn-hero-user-sub">
                  {isLoggedIn ? userDisplayName || "Mi perfil y pedidos" : "Ver historial y repetir pedidos"}
                </span>
              </div>
              <span className="btn-hero-user-arrow">›</span>
            </button>
          )}

          <div className="hero-search-wrap" ref={searchContainerRef} style={{ position: "relative" }}>
            <span className="hero-search-icon" style={{ color: "rgba(255,255,255,0.4)" }}>
              Q
            </span>
            <input
              type="text"
              placeholder="Que estas buscando?"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              aria-label="Buscar producto"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                color: "#fff",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  lineHeight: 1,
                  zIndex: 2,
                }}
                aria-label="Limpiar busqueda"
              >
                x
              </button>
            )}

            {/* Predictive Search Dropdown */}
            {isSearchFocused && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "var(--bg, #F5F0E8)",
                  borderRadius: "var(--r-md, 12px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.05)",
                  zIndex: 100,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "350px",
                }}
              >
                {!searchQuery.trim() ? (
                  /* Sin texto: Mostrar historial o top búsquedas */
                  <div style={{ padding: "12px" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", paddingLeft: "4px" }}>
                      Búsquedas Recientes
                    </div>
                    {recentSearches.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {recentSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setIsSearchFocused(false);
                              onSelectSuggestion?.(term);
                            }}
                            style={{
                              background: "rgba(0,0,0,0.05)",
                              border: "1px solid rgba(0,0,0,0.05)",
                              borderRadius: "999px",
                              padding: "6px 12px",
                              fontSize: "0.85rem",
                              color: "var(--texto)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span style={{ opacity: 0.5 }}>🕒</span> {term}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: "8px 4px", fontSize: "0.85rem", color: "var(--muted)" }}>No hay búsquedas recientes</div>
                    )}
                  </div>
                ) : (
                  /* Con texto: Mostrar sugerencias predictivas */
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {suggestedProducts.length > 0 ? (
                      <div style={{ padding: "8px 0" }}>
                        {suggestedProducts.map((p) => (
                          <button
                            key={p.codigo}
                            onClick={() => {
                              setIsSearchFocused(false);
                              onSelectSuggestion?.(p.nombre);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "10px 16px",
                              background: "transparent",
                              border: "none",
                              borderBottom: "1px solid rgba(0,0,0,0.04)",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "6px",
                                background: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              }}
                            >
                              {p.imagen ? (
                                <Image src={p.imagen} alt={p.nombre} width={32} height={32} style={{ objectFit: "contain" }} />
                              ) : (
                                <span style={{ fontSize: "1.2rem" }}>📦</span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--texto)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {p.nombre}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                                {p.categoria}
                              </div>
                            </div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--rojo)" }}>
                              {formatPrice(p.precio)}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)", fontSize: "0.9rem" }}>
                        No se encontraron sugerencias
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hero-actions">
            <button className="btn-hero-cart" onClick={onOpenCart} aria-label="Abrir carrito">
              <span style={{ fontWeight: 900 }}>C</span>
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
              {cartQty > 0 && <span className="cart-badge">{cartQty}</span>}
            </button>

            {onShareCart && cartQty > 0 && (
              <button className="btn-hero-share" onClick={onShareCart} aria-label="Compartir carrito">
                C
                <span className="share-tooltip">Compartir carrito</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
