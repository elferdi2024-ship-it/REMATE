"use client";

import React from "react";
import { EMOJI_POR_CATEGORIA } from "@/types";

interface CatsNavProps {
  categorias: string[];
  activeCat: string;
  onSelect: (cat: string) => void;
}

export default function CatsNav({ categorias, activeCat, onSelect }: CatsNavProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky-nav" aria-label="Categorías de productos" style={{
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      position: "relative"
    }}>
      {/* Botones de navegación (solo PC) */}
      <button 
        className="nav-arrow left"
        onClick={() => scroll("left")}
        aria-label="Anterior"
      >
        ‹
      </button>

      <div className="cats-wrap" ref={scrollRef} style={{ width: "100%", overflowX: "auto", scrollbarWidth: "none" }}>
        <div className="cats-inner-circular" style={{ 
          gap: "24px", 
          padding: "16px 20px",
          display: "flex",
          width: "max-content",
          minWidth: "100%",
          alignItems: "flex-start"
        }}>
          {categorias.map((cat) => {
            const emoji = EMOJI_POR_CATEGORIA[cat] || "📦";
            const isActive = cat === activeCat || (cat === "Todos" && (activeCat === "" || activeCat === "Todos"));
            return (
              <button
                key={cat}
                className={`cat-circle-btn${isActive ? " active" : ""}`}
                onClick={() => onSelect(cat)}
                aria-pressed={isActive}
                style={{ 
                    width: "80px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0
                }}
              >
                <div className="cat-circle-icon" style={{ 
                  width: "62px", 
                  height: "62px", 
                  fontSize: "1.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: isActive ? "var(--rojo)" : "var(--bg2)",
                  color: isActive ? "white" : "inherit",
                  boxShadow: isActive ? "0 8px 16px var(--rojo-glow)" : "0 2px 4px rgba(0,0,0,0.04)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: isActive ? "2px solid var(--rojo)" : "1px solid var(--border)"
                }}>{emoji}</div>
                <span className="cat-circle-label" style={{ 
                  fontFamily: "var(--font-body)",
                  fontSize: "10px", 
                  marginTop: "10px",
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "var(--rojo)" : "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                  lineHeight: "1.2",
                  maxWidth: "100%"
                }}>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button 
        className="nav-arrow right"
        onClick={() => scroll("right")}
        aria-label="Siguiente"
      >
        ›
      </button>

      <style jsx>{`
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          border: 1px solid var(--border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10;
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--oscuro);
          transition: all 0.2s;
        }
        .nav-arrow:hover {
          background: var(--bg2);
          transform: translateY(-50%) scale(1.1);
        }
        .nav-arrow.left { left: 10px; }
        .nav-arrow.right { right: 10px; }

        @media (min-width: 1024px) {
          .nav-arrow { display: flex; }
          .cats-wrap { padding: 0 50px; }
        }
      `}</style>
    </nav>
  );
}
