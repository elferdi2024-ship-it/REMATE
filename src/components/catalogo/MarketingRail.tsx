"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface MarketingCardData {
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

interface MarketingRailConfig {
  cards: MarketingCardData[];
  sectionTitle: string;
  sectionKicker: string;
}

const FALLBACK_CARDS: MarketingCardData[] = [
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

interface MarketingRailProps {
  cartQty?: number;
  isLoggedIn?: boolean;
}

export default function MarketingRail({ cartQty = 0, isLoggedIn = false }: MarketingRailProps) {
  const [config, setConfig] = useState<MarketingRailConfig>({
    cards: FALLBACK_CARDS,
    sectionTitle: "Recompra rapida, ofertas activas y mas conversion",
    sectionKicker: "MODO COMPRA INTELIGENTE",
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, "configuracion", "marketing_rail"));
        if (snap.exists()) {
          const data = snap.data() as MarketingRailConfig;
          if (data.cards && data.cards.length > 0) {
            setConfig({
              cards: data.cards,
              sectionTitle: data.sectionTitle || config.sectionTitle,
              sectionKicker: data.sectionKicker || config.sectionKicker,
            });
          }
        }
      } catch (e) {
        // Silently fall back to defaults
        console.warn("MarketingRail: Could not load config from Firestore, using defaults");
      }
    }
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCards = config.cards.filter((c) => c.active);

  if (activeCards.length === 0) return null;

  return (
    <section className="marketing-rail" aria-label="Promociones y beneficios">
      <div className="marketing-rail-top">
        <p className="marketing-kicker">{config.sectionKicker}</p>
        <h2 className="marketing-title">{config.sectionTitle}</h2>
      </div>

      <div className="marketing-grid">
        {activeCards.map((card) => (
          <article key={card.id} className={`marketing-card marketing-card-${card.variant}`}>
            <span className="marketing-pill">{card.pill}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            {card.ctaLink.startsWith("http") ? (
              <a href={card.ctaLink} target="_blank" rel="noopener noreferrer" className="marketing-cta">
                {card.ctaText}
              </a>
            ) : (
              <Link href={card.ctaLink} className="marketing-cta">
                {card.ctaText}
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
