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
    title: "6. Enviar Pedido",
    shortDesc: "Confirmar orden al instante",
    description: "Presiona 'Enviar Pedido' para generar tu comprobante digital y registrar tu orden. Nosotros nos comunicaremos contigo.",
    speechText: "Por último, haz clic en el botón Enviar Pedido. La aplicación descargará una imagen de tu comprobante y enviará la orden a nuestro sistema para que te contactemos a la brevedad. ¡Eso es todo!",
    duration: 10,
    pointer: { top: "84%", left: "50%", label: "Finalizar Compra" },
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

      {/* Main Layout: Responsive flex for mobile, grid for desktop */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-center lg:items-start">
        
        {/* LEFT COLUMN: Phone Frame Simulator container */}
        <section className="w-full lg:col-span-5 flex flex-col items-center">
          <div 
            ref={phoneWrapperRef}
            className="relative w-full overflow-hidden flex justify-center bg-neutral-900/10 rounded-[42px] p-2"
            style={{ height: `${600 * scale}px` }}
          >
            {/* Phone Frame Mockup (Matches El Remate client visual experience) */}
            <div 
              className="absolute left-0 top-0 w-[300px] h-[600px] origin-top-left bg-[#F5F2EE] border-4 border-neutral-800 rounded-[40px] overflow-hidden flex flex-col select-none ring-1 ring-black/10"
              style={{ transform: `scale(${scale})` }}
            >
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-800 rounded-b-xl z-30 flex items-center justify-center">
                <div className="w-10 h-0.5 bg-neutral-700 rounded-full" />
              </div>

              {/* Status bar mock */}
              <div className="h-6 w-full px-5 pt-1.5 flex justify-between items-center text-[7.5px] font-mono text-neutral-500 z-20 bg-[#F5F2EE]">
                <span className="font-bold">00:18</span>
                <div className="flex gap-1 items-center">
                  <span>📶</span>
                  <span>🔋 98%</span>
                </div>
              </div>

              {/* Phone Content Screen (Light Theme, system variables matched) */}
              <div className="flex-1 relative overflow-hidden flex flex-col bg-white text-[11px] text-[#111111] font-sans">
                
                {/* 1. SELECCIONAR SUCURSAL SCREEN (Beige layout) */}
                {sim.screen === "sucursal" && (
                  <div className="flex-1 flex flex-col p-4 pt-6 justify-between bg-[#F5F2EE] animate-in fade-in duration-300">
                    <div className="space-y-4 mt-2">
                      <div className="w-11 h-11 bg-[#E8302A] rounded-2xl flex items-center justify-center text-xl shadow-md mx-auto">🔨</div>
                      <div className="text-center space-y-1.5">
                        <h4 className="font-display font-bold text-2xl text-[#111111] uppercase tracking-tight">EL REMATE</h4>
                        <p className="text-[10px] text-[#5C5550] font-medium leading-normal px-4">Elegí tu sucursal más cercana para ver stock y ofertas de tu zona.</p>
                      </div>

                      <div className="space-y-2.5 pt-3">
                        {/* Canelones Card (Highlighted) */}
                        <div 
                          onClick={() => handleStepSelect(1)}
                          className="bg-white border-2 border-[#E8302A] rounded-xl p-3.5 flex justify-between items-center cursor-pointer shadow-[0_4px_16px_rgba(232,48,42,0.12)] transition-all hover:translate-y-[-1px]"
                        >
                          <div>
                            <p className="font-bold text-[#111111] text-[12px]">Sucursal Canelones 🏪</p>
                            <p className="text-[9px] text-[#5C5550] mt-0.5">Ruta 5 km 45, Canelones</p>
                          </div>
                          <span className="text-[#E8302A] text-xs font-black">➡️</span>
                        </div>

                        {/* Atlántida Card */}
                        <div className="bg-white/60 border border-[#DDD8D0] rounded-xl p-3.5 flex justify-between items-center opacity-70">
                          <div>
                            <p className="font-bold text-[#3A3330] text-[12px]">Sucursal Atlántida</p>
                            <p className="text-[9px] text-[#888078] mt-0.5">Ruta Interbalnearia km 46</p>
                          </div>
                          <span className="text-[#888078] text-xs">➡️</span>
                        </div>

                        {/* Las Piedras Card */}
                        <div className="bg-white/60 border border-[#DDD8D0] rounded-xl p-3.5 flex justify-between items-center opacity-70">
                          <div>
                            <p className="font-bold text-[#3A3330] text-[12px]">Sucursal Las Piedras</p>
                            <p className="text-[9px] text-[#888078] mt-0.5">Dr. Pouey 632</p>
                          </div>
                          <span className="text-[#888078] text-xs">➡️</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-[8px] text-[#888078] font-bold tracking-widest uppercase mb-1">
                      Distribuidora Mayorista Canelones
                    </div>
                  </div>
                )}

                {/* 2. CATALOGO SCREEN */}
                {(sim.screen === "catalogo" || sim.screen === "drawer") && (
                  <div className="flex-1 flex flex-col bg-white animate-in fade-in duration-300">
                    {/* Catalog Header (White header, red sucursal badge) */}
                    <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5.5 h-5.5 bg-[#E8302A] rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm">🔨</span>
                        <span className="font-display font-extrabold text-[12px] tracking-tight text-[#111111]">EL REMATE</span>
                      </div>
                      <span className="text-[8px] font-extrabold text-[#E8302A] bg-[#FEF2F1] px-2 py-0.5 rounded-full border border-[#FEF2F1] shadow-sm uppercase">🏪 CANELONES</span>
                    </div>

                    {/* Search & Category circular buttons (CatsNav replica) */}
                    <div className="border-b border-gray-100 bg-[#F8FAFC]">
                      {/* Search Bar mockup */}
                      <div className="px-3 pt-2">
                        <div className="bg-white border border-[#DDD8D0] rounded-xl py-1.5 px-2.5 text-[9px] text-[#888078] flex items-center gap-2 shadow-sm">
                          <span>🔍</span>
                          <span className="font-medium">Buscar productos mayoristas...</span>
                        </div>
                      </div>
                      
                      {/* CatsNav Circular Pills */}
                      <div className="w-full overflow-x-auto scrollbar-none py-2 px-3">
                        <div className="flex gap-4 w-max">
                          {/* Todos */}
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm shadow-sm transition-all">📦</div>
                            <span className="text-[8px] font-bold text-[#5C5550] uppercase tracking-wider">Todos</span>
                          </div>
                          {/* Bebidas */}
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm shadow-sm transition-all ${
                              sim.screen === "catalogo" ? "border-gray-200 bg-white" : "border-[#E8302A] bg-[#FEF2F1]"
                            }`}>🍾</div>
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${
                              sim.screen === "catalogo" ? "text-[#5C5550]" : "text-[#E8302A]"
                            }`}>Bebidas</span>
                          </div>
                          {/* Almacén */}
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm shadow-sm transition-all ${
                              sim.screen === "catalogo" ? "border-[#E8302A] bg-[#FEF2F1]" : "border-gray-200 bg-white"
                            }`}>🧉</div>
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${
                              sim.screen === "catalogo" ? "text-[#E8302A]" : "text-[#5C5550]"
                            }`}>Almacén</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Catalog Grid Area */}
                    <div className="flex-1 p-3 grid grid-cols-2 gap-2.5 overflow-y-auto bg-[#F8FAFC]">
                      {/* Product 1: Yerba Mate */}
                      <div 
                        onClick={() => handleStepSelect(2)}
                        className="bg-white border border-[#DDD8D0] rounded-xl p-2.5 flex flex-col justify-between cursor-pointer hover:border-gray-300 shadow-sm"
                      >
                        <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-3xl mb-1.5 relative overflow-hidden border border-gray-100">
                          🧉
                          <span className="absolute bottom-1 right-1 bg-[#E8302A] text-white font-black text-[6.5px] px-1 rounded-sm uppercase tracking-wider">Bulto Cerrado</span>
                        </div>
                        <div>
                          <p className="font-bold text-[9.5px] text-[#3A3330] line-clamp-2 leading-tight">Yerba Mate Premium 1kg</p>
                          <p className="text-[7.5px] text-[#888078] font-mono mt-0.5">Cód: 77301240</p>
                        </div>
                        <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-gray-100">
                          <div>
                            <p className="text-[14px] font-bebas font-bold text-[#E8302A] leading-none">{formatCurrency(350)}</p>
                            <p className="text-[6.5px] text-[#5C5550] font-bold uppercase tracking-widest mt-0.5">unidad</p>
                          </div>
                          <span className="w-5.5 h-5.5 bg-[#E8302A] rounded-md flex items-center justify-center text-white text-[10px] shadow-sm">+</span>
                        </div>
                      </div>

                      {/* Product 2: Aceite */}
                      <div className="bg-white border border-[#DDD8D0] rounded-xl p-2.5 flex flex-col justify-between opacity-80 shadow-sm">
                        <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-3xl mb-1.5 border border-gray-100">
                          🍾
                        </div>
                        <div>
                          <p className="font-bold text-[9.5px] text-[#3A3330] line-clamp-2 leading-tight">Aceite de Oliva Extra V. 500ml</p>
                          <p className="text-[7.5px] text-[#888078] font-mono mt-0.5">Cód: 87654321</p>
                        </div>
                        <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-gray-100">
                          <div>
                            <p className="text-[14px] font-bebas font-bold text-[#E8302A] leading-none">{formatCurrency(750)}</p>
                            <p className="text-[6.5px] text-[#5C5550] font-bold uppercase tracking-widest mt-0.5">unidad</p>
                          </div>
                          <span className="w-5.5 h-5.5 bg-gray-200 text-gray-500 rounded-md flex items-center justify-center text-[10px] shadow-sm">+</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom FloatCartBtn (Replicates FloatCartBtn.tsx styles) */}
                    {sim.hasItems && (
                      <div 
                        onClick={() => handleStepSelect(3)}
                        className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#111111] text-white border-1.5 border-[#E8302A]/35 rounded-[30px] py-2 px-4 flex items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.30)] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-300 w-[240px] z-10 font-bebas tracking-widest text-[11px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>🛒 Pedido</span>
                          <span className="bg-[#E8302A] text-white text-[7.5px] font-body rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold">{sim.cartCount}</span>
                        </div>
                        <span className="bg-[#E8302A]/15 border border-[#E8302A]/30 text-[#E8302A] text-[9.5px] font-body font-bold rounded-lg px-2 py-0.5">{formatCurrency(sim.cartTotal)}</span>
                      </div>
                    )}

                    {/* 3. SIMULATED BUY DRAWER SHEET (QuickViewModal replica) */}
                    {sim.screen === "drawer" && (
                      <div className="absolute inset-0 bg-[#090D1A]/40 z-20 flex flex-col justify-end animate-in fade-in duration-200">
                        <div className="bg-white border-t border-gray-100 rounded-t-[32px] p-5 space-y-4 max-h-[75%] animate-in slide-in-from-bottom-10 duration-300 shadow-2xl relative text-left">
                          
                          {/* Mobile handle pull bar */}
                          <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto" />

                          {/* Category pill */}
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 border border-gray-200/50 text-gray-500 text-[8.5px] font-bold uppercase tracking-wider rounded-md">
                            🧉 Almacén
                          </div>

                          {/* Product Info inside Drawer */}
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                              <h4 className="font-bold text-sm text-gray-900 leading-tight">Yerba Mate Premium 1kg</h4>
                              <p className="text-[8px] text-gray-400 font-bold tracking-wider mt-1">CÓDIGO: 77301240</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bebas text-2xl text-[#E8302A] leading-none">{formatCurrency(350)}</p>
                              <p className="text-[7.5px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Unidad IVA Incl.</p>
                            </div>
                          </div>

                          {/* Packs Selector (Compra rápida bultos) */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">⚡</span>
                              <span className="text-[8.5px] text-gray-500 font-bold uppercase tracking-wider">Compra rápida (Bulto cerrado)</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {/* 6 u */}
                              <div className="py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-center opacity-70">
                                <span className="text-[7.5px] font-bold text-gray-400 block">LLEVAR</span>
                                <span className="text-xs font-black text-gray-800">6 u.</span>
                              </div>
                              {/* 12 u (Highlighted) */}
                              <div 
                                onClick={() => handleStepSelect(3)}
                                className="py-2.5 bg-[#FEF2F1] border-2 border-[#E8302A] rounded-[14px] text-center cursor-pointer hover:bg-red-50"
                              >
                                <span className="text-[7.5px] font-bold text-[#E8302A] block animate-pulse">LLEVAR</span>
                                <span className="text-xs font-black text-[#E8302A]">12 u. 🔥</span>
                              </div>
                              {/* 24 u */}
                              <div className="py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-center opacity-70">
                                <span className="text-[7.5px] font-bold text-gray-400 block">LLEVAR</span>
                                <span className="text-xs font-black text-gray-800">24 u.</span>
                              </div>
                              {/* 48 u */}
                              <div className="py-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-center opacity-70">
                                <span className="text-[7.5px] font-bold text-gray-400 block">LLEVAR</span>
                                <span className="text-xs font-black text-gray-800">48 u.</span>
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleStepSelect(3)}
                            className="w-full bg-[#111111] hover:bg-black text-white font-bold text-xs py-3 rounded-[20px] transition-all text-center uppercase tracking-wider"
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
                  <div className="flex-1 flex flex-col justify-between p-3.5 bg-white text-left animate-in fade-in duration-300">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between">
                        <h4 className="font-display font-extrabold text-sm text-gray-900 uppercase">Mi Pedido</h4>
                        <span onClick={() => handleStepSelect(1)} className="text-[9px] text-[#5C5550] hover:text-[#E8302A] font-bold uppercase cursor-pointer">Volver</span>
                      </div>

                      {/* Cart Items list */}
                      <div className="space-y-2">
                        <div className="bg-gray-50 border border-gray-200/50 rounded-xl p-3 flex justify-between items-center shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">🧉</span>
                            <div>
                              <p className="font-bold text-[#111111] text-[10px]">Yerba Mate Premium</p>
                              <p className="text-[8px] text-[#5C5550] mt-0.5">Bulto cerrado · 12 unidades</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-[#E8302A]">{formatCurrency(4200)}</p>
                            <p className="text-[7.5px] text-[#888078] font-bold font-mono">({formatCurrency(350)} u.)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Totals & Continue button */}
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <div className="space-y-1.5 text-[8.5px] text-[#5C5550] font-mono">
                        <div className="flex justify-between"><span>SUBTOTAL:</span><span>{formatCurrency(4200)}</span></div>
                        <div className="flex justify-between text-[#1A7A42] font-black bg-[#EBF7F0] px-2 py-0.5 rounded"><span>ENVÍO A LOCAL:</span><span>GRATIS 🚚</span></div>
                        <div className="flex justify-between text-[#111111] font-extrabold text-[11.5px] pt-2 border-t border-dashed border-gray-200">
                          <span>TOTAL A PAGAR:</span><span>{formatCurrency(4200)}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleStepSelect(4)}
                        className="w-full bg-[#E8302A] hover:bg-[#C4231E] text-white text-[10px] font-black tracking-wider py-3 rounded-xl transition-all shadow-md shadow-[#E8302A]/10 text-center uppercase"
                      >
                        CONTINUAR COMPRA ➡️
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. CHECKOUT DETAILS SCREEN */}
                {sim.screen === "checkout" && (
                  <div className="flex-1 flex flex-col justify-between p-3.5 bg-white text-left animate-in fade-in duration-300">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between">
                        <h4 className="font-display font-extrabold text-sm text-gray-900 uppercase">Datos del Local</h4>
                        <span onClick={() => handleStepSelect(3)} className="text-[9px] text-[#5C5550] font-bold uppercase cursor-pointer">Volver</span>
                      </div>

                      {/* Checkout fields */}
                      <div className="space-y-2.5 pt-1">
                        <div className="bg-[#EBF7F0] border border-emerald-500/20 text-[#1A7A42] p-2.5 rounded-lg text-[9px] font-black text-center uppercase tracking-wide">
                          🚚 ¡ENVÍO GRATIS APLICADO! SUPERASTE LOS $3.000
                        </div>

                        <div>
                          <label className="text-[7.5px] uppercase tracking-widest text-[#888078] font-bold block mb-0.5">Nombre del Local / Comercio</label>
                          <input 
                            type="text" 
                            disabled 
                            value="Mini Market El Sol" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[9.5px] text-[#111111] font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[7.5px] uppercase tracking-widest text-[#888078] font-bold block mb-0.5">Teléfono Celular (WhatsApp)</label>
                          <input 
                            type="text" 
                            disabled 
                            value="099 123 456" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[9.5px] text-[#111111] font-semibold outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[7.5px] uppercase tracking-widest text-[#888078] font-bold block mb-0.5">Dirección de Entrega</label>
                          <input 
                            type="text" 
                            disabled 
                            value="Av. Giannattasio km 22, Solymar" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[9.5px] text-[#111111] font-semibold outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleStepSelect(5)}
                      className="w-full bg-[#1A7A42] hover:bg-[#145E33] text-white text-[10px] font-black tracking-widest py-3 rounded-xl transition-all shadow-md shadow-[#1A7A42]/10 text-center uppercase flex items-center justify-center gap-1.5"
                    >
                      ✔️ CONFIRMAR Y ENVIAR PEDIDO
                    </button>
                  </div>
                )}

                {/* 6. WHATSAPP SUCCESS SCREEN (WhatsApp Chat Mockup style) */}
                {sim.screen === "success" && (
                  <div className="flex-1 flex flex-col justify-between bg-[#E5DDD5] animate-in zoom-in-95 duration-300 text-left">
                    {/* WhatsApp Chat Header */}
                    <div className="bg-[#075E54] text-white px-3 py-2 flex items-center gap-2 z-10 shadow-md">
                      <div className="w-6.5 h-6.5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold font-serif">🔨</div>
                      <div>
                        <p className="font-bold text-[9.5px] leading-none">Distribuidora El Remate</p>
                        <p className="text-[6.5px] text-emerald-100 mt-0.5">En línea</p>
                      </div>
                    </div>

                    {/* Chat Bubble Area */}
                    <div className="flex-grow p-3 space-y-3 overflow-y-auto flex flex-col justify-end text-[7px] leading-tight">
                      
                      {/* User Sent Message bubble (Right) */}
                      <div className="self-end bg-[#DCF8C6] border border-emerald-200/50 rounded-l-lg rounded-br-lg p-2.5 max-w-[210px] shadow-sm text-neutral-800 space-y-1 relative">
                        <p className="text-[#128C7E] font-extrabold text-[8px]">*Distribuidora El Remate* 🛒</p>
                        <p className="font-semibold">Cliente: Mini Market El Sol</p>
                        <p>ID Pedido: #M826A</p>
                        <p>-------------------------</p>
                        <p>12 u. Yerba Mate Premium 1kg - $4.200</p>
                        <p>-------------------------</p>
                        <p className="font-extrabold text-[#111111] text-[8px]">TOTAL: $4.200 (Envío Gratis)</p>
                        <span className="absolute bottom-1 right-2 text-[5.5px] text-gray-500 font-mono">22:15 ✔️✔️</span>
                      </div>

                      {/* System / Admin response bubble (Left) */}
                      <div className="self-start bg-white border border-gray-200 rounded-r-lg rounded-bl-lg p-2.5 max-w-[210px] shadow-sm text-neutral-800 space-y-1 relative">
                        <p className="font-bold text-[#E8302A] text-[7.5px]">Marti — El Remate 🔨</p>
                        <p className="font-medium text-[7.5px] leading-normal text-neutral-700">
                          ¡Recibido! Tu pedido está siendo procesado por el local de Canelones. En breve te contactará un empleado para despacharlo. ¡Gracias por elegirnos!
                        </p>
                        <span className="absolute bottom-1 right-2 text-[5.5px] text-gray-400 font-mono">22:16</span>
                      </div>
                    </div>

                    {/* Reset Controls footer */}
                    <div className="bg-[#F4F4F4] border-t border-gray-200 p-2 text-center">
                      <button 
                        onClick={() => handleStepSelect(0)}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-[8.5px] font-bold py-1.5 px-4 rounded-lg text-neutral-700 transition-colors shadow-sm"
                      >
                        🔄 Reiniciar Guía de Compra
                      </button>
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
