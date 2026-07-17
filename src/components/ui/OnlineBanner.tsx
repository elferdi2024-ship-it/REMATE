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
        background: "linear-gradient(90deg, #1C1C1A 0%, #2A2A2A 100%)",
        color: "#fff",
        borderBottom: "2px solid var(--ambar, #D97706)",
        padding: "8px 16px",
        fontSize: "0.85rem",
        fontWeight: 700,
        textAlign: "center",
        lineHeight: "1.4",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        fontFamily: "var(--font-body), sans-serif",
        animation: "toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        letterSpacing: "0.3px",
      }}
    >
      <span className="relative flex h-3.5 w-3.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F59E0B] items-center justify-center text-[9px] font-black text-black select-none">⚠</span>
      </span>
      <span>Sin conexión a internet. Tu carrito y cambios locales están seguros.</span>
    </div>
  );
}
