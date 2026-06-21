"use client";
// filepath: src/components/catalogo/ReorderRail.tsx

import React, { useMemo } from "react";
import Image from "next/image";
import type { Producto, Pedido } from "@/types";

interface ReorderRailProps {
  productos: Producto[];
  pedidos: Pedido[];
  qtyMap: Record<string, number>;
  onAddProduct: (producto: Producto, e?: React.MouseEvent) => void;
  onQtyChange: (codigo: string, qty: number) => void;
}

export default function ReorderRail({
  productos = [],
  pedidos = [],
  qtyMap = {},
  onAddProduct,
  onQtyChange,
}: ReorderRailProps) {
  // Calcular productos frecuentes
  const frequentItems = useMemo(() => {
    if (!pedidos || pedidos.length === 0 || productos.length === 0) return [];

    // Contar ocurrencias de cada código de producto en los pedidos
    const counts: Record<string, number> = {};
    pedidos.forEach((p) => {
      if (p.items && Array.isArray(p.items)) {
        p.items.forEach((item) => {
          counts[item.codigo] = (counts[item.codigo] || 0) + item.cantidad;
        });
      }
    });

    // Ordenar códigos por frecuencia/cantidad acumulada descendente
    const sortedCodes = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code]) => code);

    // Mapear al objeto Producto completo del catálogo activo
    const list: Producto[] = [];
    sortedCodes.forEach((code) => {
      const match = productos.find((p) => p.codigo === code);
      if (match) {
        list.push(match);
      }
    });

    return list.slice(0, 10); // Mostrar top 10 productos frecuentes
  }, [pedidos, productos]);

  if (frequentItems.length === 0) return null;

  return (
    <div style={{ marginTop: "16px", marginBottom: "20px" }}>
      <style>{`
        .frequent-rail-scroll::-webkit-scrollbar {
          display: none;
        }
        .frequent-rail-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <span style={{ fontSize: "18px" }}>🔄</span>
        <h3
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "var(--oscuro, #1A1410)",
            fontFamily: "var(--font-display)",
          }}
        >
          Tus Compras Frecuentes
        </h3>
      </div>

      <div
        className="frequent-rail-scroll"
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          padding: "4px",
          scrollSnapType: "x mandatory",
        }}
      >
        {frequentItems.map((item) => {
          const qty = qtyMap[item.codigo] || 0;
          const isInCart = qty > 0;
          
          return (
            <div
              key={item.codigo}
              style={{
                flex: "0 0 160px",
                scrollSnapAlign: "start",
                background: "var(--white, #fff)",
                border: isInCart ? "1.5px solid var(--verde)" : "1px solid rgba(17,11,8,0.06)",
                borderRadius: "16px",
                padding: "10px",
                boxShadow: isInCart ? "0 4px 12px rgba(26,122,66,0.06)" : "0 2px 6px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Imagen pequeña */}
              <div
                style={{
                  background: "#f9f8f6",
                  borderRadius: "10px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  marginBottom: "8px",
                  overflow: "hidden",
                }}
              >
                {item.imagen ? (
                  <Image
                    src={item.imagen}
                    alt={item.nombre}
                    fill
                    sizes="80px"
                    style={{ objectFit: "contain", padding: "4px" }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem" }}>📦</span>
                )}
              </div>

              {/* Título corto */}
              <h4
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--oscuro)",
                  lineHeight: "1.25",
                  height: "2.5em",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.nombre}
              </h4>

              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "var(--rojo, #E8302A)",
                      display: "block",
                      lineHeight: "1",
                    }}
                  >
                    ${item.precio}
                  </span>
                  {item.contenido && (
                    <span style={{ fontSize: "8px", color: "var(--muted)", fontWeight: 700 }}>
                      {item.contenido}
                    </span>
                  )}
                </div>

                {/* Acción rápida de Carrito */}
                {isInCart ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "rgba(26,122,66,0.06)",
                      borderRadius: "12px",
                      border: "1px solid rgba(26,122,66,0.2)",
                      padding: "2px",
                    }}
                  >
                    <button
                      onClick={() => onQtyChange(item.codigo, qty - 1)}
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "24px",
                        height: "24px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        color: "var(--verde)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: "11px", fontWeight: 800, width: "16px", textAlign: "center" }}>{qty}</span>
                    <button
                      onClick={() => onQtyChange(item.codigo, qty + 1)}
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "24px",
                        height: "24px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        color: "var(--verde)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => onAddProduct(item, e)}
                    style={{
                      background: "var(--rojo, #E8302A)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(232, 48, 42, 0.2)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
