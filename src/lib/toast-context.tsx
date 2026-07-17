"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
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

  const typeStyles: Record<ToastType, { border: string; shadow: string; iconColor: string; bg: string }> = {
    success: {
      border: "1.5px solid #2ECC71",
      shadow: "0 10px 30px rgba(46, 204, 113, 0.22)",
      iconColor: "#2ECC71",
      bg: "rgba(26, 20, 16, 0.96)"
    },
    error: {
      border: "1.5px solid #E53935",
      shadow: "0 10px 30px rgba(229, 57, 53, 0.22)",
      iconColor: "#E53935",
      bg: "rgba(26, 20, 16, 0.96)"
    },
    warning: {
      border: "1.5px solid #F59E0B",
      shadow: "0 10px 30px rgba(245, 158, 11, 0.22)",
      iconColor: "#F59E0B",
      bg: "rgba(26, 20, 16, 0.96)"
    },
    info: {
      border: "1.5px solid #3498DB",
      shadow: "0 10px 30px rgba(52, 152, 219, 0.18)",
      iconColor: "#3498DB",
      bg: "rgba(26, 20, 16, 0.96)"
    },
  };

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
        {toasts.map((toast) => {
          const styleConfig = typeStyles[toast.type];
          return (
            <div
              key={toast.id}
              role="alert"
              onClick={() => removeToast(toast.id)}
              style={{
                background: styleConfig.bg,
                border: styleConfig.border,
                borderRadius: "14px",
                padding: "0.85rem 1.4rem",
                color: "#F5F2EE",
                fontSize: "0.85rem",
                fontWeight: 700,
                fontFamily: "var(--font-body), sans-serif",
                boxShadow: styleConfig.shadow,
                maxWidth: "90vw",
                width: "max-content",
                pointerEvents: "auto",
                cursor: "pointer",
                animation: "toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                letterSpacing: "0.2px"
              }}
              className="sm:max-w-sm"
            >
              <span
                style={{
                  color: styleConfig.iconColor,
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {iconMap[toast.type]}
              </span>
              <span style={{ lineHeight: 1.4 }}>{toast.message}</span>
            </div>
          );
        })}
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
