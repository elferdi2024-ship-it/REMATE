"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import type { ListaItem } from "@/lib/listas";

interface ListaCardProps {
  lista: {
    id: string;
    nombre: string;
    items: ListaItem[];
    actualizadaEn: any;
  };
  onEditar: () => void;
  onEliminar: () => void;
  onAgregarTodo: (items: ListaItem[]) => void;
}

function timeAgo(date: any): string {
  const now = new Date();
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

export default function ListaCard({
  lista,
  onEditar,
  onEliminar,
  onAgregarTodo,
}: ListaCardProps) {
  const itemCount = lista.items?.length || 0;
  const actualizada = timeAgo(lista.actualizadaEn);

  return (
    <div
      style={{
        background: "var(--white, #FFFFFF)",
        border: "1.5px solid var(--border, #E8DDD0)",
        borderRadius: "var(--r-lg, 16px)",
        padding: "16px",
        transition: "box-shadow 0.18s, transform 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "var(--shadow-md, 0 4px 16px rgba(26,31,58,0.1))";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--border2, #D4C5B0)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "none";
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--border, #E8DDD0)";
      }}
    >
      {/* Name */}
      <h3
        style={{
          fontSize: "0.95rem",
          fontWeight: 700,
          color: "var(--texto, #1A1410)",
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          margin: "0 0 4px",
        }}
      >
        {lista.nombre}
      </h3>

      {/* Meta */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          fontSize: "0.72rem",
          color: "var(--muted, #9C8570)",
          fontWeight: 500,
          marginBottom: "12px",
        }}
      >
        <span>{itemCount} {itemCount === 1 ? "producto" : "productos"}</span>
        <span>Actualizada hace {actualizada}</span>
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
          onClick={() => onAgregarTodo(lista.items)}
          style={{
            flex: 1,
            minWidth: "120px",
            background: "var(--verde, #1A6B3C)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--r-sm, 8px)",
            padding: "8px 14px",
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "0.76rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(34,197,94,0.25)",
            transition: "all 0.13s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = "var(--verde-dark, #145530)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "var(--verde, #1A6B3C)";
          }}
        >
          Agregar todo al carrito
        </button>
        <button
          onClick={onEditar}
          style={{
            background: "transparent",
            border: "1.5px solid var(--border, #E8DDD0)",
            color: "var(--tierra, #5C4A35)",
            borderRadius: "var(--r-sm, 8px)",
            padding: "8px 12px",
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "0.76rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "var(--oscuro, #1A1410)";
            (e.target as HTMLButtonElement).style.color = "var(--oscuro, #1A1410)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "var(--border, #E8DDD0)";
            (e.target as HTMLButtonElement).style.color = "var(--tierra, #5C4A35)";
          }}
        >
          Editar
        </button>
        <button
          onClick={onEliminar}
          aria-label="Eliminar lista"
          style={{
            background: "transparent",
            border: "1.5px solid var(--border, #E8DDD0)",
            color: "var(--muted, #9C8570)",
            borderRadius: "var(--r-sm, 8px)",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "all 0.12s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "var(--rojo, #D62828)";
            (e.target as HTMLButtonElement).style.color = "var(--rojo, #D62828)";
            (e.target as HTMLButtonElement).style.background = "rgba(239,35,60,0.04)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "var(--border, #E8DDD0)";
            (e.target as HTMLButtonElement).style.color = "var(--muted, #9C8570)";
            (e.target as HTMLButtonElement).style.background = "transparent";
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
