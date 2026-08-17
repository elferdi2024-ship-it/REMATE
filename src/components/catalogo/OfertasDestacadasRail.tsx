// filepath: src/components/catalogo/OfertasDestacadasRail.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { haptic } from "@/lib/haptic";
import { formatPrice } from "@/lib/format";
import type { OfertaConfig, OfertaProducto } from "@/types/ofertas";

// ─── Countdown Timer ────────────────────────────────────────────
function MiniCountdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remaining <= 0) return null;

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const isUrgent = remaining < 3600;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-mono font-black tracking-wider px-2.5 py-1 rounded-md border shrink-0 ${
        isUrgent
          ? "bg-red-50 text-[#EF233C] border-red-200 animate-pulse"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      ⏱ {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ─── Offer Card ──────────────────────────────────────────
function OfertaMiniCard({
  producto,
  onAdd,
}: {
  producto: OfertaProducto;
  onAdd: () => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    haptic.add();
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="relative min-w-[200px] max-w-[220px] bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-3.5 flex flex-col justify-between shrink-0 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 select-none">
      {/* Discount Badge */}
      <div className="absolute top-2.5 right-2.5 z-10 bg-[#EF233C] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
        -{producto.descuento}% OFF
      </div>

      {/* Featured Star */}
      {producto.destacado && (
        <span className="absolute top-2.5 left-2.5 text-xs">⭐</span>
      )}

      {/* Top Details */}
      <div className="mt-4 mb-2">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 truncate">
          {producto.categoria}
        </p>

        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.4em]">
          {producto.nombre}
        </h4>
      </div>

      {/* Prices */}
      <div className="mt-auto pt-2 border-t border-slate-100 mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg sm:text-xl font-black text-slate-950 font-mono tracking-tight leading-none">
            {formatPrice(producto.precioOferta)}
          </span>
          <span className="text-xs font-semibold text-slate-400 line-through leading-none">
            {formatPrice(producto.precioOriginal)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={added}
        aria-label={`Agregar ${producto.nombre}`}
        className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5 ${
          added
            ? "bg-emerald-600 text-white shadow-emerald-500/20"
            : "bg-[#EF233C] hover:bg-[#C01730] text-white shadow-[#EF233C]/20"
        }`}
      >
        <span>{added ? "✓ Agregado" : "+ Agregar"}</span>
      </button>
    </div>
  );
}

// ─── Main Rail Component ─────────────────────────────────────────
export default function OfertasDestacadasRail() {
  const [config, setConfig] = useState<OfertaConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "configuracion", "ofertas"));
        if (snap.exists()) {
          const data = snap.data() as OfertaConfig;
          if (data.activa && data.productos && data.productos.length > 0) {
            setConfig(data);
          }
        }
      } catch (e) {
        console.error("Error loading ofertas rail:", e);
      }
    }
    load();
  }, []);

  const handleAdd = (producto: OfertaProducto) => {
    addItem({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precioOferta,
    });
    toast.success(`${producto.nombre} agregado`);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 240;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Don't render if no active offers
  if (!config || config.productos.length === 0) return null;

  // Sort: destacados first, then by discount
  const sorted = [...config.productos].sort((a, b) => {
    if (a.destacado && !b.destacado) return -1;
    if (!a.destacado && b.destacado) return 1;
    return b.descuento - a.descuento;
  });

  return (
    <section className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 my-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="bg-[#EF233C] text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md shadow-xs">
            🔥 OFERTAS DIRECTAS
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display uppercase tracking-wide m-0">
            {config.titulo || "Súper Precios de la Semana"}
          </h3>
          {config.expiresAt && <MiniCountdown expiresAt={config.expiresAt} />}
          <span className="text-xs font-bold text-slate-500 font-mono">
            ({config.productos.length} items)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll arrows */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Desplazar a la izquierda"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Desplazar a la derecha"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors shadow-xs"
          >
            →
          </button>

          <Link
            href="/ofertas"
            className="text-xs font-extrabold text-[#EF233C] hover:text-[#C01730] bg-red-50 hover:bg-red-100 border border-red-200/80 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap uppercase tracking-wider ml-1"
          >
            Ver todas →
          </Link>
        </div>
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory"
      >
        {sorted.map((p) => (
          <OfertaMiniCard
            key={p.codigo}
            producto={p}
            onAdd={() => handleAdd(p)}
          />
        ))}

        {/* View all CTA card */}
        <Link
          href="/ofertas"
          className="min-w-[160px] rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50 hover:bg-red-50 p-4 shrink-0 flex flex-col items-center justify-center gap-2 text-center transition-all group"
        >
          <span className="text-3xl transition-transform group-hover:scale-110">🏷️</span>
          <span className="text-xs font-extrabold text-[#EF233C] uppercase tracking-wider leading-tight">
            Ver todas las ofertas
          </span>
        </Link>
      </div>
    </section>
  );
}
