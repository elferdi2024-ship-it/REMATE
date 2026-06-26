"use client";
// filepath: src/components/catalogo/FilterSheet.tsx

import React, { useState, useEffect, useRef } from "react";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  marcasDisponibles: string[];
  marcasSeleccionadas: string[];
  onMarcasChange: (marcas: string[]) => void;
  minPrecio: number;
  maxPrecio: number;
  onPrecioRangeChange: (min: number, max: number) => void;
  soloOfertas: boolean;
  onSoloOfertasChange: (val: boolean) => void;
  onClearAll: () => void;
  totalFiltrados: number;
}

export default function FilterSheet({
  isOpen,
  onClose,
  marcasDisponibles = [],
  marcasSeleccionadas = [],
  onMarcasChange,
  minPrecio,
  maxPrecio,
  onPrecioRangeChange,
  soloOfertas,
  onSoloOfertasChange,
  onClearAll,
  totalFiltrados,
}: FilterSheetProps) {
  const [localMin, setLocalMin] = useState<string>(minPrecio ? String(minPrecio) : "");
  const [localMax, setLocalMax] = useState<string>(maxPrecio ? String(maxPrecio) : "");
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalMin(minPrecio ? String(minPrecio) : "");
    setLocalMax(maxPrecio ? String(maxPrecio) : "");
  }, [minPrecio, maxPrecio]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Set focus on open
    sheetRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        if (!sheetRef.current) return;
        const focusableElements = sheetRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0] as HTMLElement;
        const last = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBrandToggle = (brand: string) => {
    if (marcasSeleccionadas.includes(brand)) {
      onMarcasChange(marcasSeleccionadas.filter((b) => b !== brand));
    } else {
      onMarcasChange([...marcasSeleccionadas, brand]);
    }
  };

  const handleApply = () => {
    const min = localMin ? parseFloat(localMin) : 0;
    const max = localMax ? parseFloat(localMax) : Infinity;
    onPrecioRangeChange(min, max === Infinity ? 0 : max);
    onClose();
  };

  const handleClear = () => {
    setLocalMin("");
    setLocalMax("");
    onClearAll();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(17, 11, 8, 0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          animation: "fadeIn 0.25s ease-out",
        }}
      />

      {/* Sheet Content */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="filter-sheet outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-title"
        style={{
          position: "relative",
          zIndex: 1,
          background: "var(--white, #fff)",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.15)",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        {/* Handle bar */}
        <div
          onClick={onClose}
          style={{
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              background: "var(--border, #DDD8D0)",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px 16px",
            borderBottom: "1px solid rgba(17,11,8,0.06)",
          }}
        >
          <div>
            <h3
              id="filters-title"
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--oscuro, #111)",
                fontFamily: "var(--font-display)",
              }}
            >
              Filtros Avanzados
            </h3>
            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>
              {totalFiltrados} productos encontrados
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleClear}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--rojo, #E8302A)",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              Limpiar todo
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar filtros"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--oscuro, #111)",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.04)";
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Scroll */}
        <div style={{ overflowY: "auto", padding: "20px", flex: 1 }}>
          {/* Solo ofertas */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--rojo-pale, #FEF2F1)",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "24px",
              border: "1.5px solid rgba(232, 48, 42, 0.1)",
            }}
          >
            <div>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--oscuro)", display: "flex", alignItems: "center", gap: "6px" }}>
                🔥 Solo Ofertas
                {soloOfertas && (
                  <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                    Activo
                  </span>
                )}
              </span>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>
                Ver productos con descuento activo
              </span>
            </div>
            <button
              onClick={() => onSoloOfertasChange(!soloOfertas)}
              aria-label="Alternar mostrar solo ofertas"
              style={{
                width: "48px",
                height: "28px",
                borderRadius: "14px",
                background: soloOfertas ? "var(--rojo, #E8302A)" : "var(--border, #DDD8D0)",
                border: "none",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: "3px",
                  left: soloOfertas ? "23px" : "3px",
                  transition: "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                }}
              />
            </button>
          </div>

          {/* Rango de Precios */}
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: "0.85rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "var(--oscuro)",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>Rango de Precio ($)</span>
              {(localMin !== "" || localMax !== "") && (
                <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  Filtrado
                </span>
              )}
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 28px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--border, #DDD8D0)",
                    background: "var(--bg, #fff)",
                    fontSize: "14px",
                    fontWeight: 700,
                    outline: "none",
                  }}
                />
              </div>
              <span style={{ color: "var(--muted)", fontWeight: 700 }}>—</span>
              <div style={{ flex: 1, position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  placeholder="Máximo"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 28px",
                    borderRadius: "12px",
                    border: "1.5px solid var(--border, #DDD8D0)",
                    background: "var(--bg, #fff)",
                    fontSize: "14px",
                    fontWeight: 700,
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Marcas */}
          {marcasDisponibles.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--oscuro)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>Filtrar por Marca</span>
                {marcasSeleccionadas.length > 0 && (
                  <span className="text-[9px] bg-[#E8302A] text-white font-black px-2 py-0.5 rounded-full">
                    {marcasSeleccionadas.length}
                  </span>
                )}
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {marcasDisponibles.map((brand) => {
                  const isSelected = marcasSeleccionadas.includes(brand);
                  return (
                    <button
                      key={brand}
                      onClick={() => handleBrandToggle(brand)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "20px",
                        border: isSelected ? "1.5px solid var(--rojo, #E8302A)" : "1.5px solid var(--border, #DDD8D0)",
                        background: isSelected ? "var(--rojo-pale, #FEF2F1)" : "var(--bg, #fff)",
                        color: isSelected ? "var(--rojo, #E8302A)" : "var(--texto, #111)",
                        fontSize: "12px",
                        fontWeight: isSelected ? 800 : 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(17,11,8,0.06)",
            background: "var(--white, #fff)",
          }}
        >
          <button
            onClick={handleApply}
            style={{
              width: "100%",
              background: "var(--rojo, #E8302A)",
              color: "#fff",
              border: "none",
              borderRadius: "16px",
              padding: "16px",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(232, 48, 42, 0.25)",
            }}
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Embedded Animations Style */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
