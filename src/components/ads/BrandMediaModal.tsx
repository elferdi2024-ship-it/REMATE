"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { BrandConfig } from "@/types/brands";
import { trackModalOpen, trackModalCta } from "@/hooks/useAdImpression";

interface BrandMediaModalProps {
  brand: BrandConfig;
  isOpen: boolean;
  onClose: () => void;
}

export default function BrandMediaModal({ brand, isOpen, onClose }: BrandMediaModalProps) {
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      trackModalOpen(brand.id);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, brand.id]);

  if (!isOpen) return null;

  const activeAsset = brand.assets[activeAssetIndex];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(10px, 3vw, 20px)"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#111",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "800px",
          height: "auto",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            fontSize: "18px",
            cursor: "pointer",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          &times;
        </button>

        <div style={{ padding: "clamp(12px, 3vw, 20px)", borderBottom: "1px solid #333" }}>
          <h2 style={{ color: "#fff", margin: 0, fontSize: "1.2rem" }}>{brand.name}</h2>
          <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0 }}>Recomendado por {brand.name}</p>
        </div>

        <div style={{ 
          position: "relative", 
          background: `${brand.color}15`, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          aspectRatio: "clamp(1, 1.5, 1.5)",
          maxHeight: "50vh",
          width: "100%"
        }}>
          {activeAsset.type === "video" ? (
            <video
              src={activeAsset.src}
              controls
              autoPlay
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          ) : (
            <Image
              src={activeAsset.src}
              alt={activeAsset.alt}
              fill
              style={{ objectFit: "contain", padding: "10px" }}
            />
          )}
        </div>

        {brand.assets.length > 1 && (
          <div style={{ padding: "clamp(8px, 2vw, 12px)", background: "#1a1a1a", display: "flex", gap: "8px", overflowX: "auto" }}>
            {brand.assets.map((asset, idx) => (
              <button
                key={asset.src}
                onClick={() => setActiveAssetIndex(idx)}
                style={{
                  flexShrink: 0,
                  width: "60px",
                  height: "60px",
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: activeAssetIndex === idx ? "2px solid var(--rojo)" : "2px solid transparent",
                  cursor: "pointer",
                  background: "#000"
                }}
              >
                {asset.type === "video" ? (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px" }}>Vid</div>
                ) : (
                  <Image src={asset.src} alt={asset.alt} fill style={{ objectFit: "cover" }} />
                )}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: "clamp(12px, 3vw, 20px)", background: "#111", borderTop: "1px solid #333", display: "flex", justifyContent: "center" }}>
          <button 
            onClick={() => {
              trackModalCta(brand.id);
              onClose();
            }}
            style={{
              background: "var(--rojo)",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%"
            }}
          >
            Ver catálogo de la marca
          </button>
        </div>
      </div>
    </div>
  );
}
