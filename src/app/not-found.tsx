// filepath: src/app/not-found.tsx
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1A1410] px-5 text-center text-white">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8302A]/[0.08] blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Mascot */}
        <Image
          src="/martillo_boca_abierta.png"
          alt="Marti sorprendido"
          width={140}
          height={140}
          className="mx-auto mb-6 drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)] animate-bounce"
          style={{ animationDuration: "3s" }}
        />

        {/* 404 number */}
        <h1 className="font-bebas text-[clamp(5rem,15vw,9rem)] leading-none tracking-[4px] text-[#E8302A] drop-shadow-[0_0_40px_rgba(232,48,42,0.3)]">
          404
        </h1>

        {/* Message */}
        <p className="mt-2 font-serif text-[clamp(1.2rem,3vw,1.6rem)] italic text-[#C8C3BC]">
          ¡Uy! Esta página no existe
        </p>
        <p className="mt-2 text-sm font-medium text-[#888078]">
          Parece que Marti se comió esta página
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E8302A] px-7 py-3.5 font-bebas text-[1.15rem] tracking-[2px] text-white no-underline shadow-[0_4px_18px_rgba(232,48,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#C4231E] hover:shadow-[0_6px_24px_rgba(232,48,42,0.5)]"
          >
            🏠 IR AL INICIO
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-bebas text-[1.15rem] tracking-[2px] text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
          >
            🛒 VER CATÁLOGO
          </Link>
        </div>
      </div>
    </div>
  );
}
