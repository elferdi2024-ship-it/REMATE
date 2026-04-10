"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { usePedidosLocales } from "@/hooks/usePedidosLocales";
import { usePedidosCloud } from "@/hooks/usePedidosCloud";

interface PedidoRecord {
  id?: string;
  fecha: any;
  items: Array<{
    codigo: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  total: number;
  notas?: string;
}

// Explicitly mark id as optional for TS narrowing
type PedidoWithId = PedidoRecord & { id?: string };

function formatDate(date: any): string {
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string") {
    d = new Date(date);
  } else if (date?.toDate) {
    d = date.toDate();
  } else if (date?.seconds) {
    d = new Date(date.seconds * 1000);
  } else {
    return "";
  }

  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} \u00b7 ${hours}:${mins}`;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function HistorialPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items: cartItems, addItem, clearCart } = useCart();
  const toast = useToast();

  const { pedidos: localPedidos } = usePedidosLocales();
  const { pedidos: cloudPedidos, loading: cloudLoading } = usePedidosCloud();

  const [selectedPedido, setSelectedPedido] = useState<PedidoRecord | null>(null);
  const [replaceModal, setReplaceModal] = useState(false);
  const [pendingReorder, setPendingReorder] = useState<PedidoRecord | null>(null);

  const pedidos: PedidoRecord[] = user ? (cloudPedidos as PedidoRecord[]) : (localPedidos as PedidoRecord[]);
  const loading = user && cloudLoading;

  const handleReorder = useCallback(
    (pedido: PedidoRecord) => {
      if (cartItems.length === 0) {
        // Cart empty: load directly
        pedido.items.forEach((item) => {
          for (let i = 0; i < item.cantidad; i++) {
            addItem({
              codigo: item.codigo,
              nombre: item.nombre,
              precio: item.precioUnitario,
            });
          }
        });
        toast.success("Cargado. Revis\u00e1 antes de enviar.");
      } else {
        // Cart has items: show replace/add modal
        setPendingReorder(pedido);
        setReplaceModal(true);
      }
    },
    [cartItems, addItem, toast]
  );

  const handleReorderReplace = useCallback(() => {
    if (!pendingReorder) return;
    clearCart();
    pendingReorder.items.forEach((item) => {
      for (let i = 0; i < item.cantidad; i++) {
        addItem({
          codigo: item.codigo,
          nombre: item.nombre,
          precio: item.precioUnitario,
        });
      }
    });
    setReplaceModal(false);
    setPendingReorder(null);
    toast.success("Carrito reemplazado. Revis\u00e1 antes de enviar.");
  }, [pendingReorder, clearCart, addItem, toast]);

  const handleReorderAppend = useCallback(() => {
    if (!pendingReorder) return;
    pendingReorder.items.forEach((item) => {
      for (let i = 0; i < item.cantidad; i++) {
        addItem({
          codigo: item.codigo,
          nombre: item.nombre,
          precio: item.precioUnitario,
        });
      }
    });
    setReplaceModal(false);
    setPendingReorder(null);
    toast.success("Productos agregados al carrito.");
  }, [pendingReorder, addItem, toast]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg, #F4F6FB)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid var(--border, #E8DDD0)",
            borderTopColor: "var(--rojo, #D62828)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <header
        style={{
          background: "var(--oscuro, #1A1410)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Link
          href="/catalogo"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)",
            borderRadius: "var(--r-sm, 8px)",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            fontSize: "1rem",
            flexShrink: 0,
          }}
          aria-label="Volver al cat\u00e1logo"
        >
          &#8592;
        </Link>
        <div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.6rem",
              color: "#fff",
              letterSpacing: "1px",
              lineHeight: 1,
              margin: 0,
            }}
          >
            Historial de Pedidos
          </h1>
          <p
            style={{
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.35)",
              margin: "2px 0 0",
              fontWeight: 500,
            }}
          >
            {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
            {user ? " \u00b7 guardados en la nube" : " \u00b7 locales"}
          </p>
        </div>
      </header>

      {/* Orders list */}
      <main style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
        {pedidos.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--muted, #9C8570)",
            }}
          >
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px", opacity: 0.4 }}>
              &#128203;
            </span>
            <p style={{ fontWeight: 600, color: "var(--text2)", marginBottom: "4px" }}>
              No hay pedidos todav\u00eda
            </p>
            <p style={{ fontSize: "0.82rem" }}>
              Cuando env\u00edes tu primer pedido, aparecer\u00e1 ac\u00e1.
            </p>
            <Link
              href="/catalogo"
              style={{
                display: "inline-block",
                marginTop: "16px",
                background: "var(--oscuro, #1A1410)",
                color: "#fff",
                borderRadius: "var(--r-md, 12px)",
                padding: "10px 24px",
                textDecoration: "none",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1rem",
                letterSpacing: "1px",
              }}
            >
              Ir al cat\u00e1logo
            </Link>
          </div>
        ) : (
          pedidos.map((pedido, idx) => (
            <PedidoCard
              key={idx}
              pedido={pedido as PedidoRecord}
              onReorder={handleReorder}
              onViewFull={() => setSelectedPedido(pedido as PedidoRecord)}
            />
          ))
        )}
      </main>

      {/* Full order modal */}
      {selectedPedido && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 14, 35, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedPedido(null)}
        >
          <div
            style={{
              background: "var(--white, #FFFFFF)",
              borderRadius: "var(--r-lg, 16px)",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "var(--shadow-lg, 0 12px 40px rgba(26,31,58,0.16))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "var(--oscuro, #1A1410)",
                padding: "20px",
                borderRadius: "var(--r-lg, 16px) var(--r-lg, 16px) 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.58rem",
                    fontWeight: 600,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "var(--rojo, #D62828)",
                    opacity: 0.8,
                  }}
                >
                  PEDIDO COMPLETO
                </div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.4rem",
                    color: "#fff",
                    letterSpacing: "1px",
                    marginTop: "2px",
                  }}
                >
                  {formatDate(selectedPedido.fecha)}
                </div>
              </div>
              <button
                onClick={() => setSelectedPedido(null)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)",
                  borderRadius: "var(--r-sm, 8px)",
                  width: "34px",
                  height: "34px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                &#10005;
              </button>
            </div>

            <div style={{ padding: "16px 20px" }}>
              {selectedPedido.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--bg2, #ECEEF6)",
                    fontSize: "0.82rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      color: "var(--rojo-dark, #B01E1E)",
                      minWidth: "32px",
                    }}
                  >
                    {item.cantidad}x
                  </span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{item.nombre}</span>
                  <span style={{ fontWeight: 700, color: "var(--text2)" }}>
                    {formatPrice(item.precioUnitario * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "12px 20px 16px",
                borderTop: "2px solid var(--bg2, #ECEEF6)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  color: "var(--muted, #9C8570)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.8rem",
                  color: "var(--oscuro, #1A1410)",
                }}
              >
                {formatPrice(selectedPedido.total)}
              </span>
            </div>

            {selectedPedido.notas && (
              <div style={{ padding: "0 20px 16px" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text2)", textTransform: "uppercase" }}>
                  Notas
                </span>
                <p style={{ fontSize: "0.82rem", color: "var(--text2)", marginTop: "4px" }}>
                  {selectedPedido.notas}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Replace or append modal */}
      {replaceModal && pendingReorder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 14, 35, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => {
            setReplaceModal(false);
            setPendingReorder(null);
          }}
        >
          <div
            style={{
              background: "var(--white, #FFFFFF)",
              borderRadius: "var(--r-lg, 16px)",
              width: "100%",
              maxWidth: "380px",
              boxShadow: "var(--shadow-lg, 0 12px 40px rgba(26,31,58,0.16))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "var(--oscuro, #1A1410)",
                padding: "20px",
                borderRadius: "var(--r-lg, 16px) var(--r-lg, 16px) 0 0",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "6px" }}>
                &#128722;
              </span>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "1.4rem",
                  color: "#fff",
                  letterSpacing: "1px",
                  margin: 0,
                }}
              >
                \u00bfReemplazar o agregar?
              </h2>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: "4px",
                  marginBottom: 0,
                }}
              >
                Ya ten\u00e9s productos en el carrito.
              </p>
            </div>

            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={handleReorderReplace}
                style={{
                  width: "100%",
                  background: "var(--oscuro, #1A1410)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--r-md, 12px)",
                  padding: "12px 20px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reemplazar carrito
              </button>
              <button
                onClick={handleReorderAppend}
                style={{
                  width: "100%",
                  background: "var(--rojo-pale, rgba(76,201,240,0.12))",
                  border: "1.5px solid rgba(76,201,240,0.35)",
                  color: "var(--rojo-dark, #B01E1E)",
                  borderRadius: "var(--r-md, 12px)",
                  padding: "12px 20px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Agregar a lo que ya tengo
              </button>
              <button
                onClick={() => {
                  setReplaceModal(false);
                  setPendingReorder(null);
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1.5px solid var(--border, #E8DDD0)",
                  color: "var(--muted, #9C8570)",
                  borderRadius: "var(--r-md, 12px)",
                  padding: "10px 20px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Pedido Card Sub-component ── */
function PedidoCard({
  pedido,
  onReorder,
  onViewFull,
}: {
  pedido: PedidoRecord;
  onReorder: (p: PedidoRecord) => void;
  onViewFull: () => void;
}) {
  const totalItems = pedido.items.reduce((s, i) => s + i.cantidad, 0);
  const showItems = pedido.items.slice(0, 2);
  const remaining = pedido.items.length - 2;

  return (
    <div
      style={{
        background: "var(--white, #FFFFFF)",
        border: "1.5px solid var(--border, #E8DDD0)",
        borderRadius: "var(--r-lg, 16px)",
        padding: "16px",
        marginBottom: "12px",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          {formatDate(pedido.fecha)}
        </span>
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.3rem",
            color: "var(--oscuro, #1A1410)",
          }}
        >
          {formatPrice(pedido.total)}
        </span>
      </div>

      <div
        style={{
          fontSize: "0.72rem",
          color: "var(--muted, #9C8570)",
          marginBottom: "8px",
        }}
      >
        {totalItems} {totalItems === 1 ? "unidad" : "unidades"} en {pedido.items.length} {pedido.items.length === 1 ? "producto" : "productos"}
      </div>

      {/* Items preview */}
      <div style={{ marginBottom: "10px" }}>
        {showItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              fontSize: "0.78rem",
              color: "var(--text2)",
              fontWeight: 600,
              padding: "2px 0",
            }}
          >
            \u2022 {item.nombre} \u00d7 {item.cantidad}
          </div>
        ))}
        {remaining > 0 && (
          <div
            style={{
              fontSize: "0.74rem",
              fontWeight: 600,
              color: "var(--muted, #9C8570)",
              padding: "2px 0",
            }}
          >
            + {remaining} m\u00e1s...
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => onReorder(pedido)}
          style={{
            background: "var(--verde, #1A6B3C)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-sm, 8px)",
            padding: "8px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            boxShadow: "0 2px 8px rgba(34,197,94,0.25)",
          }}
        >
          &#9889; Repetir este pedido
        </button>
        <button
          onClick={onViewFull}
          style={{
            background: "transparent",
            border: "1.5px solid var(--border, #E8DDD0)",
            color: "var(--text2)",
            borderRadius: "var(--r-sm, 8px)",
            padding: "8px 14px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.76rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Ver todo &#8595;
        </button>
      </div>
    </div>
  );
}
