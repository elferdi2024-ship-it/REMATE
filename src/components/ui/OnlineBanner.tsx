"use client";

import { useOnline } from "@/hooks/useOnline";

export default function OnlineBanner() {
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 8000,
        width: "100%",
        background: "var(--oscuro)",
        color: "#fff",
        borderBottom: "2px solid var(--ambar)",
        padding: "0.375rem 1rem",
        fontSize: "0.8125rem",
        fontWeight: 500,
        textAlign: "center",
        lineHeight: "1.4",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <span style={{ color: "var(--ambar)", fontSize: "1rem" }}>⚠</span>
      Sin conexión a internet. Tu carrito está seguro.
    </div>
  );
}
