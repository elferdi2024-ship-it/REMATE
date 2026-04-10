import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--oscuro, #1A1410)",
        color: "#fff",
        fontFamily: "var(--font-body), sans-serif",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display), sans-serif",
          fontSize: "3rem",
          letterSpacing: "2px",
          margin: 0,
        }}
      >
        404
      </h1>
      <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "8px" }}>
        Pagina no encontrada
      </p>
      <Link
        href="/catalogo"
        style={{
          marginTop: "20px",
          background: "var(--rojo, #D62828)",
          color: "#fff",
          borderRadius: "var(--r-md, 12px)",
          padding: "10px 24px",
          textDecoration: "none",
          fontFamily: "var(--font-display), sans-serif",
          fontSize: "1.1rem",
          letterSpacing: "1px",
        }}
      >
        Volver al catalogo
      </Link>
    </div>
  );
}
