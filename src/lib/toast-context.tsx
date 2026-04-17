"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 3000) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);
    },
    [removeToast]
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

  // Cleanup timers on unmount
  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  const iconMap: Record<ToastType, string> = {
    success: "\u2713",
    error: "\u2715",
    warning: "\u26A0",
    info: "\u2139",
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Inline keyframes for toast animation */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(1rem); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Toast container — fixed bottom, stacked */}
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "center",
          gap: "0.5rem",
          pointerEvents: "none",
        }}
        className="sm:items-end sm:left-auto sm:translate-x-0 sm:right-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            onClick={() => removeToast(toast.id)}
            style={{
              background: "var(--oscuro, #1A1410)",
              border: "1px solid var(--rojo, #D62828)",
              borderRadius: "12px",
              padding: "0.75rem 1.25rem",
              color: "#E8EAF6",
              fontSize: "0.875rem",
              fontFamily: "Inter, system-ui, sans-serif",
              boxShadow: "0 4px 20px rgba(214, 40, 40, 0.15)",
              maxWidth: "90vw",
              width: "max-content",
              pointerEvents: "auto",
              cursor: "pointer",
              animation: "toastIn 0.3s ease-out",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            className="sm:max-w-sm"
          >
            <span
              style={{
                color:
                  toast.type === "success"
                    ? "#00E5FF"
                    : toast.type === "error"
                      ? "#FF5252"
                      : toast.type === "warning"
                        ? "#FFD600"
                        : "#64B5F6",
                fontWeight: 700,
                fontSize: "1rem",
                flexShrink: 0,
              }}
            >
              {iconMap[toast.type]}
            </span>
            <span style={{ lineHeight: 1.4 }}>{toast.message}</span>
          </div>
        ))}
      </div>
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
