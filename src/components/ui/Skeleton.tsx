"use client";

type SkeletonVariant = "card" | "row" | "text";

interface SkeletonProps {
  lines?: number;
  variant?: SkeletonVariant;
}

const PULSE_STYLE: React.CSSProperties = {
  background:
    "linear-gradient(90deg, var(--border) 25%, #e8ecf6 50%, var(--border) 75%)",
  backgroundSize: "200% 100%",
  animation: "pulse 1.5s ease-in-out infinite",
  borderRadius: "var(--r-sm)",
};

export default function Skeleton({ lines = 3, variant = "text" }: SkeletonProps) {
  if (variant === "card") {
    return (
      <div
        style={{
          background: "var(--white)",
          borderRadius: "var(--r-md)",
          padding: "1rem",
          border: "1px solid var(--border)",
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            ...PULSE_STYLE,
            width: "100%",
            aspectRatio: "4 / 3",
            borderRadius: "var(--r-sm)",
            marginBottom: "0.75rem",
          }}
        />
        {/* Title line */}
        <div
          style={{
            ...PULSE_STYLE,
            height: "1rem",
            width: "75%",
            marginBottom: "0.5rem",
          }}
        />
        {/* Subtitle lines */}
        {Array.from({ length: Math.max(lines - 1, 1) }).map((_, i) => (
          <div
            key={i}
            style={{
              ...PULSE_STYLE,
              height: "0.75rem",
              width: i === Math.max(lines - 2, 0) ? "50%" : "90%",
              marginBottom: "0.5rem",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "0.75rem 0",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Avatar / icon placeholder */}
        <div
          style={{
            ...PULSE_STYLE,
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "50%",
            flexShrink: 0,
          }}
        />
        {/* Text lines */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              style={{
                ...PULSE_STYLE,
                height: "0.75rem",
                width: i === 0 ? "60%" : "85%",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default: text variant
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            ...PULSE_STYLE,
            height: "0.875rem",
            width: i === lines - 1 ? "60%" : "100%",
          }}
        />
      ))}
    </div>
  );
}
