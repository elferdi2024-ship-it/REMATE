"use client";

import { useEffect } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onDismiss?: () => void;
}

const ICONS: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2715",
  warning: "\u26A0",
  info: "\u2139",
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: "var(--verde)",
  error: "var(--rojo)",
  warning: "#F59E0B",
  info: "var(--rojo)",
};

export default function Toast({ message, type, visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => onDismiss?.(), 3000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        bottom: "1rem",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? ("auto" as const) : ("none" as const),
        maxWidth: "calc(100vw - 2rem)",
        background: "var(--oscuro)",
        borderLeft: `4px solid ${BORDER_COLORS[type]}`,
        color: "var(--white)",
        borderRadius: "var(--r-md)",
        padding: "0.75rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        boxShadow: "0 8px 24px rgba(15, 18, 37, 0.35)",
        fontSize: "0.875rem",
        lineHeight: "1.4",
      }}
      className={`fixed z-[9999] transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      } left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 sm:max-w-sm`}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1.5rem",
          height: "1.5rem",
          borderRadius: "50%",
          background: `${BORDER_COLORS[type]}22`,
          color: BORDER_COLORS[type],
          fontSize: "0.875rem",
          fontWeight: 700,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {ICONS[type]}
      </span>
      <span style={{ wordBreak: "break-word" }}>{message}</span>
    </div>
  );
}
