// filepath: src/components/catalogo/ProductoSkeleton.tsx
import React from "react";

export function ProductoSkeleton() {
  const pulseStyle = {
    animation: "shimmerPulse 1.6s ease-in-out infinite",
    background: "var(--bg2)",
  };

  return (
    <div
      style={{
        background: "var(--white)",
        border: "1.5px solid var(--border)",
        borderRadius: "16px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        height: "290px", // Altura fija garantizada para eliminar el CLS del catálogo
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Thumbnail area skeleton */}
      <div
        style={{
          ...pulseStyle,
          borderRadius: "12px",
          height: "120px",
          marginBottom: "10px",
          width: "100%",
        }}
      />

      {/* Categoria chip skeleton */}
      <div
        style={{
          ...pulseStyle,
          height: "18px",
          width: "65px",
          borderRadius: "6px",
          marginBottom: "10px",
        }}
      />

      {/* Name skeleton (2 lines) */}
      <div
        style={{
          ...pulseStyle,
          height: "14px",
          width: "90%",
          borderRadius: "4px",
          marginBottom: "6px",
        }}
      />
      <div
        style={{
          ...pulseStyle,
          height: "14px",
          width: "60%",
          borderRadius: "4px",
          marginBottom: "14px",
        }}
      />

      {/* Price skeleton */}
      <div
        style={{
          ...pulseStyle,
          height: "22px",
          width: "75px",
          borderRadius: "6px",
          marginTop: "auto",
        }}
      />

      {/* Button skeleton */}
      <div
        style={{
          ...pulseStyle,
          position: "absolute",
          bottom: "12px",
          right: "12px",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
