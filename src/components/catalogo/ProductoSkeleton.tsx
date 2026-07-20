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
        borderRadius: "var(--r-lg)",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        height: "320px",
        boxShadow: "0 2px 8px rgba(17,11,8,0.03)",
      }}
    >
      {/* Thumbnail area skeleton */}
      <div
        style={{
          ...pulseStyle,
          borderRadius: "calc(var(--r-lg) - 2px)",
          aspectRatio: "1 / 1",
          height: "auto",
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
          width: "44px",
          height: "44px",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
