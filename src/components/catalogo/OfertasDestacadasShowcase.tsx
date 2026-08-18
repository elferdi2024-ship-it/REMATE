// filepath: src/components/catalogo/OfertasDestacadasShowcase.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { haptic } from "@/lib/haptic";
import { formatPrice } from "@/lib/format";
import type { OfertaConfig, PremiumPromo } from "@/types/ofertas";
import { DEFAULT_PREMIUM_PROMOS } from "@/lib/constants/ofertas";

interface OfertasDestacadasShowcaseProps {
  sucursalId?: string | null;
  onOpenSucursalModal?: () => void;
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export default function OfertasDestacadasShowcase({
  sucursalId = null,
  onOpenSucursalModal,
  title = "Ofertas Destacadas de la Semana",
  subtitle = "Precios directos mayoristas y combos exclusivos por tiempo limitado",
  showViewAll = true,
}: OfertasDestacadasShowcaseProps) {
  const [promos, setPromos] = useState<PremiumPromo[]>(DEFAULT_PREMIUM_PROMOS);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const { addItem, items: cartItems, updateQty, removeItem } = useCart();
  const toast = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Escuchar configuración en tiempo real desde Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "configuracion", "ofertas"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as OfertaConfig;
          if (data.premiumPromos && data.premiumPromos.length > 0) {
            const validCustomPromos = data.premiumPromos.filter(p => !p.imagen?.includes("WhatsApp Image 2026-06-05"));
            const merged = DEFAULT_PREMIUM_PROMOS.map(dp => {
              const custom = validCustomPromos.find(p => p.id === dp.id);
              return custom || dp;
            });
            validCustomPromos.forEach(fp => {
              if (!merged.some(m => m.id === fp.id)) merged.push(fp);
            });
            setPromos(merged);
          }
          if (data.expiresAt) {
            setExpiresAt(data.expiresAt);
          }
        }
      },
      (err) => {
        console.warn("OfertasDestacadasShowcase: Using default promos fallback", err);
      }
    );
    return () => unsub();
  }, []);

  const promosVisibles = promos
    .filter((p) => p.activa)
    .filter((p) => !p.sucursalId || p.sucursalId === sucursalId);

  if (promosVisibles.length === 0) return null;

  const handleAddPromo = (promo: PremiumPromo, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic.add();

    addItem({
      codigo: `PROMO-${promo.id}`,
      nombre: promo.titulo,
      precio: promo.precio || 0,
      escalaPrecios: promo.escalaPrecios,
    });
    toast.success(`🔥 ¡${promo.titulo} agregado al pedido!`);
  };

  const getInCartQty = (promoId: string) => {
    const item = cartItems.find((i) => i.codigo === `PROMO-${promoId}`);
    return item ? item.cantidad : 0;
  };

  const handleQtyDelta = (promo: PremiumPromo, delta: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic.add();
    const code = `PROMO-${promo.id}`;
    const current = getInCartQty(promo.id);
    const next = current + delta;
    if (next <= 0) {
      removeItem(code);
    } else {
      updateQty(code, delta);
    }
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full py-4 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-[#DDD8D0]/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EF233C] text-white text-[10px] sm:text-xs font-black tracking-wider uppercase rounded-md shadow-xs">
            <span className="animate-pulse">🔥</span> OFERTAS
          </span>
          <h2 className="font-bebas text-lg sm:text-2xl text-[#1A1410] tracking-wide leading-none m-0">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll navigation arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Desplazar a la izquierda"
              className="w-7 h-7 rounded-lg bg-white border border-[#DDD8D0] text-[#1A1410] font-bold text-xs flex items-center justify-center shadow-xs active:scale-95 hover:bg-slate-50 transition-colors"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Desplazar a la derecha"
              className="w-7 h-7 rounded-lg bg-white border border-[#DDD8D0] text-[#1A1410] font-bold text-xs flex items-center justify-center shadow-xs active:scale-95 hover:bg-slate-50 transition-colors"
            >
              →
            </button>
          </div>

          {showViewAll && (
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#EF233C] hover:text-[#C01730] bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all uppercase tracking-wider"
            >
              <span>Ver todas</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>

      {/* Grid / Responsive Rail of Promo Cards */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1.5 snap-x snap-mandatory scroll-smooth"
      >
        {promosVisibles.map((promo) => {
          const inCart = getInCartQty(promo.id);
          const hasPrice = promo.precio !== null && promo.precio !== undefined && promo.precio > 0;

          return (
            <div
              key={promo.id}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[175px] snap-start rounded-2xl border border-[#DDD8D0] bg-white p-2 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-red-300 transition-all duration-200 select-none group"
            >
              {/* Promo 1:1 Image */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FBF9F7] mb-1.5">
                <Image
                  src={promo.imagen}
                  alt={promo.titulo}
                  fill
                  sizes="(max-width: 640px) 140px, 175px"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Title */}
              <h3 className="font-bold text-[11px] sm:text-xs text-[#1A1410] truncate leading-tight mb-1" title={promo.titulo}>
                {promo.titulo}
              </h3>

              {/* Bottom Card Bar & Action */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 mt-auto">
                {hasPrice ? (
                  <span className="text-sm sm:text-base font-black text-[#1A1410] font-mono tracking-tight leading-none">
                    {formatPrice(promo.precio!)}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">Promo</span>
                )}

                {/* Add to Cart Actions */}
                {hasPrice && (
                  inCart > 0 ? (
                    <div className="flex items-center gap-1.5 bg-slate-900 text-white rounded-lg px-1.5 py-0.5 font-bold shadow-xs">
                      <button
                        type="button"
                        onClick={(e) => handleQtyDelta(promo, -1, e)}
                        aria-label="Restar una unidad"
                        className="hover:text-[#EF233C] text-xs font-black px-0.5"
                      >
                        -
                      </button>
                      <span className="text-[10px] font-mono font-black">{inCart}</span>
                      <button
                        type="button"
                        onClick={(e) => handleQtyDelta(promo, 1, e)}
                        aria-label="Sumar una unidad"
                        className="hover:text-emerald-400 text-xs font-black px-0.5"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleAddPromo(promo, e)}
                      className="bg-[#EF233C] hover:bg-[#C01730] text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-xs transition-all active:scale-95 uppercase tracking-wider"
                    >
                      + AGREGAR
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
