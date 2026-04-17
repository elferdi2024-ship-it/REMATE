import React, { useState, useCallback, useEffect, useMemo } from "react";
import type { Producto, Vista } from "@/types";
import ProductoCard from "./ProductoCard";
import ProductoRow from "./ProductoRow";
import AdBanner from "../ui/AdBanner";

interface ProductoGridProps {
  productos: Producto[];
  vista: Vista;
  qtyMap: Record<string, number>;
  searchTerm?: string;
  onAdd: (producto: Producto) => void;
  onQtyChange: (codigo: string, qty: number) => void;
}

const PAGE_SIZE = 40;

// Corrección de categorías para productos mal catalogados
const CATEGORY_CORRECTIONS: Record<string, string> = {
  "ALFAJOR": "Golosinas y Dulces",
  "PILAS": "Otros",
  "LAMPARA": "Otros",
  "SHAMPOO": "Higiene Personal",
  "ACONDICIONADOR": "Higiene Personal",
  "JABON TOCADOR": "Higiene Personal",
  "DENTAL": "Higiene Personal",
  "AFEITADORA": "Higiene Personal",
  "ACEITUNAS": "Conservas y Enlatados",
  "CHOCLO": "Conservas y Enlatados",
  "ARVEJAS": "Conservas y Enlatados",
  "POROTOS": "Conservas y Enlatados",
  "LENTEJAS": "Conservas y Enlatados",
  "PAN DULCE": "Panadería",
  "BUDIN": "Panadería",
};

export default function ProductoGrid({
  productos,
  vista,
  qtyMap,
  searchTerm,
  onAdd,
  onQtyChange,
}: ProductoGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [columns, setColumns] = useState(2);

  // Detectar columnas para inyectar banners cada 2 líneas
  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w >= 1300) setColumns(6);
      else if (w >= 1060) setColumns(5);
      else if (w >= 780) setColumns(4);
      else if (w >= 520) setColumns(3);
      else setColumns(2);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [productos.length]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  // Agrupar y corregir productos
  const grouped = useMemo(() => {
    return productos.reduce((acc, p) => {
      let categoria = p.categoria;
      const nombreUpper = p.nombre.toUpperCase();
      
      // Aplicar correcciones basadas en palabras clave
      for (const [key, corrected] of Object.entries(CATEGORY_CORRECTIONS)) {
        if (nombreUpper.includes(key)) {
          categoria = corrected;
          break;
        }
      }

      if (!acc[categoria]) acc[categoria] = [];
      acc[categoria].push(p);
      return acc;
    }, {} as Record<string, Producto[]>);
  }, [productos]);

  const categories = Object.keys(grouped).sort();

  const banners = [
    {
      id: "banner-premium-1",
      type: "html" as const,
      backgroundColor: "var(--oscuro)",
      htmlContent: (
        <div style={{ textAlign: "center", width: "100%", padding: "12px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", color: "var(--rojo)", margin: 0, letterSpacing: "2px" }}>PATROCINADOR EXCLUSIVO</h3>
          <p style={{ margin: "2px 0 0", color: "var(--on-dark-mid)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.9rem", letterSpacing: "1px" }}>Confianza y Calidad en cada entrega</p>
        </div>
      )
    },
    {
      id: "banner-weekend",
      type: "html" as const,
      backgroundColor: "#FEF3C7",
      htmlContent: (
        <div style={{ textAlign: "center", width: "100%", padding: "20px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "#D97706", margin: 0 }}>LOS ROMPE DEL FINDE</h3>
          <p style={{ margin: "4px 0 0", color: "#5C4A35", fontWeight: 700 }}>Aprovechá estas ofertas exclusivas hasta el domingo.</p>
        </div>
      )
    },
    {
      id: "banner-cleaning",
      type: "html" as const,
      backgroundColor: "#EBF7F0",
      htmlContent: (
        <div style={{ textAlign: "center", width: "100%", padding: "20px" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", color: "#1A7A42", margin: 0 }}>¡HASTA 25% OFF EN LIMPIEZA!</h3>
          <p style={{ margin: "4px 0 0", color: "#145E33", fontWeight: 700 }}>Stockeate con los mejores precios mayoristas.</p>
        </div>
      )
    }
  ];

  let globalProductIndex = 0;
  let bannerIndex = 0;

  if (productos.length === 0) {
    return (
      <div className="no-results">
        <span className="no-results-icon">&#128269;</span>
        <p>No encontramos nada con eso — probá con otro término.</p>
      </div>
    );
  }

  return (
    <div className="catalogo-container" style={{ padding: "0 4px 40px" }}>
      {categories.map((cat) => {
        const catProds = grouped[cat];
        const visibleInCat = catProds.filter(() => {
          const isVisible = globalProductIndex < visibleCount;
          globalProductIndex++;
          return isVisible;
        });

        if (visibleInCat.length === 0) return null;

        const bannerInterval = columns * 2; // Inyectar cada 2 líneas

        return (
          <section key={cat} className="cat-section" style={{ marginBottom: "32px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              marginBottom: "16px",
              padding: "0 12px"
            }}>
              <h2 className="cat-section-title" style={{ 
                fontFamily: "var(--font-display)", 
                fontSize: "2rem", 
                color: "var(--oscuro)", 
                margin: 0,
                letterSpacing: "1px"
              }}>
                {cat}
              </h2>
              <div style={{ flex: 1, height: "1px", background: "var(--border)", marginTop: "8px" }}></div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                {catProds.length} items
              </span>
            </div>

            <div className={vista === "grilla" ? "grid" : "product-list"}>
              {visibleInCat.map((p, idx) => {
                const elements = [];
                
                // El producto
                elements.push(
                  vista === "grilla" ? (
                    <ProductoCard
                      key={p.codigo}
                      producto={p}
                      qty={qtyMap[p.codigo] || 0}
                      searchTerm={searchTerm}
                      onAdd={onAdd}
                      onQtyChange={onQtyChange}
                    />
                  ) : (
                    <ProductoRow
                      key={p.codigo}
                      producto={p}
                      qty={qtyMap[p.codigo] || 0}
                      onAdd={onAdd}
                      onQtyChange={onQtyChange}
                    />
                  )
                );

                // Inyectar banner después de cada N productos (dentro de la categoría)
                if (idx > 0 && (idx + 1) % bannerInterval === 0 && idx < visibleInCat.length - 1) {
                  const banner = banners[bannerIndex % banners.length];
                  bannerIndex++;
                  elements.push(
                    <div key={`banner-${p.codigo}`} className="grid-banner-row">
                      <AdBanner {...banner} />
                    </div>
                  );
                }

                return elements;
              })}
            </div>
          </section>
        );
      })}

      {visibleCount < productos.length && (
        <div className="load-more-wrap" style={{ textAlign: "center", marginTop: "20px" }}>
          <button className="btn-load-more" onClick={handleLoadMore}>
            CARGAR MÁS PRODUCTOS ↓
          </button>
        </div>
      )}
    </div>
  );
}
