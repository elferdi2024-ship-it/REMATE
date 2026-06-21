"use client";
// filepath: src/components/catalogo/BottomNavBar.tsx

import React from "react";

interface BottomNavBarProps {
  activeTab: string;
  onTabSelect: (tab: string) => void;
  cartQty: number;
  onOpenCart: () => void;
  onOpenUser: () => void;
}

export default function BottomNavBar({
  activeTab,
  onTabSelect,
  cartQty,
  onOpenCart,
  onOpenUser,
}: BottomNavBarProps) {
  const tabs = [
    {
      id: "inicio",
      label: "Inicio",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: "buscar",
      label: "Buscar",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      ),
    },
    {
      id: "favoritos",
      label: "Favoritos",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
    },
    {
      id: "carrito",
      label: "Carrito",
      icon: (
        <div style={{ position: "relative" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {cartQty > 0 && (
            <span
              className="absolute -top-2 -right-2 bg-red-600 text-white font-black rounded-full flex items-center justify-center animate-soft-pulse"
              style={{
                fontSize: "9px",
                minWidth: "16px",
                height: "16px",
                padding: "0 4px",
                boxShadow: "0 2px 6px rgba(220,38,38,0.4)",
              }}
            >
              {cartQty}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "cuenta",
      label: "Cuenta",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === "carrito") {
      onOpenCart();
    } else if (tabId === "cuenta") {
      onOpenUser();
    } else {
      onTabSelect(tabId);
    }
  };

  return (
    <div
      className="bottom-nav md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(17,11,8,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 12px)",
        paddingTop: "8px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.03)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              background: "transparent",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              color: isSelected ? "var(--rojo, #E8302A)" : "var(--muted, #5C5550)",
              cursor: "pointer",
              padding: "6px 12px",
              minWidth: "64px",
              transition: "color 0.2s ease, transform 0.1s ease",
              transform: isSelected ? "scale(1.05)" : "scale(1)",
            }}
            aria-label={tab.label}
          >
            <div style={{ transition: "transform 0.2s ease" }} className={isSelected ? "scale-110" : ""}>
              {tab.icon}
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: isSelected ? 800 : 500,
                letterSpacing: "0.2px",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
