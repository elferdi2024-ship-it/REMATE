import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import FiestaClient from "./FiestaClient";

export const metadata: Metadata = {
  title: "Especial Fiesta | Distribuidora El Remate",
  description:
    "Armá tu fiesta con bebidas, parrilla, picada y descartables a precio mayorista.",
};

const highlights = [
  { value: "4", label: "Categorías" },
  { value: "24h", label: "Planificá" },
  { value: "$", label: "Mayorista" },
];


export default function FiestaLanding() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white selection:bg-[#E8302A] selection:text-white [color-scheme:dark] [touch-action:manipulation]">
      <Link
        href="#combos"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-black focus:text-[#12080c]"
      >
        Saltar a productos
      </Link>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/10 bg-black/70 px-4 shadow-[0_18px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl md:h-16 md:px-5">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-bebas text-[1.1rem] tracking-[0.12em] text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#E8302A]"
            aria-label="Volver al inicio de El Remate"
          >
            <span className="text-[#E8302A]">EL</span>
            <span>REMATE</span>
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#E8302A] px-5 text-[0.8rem] font-black tracking-wide text-white shadow-[0_8px_24px_rgba(232,48,42,0.35)] transition-all active:scale-95 hover:bg-[#C4231E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:min-h-11 md:px-6 md:text-sm"
          >
            Catálogo
          </Link>
        </div>
      </header>

      <section className="relative isolate flex min-h-[100svh] flex-col items-center justify-center px-5 pb-10 pt-24 text-center md:min-h-[90svh] md:px-6 md:pb-16 md:pt-32">
        <div className="absolute inset-0 -z-20">
          <Image
            src="/fiestahero.png"
            alt="Mesa de fiesta con bebidas y comida"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60 saturate-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-[#0a0a0a]/70 to-[#0a0a0a]" />
        </div>

        <div className="absolute left-[-15%] top-[10%] -z-10 h-60 w-60 rounded-full bg-[#E8302A]/20 blur-[100px] md:h-[24rem] md:w-[24rem]" />
        <div className="absolute bottom-[15%] right-[-10%] -z-10 h-60 w-60 rounded-full bg-[#FFB300]/15 blur-[100px] md:h-[20rem] md:w-[20rem]" />

        <div className="mx-auto flex w-full max-w-lg flex-col items-center md:max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#E8302A]/30 bg-[#E8302A]/10 px-4 py-1.5 font-body text-[0.65rem] font-black uppercase tracking-[0.3em] text-[#E8302A] backdrop-blur-md md:mb-6 md:px-5 md:py-2 md:text-xs">
            <span className="animate-pulse">🔥</span> Fiesta mayorista
          </div>

          <h1 className="font-bebas text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.85] tracking-[2px] uppercase select-none">
            <span className="block text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
              Armá la fiesta
            </span>
            <span className="block bg-gradient-to-r from-[#FFB300] via-[#E8302A] to-[#FF3366] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(232,48,42,0.45)]">
              sin fundirte
            </span>
          </h1>

          <p className="mt-5 max-w-md text-balance font-serif text-[1.05rem] leading-7 text-white/80 md:mt-7 md:max-w-xl md:text-[1.4rem] md:leading-9">
            Bebidas, picada, parrilla y extras a precio mayorista. Sin recorrer todo el catálogo.
          </p>

          <div className="mt-6 flex w-full max-w-sm gap-3 md:mt-8 md:max-w-md">
            <Link
              href="#combos"
              className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#E8302A] px-5 font-bebas text-[1.15rem] tracking-[0.1em] text-white shadow-[0_12px_36px_rgba(232,48,42,0.4)] transition-all active:scale-95 hover:bg-[#C4231E] hover:shadow-[0_16px_44px_rgba(232,48,42,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:min-h-14 md:px-8 md:text-[1.3rem]"
            >
              VER PRODUCTOS
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex min-h-13 flex-1 items-center justify-center whitespace-nowrap rounded-2xl border border-white/15 bg-white/5 px-5 font-bebas text-[1.15rem] tracking-[0.1em] text-white backdrop-blur-md transition-all hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:min-h-14 md:px-8 md:text-[1.3rem]"
            >
              CATÁLOGO
            </Link>
          </div>

          <div className="mt-7 grid w-full max-w-sm grid-cols-3 gap-2 md:mt-10 md:max-w-lg md:gap-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm md:rounded-[1.4rem] md:p-5">
                <div className="font-bebas text-[1.6rem] leading-none text-[#E8302A] md:text-4xl">{item.value}</div>
                <div className="mt-1.5 text-[0.7rem] font-bold uppercase leading-tight tracking-wide text-white/50 md:mt-2 md:text-xs">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="combos" className="relative scroll-mt-24 px-0 md:px-6">
        <FiestaClient />
      </section>


      <section className="px-4 pb-20 text-center md:px-6 md:pb-28">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 md:rounded-[2rem] md:p-10">
          <div className="absolute inset-0 rounded-[inherit] bg-[conic-gradient(from_0deg,transparent,rgba(232,48,42,0.08)_90deg,transparent_180deg,rgba(232,48,42,0.05)_270deg,transparent)] animate-[spin_12s_linear_infinite]" />
          <div className="relative">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.28em] text-[#E8302A] md:text-xs">Cierre de pedido</p>
            <p className="mt-1 font-body text-sm font-medium text-white/50">¿Ya tenés todo?</p>
            <h2 className="mt-2 font-serif text-[1.75rem] leading-tight text-white md:mt-3 md:text-5xl">Cerrá tu pedido</h2>
            <p className="mx-auto mt-3 max-w-xl text-[0.95rem] font-medium leading-7 text-white/72 md:mt-4 md:text-[1.05rem] md:leading-8">
              Sumá lo necesario y cerrá la compra con una lista clara por WhatsApp.
            </p>
            <div className="mt-5 flex flex-col items-center gap-3 md:mt-7 md:flex-row md:justify-center">
              <Link
                href="#combos"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-2xl bg-[#E8302A] px-6 font-bebas text-[1.1rem] tracking-[0.1em] text-white shadow-[0_12px_36px_rgba(232,48,42,0.4)] transition-all active:scale-95 hover:bg-[#C4231E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:min-h-14 md:px-8"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                Armar pedido
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 font-bebas text-[1.1rem] tracking-[0.1em] text-white backdrop-blur-md transition-all hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 md:min-h-14 md:px-8"
              >
                Ver catálogo completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0a0a0a] px-4 pb-24 pt-10 text-center md:pb-12">
        <div className="mx-auto max-w-3xl">
          <Image src="/logo.png" alt="Distribuidora El Remate" width={50} height={50} className="mx-auto mb-4 opacity-50" />
          <p className="text-[0.7rem] font-medium text-white/30">
            © {new Date().getFullYear()} Distribuidora El Remate. Todos los derechos reservados.
          </p>
          <p className="mt-1 text-[0.6rem] text-white/15">Powered by Dafna y Mateo Asencio</p>
        </div>
      </footer>
    </main>
  );
}
