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
  { value: "4", label: "categorías para resolver todo" },
  { value: "24h", label: "ideal para planificar con tiempo" },
  { value: "$", label: "precios mayoristas" },
];

const benefits = [
  {
    title: "Selección corta",
    text: "Solo categorías útiles para armar una compra de fiesta sin entrar al catálogo completo.",
  },
  {
    title: "Ritmo mobile",
    text: "Pocas decisiones por pantalla, búsqueda arriba y acciones claras para sumar productos.",
  },
  {
    title: "Pedido claro",
    text: "Ves lo elegido, abrís el pedido y cerrás la compra cuando está todo listo.",
  },
];

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z"
        fill="currentColor"
      />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" fill="currentColor" />
    </svg>
  );
}

export default function FiestaLanding() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0b0908] text-white selection:bg-[#d7a84f] selection:text-[#140f08] [color-scheme:dark] [touch-action:manipulation]">
      <Link
        href="#combos"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-black focus:text-[#12080c]"
      >
        Saltar a productos
      </Link>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-white/10 bg-[#11100f]/82 px-4 shadow-[0_18px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl md:px-5">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-body text-[0.82rem] font-black uppercase tracking-[0.36em] text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#d7a84f]"
            aria-label="Volver al inicio de El Remate"
          >
            <span className="text-[#d7a84f]">EL</span>
            <span>REMATE</span>
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f3ead9] px-4 text-sm font-black tracking-[-0.01em] text-[#17110b] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a84f] md:px-5"
          >
            Catálogo
          </Link>
        </div>
      </header>

      <section className="relative isolate flex min-h-[62svh] items-end px-4 pb-8 pt-24 md:min-h-[86svh] md:items-center md:px-6 md:pb-16 md:pt-32">
        <div className="absolute inset-0 -z-20">
          <Image
            src="/fiestahero.png"
            alt="Mesa de fiesta con bebidas y comida"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50 saturate-[0.82]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,9,8,0.24)_0%,rgba(11,9,8,0.78)_58%,#0b0908_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,9,8,0.90)_0%,rgba(11,9,8,0.55)_46%,rgba(11,9,8,0.86)_100%)]" />
        </div>

        <div className="absolute left-[-20%] top-[18%] -z-10 h-72 w-72 rounded-full bg-[#8f2f22]/18 blur-3xl md:h-[28rem] md:w-[28rem]" />
        <div className="absolute bottom-[12%] right-[-18%] -z-10 h-72 w-72 rounded-full bg-[#d7a84f]/10 blur-3xl md:h-[30rem] md:w-[30rem]" />

        <div className="mx-auto grid w-full max-w-6xl items-end gap-5 md:grid-cols-[0.98fr_1.02fr] md:items-center md:gap-10">
          <div className="flex flex-col items-center text-center md:items-start md:text-left max-w-2xl mx-auto w-full">
            <div className="mb-3 inline-flex min-h-8 items-center rounded-full border border-white/12 bg-white/[0.055] px-3.5 font-body text-[0.62rem] font-black uppercase tracking-[0.28em] text-[#d7a84f] backdrop-blur-md md:mb-5 md:min-h-10 md:px-4 md:text-[0.68rem]">
              Fiesta mayorista
            </div>

            <h1 className="sr-only">Armá la fiesta sin fundirte</h1>

            <div className="relative w-full max-w-[680px] overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#120f0d]/58 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.38)] backdrop-blur-sm md:rounded-[2.4rem] md:p-3">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(215,168,79,0.12),transparent_42%)]" />
              <Image
                src="/fiesta_title.png"
                alt=""
                width={1024}
                height={1024}
                priority
                sizes="(max-width: 768px) 95vw, 720px"
                className="relative z-10 -my-6 w-full scale-[1.08] object-contain drop-shadow-[0_16px_34px_rgba(0,0,0,0.55)] md:-my-16 md:scale-[1.12]"
                style={{ width: "100%", maxWidth: "100%", height: "auto", display: "block" }}
              />
            </div>

            <p className="mt-4 max-w-xl text-balance font-serif text-[1.1rem] leading-7 text-white/86 md:mt-6 md:text-[1.58rem] md:leading-10">
              Una selección corta para resolver bebidas, picada, parrilla y extras sin recorrer todo el catálogo.
            </p>

            <div className="mt-5 flex w-full max-w-md gap-3 md:mt-7 md:max-w-none">
              <Link
                href="#combos"
                className="inline-flex min-h-12 flex-1 items-center justify-center whitespace-nowrap rounded-2xl bg-[#f3ead9] px-4 font-body text-sm font-black uppercase tracking-[0.16em] text-[#17110b] shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a84f] md:min-h-14 md:px-7"
              >
                Productos
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex min-h-12 flex-1 items-center justify-center whitespace-nowrap rounded-2xl border border-white/12 bg-white/[0.055] px-4 font-body text-sm font-black uppercase tracking-[0.16em] text-white/86 backdrop-blur-md transition-colors hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a84f] md:min-h-14 md:px-7"
              >
                Catálogo
              </Link>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto rounded-[1rem] border border-white/10 bg-black/30 p-1.5 shadow-[0_14px_44px_rgba(0,0,0,0.28)] backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:rounded-[2rem] md:p-3 md:shadow-[0_25px_90px_rgba(0,0,0,0.38)]">
            {highlights.map((item) => (
              <div key={item.label} className="shrink-0 flex-1 min-w-[6.5rem] snap-start rounded-[0.8rem] bg-white/[0.08] p-2.5 text-center md:min-w-0 md:rounded-[1.4rem] md:p-5">
                <div className="font-bebas text-2xl leading-none text-[#ffcf33] md:text-5xl">{item.value}</div>
                <div className="mt-1 text-[0.54rem] font-bold uppercase leading-3 tracking-wide text-white/70 md:mt-2 md:text-xs md:leading-4">
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

      <section className="py-10 md:py-18">
        <div className="mx-auto max-w-6xl flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:px-6 md:pb-0">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="shrink-0 w-[78vw] max-w-[300px] snap-start rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur md:w-auto md:max-w-none md:p-5"
            >
              <h2 className="font-serif text-[1.3rem] leading-7 text-white md:text-[1.45rem]">{benefit.title}</h2>
              <p className="mt-1.5 text-[0.88rem] font-medium leading-6 text-white/60 md:mt-2 md:text-[0.92rem]">{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 text-center md:px-6 md:pb-28">
        <div className="mx-auto max-w-3xl rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 md:rounded-[2rem] md:p-10">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.28em] text-[#d7a84f] md:text-xs">Cierre de pedido</p>
          <h2 className="mt-2 font-serif text-[1.75rem] leading-tight text-white md:mt-3 md:text-5xl">Todo listo, sin sobrecargar.</h2>
          <p className="mx-auto mt-3 max-w-xl text-[0.95rem] font-medium leading-7 text-white/72 md:mt-4 md:text-[1.05rem] md:leading-8">
            Sumá lo necesario y seguí el cierre del pedido con una lista clara.
          </p>
          <Link
            href="#combos"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#f3ead9] px-6 font-body text-sm font-black uppercase tracking-[0.16em] text-[#17110b] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a84f] md:mt-7 md:min-h-14 md:px-8"
          >
            Empezar pedido
          </Link>
        </div>
      </section>

    </main>
  );
}
