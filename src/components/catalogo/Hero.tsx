"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import type { Producto } from "@/types";
import { SUCURSALES } from "@/lib/sucursales";
import { haptic } from "@/lib/haptic";

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
  onSearchSubmit?: (q: string) => void;
  suggestedProducts?: Producto[];
  recentSearches?: string[];
  onSelectSuggestion?: (query: string) => void;
  sucursalId?: string | null;
  onChangeBranch?: () => void;
}

import { formatPrice } from "@/lib/format";


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
  onSearchSubmit,
  suggestedProducts = [],
  recentSearches = [],
  onSelectSuggestion,
  sucursalId = null,
  onChangeBranch,
}: HeroProps) {
  const sucursalObj = SUCURSALES.find((s) => s.id === sucursalId);
  const trustItems = ["Precios mayoristas reales", "Pedido en minutos", "Atencion por WhatsApp"];
  const [inputValue, setInputValue] = useState(searchQuery || "");

  // Sync with parent query changes (e.g. from banner or popular tags)
  useEffect(() => {
    setInputValue(searchQuery || "");
  }, [searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onSearchChange?.(val);
  };

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
              "linear-gradient(135deg, rgba(17,11,8,0.95) 0%, rgba(17,11,8,0.88) 40%, rgba(17,11,8,0.65) 75%, rgba(17,11,8,0.3) 100%)",
            backdropFilter: "blur(4px)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 100% at -5% 50%, rgba(214,40,40,0.2) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 1,
          animation: "pulse 6s infinite ease-in-out"
        }}
      />

      <div className="hero-inner hero-inner-v2" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-brand">
          <Link href="/" className="hero-back-link">
            Inicio
          </Link>

          <div style={{ marginBottom: "10px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span className="hero-eyebrow-badge">MAYORISTA · DISTRIBUIDORA · CANELONES</span>
            {sucursalObj && (
              <button
                type="button"
                onClick={onChangeBranch}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(232, 48, 42, 0.12)",
                  border: "1px solid rgba(232, 48, 42, 0.3)",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: "0 2px 10px rgba(232,48,42,0.1)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
                  e.currentTarget.style.borderColor = 'rgba(232, 48, 42, 0.6)';
                  e.currentTarget.style.background = 'rgba(232, 48, 42, 0.18)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(232,48,42,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'rgba(232, 48, 42, 0.3)';
                  e.currentTarget.style.background = 'rgba(232, 48, 42, 0.12)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(232,48,42,0.1)';
                }}
              >
                <span>🏪 {sucursalObj.nombre}</span>
                <span style={{ color: "#E8302A", fontSize: "0.6rem", fontWeight: 900 }}>· Cambiar</span>
              </button>
            )}

            <Link
              href="/tutorial"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px dashed rgba(255, 255, 255, 0.2)",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "0.68rem",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "#fff",
                textDecoration: "none",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1.5px) scale(1.02)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <span>🎤 Guía con &quot;Marti&quot; 🔨</span>
            </Link>
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
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "12px",
              overflow: "hidden",
              width: "fit-content",
              display: "flex",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
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

          <div 
            className="hero-search-wrap" 
            ref={searchContainerRef} 
            style={{ 
              position: "relative",
              width: "100%",
              maxWidth: "650px",
              margin: "0 auto",
            }}
          >
            <span 
              className="hero-search-icon" 
              style={{ 
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isSearchFocused ? "var(--rojo, #E8302A)" : "#8E8880",
                zIndex: 2,
                transition: "color 0.2s ease-in-out",
              }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscá por nombre, marca o categoría..."
              value={inputValue}
              onChange={handleChange}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setIsSearchFocused(false);
                  onSearchChange?.(inputValue);
                  if (onSearchSubmit) onSearchSubmit(inputValue);
                }
              }}
              aria-label="Buscar producto"
              className="hero-search-input-premium"
            />
            {inputValue && (
              <button
                className="hero-search-clear-btn"
                onClick={() => {
                  setInputValue("");
                  onSearchChange?.("");
                }}
                aria-label="Limpiar busqueda"
              >
                ✕
              </button>
            )}

            <button
              onClick={() => {
                setIsSearchFocused(false);
                onSearchChange?.(inputValue);
                if (onSearchSubmit) onSearchSubmit(inputValue);
              }}
              style={{
                position: "absolute",
                right: "6px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "linear-gradient(135deg, var(--rojo, #D62828) 0%, #E8302A 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "24px",
                padding: "10px 24px",
                fontSize: "0.85rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(232, 48, 42, 0.3)",
                transition: "all 0.2s ease-in-out",
                letterSpacing: "1.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                zIndex: 3,
              }}
              className="hidden-mobile"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-50%) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(232, 48, 42, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(232, 48, 42, 0.3)";
              }}
            >
              <span>BUSCAR</span>
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Predictive Search Dropdown */}
            {isSearchFocused && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "#ffffff",
                  borderRadius: "18px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)",
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
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              haptic.add();
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

          <div
            className="hero-search-tags"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "16px",
              flexWrap: "wrap",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#C8C3BC",
              width: "100%",
            }}
          >
            <span style={{ opacity: 0.85 }}>Búsquedas sugeridas:</span>
            {[
              { label: "Mayonesa", query: "mayonesa" },
              { label: "Refrescos", query: "refresco" },
              { label: "Hamburguesas", query: "hamburguesa" },
              { label: "Helados", query: "helado" },
              { label: "Cerveza", query: "cerveza" }
            ].map((tag) => (
              <button
                key={tag.query}
                onClick={() => {
                  setInputValue(tag.label);
                  onSearchChange?.(tag.query);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "16px",
                  padding: "5px 14px",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 700,
                  transition: "all 0.2s ease-in-out",
                  fontFamily: "var(--font-body), sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--rojo, #D62828)";
                  e.currentTarget.style.borderColor = "var(--rojo, #D62828)";
                  e.currentTarget.style.transform = "translateY(-1.5px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(214, 40, 40, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className="hero-actions">
            <button className="btn-hero-cart" onClick={onOpenCart} aria-label="Abrir carrito">
              <span style={{ fontWeight: 900 }}>🛒</span>
              <span>{cartQty > 0 ? "VER PEDIDO" : "EMPEZAR PEDIDO"}</span>
              {cartQty > 0 && (
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
              )}
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
