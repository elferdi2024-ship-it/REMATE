'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F4F6FB',
          padding: '20px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '480px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ color: '#1A1F3A', marginBottom: '12px' }}>
              Algo salió mal
            </h2>
            <p style={{ color: '#7A7FA8', marginBottom: '24px' }}>
              Ha ocurrido un error inesperado.
            </p>
            <button
              onClick={() => reset()}
              style={{
                background: '#1A1F3A',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
