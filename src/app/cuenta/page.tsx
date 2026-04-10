"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { usePedidosCloud } from "@/hooks/usePedidosCloud";
import { useListas } from "@/hooks/useListas";
import AuthForm from "@/components/usuario/AuthForm";
import { guardarPedidoUsuario } from "@/lib/pedidos";
import * as ls from "@/lib/ls";

interface LSPedido {
  fecha: string;
  items: Array<{
    codigo: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  total: number;
  notas?: string;
}

function timeAgo(date: Date | string | { seconds: number } | { toDate: () => Date }): string {
  const now = new Date();
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string") {
    d = new Date(date);
  } else if (typeof date === "object" && "toDate" in date) {
    d = (date as { toDate: () => Date }).toDate();
  } else if (typeof date === "object" && "seconds" in date) {
    d = new Date((date as { seconds: number }).seconds * 1000);
  } else {
    return "hace tiempo";
  }

  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "hace 1 dia";
  if (diffDays < 30) return `hace ${diffDays} dias`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "hace 1 mes";
  return `hace ${diffMonths} meses`;
}

export default function CuentaPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const toast = useToast();
  const { pedidos } = usePedidosCloud();
  const { listas } = useListas();
  const [authOpen, setAuthOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // After account creation, migrate localStorage orders to Firestore
  const handleMigrate = useCallback(async () => {
    if (!user) return;
    const localHistory = ls.getHistory() as LSPedido[];
    if (localHistory.length === 0) return;

    setMigrating(true);
    let migrated = 0;

    try {
      for (const pedido of localHistory) {
        await guardarPedidoUsuario(user.uid, {
          items: pedido.items,
          total: pedido.total,
          notas: pedido.notas,
          mensajeWA: "",
        });
        migrated++;
      }
      // Clear local history after successful migration
      ls.setHistory([]);
      toast.success("Historial migrado a la nube ✓");
    } catch (err) {
      console.error("Migration error:", err);
      toast.error("Error al migrar historial");
    } finally {
      setMigrating(false);
    }
  }, [user, toast]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      toast.info("Sesion cerrada");
    } catch {
      toast.error("Error al cerrar sesion");
    }
  }, [signOut, toast]);

  // Loading state
  if (authLoading) {
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

  // Not logged in: show AuthForm
  if (!user) {
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
            aria-label="Volver al catalogo"
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
              Mi Cuenta
            </h1>
            <p
              style={{
                fontSize: "0.68rem",
                color: "rgba(255,255,255,0.35)",
                margin: "2px 0 0",
                fontWeight: 500,
              }}
            >
              Cree tu cuenta o inicia sesion
            </p>
          </div>
        </header>

        {/* Auth prompt */}
        <main
          style={{
            padding: "24px 20px",
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "var(--white, #FFFFFF)",
              border: "1.5px solid var(--border, #E8DDD0)",
              borderRadius: "var(--r-lg, 16px)",
              padding: "32px 24px",
            }}
          >
            <span
              style={{
                fontSize: "2.5rem",
                display: "block",
                marginBottom: "12px",
              }}
            >
              &#128100;
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: "1.5rem",
                color: "var(--oscuro, #1A1410)",
                letterSpacing: "1px",
                margin: "0 0 8px",
              }}
            >
              Inicia sesion o crea tu cuenta
            </h2>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--tierra, #5C4A35)",
                marginBottom: "20px",
                lineHeight: 1.5,
              }}
            >
              Guarda tu historial de pedidos en la nube y accede a tus listas personalizadas.
            </p>
            <button
              onClick={() => setAuthOpen(true)}
              style={{
                background: "var(--oscuro, #1A1410)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--r-md, 12px)",
                padding: "12px 32px",
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.13s",
              }}
            >
              Comenzar
            </button>
          </div>
        </main>

        <AuthForm
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          onMigrate={handleMigrate}
        />
      </>
    );
  }

  // Logged in: show profile card
  const alias = ls.getAlias();
  const displayName = user.displayName || alias || "Usuario";
  const lastPedido = pedidos.length > 0 ? pedidos[0] : null;
  const lastPedidoAgo = lastPedido
    ? timeAgo(lastPedido.fecha)
    : null;

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
          aria-label="Volver al catalogo"
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
            Mi Cuenta
          </h1>
          <p
            style={{
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.35)",
              margin: "2px 0 0",
              fontWeight: 500,
            }}
          >
            {user.email}
          </p>
        </div>
      </header>

      {/* Profile */}
      <main style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
        {/* Profile card */}
        <div
          style={{
            background: "var(--white, #FFFFFF)",
            border: "1.5px solid var(--border, #E8DDD0)",
            borderRadius: "var(--r-lg, 16px)",
            padding: "24px 20px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontSize: "0.58rem",
              fontWeight: 600,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--muted, #9C8570)",
              display: "block",
            }}
          >
            NEGOCIO
          </span>
          <span
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: "2.2rem",
              color: "var(--oscuro, #1A1410)",
              letterSpacing: "1.5px",
              display: "block",
              marginTop: "4px",
            }}
          >
            {displayName.toUpperCase()}
          </span>
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--tierra, #5C4A35)",
              fontWeight: 500,
              display: "block",
              marginTop: "4px",
            }}
          >
            {user.email}
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--tierra, #5C4A35)",
              fontWeight: 500,
              display: "block",
              marginTop: "8px",
            }}
          >
            {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
            {lastPedidoAgo ? ` \u00b7 ultimo hace ${lastPedidoAgo}` : ""}
          </span>
        </div>

        {/* Mis Listas */}
        <div
          style={{
            background: "var(--white, #FFFFFF)",
            border: "1.5px solid var(--border, #E8DDD0)",
            borderRadius: "var(--r-lg, 16px)",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h2
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--tierra, #5C4A35)",
                margin: 0,
              }}
            >
              Mis Listas
            </h2>
            <Link
              href="/listas"
              style={{
                background: "var(--rojo-pale, rgba(76,201,240,0.12))",
                border: "1.5px solid rgba(76,201,240,0.35)",
                color: "var(--rojo-dark, #B01E1E)",
                borderRadius: "var(--r-sm, 8px)",
                padding: "5px 12px",
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "0.68rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.12s",
              }}
            >
              Ver todas &#8594;
            </Link>
          </div>

          {listas.length === 0 ? (
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--muted, #9C8570)",
                textAlign: "center",
                padding: "12px 0",
                margin: 0,
              }}
            >
              No tenes listas todavia
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {listas.slice(0, 3).map((lista) => (
                <Link
                  key={lista.id}
                  href={`/listas/${lista.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "var(--bg, #F4F6FB)",
                    border: "1.5px solid var(--border, #E8DDD0)",
                    borderRadius: "var(--r-sm, 8px)",
                    textDecoration: "none",
                    transition: "border-color 0.12s",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--texto, #1A1410)",
                    }}
                  >
                    {lista.nombre}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted, #9C8570)",
                    }}
                  >
                    {lista.items?.length || 0} productos
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Migrating indicator */}
        {migrating && (
          <div
            style={{
              textAlign: "center",
              padding: "12px",
              fontSize: "0.78rem",
              color: "var(--rojo-dark, #B01E1E)",
              fontWeight: 600,
            }}
          >
            Migrando historial...
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            background: "transparent",
            border: "1.5px solid var(--border2, #D4C5B0)",
            color: "var(--muted, #9C8570)",
            borderRadius: "var(--r-sm, 8px)",
            padding: "12px 16px",
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.13s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "var(--rojo, #D62828)";
            (e.target as HTMLButtonElement).style.color = "var(--rojo, #D62828)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "var(--border2, #D4C5B0)";
            (e.target as HTMLButtonElement).style.color = "var(--muted, #9C8570)";
          }}
        >
          Cerrar sesion
        </button>
      </main>
    </>
  );
}
