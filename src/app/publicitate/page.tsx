import Link from "next/link";
import Image from "next/image";

export default function PublicitatePage() {
  return (
    <div className="min-h-screen bg-[#050914] text-white selection:bg-[#00E5FF]/30">
      {/* Navbar Simple */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#050914]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-bebas text-2xl tracking-widest text-white">
            EL REMATE <span className="text-[#00E5FF]">ADS</span>
          </Link>
          <a
            href="https://wa.me/598XXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#00E5FF] px-6 py-2 text-sm font-bold uppercase tracking-widest text-[#050914] transition-all hover:scale-105 hover:bg-white"
          >
            Contactar
          </a>
        </div>
      </nav>

      <main className="pb-32 pt-24">
        {/* Hero */}
        <section className="relative mx-auto max-w-7xl px-6 py-20 text-center md:py-32">
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-[400px] w-[400px] animate-pulse rounded-full bg-[#00E5FF]/20 blur-[120px]" />
          </div>
          <h1 className="mx-auto max-w-4xl font-bebas text-5xl leading-[0.9] tracking-wider md:text-7xl lg:text-8xl">
            CONECTÁ TU MARCA CON <span className="text-[#00E5FF]">MILES DE COMERCIOS</span> URUGUAYOS
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-gray-400 md:text-xl">
            Aumentá tus ventas B2B posicionando tus productos directamente en el momento de compra. Publicidad nativa, fluida y de alto rendimiento.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://wa.me/598XXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#00E5FF] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#050914] transition-all hover:scale-105 hover:bg-white"
            >
              Agendar Reunión
            </a>
            <a
              href="#beneficios"
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
            >
              Ver Beneficios
            </a>
          </div>
        </section>

        {/* Beneficios */}
        <section id="beneficios" className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="font-bebas text-4xl tracking-widest md:text-5xl">
              POR QUÉ ELEGIR <span className="text-[#00E5FF]">EL REMATE ADS</span>
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Visibilidad Premium",
                desc: "Destacá tus productos en las primeras posiciones del catálogo y categorías clave. Tus artículos siempre a la vista.",
                icon: "⭐"
              },
              {
                title: "Analytics Reales",
                desc: "Medimos impresiones, aperturas de galería y clics en 'Ver producto'. Datos reales para ROI real.",
                icon: "📊"
              },
              {
                title: "Interrupción Cero",
                desc: "Anuncios nativos que se integran en la cuadrícula de productos. Publicidad que no molesta, sino que aporta valor.",
                icon: "✨"
              }
            ].map((b, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-[#0A0F1C] p-8 transition-transform hover:-translate-y-2 hover:border-[#00E5FF]/30">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00E5FF]/10 text-3xl">
                  {b.icon}
                </div>
                <h3 className="mb-3 font-bebas text-2xl tracking-wide">{b.title}</h3>
                <p className="text-gray-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Formatos */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-[#0A0F1C] to-[#050914] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-[#00E5FF]/5 to-transparent blur-3xl"></div>
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div>
                <h2 className="font-bebas text-4xl tracking-widest md:text-6xl mb-6">
                  MÚLTIPLES <span className="text-[#00E5FF]">FORMATOS</span>
                </h2>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-lg text-white">Sponsored Product</h4>
                      <p className="text-gray-400 text-sm mt-1">Inyección directa de un producto destacado en la cuadrícula del catálogo, permitiendo agregarlo al carrito con 1 clic.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-lg text-white">Brand Spotlight</h4>
                      <p className="text-gray-400 text-sm mt-1">Imágenes inmersivas intercaladas en el catálogo que abren una galería interactiva en pantalla completa.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-lg text-white">Banners y Videos</h4>
                      <p className="text-gray-400 text-sm mt-1">Impacto visual a lo ancho de la pantalla con banners horizontales o videos autoplay entre categorías.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative aspect-[4/5] rounded-3xl border border-white/10 bg-black overflow-hidden flex items-center justify-center">
                <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">Preview de Formatos</p>
                {/* Mockup visual genérico */}
                <div className="absolute inset-x-8 top-12 bottom-12 rounded-xl border border-white/10 bg-[#0A0F1C] flex flex-col p-4 gap-4">
                  <div className="h-20 rounded-lg bg-white/5 w-full"></div>
                  <div className="flex gap-4 flex-1">
                    <div className="flex-1 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 relative overflow-hidden">
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-[6px] text-white uppercase tracking-wider font-bold">Publicidad</div>
                    </div>
                    <div className="flex-1 rounded-lg bg-white/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Planes */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="font-bebas text-4xl tracking-widest md:text-5xl">
              NUESTROS <span className="text-[#00E5FF]">PLANES</span>
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { tier: "Bronce", color: "text-[#CD7F32]", bg: "bg-[#CD7F32]/10", border: "border-[#CD7F32]/30", features: ["1 Banner horizontal", "Rotación estándar", "Reporte mensual"] },
              { tier: "Plata", color: "text-[#C0C0C0]", bg: "bg-[#C0C0C0]/10", border: "border-[#C0C0C0]/30", features: ["2 Brand Spotlights", "1 Sponsored Product", "Prioridad en categorías", "Reporte quincenal"] },
              { tier: "Oro", color: "text-[#FFD700]", bg: "bg-[#FFD700]/10", border: "border-[#FFD700]/30", features: ["Formatos ilimitados", "Videos Autoplay", "Máxima prioridad en grilla", "Dashboard en tiempo real", "Cap de Frecuencia dedicado"] }
            ].map((p, i) => (
              <div key={i} className={`rounded-3xl border ${p.border} ${p.bg} p-8 relative overflow-hidden`}>
                <h3 className={`font-bebas text-3xl tracking-widest ${p.color}`}>{p.tier}</h3>
                <ul className="mt-8 space-y-4">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className={p.color}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-12">
                  <a
                    href="https://wa.me/598XXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-xl bg-white/10 py-3 text-center text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/20"
                  >
                    Consultar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer CTA */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/598XXXXXXXX"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-3xl shadow-xl transition-transform hover:scale-110"
          aria-label="Contactar por WhatsApp"
        >
          💬
        </a>
      </div>
    </div>
  );
}
