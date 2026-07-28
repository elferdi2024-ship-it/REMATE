// filepath: src/components/catalogo/DigitalCouponBadge.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { haptic } from "@/lib/haptic";
import { getCuponesConfig } from "@/lib/cupones";

interface DigitalCouponBadgeProps {
  couponCode: string;
  discountAmount: number; // Ej: 50
  discountType?: "fixed" | "percent";
  onApplyCoupon?: (code: string, amount: number) => void;
}

export default function DigitalCouponBadge({
  couponCode,
  discountAmount,
  discountType = "fixed",
  onApplyCoupon,
}: DigitalCouponBadgeProps) {
  const [isClipped, setIsClipped] = useState(false);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isCouponActive, setIsCouponActive] = useState(false);

  useEffect(() => {
    const config = getCuponesConfig();
    setIsSystemActive(config.sistemaActivo);
    const target = config.cupones.find((c) => c.codigo === couponCode);
    setIsCouponActive(Boolean(target && target.activo));
  }, [couponCode]);

  // Si el sistema está deshabilitado globalmente o el cupón no está activo en admin, no mostrar nada
  if (!isSystemActive || !isCouponActive) return null;

  const handleClip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isClipped) {
      haptic.send();
      setIsClipped(true);
      toast.success(`Cupón ${couponCode} clipeado: -$${discountAmount} en tu pedido`);
      onApplyCoupon?.(couponCode, discountAmount);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClip}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border transition-all ${
        isClipped
          ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm"
          : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/80 active:scale-95 cursor-pointer"
      }`}
    >
      <span>{isClipped ? "✅" : "✂️"}</span>
      <span>
        {isClipped
          ? `Cupón ${couponCode} Aplicado`
          : `Clipear Cupón -${discountType === "fixed" ? `$${discountAmount}` : `${discountAmount}%`}`}
      </span>
    </button>
  );
}
