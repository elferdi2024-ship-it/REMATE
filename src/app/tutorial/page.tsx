// filepath: src/app/tutorial/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Step {
  id: number;
  title: string;
  shortDesc: string;
  description: string;
  speechText: string;
  duration: number; // fallback duration in seconds if TTS is muted or fails
  pointer?: { top: string; left: string; label: string };
}

const TUTORIAL_STEPS: Step[] = [
  {
    id: 1,
    title: "1. Seleccionar Sucursal",
    shortDesc: "Elegir zona de compra",
    description: "Ingresa a la web y selecciona tu sucursal más cercana (por ejemplo, Canelones) para cargar los productos y el stock de tu zona.",
    speechText: "¡Hola! Soy Marti, tu asistente de El Remate. Te enseñaré cómo hacer tus compras mayoristas. Primero, ingresa a la web y selecciona tu sucursal. En este caso, elegiremos Canelones.",
    duration: 8,
    pointer: { top: "54%", left: "50%", label: "Toca Canelones" },
  },
  {
    id: 2,
    title: "2. Explorar Catálogo",
    shortDesc: "Buscar productos rápidamente",
    description: "Desliza las categorías superiores o usa la barra de búsqueda para ubicar los artículos que necesitas para tu comercio.",
    speechText: "Una vez dentro, puedes buscar tus productos usando la barra superior o filtrando por categorías. Tenemos miles de artículos con precios mayoristas insuperables.",
    duration: 8,
    pointer: { top: "34%", left: "30%", label: "Yerba Mate Premium" },
  },
  {
    id: 3,
    title: "3. Comprar por Bultos",
    shortDesc: "Agregar packs cerrados",
    description: "Toca cualquier producto para abrir la ficha rápida y elige bultos de 6, 12, 24 o 48 unidades con un solo toque.",
    speechText: "Para agregar un producto al carrito, haz clic en su tarjeta. Se abrirá la ficha donde puedes elegir directamente bultos cerrados de seis, doce, veinticuatro o cuarenta y ocho unidades. ¡Es super rápido!",
    duration: 10,
    pointer: { top: "72%", left: "50%", label: "Elegir Pack de 12 u." },
  },
  {
    id: 4,
    title: "4. Revisar Carrito",
    shortDesc: "Verificar cantidades y montos",
    description: "Toca el botón flotante del carrito en la parte inferior para revisar los detalles, cantidades y el costo total de tu orden.",
    speechText: "Cuando termines de agregar tus productos, haz clic en el botón de Pedido en la parte inferior para abrir tu carrito de compras y revisar el detalle.",
    duration: 8,
    pointer: { top: "91%", left: "50%", label: "Toca ver Pedido" },
  },
  {
    id: 5,
    title: "5. Datos del Local",
    shortDesc: "Completar información de envío",
    description: "Escribe el nombre de tu negocio, tu teléfono y dirección. Si el pedido supera los $3.000, ¡el envío es gratis!",
    speechText: "Aquí completas el nombre de tu negocio, tu teléfono y la dirección de entrega. Recuerda que si superas los tres mil pesos, ¡el envío a tu local es totalmente gratis!",
    duration: 10,
    pointer: { top: "86%", left: "50%", label: "Toca Enviar Pedido" },
  },
  {
    id: 6,
    title: "6. Enviar por WhatsApp",
    shortDesc: "Despachar pedido al instante",
    description: "Presiona 'Enviar Pedido' para generar tu comprobante digital y abrir tu WhatsApp con el mensaje estructurado listo.",
    speechText: "Por último, haz clic en el botón Enviar Pedido. La aplicación descargará una imagen de tu comprobante y abrirá tu WhatsApp con el mensaje listo para enviar. ¡Eso es todo!",
    duration: 10,
    pointer: { top: "84%", left: "50%", label: "Finalizar en WhatsApp" },
  },
];

export default function TutorialPage() {
  const router = useRouter();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [supportedTTS, setSupportedTTS] = useState(true);

  // Responsive scaling states for the mobile phone simulator
  const [scale, setScale] = useState(1);
  const phoneWrapperRef = useRef<HTMLDivElement>(null);

  // Synchronization references
  const currentStepIdxRef = useRef(currentStepIdx);
  const isSpeakingRef = useRef(isSpeaking);
  const isMutedRef = useRef(isMuted);
  const isPlayingRef = useRef(isPlaying);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync state to refs
  useEffect(() => {
    currentStepIdxRef.current = currentStepIdx;
  }, [currentStepIdx]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Check Speech Synthesis support
  useEffect(() => {
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setSupportedTTS(false);
    }
  }, []);

  // Sync mascot mouth animation when speaking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking && !isMuted) {
      interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 160);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, isMuted]);

  // Responsive scaling calculator for phone frame
  useEffect(() => {
    const handleResize = () => {
      if (phoneWrapperRef.current) {
        const parentWidth = phoneWrapperRef.current.parentElement?.clientWidth || 300;
        const baseWidth = 300; // Base width of the phone frame mockup
        if (parentWidth < baseWidth) {
          setScale(parentWidth / baseWidth);
        } else {
          setScale(1);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    const timeout = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, []);

  // Trigger step transition after speech ends or step finishes
  const transitionToNextStep = () => {
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);

    transitionTimeoutRef.current = setTimeout(() => {
      if (!isPlayingRef.current) return;
      const nextIdx = currentStepIdxRef.current + 1;
      if (nextIdx < TUTORIAL_STEPS.length) {
        handleStepSelect(nextIdx);
      } else {
        // End of tutorial
        setIsPlaying(false);
      }
    }, 1500); // Natural pacing delay
  };

  // Called when step finishes
  const handleStepFinished = () => {
    if (!isPlayingRef.current) return;
    transitionToNextStep();
  };

  // Speak step text using Web Speech API
  const speakText = (step: Step) => {
    if (typeof window === "undefined") return;

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);

    // Cancel current speaking
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);

    if (isMuted || !window.speechSynthesis) {
      // Fallback timer when muted
      stepTimerRef.current = setTimeout(() => {
        handleStepFinished();
      }, step.duration * 1000);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(step.speechText);
    utterance.lang = "es-UY";
    
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (voice) => voice.lang.includes("es-UY") || voice.lang.includes("es-AR") || voice.lang.includes("es-ES") || voice.lang.includes("es")
    );
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    utterance.rate = 1.02; // Paced speed
    utterance.pitch = 1.08; // Friendly pitch

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      handleStepFinished();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      handleStepFinished();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Handle Step Selection
  const handleStepSelect = (idx: number) => {
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);

    setCurrentStepIdx(idx);
    const step = TUTORIAL_STEPS[idx];

    // Narration
    if (isPlayingRef.current) {
      speakText(step);
    }
  };

  // Start Tutorial
  const startTutorial = () => {
    setIsPlaying(true);
    isPlayingRef.current = true;

    const step = TUTORIAL_STEPS[currentStepIdx];
    speakText(step);
  };

  // Pause Tutorial
  const pauseTutorial = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (nextMuted) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      
      if (isPlaying) {
        stepTimerRef.current = setTimeout(() => {
          handleStepFinished();
        }, TUTORIAL_STEPS[currentStepIdx].duration * 1000);
      }
    } else if (isPlaying) {
      speakText(TUTORIAL_STEPS[currentStepIdx]);
    }
  };

  const activeStep = TUTORIAL_STEPS[currentStepIdx];

  // Mascot avatar representation
  const getMascotSrc = () => {
    if (isSpeaking && !isMuted) {
      return mouthOpen ? "/martillo_boca_abierta.png" : "/martillo_boca_cerrada.png";
    }
    if (activeStep.pointer) {
      return "/martillo_senalando.png";
    }
    return "/martillo_boca_cerrada.png";
  };

  // Simulated Shop State
  const sim = {
    screen: currentStepIdx === 0 ? "sucursal" : currentStepIdx === 1 ? "catalogo" : currentStepIdx === 2 ? "drawer" : currentStepIdx === 3 ? "carrito" : currentStepIdx === 4 ? "checkout" : "success",
    hasItems: currentStepIdx >= 2,
    cartCount: currentStepIdx >= 2 ? 12 : 0,
    cartTotal: currentStepIdx >= 2 ? 4200 : 0,
  };

  // Helper currency formatting
  const formatCurrency = (val: number) => {
    return val.toLocaleString("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0
    });
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-body selection:bg-red-500/30 selection:text-red-200">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-neutral-950 to-neutral-950 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-red-600 rounded-xl flex items-center justify-center font-serif text-base sm:text-lg font-bold shadow-lg shadow-red-600/20">
                🔨
              </div>
              <div>
                <span className="font-display font-bold tracking-tight block text-white text-sm sm:text-base">
                  EL REMATE
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium uppercase tracking-wider block -mt-1 sm:-mt-0.5">
                  Guía Interactiva
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleMute}
              className="px-2.5 py-1.5 sm:p-2.5 text-xs sm:text-sm rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all text-neutral-300 hover:text-white"
              title={isMuted ? "Activar Voz" : "Silenciar Voz"}
            >
              {isMuted ? "🔇 Sin Voz" : "🔊 Con Voz"}
            </button>
            <Link
              href="/catalogo"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-red-600/10 flex items-center gap-1.5"
            >
              Catálogo ➡️
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout: Optimized 2-column layout that shifts cleanly on mobile */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Phone Frame Simulator container */}
        <section className="w-full lg:col-span-5 flex flex-col items-center">
          <div 
            ref={phoneWrapperRef}
            className="relative w-full overflow-hidden flex justify-center bg-neutral-900/10 rounded-[42px] p-2"
            style={{ height: `${600 * scale}px` }}
          >
            {/* Phone Frame Mockup scaled with transform scale */}
            <div 
              className="absolute left-0 top-0 w-[300px] h-[600px] origin-top-left bg-[#050914] border-4 border-neutral-800 rounded-[40px] overflow-hidden flex flex-col select-none ring-1 ring-white/10"
              style={{ transform: `scale(${scale})` }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-800 rounded-b-xl z-30 flex items-center justify-center">
                <div className="w-10 h-0.5 bg-neutral-700 rounded-full" />
              </div>

              {/* Status bar mock */}
              <div className="h-6 w-full px-5 pt-1.5 flex justify-between items-center text-[7.5px] font-mono text-neutral-400 z-20 bg-neutral-950/80">
                <span>00:18</span>
                <div className="flex gap-1 items-center">
                  <span>📶</span>
                  <span>🔋 98%</span>
                </div>
              </div>

              {/* Phone Content Screen */}
              <div className="flex-1 relative overflow-hidden flex flex-col bg-[#050914] text-[11px]">
                
                {/* 1. SELECCIONAR SUCURSAL SCREEN */}
                {sim.screen === "sucursal" && (
                  <div className="flex-1 flex flex-col p-4 pt-6 justify-between animate-in fade-in duration-300">
                    <div className="space-y-4 mt-2">
                      <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-lg font-bold mx-auto">🔨</div>
                      <div className="text-center space-y-1">
                        <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">EL REMATE</h4>
                        <p className="text-[9px] text-neutral-400">Elegí tu sucursal más cercana para ver stock y ofertas de tu zona.</p>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        {/* Canelones Card (Highlighted) */}
                        <div 
                          onClick={() => handleStepSelect(1)}
                          className="bg-red-600/10 border border-red-500/30 rounded-xl p-3 flex justify-between items-center cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.1)] transition-all hover:bg-red-600/20"
                        >
                          <div>
                            <p className="font-bold text-white text-[11.5px]">Sucursal Canelones 🏪</p>
                            <p className="text-[8.5px] text-neutral-400 mt-0.5">Ruta 5 km 45, Canelones</p>
                          </div>
                          <span className="text-red-400 text-xs font-bold">➡️</span>
                        </div>

                        {/* Atlántida Card */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between items-center opacity-70">
                          <div>
                            <p className="font-bold text-neutral-300 text-[11.5px]">Sucursal Atlántida</p>
                            <p className="text-[8.5px] text-neutral-500 mt-0.5">Ruta Interbalnearia km 46</p>
                          </div>
                          <span className="text-neutral-500 text-xs">➡️</span>
                        </div>

                        {/* Las Piedras Card */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between items-center opacity-70">
                          <div>
                            <p className="font-bold text-neutral-300 text-[11.5px]">Sucursal Las Piedras</p>
                            <p className="text-[8.5px] text-neutral-500 mt-0.5">Dr. Pouey 632</p>
                          </div>
                          <span className="text-neutral-500 text-xs">➡️</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-[7.5px] text-neutral-600 font-mono tracking-widest uppercase">
                      Distribuidora Mayorista
                    </div>
                  </div>
                )}

                {/* 2. CATALOGO SCREEN */}
                {(sim.screen === "catalogo" || sim.screen === "drawer") && (
                  <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                    {/* Catalog Header */}
                    <div className="bg-neutral-950/80 border-b border-white/5 px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 bg-red-600 rounded-md flex items-center justify-center text-xs font-bold">🔨</span>
                        <span className="font-display font-bold text-[10px] tracking-tight text-white">EL REMATE</span>
                      </div>
                      <span className="text-[7.5px] font-bold text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded-full border border-red-500/20">🏪 CANELONES</span>
                    </div>

                    {/* Catalog Search & Category pills */}
                    <div className="p-3 border-b border-white/5 space-y-2 bg-neutral-950/40">
                      <div className="bg-white/5 border border-white/5 rounded-lg py-1.5 px-2.5 text-[8.5px] text-neutral-500 flex items-center gap-2">
                        <span>🔍</span>
                        <span>Buscar productos mayoristas...</span>
                      </div>
                      
                      {/* Horizontal pills */}
                      <div className="flex gap-1.5 overflow-hidden">
                        <span className="bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[8px] font-bold">TODOS</span>
                        <span className="bg-white/5 text-neutral-400 px-2 py-0.5 rounded-full text-[8px]">BEBIDAS</span>
                        <span className="bg-white/5 text-neutral-400 px-2 py-0.5 rounded-full text-[8px]">ALMACÉN</span>
                      </div>
                    </div>

                    {/* Catalog Grid Area */}
                    <div className="flex-1 p-3 grid grid-cols-2 gap-2.5 overflow-y-auto">
                      {/* Product 1: Yerba Mate */}
                      <div 
                        onClick={() => handleStepSelect(2)}
                        className="bg-neutral-900/60 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between cursor-pointer hover:bg-neutral-900 transition-colors"
                      >
                        <div className="aspect-square bg-neutral-800 rounded-lg flex items-center justify-center text-2xl mb-1.5 relative overflow-hidden">
                          🧉
                          <span className="absolute bottom-1 right-1 bg-red-600 text-white font-black text-[6.5px] px-1 rounded-sm uppercase">Bulto Cerrado</span>
                        </div>
                        <div>
                          <p className="font-bold text-[9.5px] text-neutral-200 line-clamp-2 leading-tight">Yerba Mate Premium 1kg</p>
                          <p className="text-[7.5px] text-neutral-500 font-mono mt-0.5">Cód: 77301240</p>
                        </div>
                        <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-white/5">
                          <div>
                            <p className="text-[12px] font-mono font-bold text-white">{formatCurrency(350)}</p>
                            <p className="text-[6.5px] text-neutral-500 font-medium">unidad</p>
                          </div>
                          <span className="w-5 h-5 bg-red-600 hover:bg-red-500 rounded-md flex items-center justify-center text-[10px] text-white">🛒</span>
                        </div>
                      </div>

                      {/* Product 2: Aceite */}
                      <div className="bg-neutral-900/60 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between opacity-80">
                        <div className="aspect-square bg-neutral-800 rounded-lg flex items-center justify-center text-2xl mb-1.5">
                          🍾
                        </div>
                        <div>
                          <p className="font-bold text-[9.5px] text-neutral-200 line-clamp-2 leading-tight">Aceite de Oliva Extra V. 500ml</p>
                          <p className="text-[7.5px] text-neutral-500 font-mono mt-0.5">Cód: 87654321</p>
                        </div>
                        <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-white/5">
                          <div>
                            <p className="text-[12px] font-mono font-bold text-white">{formatCurrency(750)}</p>
                            <p className="text-[6.5px] text-neutral-500 font-medium">unidad</p>
                          </div>
                          <span className="w-5 h-5 bg-neutral-800 text-neutral-600 rounded-md flex items-center justify-center text-[10px]">🛒</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Cart banner Float */}
                    {sim.hasItems && (
                      <div 
                        onClick={() => handleStepSelect(3)}
                        className="m-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2.5 rounded-xl flex items-center justify-between cursor-pointer shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all animate-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-black/20 text-[9px] font-bold px-1.5 py-0.5 rounded-md">{sim.cartCount} u.</span>
                          <span className="font-bold text-[9.5px] uppercase tracking-wider">Ver mi Pedido</span>
                        </div>
                        <span className="font-bold text-[11px]">{formatCurrency(sim.cartTotal)} ➡️</span>
                      </div>
                    )}

                    {/* 3. SIMULATED BUY DRAWER SHEET */}
                    {sim.screen === "drawer" && (
                      <div className="absolute inset-0 bg-black/75 z-20 flex flex-col justify-end animate-in fade-in duration-200">
                        <div className="bg-neutral-900 border-t border-white/10 rounded-t-3xl p-4 space-y-4 max-h-[75%] animate-in slide-in-from-bottom-10 duration-300">
                          
                          {/* Pull Bar */}
                          <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto" />

                          {/* Product Info inside Drawer */}
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-xl">mate</div>
                            <div>
                              <h4 className="font-bold text-[11px] text-white">Yerba Mate Premium 1kg</h4>
                              <p className="text-[8px] text-neutral-400 mt-0.5">Precio unitario: {formatCurrency(350)}</p>
                              <p className="text-[7.5px] text-red-400 font-extrabold uppercase mt-1">🏷️ Descuento por bulto aplicado</p>
                            </div>
                          </div>

                          {/* Packs Selector */}
                          <div className="space-y-2">
                            <p className="text-[8px] text-neutral-500 font-black uppercase tracking-wider">Elegí la cantidad del Bulto:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {/* 6 u */}
                              <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center opacity-70">
                                <p className="font-bold text-white text-[10px]">Bulto de 6 u.</p>
                                <p className="text-[9px] font-mono font-bold text-neutral-400 mt-0.5">{formatCurrency(2100)}</p>
                              </div>
                              {/* 12 u (Highlighted) */}
                              <div 
                                onClick={() => handleStepSelect(3)}
                                className="bg-red-600/20 border border-red-500/50 p-2 rounded-xl text-center shadow-[0_0_12px_rgba(239,68,68,0.15)] cursor-pointer hover:bg-red-600/30"
                              >
                                <p className="font-bold text-red-400 text-[10px]">Bulto de 12 u. 🔥</p>
                                <p className="text-[9.5px] font-mono font-bold text-white mt-0.5">{formatCurrency(4200)}</p>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleStepSelect(3)}
                            className="w-full bg-red-600 hover:bg-red-500 text-white text-[9.5px] font-bold py-2 rounded-xl transition-colors text-center"
                          >
                            Agregar al Pedido 🛒
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. SHOPPING CART REVIEW SCREEN */}
                {sim.screen === "carrito" && (
                  <div className="flex-1 flex flex-col justify-between p-3 animate-in fade-in duration-300">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="border-b border-white/5 pb-2 flex items-center justify-between">
                        <h4 className="font-display font-bold text-white">Mi Carrito</h4>
                        <span onClick={() => handleStepSelect(1)} className="text-[9px] text-neutral-500 cursor-pointer">Volver</span>
                      </div>

                      {/* Cart Items list */}
                      <div className="space-y-2">
                        <div className="bg-neutral-900 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">mate</span>
                            <div>
                              <p className="font-bold text-white">Yerba Mate Premium</p>
                              <p className="text-[8px] text-neutral-400 mt-0.5">Bulto de 12 unidades</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-white">{formatCurrency(4200)}</p>
                            <p className="text-[8px] text-neutral-500">{formatCurrency(350)} u.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Totals & Continue button */}
                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <div className="space-y-1 text-[9px] text-neutral-400 font-mono">
                        <div className="flex justify-between"><span>SUBTOTAL:</span><span>{formatCurrency(4200)}</span></div>
                        <div className="flex justify-between text-emerald-400 font-bold"><span>ENVÍO:</span><span>GRATIS</span></div>
                        <div className="flex justify-between text-white font-bold text-[11px] pt-1.5 border-t border-white/5">
                          <span>TOTAL:</span><span>{formatCurrency(4200)}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleStepSelect(4)}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-[9.5px] font-black tracking-wider py-2.5 rounded-xl transition-all shadow-md shadow-red-600/10 text-center"
                      >
                        CONTINUAR COMPRA ➡️
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. CHECKOUT DETAILS SCREEN */}
                {sim.screen === "checkout" && (
                  <div className="flex-1 flex flex-col justify-between p-3 animate-in fade-in duration-300">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="border-b border-white/5 pb-2 flex items-center justify-between">
                        <h4 className="font-display font-bold text-white">Datos del Comercio</h4>
                        <span onClick={() => handleStepSelect(3)} className="text-[9px] text-neutral-500 cursor-pointer">Volver</span>
                      </div>

                      {/* Checkout fields */}
                      <div className="space-y-2.5 pt-1 text-left">
                        <div className="bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 p-2 rounded-lg text-[8.5px] font-bold text-center">
                          🚚 ¡ENVÍO GRATIS APLICADO! SUPERASTE LOS $3.000
                        </div>

                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-0.5">Nombre del Local / Negocio</label>
                          <input 
                            type="text" 
                            disabled 
                            value="Mini Market El Sol" 
                            className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-[9.5px] text-neutral-300 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-0.5">Teléfono Celular (WhatsApp)</label>
                          <input 
                            type="text" 
                            disabled 
                            value="099 123 456" 
                            className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-[9.5px] text-neutral-300 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] uppercase tracking-wider text-neutral-500 block mb-0.5">Dirección de Entrega</label>
                          <input 
                            type="text" 
                            disabled 
                            value="Av. Giannattasio km 22, Solymar" 
                            className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-[9.5px] text-neutral-300 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleStepSelect(5)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-[9.5px] font-black tracking-widest py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 text-center"
                    >
                      💬 ENVIAR PEDIDO POR WHATSAPP
                    </button>
                  </div>
                )}

                {/* 6. WHATSAPP SUCCESS SCREEN */}
                {sim.screen === "success" && (
                  <div className="flex-1 flex flex-col p-4 justify-between bg-neutral-950 text-center animate-in zoom-in-95 duration-300">
                    <div className="space-y-3 mt-4">
                      <div className="w-11 h-11 bg-emerald-500 text-white text-lg rounded-full flex items-center justify-center mx-auto mb-1 animate-bounce">
                        ✓
                      </div>
                      <h4 className="font-bebas text-[14.5px] text-emerald-400">¡Pedido Armado Correctamente!</h4>
                      <p className="text-[8.5px] text-neutral-400">Se generó el mensaje de WhatsApp mayorista listo para enviar:</p>
                    </div>

                    {/* Mock WhatsApp message display */}
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 text-left font-mono text-[7px] text-neutral-300 space-y-1 max-w-[240px] mx-auto select-all leading-tight">
                      <p className="text-emerald-400 font-bold">*Distribuidora El Remate* 🛒</p>
                      <p>Cliente: Mini Market El Sol</p>
                      <p>ID Pedido: #M826A</p>
                      <p>-------------------------</p>
                      <p>12 u. Yerba Mate Premium 1kg - $4.200</p>
                      <p>-------------------------</p>
                      <p className="font-bold text-white">TOTAL: $4.200 (Envío Gratis)</p>
                    </div>

                    <div className="space-y-2 pb-2">
                      <button 
                        onClick={() => handleStepSelect(0)}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] font-bold py-1.5 rounded-lg text-neutral-300 transition-colors"
                      >
                        🔄 Reiniciar Guía
                      </button>
                      <p className="text-[7.5px] text-neutral-500">¡Comprar de forma mayorista nunca fue tan simple!</p>
                    </div>
                  </div>
                )}

                {/* GLOWING TOUCH POINTER OVERLAY */}
                {activeStep.pointer && (
                  <div
                    className="absolute z-40 pointer-events-none transition-all duration-500 ease-out"
                    style={{
                      top: activeStep.pointer.top,
                      left: activeStep.pointer.left,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="relative">
                      {/* Ripple pulse */}
                      <div className="absolute -inset-3 rounded-full bg-red-500/40 animate-ping" />
                      {/* Indicator Dot */}
                      <div className="w-6.5 h-6.5 rounded-full border-2 border-white bg-red-600 shadow-lg shadow-red-500/50 flex items-center justify-center">
                        <span className="text-[9px]">👇</span>
                      </div>
                      {/* Label tooltip */}
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white font-semibold text-[8px] px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap shadow-lg">
                        {activeStep.pointer.label}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Quick Play Controls */}
          <div className="flex gap-4 mt-4 relative z-20">
            {isPlaying ? (
              <button
                onClick={pauseTutorial}
                className="px-5 py-2 sm:px-6 sm:py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 border border-white/5"
              >
                ⏸️ Pausar Guía
              </button>
            ) : (
              <button
                onClick={startTutorial}
                className="px-5 py-2 sm:px-6 sm:py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-red-600/10 flex items-center gap-1.5"
              >
                ▶️ Iniciar Guía
              </button>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Mascot Dialogue + Step Navigations */}
        <section className="w-full lg:col-span-7 flex flex-col gap-6">
          
          {/* MASCOT DIALOGUE PANEL */}
          <div className="relative bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl flex items-start gap-5 w-full">
            <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center p-1">
              <Image
                src={getMascotSrc()}
                alt="Marti El Martillo"
                width={88}
                height={88}
                priority
                className={`object-contain transition-transform duration-200 ${isSpeaking && !isMuted ? "scale-105" : ""}`}
              />
              {isSpeaking && !isMuted && (
                <div className="absolute top-1 right-1 flex gap-0.5">
                  <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="relative bg-neutral-900 border border-white/10 rounded-2xl px-5 py-3 text-neutral-200 text-sm shadow-md">
                <div className="absolute top-8 -left-2.5 w-5 h-5 bg-neutral-900 border-l border-b border-white/10 rotate-45" />
                
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-display font-bold text-red-400 text-xs tracking-wider uppercase">
                    Marti — Asistente de El Remate
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 font-medium">
                    {isSpeaking ? "Narrando..." : isPlaying ? "Reproduciendo" : "Pausa"}
                  </span>
                </div>
                
                <p className="leading-relaxed text-xs sm:text-sm select-none font-medium text-neutral-100">
                  {isPlaying ? activeStep.speechText : "¡Hola! Haz clic en el botón 'Iniciar Guía' o toca el Play para empezar el tutorial de compra paso a paso por voz para clientes."}
                </p>
              </div>
            </div>
          </div>

          {/* STEPS TIMELINE CHECKLIST */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl w-full">
            <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              📋 Pasos del Tutorial
            </h3>
            
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              {TUTORIAL_STEPS.map((step, idx) => {
                const isActive = idx === currentStepIdx;
                return (
                  <div
                    key={step.id}
                    onClick={() => handleStepSelect(idx)}
                    className={`flex items-start gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-red-950/30 border-red-500/50 shadow-md"
                        : "bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                      isActive ? "bg-red-600 text-white" : "bg-neutral-800 text-neutral-400"
                    }`}>
                      {step.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className={`font-display font-bold text-xs sm:text-sm ${isActive ? "text-red-400" : "text-white"}`}>
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extra Help Card */}
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-5 sm:p-6 text-center w-full">
            <h4 className="font-display font-bold text-sm sm:text-base text-white">¿Sigues con dudas?</h4>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 mb-4 leading-relaxed">
              Puedes descargar el manual completo para comerciantes en formato de texto para leerlo detenidamente.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/manual_usuario_comerciantes.md"
                className="px-3.5 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
              >
                📄 Descargar Manual (.md)
              </Link>
              <a
                href="https://wa.me/59892265952"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
              >
                💬 Contactar Soporte
              </a>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
