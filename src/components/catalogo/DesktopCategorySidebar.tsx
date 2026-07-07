"use client";

import React, { useState, useEffect } from "react";
import { EMOJI_POR_CATEGORIA } from "@/types";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

interface DesktopCategorySidebarProps {
  categorias: string[];
  activeCat: string;
  onSelect: (cat: string) => void;
  itemsCountMap?: Record<string, number>;
}

export default function DesktopCategorySidebar({
  categorias,
  activeCat,
  onSelect,
  itemsCountMap = {},
}: DesktopCategorySidebarProps) {
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

  return (
    <aside className="desktop-category-sidebar" style={{
      width: "260px",
      flexShrink: 0,
      position: "sticky",
      top: "100px",
      height: "calc(100vh - 120px)",
      overflowY: "auto",
      background: "#fff",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: "16px",
      padding: "20px 16px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
    }}>
      <h3 style={{
        fontSize: "0.85rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "1px",
        color: "var(--muted)",
        marginBottom: "16px",
        paddingLeft: "8px"
      }}>
        Navegar por Secciones
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {categorias.map((cat) => {
          const emoji = EMOJI_POR_CATEGORIA[cat] || "📦";
          const isActive = cat === activeCat || (cat === "Todos" && (activeCat === "" || activeCat === "Todos"));
          const count = itemsCountMap[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "10px 12px",
                background: isActive ? "rgba(232, 48, 42, 0.08)" : "transparent",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                color: isActive ? "var(--rojo)" : "var(--texto)",
                fontWeight: isActive ? 800 : 600,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <div style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive ? "#fff" : "var(--bg2)",
                borderRadius: "8px",
                fontSize: "1.2rem",
                boxShadow: isActive ? "0 2px 8px rgba(232, 48, 42, 0.15)" : "none",
                border: isActive ? "1px solid rgba(232, 48, 42, 0.2)" : "1px solid transparent",
              }}>
                {configCats[cat] ? (
                  <div style={{ position: "relative", width: "70%", height: "70%" }}>
                    <Image 
                      src={configCats[cat]} 
                      alt={cat} 
                      fill 
                      className="object-contain"
                    />
                  </div>
                ) : (
                  emoji
                )}
              </div>
              <span style={{ flex: 1, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {cat}
              </span>
              {count > 0 && cat !== "Todos" && (
                <span style={{
                  fontSize: "0.75rem",
                  background: isActive ? "var(--rojo)" : "var(--bg2)",
                  color: isActive ? "#fff" : "var(--muted)",
                  padding: "2px 8px",
                  borderRadius: "99px",
                  fontWeight: 700
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <style jsx>{`
        /* Ocultar barra de desplazamiento en webkit */
        aside::-webkit-scrollbar {
          width: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
        }
        aside:hover::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </aside>
  );
}
