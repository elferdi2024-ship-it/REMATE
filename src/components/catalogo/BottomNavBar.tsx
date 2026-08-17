// filepath: src/components/catalogo/BottomNavBar.tsx
import React from "react";
import { haptic } from "@/lib/haptic";

const getTabIcon = (id: string, isSelected: boolean, cartQty: number) => {
  switch (id) {
    case "inicio":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isSelected ? "#EF233C" : "none"} stroke={isSelected ? "#EF233C" : "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" stroke={isSelected ? "#FFFFFF" : "currentColor"} />
        </svg>
      );
    case "buscar":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#EF233C" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "favoritos":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isSelected ? "#EF233C" : "none"} stroke={isSelected ? "#EF233C" : "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "carrito":
      return (
        <div className="relative flex h-6 w-6 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#EF233C" : "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {cartQty > 0 && (
            <span className="absolute -right-2.5 -top-1.5 z-10 flex min-w-[17px] h-[17px] items-center justify-center rounded-full bg-[#EF233C] px-1 text-[9px] font-black text-white shadow-sm font-mono">
              {cartQty}
            </span>
          )}
        </div>
      );
    case "cuenta":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isSelected ? "#EF233C" : "none"} stroke={isSelected ? "#EF233C" : "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" fill={isSelected ? "#EF233C" : "none"} />
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
    { id: "inicio", label: "Catálogo" },
    { id: "buscar", label: "Buscar" },
    { id: "favoritos", label: "Favoritos" },
    { id: "carrito", label: "Pedido" },
    { id: "cuenta", label: "Cuenta" },
  ];

  const handleTabClick = (tabId: string) => {
    haptic.add();
    if (tabId === "carrito") {
      onOpenCart();
    } else if (tabId === "cuenta") {
      onOpenUser();
    } else {
      onTabSelect(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-[env(safe-area-inset-bottom,8px)] pt-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] flex justify-around items-center md:hidden">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[60px] min-h-[44px] transition-all active:scale-95 touch-manipulation rounded-xl ${
              isSelected ? "text-[#EF233C]" : "text-slate-500 hover:text-slate-800"
            }`}
            aria-label={tab.label}
          >
            <div
              className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${
                isSelected ? "bg-red-50" : "bg-transparent"
              }`}
            >
              {getTabIcon(tab.id, isSelected, cartQty)}
            </div>
            <span className={`text-[10px] tracking-tight ${isSelected ? "font-black" : "font-semibold"}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
