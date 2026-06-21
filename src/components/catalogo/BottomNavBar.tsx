// filepath: src/components/catalogo/BottomNavBar.tsx
import React from "react";

const getTabIcon = (id: string, isSelected: boolean, cartQty: number) => {
  switch (id) {
    case "inicio":
      return isSelected ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nav-grad-inicio" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B66" />
              <stop offset="100%" stopColor="#E8302A" />
            </linearGradient>
          </defs>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="url(#nav-grad-inicio)" stroke="#E8302A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 22V12h6v10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "buscar":
      return isSelected ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nav-grad-buscar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8E8A" />
              <stop offset="100%" stopColor="#E8302A" />
            </linearGradient>
          </defs>
          <circle cx="11" cy="11" r="8" fill="url(#nav-grad-buscar)" stroke="#E8302A" strokeWidth="1.5" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#E8302A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="9" cy="9" r="1.5" fill="#FFFFFF" opacity="0.6" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "favoritos":
      return isSelected ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nav-grad-favoritos" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B66" />
              <stop offset="100%" stopColor="#E8302A" />
            </linearGradient>
          </defs>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="url(#nav-grad-favoritos)" stroke="#E8302A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "carrito":
      return (
        <div style={{ position: "relative", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isSelected ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nav-grad-carrito" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B66" />
                  <stop offset="100%" stopColor="#E8302A" />
                </linearGradient>
              </defs>
              <circle cx="8" cy="21" r="1.5" fill="#E8302A" />
              <circle cx="19" cy="21" r="1.5" fill="#E8302A" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" stroke="#E8302A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.2 5.5h13.6l-1.3 6H7.5l-1.3-6z" fill="url(#nav-grad-carrito)" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          )}
          {cartQty > 0 && (
            <span
              className="absolute -top-1.5 -right-2.5 bg-red-600 text-white font-black rounded-full flex items-center justify-center animate-soft-pulse"
              style={{
                fontSize: "9px",
                minWidth: "16px",
                height: "16px",
                padding: "0 4px",
                boxShadow: "0 2px 6px rgba(220,38,38,0.4)",
                zIndex: 10,
              }}
            >
              {cartQty}
            </span>
          )}
        </div>
      );
    case "cuenta":
      return isSelected ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nav-grad-cuenta" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B66" />
              <stop offset="100%" stopColor="#E8302A" />
            </linearGradient>
          </defs>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" fill="url(#nav-grad-cuenta)" stroke="#E8302A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" fill="url(#nav-grad-cuenta)" stroke="#E8302A" strokeWidth="1.5" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
};

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
    { id: "inicio", label: "Inicio" },
    { id: "buscar", label: "Buscar" },
    { id: "favoritos", label: "Favoritos" },
    { id: "carrito", label: "Carrito" },
    { id: "cuenta", label: "Cuenta" },
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
              gap: "2px",
              color: isSelected ? "#E8302A" : "#6E6864",
              cursor: "pointer",
              padding: "4px 8px",
              minWidth: "60px",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            aria-label={tab.label}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "30px",
                borderRadius: "15px",
                backgroundColor: isSelected ? "rgba(232, 48, 42, 0.08)" : "transparent",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
              }}
            >
              {getTabIcon(tab.id, isSelected, cartQty)}
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: isSelected ? 800 : 500,
                letterSpacing: "0.1px",
                transition: "color 0.25s ease",
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
