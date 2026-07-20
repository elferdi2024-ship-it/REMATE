"use client";

import React, { useState, useEffect } from "react";
import { EMOJI_POR_CATEGORIA } from "@/types";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

interface CatsNavProps {
  categorias: string[];
  activeCat: string;
  onSelect: (cat: string) => void;
}

export default function CatsNav({ categorias, activeCat, onSelect }: CatsNavProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [configCats, setConfigCats] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "configuracion", "categorias"));
        if (snap.exists()) {
          setConfigCats(snap.data());
        }
      } catch (e) {
        console.error("Error cargando config de categorías:", e);
      }
    }
    load();
  }, []);

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
      position: "sticky",
      top: 0,
      zIndex: 90
    }}>
      {/* Botones de navegación (solo PC) */}
      <button 
        className="nav-arrow left"
        onClick={() => scroll("left")}
        aria-label="Anterior"
      >
        ‹
      </button>

      <div style={{ position: "relative", width: "100%", overflow: "hidden", display: "flex", alignItems: "center" }}>
        {/* Desvanecimiento Izquierdo */}
        <div className="scroll-fade-left" style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "48px",
          background: "linear-gradient(to right, rgba(255,255,255,0.95) 20%, transparent 100%)",
          zIndex: 5,
          pointerEvents: "none"
        }} />
        
        {/* Desvanecimiento Derecho */}
        <div className="scroll-fade-right" style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "48px",
          background: "linear-gradient(to left, rgba(255,255,255,0.95) 20%, transparent 100%)",
          zIndex: 5,
          pointerEvents: "none"
        }} />

        <div className="cats-wrap" ref={scrollRef} style={{ width: "100%", overflowX: "auto", scrollbarWidth: "none" }}>
          <div className="cats-inner-circular">
            {categorias.map((cat) => {
              const emoji = EMOJI_POR_CATEGORIA[cat] || "📦";
              const isActive = cat === activeCat || (cat === "Todos" && (activeCat === "" || activeCat === "Todos"));
              return (
                <button
                  key={cat}
                  className={`cat-circle-btn${isActive ? " active" : ""}`}
                  onClick={() => onSelect(cat)}
                  aria-pressed={isActive}
                >
                  <div className="cat-circle-icon">
                    {configCats[cat] ? (
                      <div style={{ position: "relative", width: "70%", height: "70%" }}>
                        <Image 
                          src={configCats[cat]} 
                          alt={cat} 
                          fill 
                          className="object-contain animate-icon-subtle"
                        />
                      </div>
                    ) : (
                      emoji
                    )}
                  </div>
                  <span className="cat-circle-label">{cat}</span>
                </button>
              );
            })}
          </div>
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
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-arrow:hover {
          background: var(--bg2);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .nav-arrow.left { left: 10px; }
        .nav-arrow.right { right: 10px; }

        .cats-inner-circular {
          gap: 12px;
          padding: 12px 16px;
          display: flex;
          width: max-content;
          min-width: 100%;
          align-items: flex-start;
        }

        .cat-circle-btn {
          width: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cat-circle-icon {
          width: 52px;
          height: 52px;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--bg2);
          color: inherit;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid var(--border);
          box-shadow: 0 2px 8px rgba(17,11,8,0.02);
        }
        
        .cat-circle-btn:hover .cat-circle-icon {
          background: var(--crema-2);
          border-color: var(--border-2);
          box-shadow: 0 4px 12px rgba(17,11,8,0.06);
          transform: scale(1.05);
        }

        .cat-circle-btn.active .cat-circle-icon {
          background: #ffffff;
          color: var(--rojo);
          border: 2px solid var(--rojo);
          box-shadow: 0 4px 14px rgba(232, 48, 42, 0.15);
          transform: scale(1.05);
        }

        .cat-circle-label {
          font-family: var(--font-body);
          font-size: 9px;
          margin-top: 8px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
          line-height: 1.2;
          max-width: 100%;
          transition: color 0.3s, font-weight 0.3s;
        }

        .cat-circle-btn.active .cat-circle-label {
          font-weight: 800;
          color: var(--rojo);
        }

        .cat-circle-btn:hover .cat-circle-label {
          color: var(--text);
        }

        @media (min-width: 768px) {
          .cats-inner-circular {
            gap: 24px;
            padding: 16px 24px;
          }
          .cat-circle-btn {
            width: 80px;
          }
          .cat-circle-icon {
            width: 62px;
            height: 62px;
            font-size: 1.8rem;
          }
          .cat-circle-label {
            font-size: 10px;
            margin-top: 10px;
          }
        }

        @media (min-width: 1024px) {
          .nav-arrow { display: flex; }
          .cats-wrap { padding: 0 50px; }
        }
      `}</style>
    </nav>
  );
}
