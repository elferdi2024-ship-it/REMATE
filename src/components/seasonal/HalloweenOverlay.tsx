// filepath: src/components/seasonal/HalloweenOverlay.tsx
"use client";

import React, { useEffect, useState } from "react";

interface HalloweenOverlayProps {
  /** Controlado en vivo desde Admin (config/tienda -> modoHalloween) */
  enabled?: boolean;
  /** Cantidad de productos en el carrito para sincronizar posición con el FAB */
  cartQty?: number;
}

/**
 * Data-URI SVG: Telaraña de esquina superior izquierda (para tarjetas destacadas / en carrito)
 */
const COBWEB_TOP_LEFT_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <g stroke="#64748B" stroke-width="1.15" stroke-linecap="round" opacity="0.58">
    <line x1="0" y1="0" x2="46" y2="4" />
    <line x1="0" y1="0" x2="42" y2="19" />
    <line x1="0" y1="0" x2="31" y2="33" />
    <line x1="0" y1="0" x2="17" y2="43" />
    <line x1="0" y1="0" x2="3" y2="46" />
    <path d="M 14 1.5 Q 12 6 13 8.5 Q 9.5 10 9.5 13.5 Q 5.5 14 5.5 17.5 Q 2 17.5 1 19" />
    <path d="M 27 2.5 Q 23.5 9.5 25 13 Q 19.5 16 19 20.5 Q 13 21.5 11 26.5 Q 5.5 27.5 2 30" />
    <path d="M 40 3.5 Q 35.5 13 37.5 17.5 Q 29.5 22 28.5 28.5 Q 19.5 31 15.5 38.5 Q 8 40 2.5 42" />
  </g>
</svg>
`);

/**
 * Data-URI SVG: Telaraña lateral derecha para el interior del buscador (junto al botón rojo de lupa)
 */
const COBWEB_SEARCH_RIGHT_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 40" fill="none">
  <g stroke="#64748B" stroke-width="1.15" stroke-linecap="round" opacity="0.62">
    <line x1="44" y1="0" x2="4" y2="2" />
    <line x1="44" y1="0" x2="10" y2="17" />
    <line x1="44" y1="0" x2="21" y2="30" />
    <line x1="44" y1="0" x2="35" y2="39" />
    <line x1="44" y1="40" x2="14" y2="38" />
    <line x1="44" y1="40" x2="22" y2="25" />
    <path d="M 30 1 Q 31 6 29 9 Q 33 12 34 16 Q 38 18 41 21" />
    <path d="M 18 1.5 Q 21 9 18 13.5 Q 24 18 25.5 23.5 Q 32 26 36.5 32" />
    <path d="M 7 2 Q 12 11 9.5 17 Q 18 22 21 30 Q 29 33 35 39" />
  </g>
</svg>
`);

/**
 * Data-URI SVG: Silueta de murciélago sutil (inclinado -10deg)
 */
const BAT_LEFT_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 18" fill="none">
  <path
    d="M18 5.2C16.9 5.2 16.2 4.3 15.8 3.2L15.1 5.4C11.4 3.4 5.8 3.2 1 6.5C4.5 6.8 6.8 8.3 7.7 10.6C9.6 9.5 11.7 9.8 13.1 11.4C14.8 10.3 16.5 10.7 18 12.6C19.5 10.7 21.2 10.3 22.9 11.4C24.3 9.8 26.4 9.5 28.3 10.6C29.2 8.3 31.5 6.8 35 6.5C30.2 3.2 24.6 3.4 20.9 5.4L20.2 3.2C19.8 4.3 19.1 5.2 18 5.2Z"
    fill="#64748B"
    fill-opacity="0.48"
  />
</svg>
`);

/**
 * Data-URI SVG: Silueta de murciélago sutil (inclinado +12deg)
 */
const BAT_RIGHT_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 18" fill="none">
  <g transform="rotate(10 18 9)">
    <path
      d="M18 5.2C16.9 5.2 16.2 4.3 15.8 3.2L15.1 5.4C11.4 3.4 5.8 3.2 1 6.5C4.5 6.8 6.8 8.3 7.7 10.6C9.6 9.5 11.7 9.8 13.1 11.4C14.8 10.3 16.5 10.7 18 12.6C19.5 10.7 21.2 10.3 22.9 11.4C24.3 9.8 26.4 9.5 28.3 10.6C29.2 8.3 31.5 6.8 35 6.5C30.2 3.2 24.6 3.4 20.9 5.4L20.2 3.2C19.8 4.3 19.1 5.2 18 5.2Z"
      fill="#64748B"
      fill-opacity="0.42"
    />
  </g>
</svg>
`);

export default function HalloweenOverlay({
  enabled = true,
  cartQty = 0,
}: HalloweenOverlayProps) {
  const [urlOverride, setUrlOverride] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hw = params.get("halloween");
    if (hw === "1" || hw === "true") setUrlOverride(true);
    else if (hw === "0" || hw === "false") setUrlOverride(false);
  }, []);

  const isActive = urlOverride !== null ? urlOverride : enabled;

  if (!isActive) return null;

  // Posición sincronizada con el botón flotante de chat (FAB)
  const pumpkinBottomClass =
    cartQty > 0
      ? "bottom-[calc(122px+env(safe-area-inset-bottom,8px))] sm:bottom-5"
      : "bottom-[calc(66px+env(safe-area-inset-bottom,8px))] sm:bottom-5";

  return (
    <>
      {/* ── Capa CSS Decorativa No-Intrusiva (Se adapta al scroll y estructura real de la web) ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* 1. Telaraña en esquina derecha interna del buscador (junto al botón rojo de búsqueda) */
            div:has(> #header-search-input)::before {
              content: "";
              position: absolute;
              right: 36px;
              top: 0;
              bottom: 0;
              width: 42px;
              background-image: url("data:image/svg+xml;utf8,${COBWEB_SEARCH_RIGHT_SVG}");
              background-repeat: no-repeat;
              background-position: right center;
              background-size: 40px 100%;
              pointer-events: none;
              z-index: 4;
            }

            /* 2. Murciélago sutil en el espacio blanco de la cabecera (entre el logo y sucursal) */
            header.ux > div > div:first-child {
              position: relative;
            }
            header.ux > div > div:first-child::after {
              content: "";
              position: absolute;
              left: 44%;
              top: 50%;
              transform: translate(-50%, -50%) rotate(-12deg);
              width: 30px;
              height: 16px;
              background-image: url("data:image/svg+xml;utf8,${BAT_LEFT_SVG}");
              background-repeat: no-repeat;
              background-size: contain;
              pointer-events: none;
              z-index: 1;
            }

            /* Destello naranja festivo junto al botón de carrito superior */
            header.ux button[aria-label^="Ver carrito"]::after {
              content: "";
              position: absolute;
              top: -6px;
              right: -9px;
              width: 10px;
              height: 10px;
              border-top: 2px solid #F97316;
              border-right: 2px solid #F97316;
              transform: rotate(15deg);
              border-radius: 1px;
              pointer-events: none;
              opacity: 0.85;
            }

            /* 3. Murciélagos sutiles en los encabezados de categorías (se mueven con el scroll) */
            .lazy-section-wrapper section > div:first-child {
              position: relative;
            }
            .lazy-section-wrapper section > div:first-child::after {
              content: "";
              position: absolute;
              right: 6px;
              top: 50%;
              transform: translateY(-50%);
              width: 28px;
              height: 15px;
              background-image: url("data:image/svg+xml;utf8,${BAT_RIGHT_SVG}");
              background-repeat: no-repeat;
              background-size: contain;
              pointer-events: none;
            }
            .lazy-section-wrapper section > div:first-child::before {
              content: "";
              position: absolute;
              left: -4px;
              top: -11px;
              width: 22px;
              height: 12px;
              background-image: url("data:image/svg+xml;utf8,${BAT_LEFT_SVG}");
              background-repeat: no-repeat;
              background-size: contain;
              pointer-events: none;
              opacity: 0.75;
            }

            /* 4. Tarjetas de Producto: Borde Naranja Halloween y Telaraña en esquina superior izquierda */
            article.ux.ring-2,
            .cat-carousel-item:first-child article.ux {
              border-color: #F97316 !important;
              box-shadow: 0 10px 26px -10px rgba(249, 115, 22, 0.28) !important;
            }

            article.ux.ring-2::after,
            .cat-carousel-item:first-child article.ux::after {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 44px;
              height: 44px;
              background-image: url("data:image/svg+xml;utf8,${COBWEB_TOP_LEFT_SVG}");
              background-repeat: no-repeat;
              background-position: top left;
              background-size: 42px 42px;
              border-top-left-radius: 15px;
              pointer-events: none;
              z-index: 25;
            }

            /* 5. Murciélago sutil junto al botón "Ver los X productos..." */
            .cat-carousel-wrap + div {
              position: relative;
            }
            .cat-carousel-wrap + div::before {
              content: "";
              position: absolute;
              left: 14px;
              top: 50%;
              transform: translateY(-50%) rotate(-8deg);
              width: 24px;
              height: 13px;
              background-image: url("data:image/svg+xml;utf8,${BAT_LEFT_SVG}");
              background-repeat: no-repeat;
              background-size: contain;
              pointer-events: none;
              opacity: 0.7;
            }

            /* Ocultar el adorno flotante de calabaza cuando el modal de chat esté abierto */
            body.chat-widget-open .halloween-floating-companion {
              opacity: 0 !important;
              transform: scale(0.8) translateY(10px) !important;
            }
          `,
        }}
      />

      {/* ── Adorno Flotante No-Interactivo: Calabaza de Halloween y Destellos junto al Botón de Chat ── */}
      <div
        aria-hidden="true"
        className={`halloween-floating-companion fixed z-[41] pointer-events-none select-none transition-all duration-300 right-3 sm:right-5 ${pumpkinBottomClass}`}
      >
        <div className="relative w-16 h-16 sm:w-[70px] sm:h-[70px]">
          {/* Destellos festivos naranjas alrededor del botón */}
          <svg
            viewBox="0 0 80 80"
            fill="none"
            className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]"
          >
            {/* Rayitas festivas izquierda arriba */}
            <line x1="8" y1="22" x2="2" y2="16" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="6" y1="29" x2="0" y2="28" stroke="#FB923C" strokeWidth="1.8" strokeLinecap="round" />
            {/* Rayitas festivas abajo derecha */}
            <line x1="66" y1="58" x2="74" y2="63" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="61" y1="65" x2="68" y2="71" stroke="#FB923C" strokeWidth="1.8" strokeLinecap="round" />
          </svg>

          {/* Calabaza Jack-o'-Lantern apoyada en la esquina inferior izquierda del botón de chat */}
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -bottom-1 -left-3.5 w-9 h-9 sm:w-10 sm:h-10 drop-shadow-[0_4px_8px_rgba(15,23,42,0.28)]"
          >
            {/* Tallo verde curvo */}
            <path
              d="M29 14C29 9.5 32.5 6 36.5 5.5C38 5.3 39 6.8 37.8 7.8C35.5 9.6 34.5 11.8 34.5 14H29Z"
              fill="#15803D"
            />
            {/* Cuerpo de la calabaza (gajos laterales y central) */}
            <ellipse cx="21" cy="36" rx="13" ry="18" fill="#EA580C" />
            <ellipse cx="43" cy="36" rx="13" ry="18" fill="#EA580C" />
            <ellipse cx="26" cy="36" rx="12" ry="19.5" fill="#F97316" />
            <ellipse cx="38" cy="36" rx="12" ry="19.5" fill="#F97316" />
            <ellipse cx="32" cy="36" rx="11" ry="20" fill="#FB923C" />
            {/* Ojos triangulares simpáticos */}
            <path d="M23 26L28.5 33H18.5L23 26Z" fill="#431407" />
            <path d="M41 26L45.5 33H35.5L41 26Z" fill="#431407" />
            {/* Nariz pequeña */}
            <path d="M32 33.5L34.5 37.5H29.5L32 33.5Z" fill="#431407" />
            {/* Sonrisa clásica de Halloween con dientecito */}
            <path
              d="M19 41.5C22.5 47.5 27.5 49 32 49C36.5 49 41.5 47.5 45 41.5C41.5 43.5 37.5 44.5 34.5 44.5V42.5H29.5V44.5C26.5 44.5 22.5 43.5 19 41.5Z"
              fill="#431407"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
