import Link from "next/link";

const WA_LINK = "https://wa.me/59899322325?text=Hola%2C%20quiero%20info%20sobre%20El%20Remate%20Ads";

export default function PublicitatePage() {
  return (
    <div className="min-h-screen bg-[#050914] text-white selection:bg-[#00E5FF]/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#050914]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-bebas text-2xl tracking-widest text-white">
            EL REMATE <span className="text-[#00E5FF]">ADS</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="#planes" className="hidden sm:inline text-sm text-gray-400 hover:text-white transition-colors">
              Planes
            </a>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#00E5FF] px-6 py-2 text-sm font-bold uppercase tracking-widest text-[#050914] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
            >
              Contactar
            </a>
          </div>
        </div>
      </nav>

      <main className="pb-32 pt-16">
        {/* ═══════════════════════════════════════════════════════════════════
            HERO — Animated gradient mesh
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative mx-auto max-w-7xl px-6 py-28 text-center md:py-40">
          {/* Animated blobs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#00E5FF]/15 blur-[140px] animate-pulse" />
            <div className="absolute -left-20 top-20 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[100px] animate-[pulse_4s_ease-in-out_infinite]" />
            <div className="absolute -right-20 bottom-20 h-[250px] w-[250px] rounded-full bg-emerald-500/8 blur-[100px] animate-[pulse_6s_ease-in-out_infinite]" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-5 py-2 mb-8">
            <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF]">Plataforma B2B activa</span>
          </div>

          <h1 className="mx-auto max-w-5xl font-bebas text-5xl leading-[0.9] tracking-wider md:text-7xl lg:text-[5.5rem]">
            CONECTÁ TU MARCA CON{" "}
            <span className="relative inline-block text-[#00E5FF]">
              MILES DE COMERCIOS
              <span className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-[#00E5FF] to-transparent rounded-full" />
            </span>{" "}
            URUGUAYOS
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl">
            Publicidad nativa dentro del catálogo mayorista más usado de Canelones. 
            Tus productos <strong className="text-white">donde los comerciantes ya compran</strong>.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-full bg-[#00E5FF] px-10 py-4 text-sm font-bold uppercase tracking-widest text-[#050914] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,229,255,0.4)]"
            >
              <span className="relative z-10">📞 Agendar Reunión</span>
            </a>
            <a
              href="#beneficios"
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/30"
            >
              Ver Beneficios ↓
            </a>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            STATS BAR
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "500+", label: "Comercios activos" },
              { value: "2.4K", label: "Productos en catálogo" },
              { value: "15K+", label: "Visitas mensuales" },
              { value: "98%", label: "Tasa de retención" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center backdrop-blur-sm">
                <p className="font-bebas text-3xl tracking-wider text-[#00E5FF] md:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            BENEFICIOS — Cards with hover glow
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="beneficios" className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00E5FF] mb-4">Ventajas clave</p>
            <h2 className="font-bebas text-4xl tracking-widest md:text-5xl">
              POR QUÉ ELEGIR <span className="text-[#00E5FF]">EL REMATE ADS</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Visibilidad Premium",
                desc: "Destacá tus productos en las primeras posiciones del catálogo y categorías clave. Tus artículos siempre a la vista del comerciante.",
                icon: "⭐",
                gradient: "from-amber-500/10 to-transparent",
              },
              {
                title: "Analytics en Tiempo Real",
                desc: "Impresiones, clics, apertura de galerías y conversiones. Datos reales para medir tu retorno de inversión con precisión.",
                icon: "📊",
                gradient: "from-blue-500/10 to-transparent",
              },
              {
                title: "Publicidad Nativa",
                desc: "Anuncios integrados en la cuadrícula de productos. No interrumpen la experiencia, aportan valor y generan confianza.",
                icon: "✨",
                gradient: "from-emerald-500/10 to-transparent",
              },
            ].map((b, i) => (
              <div
                key={i}
                className="group relative rounded-3xl border border-white/10 bg-[#0A0F1C] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#00E5FF]/30 hover:shadow-[0_0_60px_rgba(0,229,255,0.08)]"
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${b.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00E5FF]/10 text-3xl transition-transform group-hover:scale-110">
                    {b.icon}
                  </div>
                  <h3 className="mb-3 font-bebas text-2xl tracking-wide">{b.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FORMATOS — Visual showcase
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-[#0A0F1C] to-[#050914] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-[#00E5FF]/5 to-transparent blur-3xl" />
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00E5FF] mb-4">Cómo funciona</p>
                <h2 className="font-bebas text-4xl tracking-widest md:text-6xl mb-8">
                  MÚLTIPLES <span className="text-[#00E5FF]">FORMATOS</span>
                </h2>
                <ul className="space-y-8">
                  {[
                    {
                      num: "1",
                      title: "Sponsored Product",
                      desc: "Tu producto destacado aparece directamente en la cuadrícula del catálogo con badge de marca y botón de carrito.",
                    },
                    {
                      num: "2",
                      title: "Brand Spotlight",
                      desc: "Imagen inmersiva intercalada en el catálogo que abre una galería de tu marca en pantalla completa.",
                    },
                    {
                      num: "3",
                      title: "Banners y Videos",
                      desc: "Impacto visual a lo ancho de pantalla con banners hero o videos autoplay entre categorías.",
                    },
                  ].map((item) => (
                    <li key={item.num} className="flex gap-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] font-bold text-lg">
                        {item.num}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">{item.title}</h4>
                        <p className="text-gray-400 text-sm mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mockup */}
              <div className="relative aspect-[4/5] rounded-3xl border border-white/10 bg-black/50 overflow-hidden">
                <div className="absolute inset-x-6 top-8 bottom-8 rounded-xl border border-white/10 bg-[#0A0F1C] flex flex-col p-4 gap-3">
                  {/* Fake header */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#00E5FF]/20" />
                    <div className="flex-1 h-4 rounded bg-white/10" />
                  </div>
                  {/* Fake grid */}
                  <div className="flex gap-3 flex-1">
                    <div className="flex-1 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 relative">
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#00E5FF]/90 rounded text-[7px] text-[#050914] uppercase tracking-wider font-bold">
                        Tu Marca
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 h-6 rounded bg-[#00E5FF]/30" />
                    </div>
                    <div className="flex-1 rounded-lg bg-white/5" />
                  </div>
                  <div className="flex gap-3 flex-1">
                    <div className="flex-1 rounded-lg bg-white/5" />
                    <div className="flex-1 rounded-lg bg-white/5" />
                  </div>
                  {/* Fake banner */}
                  <div className="h-16 rounded-lg bg-gradient-to-r from-[#00E5FF]/10 to-purple-500/10 border border-white/5 flex items-center justify-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Brand Spotlight</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SOCIAL PROOF — Testimonios
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00E5FF] mb-4">Resultados reales</p>
            <h2 className="font-bebas text-4xl tracking-widest md:text-5xl">
              MARCAS QUE <span className="text-[#00E5FF]">CONFÍAN</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                quote: "Desde que activamos la campaña en El Remate, el volumen de pedidos mayoristas subió un 40% en el primer mes.",
                author: "Gerente Comercial",
                brand: "Marca de Limpieza",
              },
              {
                quote: "Los datos de impresiones y clics nos permiten optimizar el mix de productos en tiempo real. Publicidad que se paga sola.",
                author: "Director de Marketing",
                brand: "Bebidas Regional",
              },
            ].map((t, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-[#0A0F1C] p-8 relative">
                <span className="absolute top-4 right-6 text-6xl text-[#00E5FF]/10 font-serif">&ldquo;</span>
                <p className="text-gray-300 leading-relaxed text-lg italic relative z-10">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00E5FF]/30 to-purple-500/30 flex items-center justify-center text-sm font-bold">
                    {t.brand.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.brand}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            PLANES — Pricing tiers
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="planes" className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00E5FF] mb-4">Inversión inteligente</p>
            <h2 className="font-bebas text-4xl tracking-widest md:text-5xl">
              NUESTROS <span className="text-[#00E5FF]">PLANES</span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-lg mx-auto">Elegí el nivel de exposición que mejor se adapte a tu marca. Todos incluyen soporte personalizado.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                tier: "Bronce",
                color: "text-[#CD7F32]",
                bg: "bg-[#CD7F32]/10",
                border: "border-[#CD7F32]/20",
                hoverBorder: "hover:border-[#CD7F32]/50",
                shadow: "hover:shadow-[0_0_40px_rgba(205,127,50,0.1)]",
                features: ["1 Banner horizontal", "Rotación estándar", "Reporte mensual"],
                popular: false,
              },
              {
                tier: "Plata",
                color: "text-[#C0C0C0]",
                bg: "bg-[#C0C0C0]/10",
                border: "border-[#C0C0C0]/20",
                hoverBorder: "hover:border-[#C0C0C0]/50",
                shadow: "hover:shadow-[0_0_40px_rgba(192,192,192,0.1)]",
                features: ["2 Brand Spotlights", "1 Sponsored Product", "Prioridad en categorías", "Reporte quincenal"],
                popular: true,
              },
              {
                tier: "Oro",
                color: "text-[#FFD700]",
                bg: "bg-[#FFD700]/10",
                border: "border-[#FFD700]/20",
                hoverBorder: "hover:border-[#FFD700]/50",
                shadow: "hover:shadow-[0_0_40px_rgba(255,215,0,0.1)]",
                features: [
                  "Formatos ilimitados",
                  "Videos Autoplay",
                  "Máxima prioridad en grilla",
                  "Dashboard en tiempo real",
                  "Cap de Frecuencia dedicado",
                ],
                popular: false,
              },
            ].map((p, i) => (
              <div
                key={i}
                className={`rounded-3xl border ${p.border} ${p.bg} p-8 relative overflow-hidden transition-all duration-300 ${p.hoverBorder} ${p.shadow} ${
                  p.popular ? "md:scale-105 ring-1 ring-[#C0C0C0]/30" : ""
                }`}
              >
                {p.popular && (
                  <div className="absolute top-0 right-0 bg-[#C0C0C0] text-[#050914] text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
                    Popular
                  </div>
                )}
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
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full rounded-xl py-3.5 text-center text-sm font-bold uppercase tracking-widest transition-all ${
                      p.popular
                        ? "bg-[#C0C0C0] text-[#050914] hover:bg-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    Consultar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="rounded-[40px] border border-[#00E5FF]/20 bg-gradient-to-b from-[#00E5FF]/5 to-transparent p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.08),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="font-bebas text-4xl tracking-widest md:text-6xl mb-6">
                ¿LISTO PARA <span className="text-[#00E5FF]">IMPULSAR</span> TU MARCA?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-10 text-lg">
                Agendá una reunión de 15 minutos y te mostramos cómo tu marca puede aparecer ante cientos de comercios desde el primer día.
              </p>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-[#00E5FF] px-10 py-5 text-sm font-bold uppercase tracking-widest text-[#050914] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(0,229,255,0.4)]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.12 1.523 5.855L.058 23.406l5.677-1.49A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.795 9.795 0 01-5.003-1.37l-.358-.213-3.718.975.992-3.625-.235-.374A9.803 9.803 0 012.18 12c0-5.414 4.406-9.82 9.82-9.82 5.414 0 9.82 4.406 9.82 9.82 0 5.414-4.406 9.82-9.82 9.82z"/></svg>
                Hablar con un asesor
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-transform hover:scale-110"
          aria-label="Contactar por WhatsApp"
        >
          <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.12 1.523 5.855L.058 23.406l5.677-1.49A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.795 9.795 0 01-5.003-1.37l-.358-.213-3.718.975.992-3.625-.235-.374A9.803 9.803 0 012.18 12c0-5.414 4.406-9.82 9.82-9.82 5.414 0 9.82 4.406 9.82 9.82 0 5.414-4.406 9.82-9.82 9.82z"/></svg>
        </a>
      </div>

      {/* Footer mini */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} El Remate Canelones — Distribuidora Mayorista</p>
          <Link href="/" className="text-xs text-gray-600 hover:text-white transition-colors">
            ← Volver al sitio
          </Link>
        </div>
      </footer>
    </div>
  );
}
