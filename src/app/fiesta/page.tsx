import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import FiestaClient from "./FiestaClient";

export const metadata: Metadata = {
  title: "Especial Fiesta | Distribuidora El Remate",
  description: "Organizá la mejor fiesta con nuestras ofertas exclusivas en bebidas, hamburguesas y más.",
};

export default function FiestaLanding() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#E53935] selection:text-white overflow-x-hidden font-body">
      {/* Navbar Minimalista */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 h-[70px] flex items-center justify-between">
          <Link href="/" className="font-bebas text-2xl tracking-[2px] text-white flex items-center gap-2">
            <span className="text-[#E53935]">EL</span> REMATE
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/catalogo"
              className="text-sm font-bold tracking-wider text-white/70 hover:text-white transition-colors"
            >
              IR AL CATÁLOGO
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-[120px] pb-[80px] lg:pt-[180px] lg:pb-[120px] px-5 flex flex-col items-center justify-center min-h-[90vh] overflow-hidden z-0">
        {/* Imagen Hero Fondo */}
        <div className="absolute inset-0 z-[-1]">
          <Image 
            src="/fiestahero.png" 
            alt="Armá tu fiesta" 
            fill 
            className="object-cover opacity-60" 
            priority
          />
          {/* Overlay gradient para asegurar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/60 to-[#0A0A0A]" />
        </div>

        {/* Elementos Decorativos */}
        <div className="absolute top-1/4 left-0 w-[50vw] h-[50vw] bg-[#E53935]/20 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none z-[-1]" />
        <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-[#FFB300]/10 rounded-full blur-[100px] translate-x-1/3 pointer-events-none z-[-1]" />
        
        <div className="relative max-w-[900px] w-full mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in-up">
            <span className="text-xl">🎉</span>
            <span className="text-xs font-bold tracking-[3px] uppercase text-[#FFB300]">
              Especial Eventos & Cumpleaños
            </span>
          </div>

          {/* Título 3D CSS Premium */}
          <div className="relative group mx-auto mb-8 w-full flex justify-center" style={{ perspective: '1200px' }}>
            <div className="transform transition-transform duration-700 ease-out group-hover:rotate-x-12 group-hover:rotate-y-[-5deg] group-hover:scale-105">
              <h1 className="font-bebas text-[clamp(4.5rem,14vw,10rem)] leading-[0.8] tracking-[4px] text-white text-center relative z-10">
                <span className="block text-3d-neon text-[#FF1744] drop-shadow-[0_0_20px_rgba(255,23,68,0.8)]">ARMÁ LA</span>
                <span className="block text-3d-neon text-[#FFEA00] drop-shadow-[0_0_30px_rgba(255,234,0,0.9)] ml-4">FIESTA</span>
              </h1>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
              .text-3d-neon {
                text-shadow: 
                  0 1px 0 #cccccc,
                  0 2px 0 #c9c9c9,
                  0 3px 0 #bbb,
                  0 4px 0 #b9b9b9,
                  0 5px 0 #aaa,
                  0 6px 1px rgba(0,0,0,.1),
                  0 0 5px rgba(0,0,0,.1),
                  0 1px 3px rgba(0,0,0,.3),
                  0 3px 5px rgba(0,0,0,.2),
                  0 5px 10px rgba(0,0,0,.25),
                  0 10px 10px rgba(0,0,0,.2),
                  0 20px 20px rgba(0,0,0,.15);
              }
            `}} />
          </div>

          <p className="text-[clamp(1.1rem,2vw,1.4rem)] text-white/70 mb-10 max-w-[600px] mx-auto font-light leading-relaxed">
            Combos explosivos, bebidas frías y las mejores hamburguesas. Todo lo que necesitas para tu evento a precio mayorista.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#combos"
              className="w-full sm:w-auto px-8 py-4 bg-[#E53935] hover:bg-[#D32F2F] text-white rounded-xl font-bebas text-xl tracking-[2px] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(229,57,53,0.4)] flex items-center justify-center gap-2"
            >
              VER COMBOS 🔥
            </Link>
            <Link
              href="/catalogo"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bebas text-xl tracking-[2px] transition-all flex items-center justify-center"
            >
              CATÁLOGO COMPLETO
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-[10px] tracking-[2px] uppercase font-bold">Scroll</span>
          <div className="w-[1px] h-[30px] bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* Marquee Cintas */}
      <div className="bg-[#E53935] py-3 overflow-hidden flex whitespace-nowrap rotate-[-1deg] scale-105 border-y border-white/20 relative z-20">
        <div className="animate-marquee flex gap-8 items-center text-white font-bebas text-2xl tracking-[2px]">
          <span>⚡ PRECIOS MAYORISTAS</span>
          <span>•</span>
          <span>🍔 COMBOS DE HAMBURGUESAS</span>
          <span>•</span>
          <span>🍺 BEBIDAS FRÍAS</span>
          <span>•</span>
          <span>⚡ PRECIOS MAYORISTAS</span>
          <span>•</span>
          <span>🍔 COMBOS DE HAMBURGUESAS</span>
          <span>•</span>
          <span>🍺 BEBIDAS FRÍAS</span>
          <span>•</span>
          <span>⚡ PRECIOS MAYORISTAS</span>
          <span>•</span>
          <span>🍔 COMBOS DE HAMBURGUESAS</span>
          <span>•</span>
          <span>🍺 BEBIDAS FRÍAS</span>
          <span>•</span>
        </div>
      </div>

      {/* Catálogo en vivo de Fiesta */}
      <div className="relative z-50 px-5">
        <FiestaClient />
      </div>

      {/* Beneficios */}
      <section className="py-[80px] px-5 bg-[#111] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 text-center border border-white/5 rounded-2xl bg-white/[0.02]">
            <div className="text-4xl mb-4">💰</div>
            <h4 className="font-bebas text-2xl tracking-[1px] mb-2">PRECIOS DE MAYORISTA</h4>
            <p className="text-white/60 text-sm">Comprá para tu evento con precios que rinden mucho más.</p>
          </div>
          <div className="p-6 text-center border border-white/5 rounded-2xl bg-white/[0.02]">
            <div className="text-4xl mb-4">🚚</div>
            <h4 className="font-bebas text-2xl tracking-[1px] mb-2">ENVÍO O RETIRO</h4>
            <p className="text-white/60 text-sm">Vos elegís: te lo llevamos o pasás a buscar todo junto.</p>
          </div>
          <div className="p-6 text-center border border-white/5 rounded-2xl bg-white/[0.02]">
            <div className="text-4xl mb-4">🧊</div>
            <h4 className="font-bebas text-2xl tracking-[1px] mb-2">TODO FRÍO</h4>
            <p className="text-white/60 text-sm">Avisanos con tiempo y te preparamos la bebida lista para tomar.</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-[120px] px-5 relative text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#E53935]/10 pointer-events-none" />
        <div className="relative z-10 max-w-[600px] mx-auto">
          <h2 className="font-bebas text-[clamp(3rem,5vw,4.5rem)] leading-none mb-6">
            ¿LISTO PARA <br />FESTEJAR?
          </h2>
          <p className="text-white/70 mb-10">
            Armá tu carrito con todo lo necesario y nosotros nos encargamos del resto.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex px-10 py-5 bg-white text-black rounded-xl font-bebas text-2xl tracking-[2px] transition-transform hover:scale-105 items-center gap-2"
          >
            INICIAR PEDIDO 🛒
          </Link>
        </div>
      </section>

      {/* Custom Styles for Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          width: max-content;
        }
      `}} />
    </div>
  );
}
