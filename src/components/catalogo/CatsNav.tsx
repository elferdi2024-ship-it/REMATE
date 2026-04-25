"use client";

import React from "react";
import { EMOJI_POR_CATEGORIA } from "@/types";

interface CatsNavProps {
  categorias: string[];
  activeCat: string;
  onSelect: (cat: string) => void;
}

export default function CatsNav({ categorias, activeCat, onSelect }: CatsNavProps) {
  return (
    <nav className="sticky-nav" aria-label="Categorías de productos" style={{
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(0,0,0,0.05)"
    }}>
      <div className="cats-wrap" style={{ width: "100%", overflowX: "auto" }}>
        <div className="cats-inner-circular" style={{ 
          gap: "20px", 
          padding: "16px 20px",
          display: "flex",
          width: "max-content",
          minWidth: "100%"
        }}>
          {categorias.map((cat) => {
            const emoji = EMOJI_POR_CATEGORIA[cat] || "📦";
            const isActive = cat === activeCat;
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
                    padding: 0
                }}
              >
                <div className="cat-circle-icon" style={{ 
                  width: "60px", 
                  height: "60px", 
                  fontSize: "1.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: isActive ? "var(--oscuro)" : "var(--bg2)",
                  color: isActive ? "white" : "inherit",
                  boxShadow: isActive ? "0 10px 20px rgba(0,0,0,0.15)" : "0 2px 4px rgba(0,0,0,0.05)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}>{emoji}</div>
                <span className="cat-circle-label" style={{ 
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)", 
                  marginTop: "8px",
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "var(--oscuro)" : "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
