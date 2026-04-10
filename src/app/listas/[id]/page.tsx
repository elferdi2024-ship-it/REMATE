"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useListas } from "@/hooks/useListas";
import { getLista } from "@/lib/listas";
import type { ListaItem } from "@/lib/listas";

export default function ListaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listaId = params?.id as string;

  const { user, loading: authLoading } = useAuth();
  const { items: cartItems, addItem } = useCart();
  const toast = useToast();
  const { actualizarLista } = useListas();

  const [lista, setLista] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ListaItem[]>([]);
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/cuenta");
    }
  }, [user, authLoading, router]);

  // Fetch list
  useEffect(() => {
    if (!user || !listaId) return;

    let cancelled = false;
    setLoading(true);

    getLista(user.uid, listaId)
      .then((result) => {
        if (!cancelled) {
          if (!result) {
            toast.error("Lista no encontrada");
            router.replace("/listas");
            return;
          }
          setLista(result);
          setNombre(result.nombre || "");
          setItems(result.items || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Error fetching lista:", err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, listaId, toast, router]);

  const handleQtyChange = useCallback(
    (codigo: string, qty: number) => {
      if (qty < 1) return;
      setItems((prev) =>
        prev.map((item) =>
          item.codigo === codigo ? { ...item, cantidad: qty } : item
        )
      );
    },
    []
  );

  const handleRemoveItem = useCallback((codigo: string) => {
    setItems((prev) => prev.filter((item) => item.codigo !== codigo));
  }, []);

  const handleAgregarTodo = useCallback(() => {
    items.forEach((item) => {
      for (let i = 0; i < item.cantidad; i++) {
        addItem({
          codigo: item.codigo,
          nombre: item.nombre,
          precio: 0,
        });
      }
    });
    toast.success(`${items.length} productos agregados al carrito`);
  }, [items, addItem, toast]);

  const handleGuardarCambios = useCallback(async () => {
    if (!user || !listaId) return;
    setSaving(true);
    try {
      await actualizarLista(listaId, {
        nombre: nombre.trim() || lista.nombre,
        items,
      });
      toast.success("Lista guardada");
    } catch (err) {
      console.error("Error saving lista:", err);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }, [user, listaId, nombre, items, actualizarLista, lista, toast]);

  // Loading state
  if (authLoading || loading) {
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

  if (!user) {
    return null;
  }

  if (!lista) {
    return null;
  }

  return (
    <>
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
          href="/listas"
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
          aria-label="Volver a mis listas"
        >
          &#8592;
        </Link>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: "1.6rem",
              color: "#fff",
              letterSpacing: "1px",
              lineHeight: 1,
              margin: 0,
            }}
          >
            {lista.nombre}
          </h1>
          <p
            style={{
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.35)",
              margin: "2px 0 0",
              fontWeight: 500,
            }}
          >
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </p>
        </div>
      </header>

      {/* Content */}
      <main style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
        {/* Items table */}
        <div
          style={{
            background: "var(--white, #FFFFFF)",
            border: "1.5px solid var(--border, #E8DDD0)",
            borderRadius: "var(--r-lg, 16px)",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 60px 80px 36px",
              gap: "8px",
              alignItems: "center",
              padding: "10px 14px",
              background: "var(--bg, #F4F6FB)",
              borderBottom: "1.5px solid var(--border, #E8DDD0)",
              fontSize: "0.62rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--muted, #9C8570)",
            }}
          >
            <span>Nombre</span>
            <span style={{ textAlign: "center" }}>Cant.</span>
            <span style={{ textAlign: "right" }}>Precio ref.</span>
            <span></span>
          </div>

          {/* Table rows */}
          {items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 20px",
                color: "var(--muted, #9C8570)",
                fontSize: "0.82rem",
              }}
            >
              No hay productos en esta lista
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.codigo}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 60px 80px 36px",
                  gap: "8px",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderBottom:
                    idx < items.length - 1
                      ? "1px solid var(--bg2, #ECEEF6)"
                      : "none",
                  fontSize: "0.82rem",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--texto, #1A1410)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.nombre}
                </span>
                <input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) =>
                    handleQtyChange(item.codigo, parseInt(e.target.value) || 1)
                  }
                  style={{
                    width: "100%",
                    textAlign: "center",
                    padding: "6px 4px",
                    border: "1.5px solid var(--border, #E8DDD0)",
                    borderRadius: "var(--r-sm, 8px)",
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--texto, #1A1410)",
                    background: "var(--bg, #F4F6FB)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      "var(--rojo-dark, #B01E1E)";
                  }}
                  onBlur={(e) => {
                    (e.target as HTMLInputElement).style.borderColor =
                      "var(--border, #E8DDD0)";
                  }}
                />
                <span
                  style={{
                    textAlign: "right",
                    fontFamily: "var(--font-display), sans-serif",
                    fontSize: "1.05rem",
                    color: "var(--oscuro, #1A1410)",
                    letterSpacing: "0.5px",
                  }}
                >
                  ${item.cantidad > 0 ? "---" : "---"}
                </span>
                <button
                  onClick={() => handleRemoveItem(item.codigo)}
                  aria-label="Eliminar producto"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--muted, #9C8570)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.12s",
                    padding: "4px",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color =
                      "var(--rojo, #D62828)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color =
                      "var(--muted, #9C8570)";
                  }}
                >
                  &#10005;
                </button>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={handleAgregarTodo}
            disabled={items.length === 0}
            style={{
              width: "100%",
              background: "var(--verde, #1A6B3C)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--r-md, 12px)",
              padding: "12px 20px",
              fontFamily: "var(--font-body), sans-serif",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: items.length === 0 ? "not-allowed" : "pointer",
              boxShadow:
                items.length > 0
                  ? "0 4px 18px rgba(34,197,94,0.3)"
                  : "none",
              opacity: items.length === 0 ? 0.5 : 1,
              transition: "all 0.13s",
            }}
          >
            Agregar todo al carrito
          </button>
          <button
            onClick={handleGuardarCambios}
            disabled={saving}
            style={{
              width: "100%",
              background: "var(--oscuro, #1A1410)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--r-md, 12px)",
              padding: "12px 20px",
              fontFamily: "var(--font-body), sans-serif",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.13s",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </main>
    </>
  );
}
