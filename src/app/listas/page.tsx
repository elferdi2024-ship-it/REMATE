"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useListas } from "@/hooks/useListas";
import ListaCard from "@/componentes/listas/ListaCard";
import type { ListaItem } from "@/lib/listas";

export default function ListasPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items: cartItems, addItem } = useCart();
  const toast = useToast();
  const { listas, loading, crearLista, eliminarLista } = useListas();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  // Redirect to /cuenta if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/cuenta");
    }
  }, [user, authLoading, router]);

  const handleCrearLista = useCallback(() => {
    if (!newListName.trim()) {
      toast.error("Ingresa un nombre para la lista");
      return;
    }
    crearLista(newListName.trim(), []);
    setNewListName("");
    setCreateModalOpen(false);
    toast.success("Lista creada");
  }, [newListName, crearLista, toast]);

  const handleEliminarLista = useCallback(
    (listaId: string) => {
      eliminarLista(listaId);
      toast.info("Lista eliminada");
    },
    [eliminarLista, toast]
  );

  const handleAgregarTodo = useCallback(
    (items: ListaItem[]) => {
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
    },
    [addItem, toast]
  );

  // Loading state
  if (authLoading || (user && loading)) {
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

  // Not logged in (will redirect, but show something meanwhile)
  if (!user) {
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
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/cuenta"
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
            aria-label="Volver a mi cuenta"
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
              Mis Listas
            </h1>
            <p
              style={{
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.35)",
                margin: "2px 0 0",
                fontWeight: 500,
              }}
            >
              {listas.length} {listas.length === 1 ? "lista" : "listas"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          style={{
            background: "var(--rojo-pale, rgba(76,201,240,0.12))",
            border: "1.5px solid rgba(76,201,240,0.35)",
            color: "var(--rojo, #D62828)",
            borderRadius: "var(--r-sm, 8px)",
            padding: "8px 14px",
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.12s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background =
              "rgba(76,201,240,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background =
              "var(--rojo-pale, rgba(76,201,240,0.12))";
          }}
        >
          Nueva lista [+]
        </button>
      </header>

      {/* Lists */}
      <main style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
        {listas.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--muted, #9C8570)",
            }}
          >
            <span
              style={{
                fontSize: "2.5rem",
                display: "block",
                marginBottom: "12px",
                opacity: 0.4,
              }}
            >
              &#128203;
            </span>
            <p
              style={{
                fontWeight: 600,
                color: "var(--tierra, #5C4A35)",
                marginBottom: "4px",
              }}
            >
              No tenes listas todavia
            </p>
            <p style={{ fontSize: "0.82rem" }}>
              Crea tu primera lista para organizar tus pedidos.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{
                display: "inline-block",
                marginTop: "16px",
                background: "var(--oscuro, #1A1410)",
                color: "#fff",
                borderRadius: "var(--r-md, 12px)",
                padding: "10px 24px",
                textDecoration: "none",
                fontFamily: "var(--font-display), sans-serif",
                fontSize: "1rem",
                letterSpacing: "1px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Crear mi primera lista
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {listas.map((lista) => (
              <ListaCard
                key={lista.id}
                lista={lista}
                onEditar={() => router.push(`/listas/${lista.id}`)}
                onEliminar={() => handleEliminarLista(lista.id)}
                onAgregarTodo={handleAgregarTodo}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create list modal */}
      {createModalOpen && (
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
            setCreateModalOpen(false);
            setNewListName("");
          }}
        >
          <div
            style={{
              background: "var(--white, #FFFFFF)",
              borderRadius: "var(--r-lg, 16px)",
              width: "100%",
              maxWidth: "400px",
              boxShadow:
                "var(--shadow-lg, 0 12px 40px rgba(26,31,58,0.16))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: "var(--oscuro, #1A1410)",
                padding: "20px",
                borderRadius:
                  "var(--r-lg, 16px) var(--r-lg, 16px) 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display), sans-serif",
                    fontSize: "1.4rem",
                    color: "#fff",
                    letterSpacing: "1px",
                    margin: 0,
                  }}
                >
                  Nueva lista
                </div>
              </div>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setNewListName("");
                }}
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

            {/* Body */}
            <div style={{ padding: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--tierra, #5C4A35)",
                  marginBottom: "6px",
                }}
              >
                Nombre de la lista
              </label>
              <input
                type="text"
                className="field-input"
                placeholder="Ej: Pedido semanal, Favoritos..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCrearLista();
                }}
                autoFocus
                style={{ marginBottom: "16px" }}
              />
              <button
                onClick={handleCrearLista}
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
                  cursor: "pointer",
                  transition: "all 0.13s",
                }}
              >
                Crear lista
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
