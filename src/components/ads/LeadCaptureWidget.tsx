// filepath: src/components/ads/LeadCaptureWidget.tsx
"use client";

import React, { useState } from "react";

export default function LeadCaptureWidget() {
  const [telefono, setTelefono] = useState("");
  const [tipoCliente, setTipoCliente] = useState("comercio");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefono) return;

    const mensaje = encodeURIComponent(
      `Hola Distribuidora El Remate! Soy ${tipoCliente === "comercio" ? "Comerciante" : "Particular"} y quiero recibir las ofertas semanales por WhatsApp. Mi número: ${telefono}`
    );
    window.open(`https://wa.me/59899322325?text=${mensaje}`, "_blank");
    setSubmitted(true);
  };

  return (
    <section className="py-10 px-5 max-w-[1200px] mx-auto">
      <div className="bg-gradient-to-br from-[#1C1714] to-[#2D231C] rounded-[24px] p-6 md:p-10 border border-[#D62828]/30 shadow-[0_10px_30px_rgba(0,0,0,0.3)] text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Adorno visual sutil */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#D62828] blur-[120px] rounded-full opacity-20 pointer-events-none" />

        <div className="max-w-[550px] relative z-10">
          <span className="inline-block px-3 py-1 bg-[#D62828]/20 border border-[#D62828]/50 text-[#FF4D47] text-[10px] md:text-xs font-bold uppercase tracking-[2px] rounded-full mb-3">
            📲 DIRECTO EN TU WHATSAPP
          </span>
          <h3 className="font-bebas text-[clamp(1.8rem,4vw,2.8rem)] leading-none tracking-[1.5px] mb-3">
            RECIBÍ LAS OFERTAS MAYORISTAS CADA LUNES
          </h3>
          <p className="text-white/70 text-xs md:text-sm font-light leading-relaxed">
            Sin spam ni falsas promos. Te enviamos la lista actualizada con los mejores precios por bulto y ofertas relámpago de la semana.
          </p>
        </div>

        <div className="w-full md:w-auto relative z-10 min-w-[300px]">
          {submitted ? (
            <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl text-center">
              <span className="text-2xl mb-1 block">✅</span>
              <p className="font-bold text-sm text-emerald-300">¡Listo! Te redirigimos a WhatsApp</p>
              <p className="text-xs text-white/60 mt-1">Guardá nuestro contacto para recibir la lista.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex bg-white/10 rounded-xl p-1 border border-white/15">
                <button
                  type="button"
                  onClick={() => setTipoCliente("comercio")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tipoCliente === "comercio"
                      ? "bg-[#D62828] text-white shadow-xs"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  🏬 Soy Comercio
                </button>
                <button
                  type="button"
                  onClick={() => setTipoCliente("particular")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tipoCliente === "particular"
                      ? "bg-[#D62828] text-white shadow-xs"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  🏠 Para mi Casa
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  placeholder="Tu WhatsApp (ej: 099 123 456)"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D62828] flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#D62828] hover:bg-[#B52020] text-white font-bebas text-lg tracking-wider px-6 py-3 rounded-xl transition-all active:scale-95 shrink-0"
                >
                  SUSCRIBIRME →
                </button>
              </div>
              <span className="text-[10px] text-white/40 text-center">
                🔒 Tus datos están seguros. Podés darte de baja respondiendo SALIR.
              </span>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
