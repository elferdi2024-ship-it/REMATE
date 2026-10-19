// filepath: src/components/catalogo/BottomNavBar.tsx
"use client";

import React from "react";
import { haptic } from "@/lib/haptic";

const getTabIcon = (id: string, isSelected: boolean, cartQty: number) => {
  switch (id) {
    case "inicio":
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={isSelected ? "#EF233C" : "none"}
          stroke={isSelected ? "#EF233C" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" stroke={isSelected ? "#FFFFFF" : "currentColor"} />
        </svg>
      );
    case "buscar":
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isSelected ? "2.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "favoritos":
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={isSelected ? "#EF233C" : "none"}
          stroke={isSelected ? "#EF233C" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "carrito":
      return (
        <div className="relative flex items-center justify-center">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={isSelected ? "2.4" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {cartQty > 0 && (
            <span
              className="absolute -right-2.5 -top-1.5 z-10 flex min-w-[17px] h-[17px] items-center justify-center rounded-full bg-[#EF233C] px-1 text-[9.5px] font-black text-white shadow-xs ring-2 ring-white tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {cartQty > 99 ? "99+" : cartQty}
            </span>
          )}
        </div>
      );
    case "cuenta":
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isSelected ? "2.3" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-slate-200/80 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] md:hidden select-none">
      <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[50px] py-1 transition-all active:scale-95 touch-manipulation ${
                isSelected ? "text-[#EF233C]" : "text-slate-400 hover:text-slate-600"
              }`}
              aria-label={tab.label}
              aria-current={isSelected ? "page" : undefined}
            >
              {/* Indicador de pestaña activa superior */}
              {isSelected && (
                <span className="absolute top-0 w-8 h-[2.5px] bg-[#EF233C] rounded-full animate-in fade-in zoom-in-75 duration-200" />
              )}

              <div className="flex items-center justify-center h-6 w-6 mt-1">
                {getTabIcon(tab.id, isSelected, cartQty)}
              </div>

              <span
                className={`text-[10.5px] tracking-tight mt-1 transition-colors ${
                  isSelected ? "font-black text-[#EF233C]" : "font-semibold text-slate-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
