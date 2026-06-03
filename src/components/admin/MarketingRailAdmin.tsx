// filepath: src/components/admin/MarketingRailAdmin.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/lib/toast-context";

export interface MarketingCard {
  id: string;
  pill: string;
  icon: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  variant: "hot" | "premium" | "proof";
  active: boolean;
}

const DEFAULT_CARDS: MarketingCard[] = [
  {
    id: "recompra",
    pill: "Recompra",
    icon: "🔁",
    title: "Compra de nuevo en 1 toque",
    description: "Entra a tu historial y repeti pedidos completos en segundos.",
    ctaText: "Activar recompra",
    ctaLink: "/historial",
    variant: "hot",
    active: true,
  },
  {
    id: "canasta",
    pill: "Canasta",
    icon: "🛒",
    title: "Completa tu pedido",
    description: "Empeza tu carrito y desbloquea recomendaciones de reposicion.",
    ctaText: "Ver sugerencias",
    ctaLink: "/catalogo",
    variant: "premium",
    active: true,
  },
  {
    id: "flash-deal",
    pill: "Flash Deal",
    icon: "⚡",
    title: "Ofertas con tiempo limite",
    description: "Promos activas con cuenta regresiva para acelerar decision de compra.",
    ctaText: "Ver ofertas de hoy",
    ctaLink: "/catalogo",
    variant: "proof",
    active: true,
  },
];

const ICON_OPTIONS = ["🔁", "🛒", "⚡", "🔥", "⭐", "💎", "🎯", "📦", "🏷️", "💰", "🎁", "🚀", "✨", "🍺", "🧴", "🧹", "🥩", "🧀"];

const VARIANT_OPTIONS: { value: MarketingCard["variant"]; label: string; color: string }[] = [
  { value: "hot", label: "Rojo (Hot)", color: "#E8302A" },
  { value: "premium", label: "Dorado (Premium)", color: "#D4A853" },
  { value: "proof", label: "Verde (Proof)", color: "#22C55E" },
];

export const FIRESTORE_KEY = "configuracion";
export const FIRESTORE_DOC = "marketing_rail";

export default function MarketingRailAdmin() {
  const [cards, setCards] = useState<MarketingCard[]>([]);
  const [sectionTitle, setSectionTitle] = useState("Recompra rapida, ofertas activas y mas conversion");
  const [sectionKicker, setSectionKicker] = useState("MODO COMPRA INTELIGENTE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();

  // Load from Firestore
  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, FIRESTORE_KEY, FIRESTORE_DOC));
        if (snap.exists()) {
          const data = snap.data();
          setCards(data.cards || DEFAULT_CARDS);
          setSectionTitle(data.sectionTitle || sectionTitle);
          setSectionKicker(data.sectionKicker || sectionKicker);
        } else {
          setCards(DEFAULT_CARDS);
          await setDoc(doc(db, FIRESTORE_KEY, FIRESTORE_DOC), {
            cards: DEFAULT_CARDS,
            sectionTitle,
            sectionKicker,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error("Error loading marketing rail config:", e);
        setCards(DEFAULT_CARDS);
        toast.error("Error al cargar configuración de tarjetas");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to Firestore
  const handleSave = useCallback(
    async (updatedCards: MarketingCard[], title?: string, kicker?: string) => {
      setSaving(true);
      try {
        const payload = {
          cards: updatedCards,
          sectionTitle: title ?? sectionTitle,
          sectionKicker: kicker ?? sectionKicker,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, FIRESTORE_KEY, FIRESTORE_DOC), payload, { merge: true });
        setCards(updatedCards);
        if (title !== undefined) setSectionTitle(title);
        if (kicker !== undefined) setSectionKicker(kicker);
        toast.success("Tarjetas guardadas");
      } catch (e) {
        console.error(e);
        toast.error("Error al guardar");
      } finally {
        setSaving(false);
      }
    },
    [sectionTitle, sectionKicker, toast]
  );

  const updateCard = (id: string, updates: Partial<MarketingCard>) => {
    const updated = cards.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCards(updated);
  };

  const addCard = () => {
    const newCard: MarketingCard = {
      id: `card-${Date.now()}`,
      pill: "Nuevo",
      icon: "🎯",
      title: "Nueva tarjeta",
      description: "Descripción de la tarjeta",
      ctaText: "Ver más",
      ctaLink: "/catalogo",
      variant: "hot",
      active: true,
    };
    const updated = [...cards, newCard];
    setCards(updated);
    setEditingId(newCard.id);
  };

  const deleteCard = (id: string) => {
    if (!confirm("¿Eliminar esta tarjeta?")) return;
    const updated = cards.filter((c) => c.id !== id);
    handleSave(updated);
  };

  const moveCard = (id: string, direction: "up" | "down") => {
    const idx = cards.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= cards.length) return;
    const updated = [...cards];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setCards(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-[var(--admin-text-hi)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--admin-accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[var(--admin-text-mid)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-2xl tracking-widest text-[var(--admin-text-hi)]">
            TARJETAS <span className="text-[var(--admin-accent)]">MARKETING RAIL</span>
          </h2>
          <p className="mt-1 text-xs text-[var(--admin-text-lo)]">
            Editá las fichas de &ldquo;Modo Compra Inteligente&rdquo; que ven los clientes en el catálogo
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addCard}
            className="rounded-xl bg-[var(--admin-accent)]/10 px-4 py-2 text-sm font-bold text-[var(--admin-accent)] transition-all hover:bg-[var(--admin-accent)]/20 border border-[var(--admin-accent)]/20"
          >
            + Tarjeta
          </button>
          <button
            onClick={() => handleSave(cards)}
            disabled={saving}
            className="rounded-xl bg-[var(--admin-accent)] px-5 py-2 text-sm font-bold text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "💾 Guardar Todo"}
          </button>
        </div>
      </div>

      {/* Section Title/Kicker Editor */}
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-5 space-y-4">
        <h3 className="text-xs font-bold text-[var(--admin-text-lo)] uppercase tracking-widest">Encabezado de la sección</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Kicker (texto superior)</label>
            <input
              type="text"
              value={sectionKicker}
              onChange={(e) => setSectionKicker(e.target.value)}
              className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:outline-none focus:border-[var(--admin-accent)]/40"
              placeholder="MODO COMPRA INTELIGENTE"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Título</label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/50 focus:outline-none focus:border-[var(--admin-accent)]/40"
              placeholder="Recompra rapida, ofertas activas..."
            />
          </div>
        </div>
      </div>

      {/* Cards Editor */}
      <div className="space-y-4">
        {cards.map((card, idx) => {
          const isEditing = editingId === card.id;
          const variantInfo = VARIANT_OPTIONS.find((v) => v.value === card.variant);

          return (
            <div
              key={card.id}
              className={`rounded-2xl border bg-[var(--admin-card-bg)] overflow-hidden transition-all ${
                card.active ? "border-[var(--admin-border)]" : "border-[var(--admin-border)]/50 opacity-60"
              } ${isEditing ? "ring-1 ring-[var(--admin-accent)]/30" : ""}`}
            >
              {/* Card Header - always visible */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[var(--admin-input-bg)]/30 transition-colors"
                onClick={() => setEditingId(isEditing ? null : card.id)}
              >
                <span className="text-2xl">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: `${variantInfo?.color}20`, color: variantInfo?.color }}
                    >
                      {card.pill}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--admin-text-hi)] truncate">{card.title}</h4>
                  </div>
                  <p className="text-xs text-[var(--admin-text-lo)] mt-0.5 truncate">
                    {card.ctaText} → {card.ctaLink}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveCard(card.id, "up"); }}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-[var(--admin-text-lo)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)] disabled:opacity-20 text-xs"
                    title="Subir"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveCard(card.id, "down"); }}
                    disabled={idx === cards.length - 1}
                    className="p-1.5 rounded-lg text-[var(--admin-text-lo)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)] disabled:opacity-20 text-xs"
                    title="Bajar"
                  >
                    ▼
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateCard(card.id, { active: !card.active });
                    }}
                    className={`p-1.5 rounded-lg text-xs font-bold ${
                      card.active ? "text-green-500 hover:bg-green-500/10" : "text-red-500 hover:bg-red-500/10"
                    }`}
                  >
                    {card.active ? "✓" : "✗"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-xs"
                  >
                    🗑
                  </button>
                  <span className="text-[var(--admin-text-lo)]/50 text-xs ml-1">{isEditing ? "▾" : "▸"}</span>
                </div>
              </div>

              {/* Expandable Edit Form */}
              {isEditing && (
                <div className="border-t border-[var(--admin-border)] p-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Icon picker */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-2">Icono</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ICON_OPTIONS.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => updateCard(card.id, { icon })}
                            className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                              card.icon === icon
                                ? "bg-[var(--admin-accent)]/20 ring-2 ring-[var(--admin-accent)]/50 scale-110"
                                : "bg-[var(--admin-bg)] border border-[var(--admin-border)] hover:bg-[var(--admin-input-bg)]"
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pill text */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Pill / Badge</label>
                      <input
                        type="text"
                        value={card.pill}
                        onChange={(e) => updateCard(card.id, { pill: e.target.value })}
                        className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] focus:outline-none focus:border-[var(--admin-accent)]/40"
                        placeholder="Recompra"
                      />
                    </div>

                    {/* Variant / Color */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Estilo de color</label>
                      <div className="flex gap-2">
                        {VARIANT_OPTIONS.map((v) => (
                          <button
                            key={v.value}
                            onClick={() => updateCard(card.id, { variant: v.value })}
                            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all border ${
                              card.variant === v.value
                                ? "ring-2 ring-offset-1 ring-offset-[var(--admin-card-bg)]"
                                : "opacity-50 hover:opacity-100"
                            }`}
                            style={{
                              background: `${v.color}15`,
                              color: v.color,
                              borderColor: `${v.color}30`,
                              ...(card.variant === v.value ? { ringColor: v.color } : {}),
                            }}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Título</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateCard(card.id, { title: e.target.value })}
                        className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] focus:outline-none focus:border-[var(--admin-accent)]/40"
                        placeholder="Compra de nuevo en 1 toque"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Descripción</label>
                      <input
                        type="text"
                        value={card.description}
                        onChange={(e) => updateCard(card.id, { description: e.target.value })}
                        className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] focus:outline-none focus:border-[var(--admin-accent)]/40"
                        placeholder="Entra a tu historial..."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* CTA Text */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">Texto del botón (CTA)</label>
                      <input
                        type="text"
                        value={card.ctaText}
                        onChange={(e) => updateCard(card.id, { ctaText: e.target.value })}
                        className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] focus:outline-none focus:border-[var(--admin-accent)]/40"
                        placeholder="Activar recompra"
                      />
                    </div>

                    {/* CTA Link */}
                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-lo)] mb-1">
                        Enlace del botón
                        <span className="text-[var(--admin-text-lo)]/60 font-normal ml-1">(ruta o URL completa)</span>
                      </label>
                      <input
                        type="text"
                        value={card.ctaLink}
                        onChange={(e) => updateCard(card.id, { ctaLink: e.target.value })}
                        className="w-full rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] px-4 py-2.5 text-sm text-[var(--admin-text-hi)] font-mono focus:outline-none focus:border-[var(--admin-accent)]/40"
                        placeholder="/historial  o  /catalogo?search=Centenario"
                      />
                      <p className="text-[10px] text-[var(--admin-text-lo)]/80 mt-1">
                        Tip: Usá <code className="text-[var(--admin-text-lo)] font-bold">/catalogo?search=NombreMarca</code> para filtrar por marca
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
                    <p className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase tracking-widest mb-3">Vista previa</p>
                    <div className="flex items-start gap-3 max-w-sm">
                      <span className="text-xl">{card.icon}</span>
                      <div className="flex-1">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest mb-1"
                          style={{ background: `${variantInfo?.color}20`, color: variantInfo?.color }}
                        >
                          {card.pill}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--admin-text-hi)]">{card.title}</h4>
                        <p className="text-xs text-[var(--admin-text-lo)] mt-1">{card.description}</p>
                        <span
                          className="inline-block mt-2 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border"
                          style={{ borderColor: `${variantInfo?.color}40`, color: variantInfo?.color }}
                        >
                          {card.ctaText}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-12 text-[var(--admin-text-lo)]">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No hay tarjetas configuradas. Agregá una para empezar.</p>
        </div>
      )}
    </div>
  );
}
