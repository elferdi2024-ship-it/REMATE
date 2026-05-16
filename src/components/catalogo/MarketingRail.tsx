"use client";

import Link from "next/link";

interface MarketingRailProps {
  cartQty?: number;
  isLoggedIn?: boolean;
}

export default function MarketingRail({ cartQty = 0, isLoggedIn = false }: MarketingRailProps) {
  const cartStateText =
    cartQty > 0
      ? `Ya tenes ${cartQty} producto${cartQty > 1 ? "s" : ""} en el carrito.`
      : "Empeza tu carrito y desbloquea recomendaciones de reposicion.";

  return (
    <section className="marketing-rail" aria-label="Promociones y beneficios">
      <div className="marketing-rail-top">
        <p className="marketing-kicker">MODO COMPRA INTELIGENTE</p>
        <h2 className="marketing-title">Recompra rapida, ofertas activas y mas conversion</h2>
      </div>

      <div className="marketing-grid">
        <article className="marketing-card marketing-card-hot">
          <span className="marketing-pill">Recompra</span>
          <h3>Compra de nuevo en 1 toque</h3>
          <p>{isLoggedIn ? "Entra a tu historial y repeti pedidos completos en segundos." : "Inicia sesion y guarda tus pedidos para repetirlos rapido."}</p>
          <Link href="/publicitate" className="marketing-cta">
            Activar recompra
          </Link>
        </article>

        <article className="marketing-card marketing-card-premium">
          <span className="marketing-pill">Canasta</span>
          <h3>Completa tu pedido</h3>
          <p>{cartStateText}</p>
          <Link href="/catalogo" className="marketing-cta">
            Ver sugerencias
          </Link>
        </article>

        <article className="marketing-card marketing-card-proof">
          <span className="marketing-pill">Flash Deal</span>
          <h3>Ofertas con tiempo limite</h3>
          <p>Promos activas con cuenta regresiva para acelerar decision de compra.</p>
          <Link href="/catalogo" className="marketing-cta">
            Ver ofertas de hoy
          </Link>
        </article>
      </div>
    </section>
  );
}
