import React from "react";

export function ProductoSkeleton() {
  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Thumbnail area skeleton */}
      <div
        className="animate-pulse"
        style={{
          background: "var(--bg2)",
          borderRadius: "12px",
          height: "110px",
          marginBottom: "8px",
        }}
      />

      {/* Categoria chip skeleton */}
      <div
        className="animate-pulse"
        style={{
          background: "var(--bg2)",
          height: "22px",
          width: "60px",
          borderRadius: "6px",
          marginBottom: "8px",
        }}
      />

      {/* Name skeleton (2 lines) */}
      <div
        className="animate-pulse"
        style={{
          background: "var(--bg2)",
          height: "1.2rem",
          width: "90%",
          borderRadius: "4px",
          marginBottom: "6px",
        }}
      />
      <div
        className="animate-pulse"
        style={{
          background: "var(--bg2)",
          height: "1.2rem",
          width: "60%",
          borderRadius: "4px",
          marginBottom: "12px",
        }}
      />

      {/* Price skeleton */}
      <div
        className="animate-pulse"
        style={{
          background: "var(--bg2)",
          height: "24px",
          width: "80px",
          borderRadius: "6px",
          marginTop: "4px",
        }}
      />

      {/* Button skeleton */}
      <div
        className="animate-pulse"
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "var(--bg2)",
        }}
      />
    </div>
  );
}
