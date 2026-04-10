"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;
    contentRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(15, 18, 37, 0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          background: "var(--white)",
          borderRadius: "var(--r-lg)",
          boxShadow: "0 24px 48px rgba(15, 18, 37, 0.25)",
          width: "100%",
          maxWidth: "32rem",
          maxHeight: "calc(100vh - 2rem)",
          overflow: "auto",
          animation: "slideUp 0.25s ease-out",
        }}
      >
        {/* Header */}
        {(title || typeof onClose === "function") && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {title && (
              <h2
                id="modal-title"
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                borderRadius: "var(--r-sm)",
                border: "none",
                background: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "1.25rem",
                lineHeight: 1,
                transition: "background 0.15s, color 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "var(--bg)";
                (e.target as HTMLElement).style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "transparent";
                (e.target as HTMLElement).style.color = "var(--muted)";
              }}
            >
              &#x2715;
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "1.25rem" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
