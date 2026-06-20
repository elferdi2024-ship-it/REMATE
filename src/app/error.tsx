'use client'

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console or error reporting service
    console.error("Application error boundary:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--crema, #F5F0E8)',
      padding: '20px',
      fontFamily: 'var(--font-body), sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 'var(--r-md, 12px)',
        padding: '40px',
        maxWidth: '480px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md, 0 4px 16px rgba(17,11,8,0.12))',
      }}>
        <h2 style={{ color: 'var(--oscuro, #111111)', marginBottom: '12px', fontFamily: 'var(--font-display, sans-serif)', letterSpacing: '1px' }}>
          Algo salió mal
        </h2>
        <p style={{ color: 'var(--muted, #5C5550)', marginBottom: '24px' }}>
          Ha ocurrido un error inesperado.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: 'var(--rojo, #E8302A)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--r-sm, 8px)',
            padding: '12px 24px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
