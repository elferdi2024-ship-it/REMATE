"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { Toaster, toast as sonnerToast } from "sonner";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback(
    (type: ToastType, message: string, duration = 3000) => {
      switch (type) {
        case "success":
          sonnerToast.success(message, { duration });
          break;
        case "error":
          sonnerToast.error(message, { duration });
          break;
        case "warning":
          sonnerToast.warning(message, { duration });
          break;
        case "info":
        default:
          sonnerToast.info(message, { duration });
          break;
      }
    },
    []
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast("success", message, duration),
    [showToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => showToast("error", message, duration),
    [showToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => showToast("warning", message, duration),
    [showToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => showToast("info", message, duration),
    [showToast]
  );

  const contextValue = useMemo(() => ({ showToast, success, error, warning, info }), [
    showToast,
    success,
    error,
    warning,
    info,
  ]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgba(26, 20, 16, 0.98)",
            color: "#F5F2EE",
            border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "var(--font-body), sans-serif",
            fontWeight: 600,
            borderRadius: "16px",
          }
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
