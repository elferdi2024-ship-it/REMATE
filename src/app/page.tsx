"use client";

import Image from "next/image";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════
   LANDING PAGE — Distribuidora El Remate
   
   📌 GUÍA RÁPIDA DE EDICIÓN:
   
   1. TEXTOS "COMPRÁ FÁCIL" → buscá: FEATURES (línea 35)
   2. TEXTOS "NUESTRAS SUCURSALES" → buscá: SUCURSALES (línea 11)
   3. TEXTOS "VARIEDAD DE PRODUCTOS" → buscá: CATEGORIAS (línea 20)
   4. TEXTOS "PEDÍ ONLINE" → buscá: "PEDÍ" (Ctrl+F, ~línea 620)
   5. TEXTOS "CONTACTO" → buscá: "TENÉS DUDAS" (Ctrl+F, ~línea 990)
   
   🎨 COLORES DISPONIBLES:
      Negro: "#000000" | Gris oscuro: "#333333" | Rojo: "#E8302A"
      Verde: "#1A7A42" | Marrón: "#5C4A35" | Blanco: "#FFFFFF"
   
   ═══════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────
   📍 DATOS: SUCURSALES (editar nombres, teléfonos, direcciones)
   ────────────────────────────────────────────────────────────── */
const SUCURSALES = [
  { nombre: "La Paz", telefono: "094 358 830", direccion: "Ramón Álvarez 225" },
  { nombre: "Las Piedras", telefono: "092 202 019", direccion: "Luis Alberto de Herrera 487" },
  { nombre: "18 de Mayo", telefono: "094 713 033", direccion: "Maestro Julio Castro 15" },
  { nombre: "Las Piedras", telefono: "099 013 272", direccion: "Avenida Artigas 750" },
  { nombre: "Canelones", telefono: "094 611 400", direccion: "General Artigas 118" },
  { nombre: "El Dorado", telefono: "093 404 158", direccion: "Elías Regules esq. Honduras" },
];

/* ──────────────────────────────────────────────────────────────
   📍 DATOS: CATEGORÍAS DE PRODUCTOS (editar nombres e íconos)
   ────────────────────────────────────────────────────────────── */
const CATEGORIAS = [
  { icono: "🫗", nombre: "ACEITES Y GRASAS", titulo: "Aceites y Grasas" },
  { icono: "🏠", nombre: "ARTÍCULOS DEL HOGAR", titulo: "Hogar" },
  { icono: "🍺", nombre: "BEBIDAS ALCOHÓLICAS", titulo: "Bebidas Alcohólicas" },
  { icono: "🥤", nombre: "BEBIDAS SIN ALCOHOL", titulo: "Bebidas sin Alcohol" },
  { icono: "🥩", nombre: "CARNES Y EMBUTIDOS", titulo: "Fiambres y Carnes" },
  { icono: "🌿", nombre: "CONDIMENTOS Y ESPECIAS", titulo: "Especias" },
  { icono: "🧊", nombre: "CONGELADOS", titulo: "Congelados" },
  { icono: "🥫", nombre: "CONSERVAS Y ENLATADOS", titulo: "Conservas" },
  { icono: "📦", nombre: "DESCARTABLES Y ART. DEL HOGAR", titulo: "Descartables" },
  { icono: "🍯", nombre: "DULCES Y MERMELADAS", titulo: "Dulces y Mermeladas" },
  { icono: "🍎", nombre: "FRUTAS Y VERDURAS", titulo: "Frutas y Verduras" },
  { icono: "🍬", nombre: "GOLOSINAS Y SNACKS", titulo: "Golosinas y Snacks" },
  { icono: "🌾", nombre: "HARINAS, PASTAS Y CEREALES", titulo: "Harinas y Pastas" },
  { icono: "🧴", nombre: "HIGIENE PERSONAL", titulo: "Higiene Personal" },
  { icono: "🥛", nombre: "LÁCTEOS Y HUEVOS", titulo: "Lácteos y Huevos" },
  { icono: "🧹", nombre: "LIMPIEZA DEL HOGAR", titulo: "Limpieza" },
  { icono: "🐾", nombre: "MASCOTAS", titulo: "Mascotas" },
  { icono: "🥖", nombre: "PANADERÍA Y REPOSTERÍA", titulo: "Panadería" },
  { icono: "🥫", nombre: "SALSAS Y ADEREZOS", titulo: "Salsas y Aderezos" },
  { icono: "☕", nombre: "YERBA, TÉ Y CAFÉ", titulo: "Yerba, Té y Café" },
  { icono: "📦", nombre: "OTROS", titulo: "Otros" },
];

/* ──────────────────────────────────────────────────────────────
   📍 DATOS: FEATURES "COMPRÁ FÁCIL" (editar títulos y descripciones)
   ────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icono: "💰",
    titulo: "Precios Mayoristas",
    descripcion: "Todos los días los mejores precios para tu negocio o tu hogar",
  },
  {
    icono: "📦",
    titulo: "+1900 Productos",
    descripcion: "Variedad completa en alimentos, bebidas, limpieza e insumos",
  },
  {
    icono: "🚚",
    titulo: "Envío a Domicilio",
    descripcion: "Recibí tu pedido en la puerta de tu casa o comercio",
  },
  {
    icono: "📱",
    titulo: "Pedí por WhatsApp",
    descripcion: "Rápido, práctico y pensado para vos. Hacé tu pedido ahora",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   🏠 SECCIÓN 1: HERO (sección principal de la página)
   - Título: "PRECIOS MAYORISTAS TODOS LOS DÍAS"
   - Descriptor: "Todo para tu negocio y tu casa..."
   - Botones: "VER CATÁLOGO" y "WhatsApp"
   - Stats: "1900+ Productos", "6 Sucursales", "WA Pedido Express"
   ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-body, 'DM Sans'), sans-serif" }}>
      {/* ══════ HERO (SECCIÓN PRINCIPAL) ══════ */}
      <section
        style={{
          background: "var(--oscuro, #1A1410)",
          position: "relative",
          overflow: "hidden",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Imagen de fondo */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image
            src="/hero-bg.jpg"
            alt="Distribuidora El Remate"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          {/* Overlay oscuro cálido — contraste alto para texto claro (97%/92%/70%/40%) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(17,11,8,0.97) 0%, rgba(17,11,8,0.92) 40%, rgba(17,11,8,0.70) 75%, rgba(17,11,8,0.40) 100%)",
            }}
          />
        </div>

        {/* Textura radial cálida */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(ellipse 60% 80% at -5% 50%, rgba(214,40,40,0.14) 0%, transparent 55%),
              radial-gradient(ellipse 50% 60% at 105% 20%, rgba(214,40,40,0.08) 0%, transparent 50%)
            `,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Contenido */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "80px 20px 60px",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: "28px", display: "flex", justifyContent: "center" }}>
            <Image
              src="/logo.png"
              alt="Distribuidora El Remate"
              width={180}
              height={180}
              style={{
                objectFit: "contain",
                maxWidth: "80vw",
                height: "auto",
                filter: "drop-shadow(0 4px 20px rgba(214,40,40,0.3))",
              }}
              priority
            />
          </div>

          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                background: "var(--rojo, #D62828)",
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                padding: "4px 12px",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(214,40,40,0.4)",
              }}
            >
              Mayorista
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--rojo, #D62828)",
                opacity: 0.9,
              }}
            >
              Distribuidora · Canelones
            </span>
          </div>

          {/* Título */}
          <h1
            className="hero-title"
            style={{
              fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
              letterSpacing: "3px",
              lineHeight: 0.9,
              color: "#fff",
              marginBottom: "20px",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            PRECIOS MAYORISTAS
            <span
              style={{
                display: "block",
                color: "var(--rojo, #D62828)",
                textShadow: "0 0 30px rgba(214,40,40,0.4)",
              }}
            >
              TODOS LOS DÍAS
            </span>
          </h1>

          {/* Descriptor — DM Serif Display italic + barra roja vertical */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: "32px",
            }}
          >
            {/* Barra roja vertical 4px */}
            <div
              style={{
                width: "4px",
                minHeight: "48px",
                background: "var(--rojo, #E8302A)",
                borderRadius: "2px",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-serif, 'DM Serif Display'), Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
                color: "var(--on-dark-mid, #C8C3BC)",
                lineHeight: 1.6,
                fontWeight: 400,
                margin: 0,
                textShadow: "0 1px 8px rgba(0,0,0,0.5)",
              }}
            >
              Todo para tu negocio y tu casa: alimentos, insumos, bebidas y limpieza al mejor precio.
            </p>
          </div>

          {/* CTAs */}
          <div
            className="cta-buttons"
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "40px",
            }}
          >
            <Link
              href="/catalogo"
              style={{
                background: "var(--rojo, #D62828)",
                color: "#fff",
                borderRadius: "var(--r-md, 12px)",
                padding: "14px 32px",
                fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                fontSize: "1.2rem",
                letterSpacing: "2px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 18px rgba(214,40,40,0.35)",
                transition: "all 0.15s",
              }}
            >
              🛒 VER CATÁLOGO
            </Link>
            <a
              href="https://wa.me/59899322325"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--verde, #1A7A42)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.2)",
                borderRadius: "var(--r-md, 12px)",
                padding: "14px 28px",
                fontFamily: "var(--font-body, 'DM Sans'), sans-serif",
                fontSize: "1rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 20px rgba(26,122,66,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
                transition: "all 0.2s",
                letterSpacing: "0.5px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--verde-dark, #145E33)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(26,122,66,0.5), 0 0 0 1px rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--verde, #1A7A42)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,122,66,0.4), 0 0 0 1px rgba(255,255,255,0.1)";
              }}
            >
              📱 WhatsApp
            </a>
          </div>

          {/* Stats */}
          <div
            className="hero-stats"
            style={{
              display: "inline-flex",
              border: "1px solid rgba(214,40,40,0.3)",
              borderRadius: "var(--r-sm, 8px)",
              overflow: "hidden",
              background: "rgba(26,20,16,0.5)",
              backdropFilter: "blur(8px)",
              flexWrap: "wrap",
            }}
          >
            {[
              { val: "1900+", lbl: "Productos" },
              { val: "6", lbl: "Sucursales" },
              { val: "WA", lbl: "Pedido Express" },
            ].map((stat, i) => (
              <div
                key={i}
                className="hero-stat"
                style={{
                  padding: "12px 24px",
                  textAlign: "center",
                  borderRight: i < 2 ? "1px solid rgba(214,40,40,0.15)" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                    fontSize: "1.8rem",
                    color: "var(--rojo, #D62828)",
                    letterSpacing: "1px",
                    lineHeight: 1,
                    textShadow: "0 0 12px rgba(214,40,40,0.3)",
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--on-dark-mid, #C8C3BC)",
                    marginTop: "4px",
                    textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {stat.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TICKER ══════ */}
      <div
        style={{
          background: "var(--oscuro-2, #2C2318)",
          borderTop: "1px solid rgba(214,40,40,0.12)",
          borderBottom: "1px solid rgba(214,40,40,0.12)",
          overflow: "hidden",
          padding: "10px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            animation: "tickerScroll 32s linear infinite",
            whiteSpace: "nowrap",
          }}
        >
          {[...Array(2)].map((_, idx) => (
            <span key={idx} style={{ display: "flex" }}>
              {[
                "⚡ Precios de distribuidor",
                "📦 Pedí por WhatsApp",
                "🏠 Zona Canelones",
                "🛒 Más de 1900 productos",
                "✅ Fiambres · Congelados · Limpieza",
                "🚚 Envío a domicilio",
              ].map((item, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "var(--crema, #F5F0E8)",
                    opacity: 0.55,
                    padding: "0 32px",
                    flexShrink: 0,
                  }}
                >
                  {item}
                  <span style={{ color: "var(--rojo, #D62828)", margin: "0 4px", opacity: 2 }}>
                    ★
                  </span>
                </span>
              ))}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes tickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ══════ FEATURES (TARJETAS "COMPRÁ FÁCIL") ══════
          📌 Aquí se editan los textos de las 4 tarjetas:
          - TÍTULO: color: "var(--oscuro, #111111)" → línea ~485
          - DESCRIPCIÓN: color: "var(--muted, #5C5550)" → línea ~495
          - DATOS: const FEATURES → línea 56
      ═══════════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px 20px",
          background: "var(--crema, #F5F0E8)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "var(--oscuro, #1A1410)",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              COMPRÁ FÁCIL
            </h2>
            <p
              style={{
                fontFamily: "var(--font-serif, 'DM Serif Display'), serif",
                fontStyle: "italic",
                fontSize: "1.1rem",
                color: "var(--tierra, #5C4A35)",
              }}
            >
              Rápido, práctico y pensado para vos
            </p>
          </div>

          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                style={{
                  background: "var(--white, #FFFFFF)",
                  borderRadius: "var(--r-lg, 16px)",
                  border: "1.5px solid var(--border, #DDD8D0)",
                  padding: "32px 24px",
                  textAlign: "center",
                  transition: "all 0.2s",
                  boxShadow: "var(--shadow-md, 0 4px 16px rgba(17,11,8,0.12))",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg, 0 12px 40px rgba(17,11,8,0.18))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md, 0 4px 16px rgba(17,11,8,0.12))";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>
                  {feature.icono}
                </div>
                {/* 👇 TÍTULO TARJETA - editar color aquí 👇 */}
                <h3
                  style={{
                    fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                    fontSize: "1.6rem",
                    color: "var(--oscuro, #111111)", // 🎨 COLOR TÍTULO: cambiar aquí
                    letterSpacing: "1px",
                    marginBottom: "12px",
                    lineHeight: 1.1,
                  }}
                >
                  {feature.titulo}
                </h3>
                {/* 👇 DESCRIPCIÓN TARJETA - editar color aquí 👇 */}
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--muted, #5C5550)", // 🎨 COLOR DESCRIPCIÓN: cambiar aquí
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {feature.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CATEGORÍAS (TARJETAS DE CATEGORÍAS) ══════
          📌 Aquí se editan los textos de las tarjetas de categorías:
          - NOMBRE: color: "var(--texto, #111111)" → línea ~610
          - DATOS: const CATEGORIAS → línea 38
      ═════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px 20px",
          background: "var(--crema, #F5F0E8)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "var(--muted, #9C8570)",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Catálogo
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "var(--oscuro, #1A1410)",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              VARIEDAD DE PRODUCTOS
            </h2>
            <p
              style={{
                fontFamily: "var(--font-serif, 'DM Serif Display'), serif",
                fontStyle: "italic",
                fontSize: "1.1rem",
                color: "var(--tierra, #5C4A35)",
              }}
            >
              Todo lo que necesitás en un solo lugar
            </p>
          </div>

          <div
            className="categorias-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "10px",
            }}
          >
            {CATEGORIAS.map((cat, i) => (
              <Link
                key={i}
                href={`/catalogo?categoria=${encodeURIComponent(cat.nombre)}`}
                style={{
                  background: "var(--white, #FFFFFF)",
                  borderRadius: "var(--r-md, 12px)",
                  border: "1.5px solid var(--border, #DDD8D0)",
                  padding: "24px 12px",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "var(--shadow-sm, 0 1px 3px rgba(17,11,8,0.08))",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md, 0 4px 16px rgba(17,11,8,0.12))";
                  e.currentTarget.style.borderColor = "var(--border-2, #C8C2B8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm, 0 1px 3px rgba(250, 250, 250, 0.08))";
                  e.currentTarget.style.borderColor = "var(--border, #DDD8D0)";
                }}
              >
                <span style={{ fontSize: "2.2rem" }}>{cat.icono}</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--texto, #111111)",
                    letterSpacing: "0.3px",
                    lineHeight: 1.3,
                  }}
                >
                  {cat.titulo}
                </span>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link
              href="/catalogo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--oscuro, #1A1410)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--r-md, 12px)",
                padding: "14px 32px",
                fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                fontSize: "1.2rem",
                letterSpacing: "2px",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              VER CATÁLOGO COMPLETO →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ PEDÍ ONLINE (SECCIÓN PASOS) ══════
          📌 Aquí se editan los textos de "PEDÍ ¡ONLINE!" y los 3 pasos:
          - TÍTULO: color: "var(--oscuro, #1A1410)" → línea ~690
          - DESC: color: "var(--tierra, #5C4A35)" → línea ~700
          - TÍTULOS PASOS: color: "var(--rojo, #E8302A)" → línea ~750
          - DESC PASOS: color: "var(--muted, #5C5550)" → línea ~760
      ═══════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px 20px",
          background: "var(--white, #FFFFFF)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "900px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "var(--muted, #9C8570)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Hacé tu pedido
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              color: "var(--oscuro, #1A1410)",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            PEDÍ
            <span style={{ color: "var(--rojo, #D62828)" }}> ¡ONLINE!</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-serif, 'DM Serif Display'), serif",
              fontStyle: "italic",
              fontSize: "1.15rem",
              color: "var(--tierra, #5C4A35)",
              lineHeight: 1.7,
              marginBottom: "40px",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Navegá por el catálogo, agregá lo que querés y enviá tu pedido por WhatsApp.
          </p>

          {/* Steps */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            {[
              { step: "1", icono: "🛒", titulo: "ELEGÍ", desc: "Navegá por el catálogo y seleccioná tus productos" },
              { step: "2", icono: "📝", titulo: "ARMÁ", desc: "Revisá tu pedido y ajustá cantidades si es necesario" },
              { step: "3", icono: "📱", titulo: "ENVIÁ", desc: "Enviá tu pedido por WhatsApp y coordiná la entrega" },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  background: "var(--white, #FFFFFF)",
                  border: "1.5px solid var(--border, #DDD8D0)",
                  borderRadius: "var(--r-lg, 16px)",
                  padding: "32px 20px 28px",
                  position: "relative",
                  boxShadow: "var(--shadow-md, 0 4px 16px rgba(17,11,8,0.12))",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg, 0 12px 40px rgba(17,11,8,0.18))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md, 0 4px 16px rgba(17,11,8,0.12))";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--rojo, #E8302A)",
                    color: "#fff",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                    fontSize: "1.2rem",
                    boxShadow: "0 2px 8px rgba(232,48,42,0.3)",
                  }}
                >
                  {step.step}
                </div>
                <div style={{ fontSize: "2.8rem", marginBottom: "14px", marginTop: "8px" }}>
                  {step.icono}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                    fontSize: "1.5rem",
                    color: "var(--rojo, #E8302A)",
                    letterSpacing: "1px",
                    marginBottom: "10px",
                    lineHeight: 1.1,
                  }}
                >
                  {step.titulo}
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--muted, #5C5550)",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--muted, #9C8570)",
              marginBottom: "32px",
            }}
          >
            También podés visitarnos en cualquiera de nuestras 6 sucursales en Canelones.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/catalogo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--rojo, #D62828)",
                color: "#fff",
                borderRadius: "var(--r-md, 12px)",
                padding: "16px 36px",
                fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                fontSize: "1.3rem",
                letterSpacing: "2px",
                textDecoration: "none",
                boxShadow: "0 4px 18px rgba(214,40,40,0.35)",
                transition: "all 0.15s",
              }}
            >
              🛒 IR AL CATÁLOGO
            </Link>
            <a
              href="https://wa.me/59899322325"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "var(--verde, #1A7A42)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.2)",
                borderRadius: "var(--r-md, 12px)",
                padding: "16px 32px",
                fontFamily: "var(--font-body, 'DM Sans'), sans-serif",
                fontSize: "1.05rem",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(26,122,66,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
                transition: "all 0.2s",
                letterSpacing: "0.5px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--verde-dark, #145E33)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(26,122,66,0.5), 0 0 0 1px rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--verde, #1A7A42)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,122,66,0.4), 0 0 0 1px rgba(255,255,255,0.1)";
              }}
            >
              📱 CONSULTAR POR WHATSAPP
            </a>
          </div>
        </div>
      </section>

      {/* ══════ SUCURSALES (TARJETAS DE SUCURSALES) ══════
          📌 Aquí se editan los textos de las 6 tarjetas de sucursales:
          - NOMBRE: color: "var(--oscuro, #111111)" → línea ~910
          - DIRECCIÓN: color: "var(--texto, #111111)" → línea ~920
          - TELÉFONO: color: "var(--verde, #1A7A42)" → línea ~935
          - DATOS: const SUCURSALES → línea 26
      ═══════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "80px 20px",
          background: "var(--crema, #F5F0E8)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "var(--oscuro, #111111)", // 🎨 COLOR TÍTULO SUCURSALES: cambiar aquí
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              NUESTRAS SUCURSALES
            </h2>
            <p
              style={{
                fontFamily: "var(--font-serif, 'DM Serif Display'), serif",
                fontStyle: "italic",
                fontSize: "1.1rem",
                color: "var(--tierra, #5C4A35)", // 🎨 COLOR SUBTÍTULO SUCURSALES: cambiar aquí
              }}
            >
              Encontranos en Canelones
            </p>
          </div>

          <div
            className="sucursales-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {SUCURSALES.map((sucursal, i) => (
              <div
                key={i}
                style={{
                  background: "var(--white, #FFFFFF)",
                  borderRadius: "var(--r-lg, 16px)",
                  border: "1.5px solid var(--border, #DDD8D0)",
                  padding: "28px",
                  boxShadow: "var(--shadow-md, 0 4px 16px rgba(17,11,8,0.12))",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg, 0 12px 40px rgba(17,11,8,0.18))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md, 0 4px 16px rgba(17,11,8,0.12))";
                }}
              >
                {/* 👇 NOMBRE SUCURSAL - editar color aquí 👇 */}
                <h3
                  style={{
                    fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
                    fontSize: "1.6rem",
                    color: "var(--oscuro, #111111)", // 🎨 COLOR NOMBRE: cambiar aquí
                    letterSpacing: "1px",
                    marginBottom: "16px",
                    lineHeight: 1.1,
                  }}
                >
                  📍 {sucursal.nombre}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* 👇 DIRECCIÓN SUCURSAL - editar color aquí 👇 */}
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--texto, #111111)", // 🎨 COLOR DIRECCIÓN: cambiar aquí
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    {sucursal.direccion}
                  </p>
                  {/* 👇 TELÉFONO SUCURSAL - editar color aquí 👇 */}
                  <a
                    href={`https://wa.me/598${sucursal.telefono.replace(/\s/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--verde, #1A7A42)", // 🎨 COLOR TELÉFONO: cambiar aquí
                      textDecoration: "none",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 10px",
                      borderRadius: "var(--r-sm, 8px)",
                      transition: "all 0.15s",
                      background: "rgba(26,122,66,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(26,122,66,0.12)";
                      e.currentTarget.style.color = "var(--verde-dark, #145E33)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(26,122,66,0.06)";
                      e.currentTarget.style.color = "var(--verde, #1A7A42)";
                    }}
                  >
                    📱 {sucursal.telefono}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CONTACTO (SECCIÓN OSCURA CON BOTÓN WHATSAPP) ══════
          📌 Aquí se editan los textos de la sección de contacto:
          - TÍTULO: color: "#FFFFFF" (blanco) → línea ~1050
          - DESC: color: "var(--on-dark-mid, #C8C3BC)" → línea ~1060
          - BOTÓN WA: fondo "var(--verde, #1A7A42)" + texto "#FFFFFF" → línea ~1080
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "60px 20px",
          background: "var(--oscuro, #1A1410)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow decorativo cálido */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(214,40,40,0.12) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              color: "#fff",
              letterSpacing: "2px",
              marginBottom: "16px",
              textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              lineHeight: 1.1,
            }}
          >
            ¿TENÉS DUDAS O QUERÉS HACER UN PEDIDO?
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--on-dark-mid, #C8C3BC)",
              marginBottom: "32px",
              fontWeight: 500,
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
            }}
          >
            Contactanos por WhatsApp y te respondemos al instante
          </p>
          <a
            href="https://wa.me/59894717052"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              background: "var(--verde, #1A7A42)",
              color: "#fff",
              borderRadius: "var(--r-md, 12px)",
              padding: "18px 36px",
              fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif",
              fontSize: "1.4rem",
              letterSpacing: "2px",
              textDecoration: "none",
              boxShadow: "0 6px 24px rgba(26,122,66,0.5), 0 0 0 2px rgba(255,255,255,0.15)",
              transition: "all 0.2s",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--verde-dark, #145E33)";
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,122,66,0.6), 0 0 0 2px rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--verde, #1A7A42)";
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(26,122,66,0.5), 0 0 0 2px rgba(255,255,255,0.15)";
            }}
          >
            📱 099 322 325
          </a>
        </div>
      </section>

      {/* ══════ FOOTER (PIE DE PÁGINA) ══════
          📌 Aquí se editan los textos del footer:
          - COPYRIGHT: color: "rgba(255,255,255,0.35)" → línea ~1130
          - POWERED BY: color: "rgba(255,255,255,0.2)" → línea ~1135
      ══════════════════════════════════════════════════ */}
      <footer
        style={{
          background: "var(--oscuro, #1A1410)",
          padding: "32px 20px",
          textAlign: "center",
          borderTop: "1px solid var(--oscuro-3, #3D3226)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "16px" }}>
            <Image
              src="/logo.png"
              alt="Distribuidora El Remate"
              width={60}
              height={60}
              style={{ objectFit: "contain", opacity: 0.6 }}
            />
          </div>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginBottom: "6px" }}>
            Copyright © 2026 Distribuidora El Remate. Todos los derechos reservados.
          </p>
          <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>
            Powered by Dafna y Mateo Asencio
          </p>
        </div>
      </footer>

      {/* ── Responsive (MÓVIL OPTIMIZADO) ── */}
      <style jsx global>{`
        /* ═══════════════════════════════════════════════════════
           📱 MODO MOBILE - Optimizado para pantallas pequeñas
           Desktop NO se modifica
           ═══════════════════════════════════════════════════════ */
        
        @media (max-width: 768px) {
          /* HERO - Sección principal */
          .hero-title { 
            font-size: 2.5rem !important;
            letter-spacing: 1.5px !important;
          }
          .hero-stats { 
            flex-direction: column !important; 
            width: 100% !important;
          }
          .hero-stat {
            border-right: none !important;
            border-bottom: 1px solid rgba(214,40,40,0.15) !important;
            padding: 12px !important;
          }
          .hero-stat:last-child { border-bottom: none !important; }
          
          /* CTA buttons */
          .cta-buttons { 
            flex-direction: column !important;
            gap: 10px !important;
          }
          .cta-buttons a, .cta-buttons button {
            width: 100% !important;
            justify-content: center !important;
            padding: 14px 24px !important;
          }
          
          /* Grids a 1 columna */
          .features-grid,
          .categorias-grid,
          .sucursales-grid { 
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          
          /* Secciones - padding reducido */
          section {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          /* HERO más pequeño */
          .hero-title { 
            font-size: 2rem !important;
            letter-spacing: 1px !important;
          }
          .hero-descriptor { 
            font-size: 0.9rem !important;
            line-height: 1.5 !important;
          }
          
          /* Stats más compactos */
          .hero-stat {
            padding: 10px !important;
          }
          .hero-stat-val {
            font-size: 1.5rem !important;
          }
          .hero-stat-lbl {
            font-size: 0.6rem !important;
          }
          
          /* FEATURES - tarjetas más compactas */
          .features-grid > div {
            padding: 24px 16px !important;
          }
          .features-grid h3 {
            font-size: 1.4rem !important;
          }
          .features-grid p {
            font-size: 0.9rem !important;
          }
          
          /* CATEGORÍAS - grid 2 columnas en mobile muy pequeño */
          .categorias-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .categorias-grid > a {
            padding: 16px 8px !important;
          }
          .categorias-grid span:first-child {
            font-size: 1.8rem !important;
          }
          .categorias-grid span:last-child {
            font-size: 0.7rem !important;
          }
          
          /* SUCURSALES - padding reducido */
          .sucursales-grid > div {
            padding: 20px !important;
          }
          .sucursales-grid h3 {
            font-size: 1.4rem !important;
          }
          .sucursales-grid p,
          .sucursales-grid a {
            font-size: 0.9rem !important;
          }
          
          /* PEDÍ ONLINE steps */
          section > div > div:last-child > div {
            padding: 24px 16px !important;
          }
          
          /* CONTACTO - botón más grande */
          section > div > div:last-child a {
            width: 100% !important;
            justify-content: center !important;
            padding: 16px 24px !important;
            font-size: 1.3rem !important;
          }
        }
        
        /* Ajustes extra para pantallas muy pequeñas (320px-360px) */
        @media (max-width: 360px) {
          .hero-title { 
            font-size: 1.8rem !important;
          }
          .hero-descriptor {
            font-size: 0.85rem !important;
          }
          
          /* Categorías en 1 columna en pantallas muy pequeñas */
          .categorias-grid {
            grid-template-columns: 1fr !important;
          }
          
          /* Textos más pequeños en general */
          section h2 {
            font-size: 1.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}
