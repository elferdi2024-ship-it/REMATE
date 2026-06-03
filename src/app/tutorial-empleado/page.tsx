// filepath: src/app/tutorial-empleado/page.tsx
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
    title: "1. Inicio de Sesión",
    shortDesc: "Acceder al sistema",
    description: "Ingresa al panel administrativo usando tu correo y contraseña institucionales para acceder a los pedidos asignados.",
    speechText: "¡Hola, compañero de El Remate! Soy Marti, el martillito del logo. Hoy te enseñaré cómo usar el panel de gestión de pedidos. Primero, inicia sesión con tus credenciales de empleado.",
    duration: 8,
    pointer: { top: "54%", left: "50%", label: "Toca Iniciar Sesión" },
  },
  {
    id: 2,
    title: "2. Panel de Control",
    shortDesc: "Vista general de órdenes",
    description: "Visualiza la vista general de pedidos del día con contadores de ventas y estados no leídos en rojo.",
    speechText: "Este es tu panel principal. Verás las tarjetas de pedidos entrantes junto a estadísticas clave como pedidos pendientes, no leídos en rojo y el total de hoy.",
    duration: 10,
    pointer: { top: "28%", left: "70%", label: "Monitoreá las Estadísticas" },
  },
  {
    id: 3,
    title: "3. Filtrar por Sucursal",
    shortDesc: "Focalizar en tu zona",
    description: "Selecciona tu sucursal (por ejemplo, Canelones) en la barra lateral para ver únicamente los pedidos de tu zona.",
    speechText: "Como empleado, solo debes gestionar las órdenes de tu sucursal. Usa el selector de sucursales para elegir tu local de trabajo, por ejemplo, Canelones.",
    duration: 10,
    pointer: { top: "42%", left: "80%", label: "Filtra por tu Sucursal" },
  },
  {
    id: 4,
    title: "4. Recibir Pedidos",
    shortDesc: "Detectar nuevas compras",
    description: "Escucha la alerta sonora cuando ingresa un pedido. Verás la tarjeta del pedido en rojo de estado 'No Leído'.",
    speechText: "Cuando ingresa una orden nueva, el panel emite una alerta de sonido. Las nuevas tarjetas aparecen resaltadas en color rojo con el estado No Leído.",
    duration: 10,
    pointer: { top: "68%", left: "50%", label: "Revisá el Nuevo Pedido" },
  },
  {
    id: 5,
    title: "5. Empezar Preparación",
    shortDesc: "Iniciar empaque",
    description: "Haz clic en 'Preparar' en la tarjeta para indicar que estás recolectando los productos. El estado pasa a amarillo.",
    speechText: "Una vez verificado el stock de los productos, haz clic en el botón Empezar Preparación. El pedido pasará al estado Pendiente en color amarillo.",
    duration: 10,
    pointer: { top: "85%", left: "50%", label: "Iniciá la Preparación" },
  },
  {
    id: 6,
    title: "6. Impresión de Ticket",
    shortDesc: "Lista física de picking",
    description: "Haz clic en el botón de impresora para emitir el ticket térmico de preparación de 80mm y llevarlo al depósito.",
    speechText: "Usa la herramienta de Impresión de ticket para ticketeadoras térmicas de ochenta milímetros. Llévalo contigo al depósito para recolectar y empacar los artículos.",
    duration: 10,
    pointer: { top: "79%", left: "64%", label: "Imprimí el Ticket de Picking" },
  },
  {
    id: 7,
    title: "7. Completar Carga",
    shortDesc: "Archivar orden despachada",
    description: "Haz clic en 'Cargar' una vez empaquetado y cargado en el vehículo de reparto. Se archivará automáticamente.",
    speechText: "Cuando los productos estén embalados y cargados para el reparto o retiro, haz clic en Completar Carga. El pedido pasará a verde y se archivará del panel.",
    duration: 10,
    pointer: { top: "85%", left: "50%", label: "Marcá como Cargado" },
  },
];

export default function EmployeeTutorialPage() {
  const router = useRouter();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [supportedTTS, setSupportedTTS] = useState(true);

  // Responsive scaling states for the desktop simulator
  const [scale, setScale] = useState(1);
  const simulatorWrapperRef = useRef<HTMLDivElement>(null);

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

  // Responsive scaling calculator
  useEffect(() => {
    const handleResize = () => {
      if (simulatorWrapperRef.current) {
        const parentWidth = simulatorWrapperRef.current.parentElement?.clientWidth || 800;
        const baseWidth = 800; // Base width of the desktop browser mockup
        if (parentWidth < baseWidth) {
          setScale(parentWidth / baseWidth);
        } else {
          setScale(1);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    // Initial delay to make sure layout has settled
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

  // Called when speech narration finishes or fallback timer triggers
  const handleStepFinished = () => {
    if (!isPlayingRef.current) return;
    transitionToNextStep();
  };

  // Speak step text using Web Speech API
  const speakText = (step: Step) => {
    if (typeof window === "undefined") return;

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);

    // Cancel current speaking immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);

    // Play chime sound at Step 4 (Recibir Pedidos)
    if (step.id === 4 && !isMuted) {
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (e) {}
    }

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

    // Narration & Simulation Actions
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
      
      // Setup fallback timer for the remainder of the step
      if (isPlaying) {
        stepTimerRef.current = setTimeout(() => {
          handleStepFinished();
        }, TUTORIAL_STEPS[currentStepIdx].duration * 1000);
      }
    } else if (isPlaying) {
      speakText(TUTORIAL_STEPS[currentStepIdx]);
    }
  };

  // Reset/Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  // Simulated Dashboard State calculations
  const sim = {
    isLoggedIn: currentStepIdx > 0,
    selectedBranch: currentStepIdx >= 3 ? "Canelones" : "todas",
    isBranchDropdownOpen: currentStepIdx === 2,
    hasOrder: currentStepIdx >= 3,
    orderStatus: currentStepIdx === 3 ? "no_leido" : (currentStepIdx === 4 || currentStepIdx === 5) ? "pendiente" : "cargado",
    isTicketOpen: currentStepIdx === 5,
    showSuccess: currentStepIdx === 6
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
                  Panel Empleados
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
              href="/admin/login"
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-red-600/10 flex items-center gap-1.5"
            >
              Iniciar Sesión ➡️
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout: Fixed 2-column layout to always show the desktop context */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Desktop Web Browser Simulator */}
        <section className="w-full lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex justify-center">
            <div 
              ref={simulatorWrapperRef}
              className="relative w-full max-w-[800px] overflow-hidden bg-neutral-900/40 rounded-2xl border border-white/10 shadow-2xl"
              style={{ height: `${500 * scale}px` }}
            >
              {/* Base width container scaled with transform scale */}
              <div 
                className="absolute left-0 top-0 w-[800px] h-[500px] origin-top-left bg-[#050914] overflow-hidden flex flex-col select-none"
                style={{ transform: `scale(${scale})` }}
              >
              {/* Browser Header Bar */}
              <div className="w-full h-9 bg-neutral-900 border-b border-white/5 px-3 flex items-center gap-3">
                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 max-w-md bg-black/60 border border-white/5 rounded-md py-0.5 text-[10px] text-neutral-400 font-mono truncate text-center">
                  https://admin.distribuidoraelremate.uy/pedidos
                </div>
                <div className="w-8" /> {/* Balance spacer */}
              </div>

              {/* Browser Content Area */}
              <div className="flex-1 relative overflow-hidden flex text-[12px] bg-[#050914]">
                
                {/* 1. MOCK LOGIN SCREEN */}
                {!sim.isLoggedIn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/95 z-10 transition-all duration-300">
                    <div className="w-[320px] bg-neutral-900 border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                        🔨
                      </div>
                      <h3 className="font-display font-bold text-white text-base">ADMIN EL REMATE</h3>
                      <p className="text-[10px] text-neutral-400 mt-1 mb-5">Ingresá con tu cuenta de administrador</p>
                      
                      <div className="space-y-3 text-left">
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">Email</label>
                          <input 
                            type="text" 
                            disabled 
                            value="admin@elremate.com" 
                            className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-neutral-300 font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 block mb-1">Contraseña</label>
                          <input 
                            type="password" 
                            disabled 
                            value="12345678" 
                            className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-neutral-300 font-mono outline-none"
                          />
                        </div>
                        
                        <button 
                          onClick={() => handleStepSelect(1)}
                          className="w-full bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold py-2 rounded-lg mt-3 transition-colors flex items-center justify-center gap-1.5"
                        >
                          Iniciar sesión ➡️
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SIMULATED DASHBOARD */}
                {sim.isLoggedIn && (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Top Dashboard Navbar */}
                    <div className="h-12 border-b border-white/5 bg-neutral-950/80 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bebas text-lg tracking-wider text-white">PEDIDOS DE <span className="text-[#00E5FF]">HOY</span></span>
                        <span className="text-neutral-600 text-[10px]">•</span>
                        <span className="text-neutral-500 text-[10px] font-mono">03 Jun 2026</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Simulation Button */}
                        <button 
                          onClick={() => handleStepSelect(3)}
                          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-[#00E5FF]"
                        >
                          🧪 SIMULAR PEDIDO
                        </button>
                        {/* Search bar mockup */}
                        <div className="w-36 bg-white/5 border border-white/5 rounded-md px-2 py-0.5 text-[9px] text-neutral-500 font-mono">
                          Buscar...
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {/* Stats Cards */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-gradient-to-br from-[#00E5FF]/10 to-transparent border border-[#00E5FF]/20 rounded-xl p-3">
                          <p className="text-[7px] text-neutral-500 font-black uppercase tracking-wider">Ventas Hoy</p>
                          <p className="font-bebas text-base text-white mt-0.5">{formatCurrency(sim.hasOrder ? 1450 : 0)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-3">
                          <p className="text-[7px] text-neutral-500 font-black uppercase tracking-wider">Artículos</p>
                          <p className="font-bebas text-base text-white mt-0.5">{sim.hasOrder ? 3 : 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-3">
                          <p className="text-[7px] text-neutral-500 font-black uppercase tracking-wider">No Leídos</p>
                          <p className="font-bebas text-base text-red-400 mt-0.5">{sim.orderStatus === "no_leido" ? 1 : 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl p-3">
                          <p className="text-[7px] text-neutral-500 font-black uppercase tracking-wider">Pendientes</p>
                          <p className="font-bebas text-base text-yellow-400 mt-0.5">{sim.orderStatus === "pendiente" ? 1 : 0}</p>
                        </div>
                      </div>

                      {/* Control Deck */}
                      <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <span className="bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">TODOS</span>
                          <span className="bg-white/5 text-neutral-500 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">NO LEÍDOS</span>
                        </div>

                        {/* Branch Selector Dropdown */}
                        <div className="relative">
                          <div 
                            onClick={() => handleStepSelect(3)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[9px] text-white flex items-center gap-1.5 cursor-pointer hover:bg-white/10 transition-colors"
                          >
                            <span>🏪 {sim.selectedBranch === "Canelones" ? "SUCURSAL CANELONES" : "TODAS LAS SUCURSALES"}</span>
                            <span>▼</span>
                          </div>

                          {/* Branch Selector Dropdown Items (Simulated Open) */}
                          {sim.isBranchDropdownOpen && (
                            <div className="absolute right-0 top-6 z-20 w-44 bg-neutral-900 border border-white/10 rounded-lg shadow-xl py-1 overflow-hidden">
                              <div className="px-3 py-1.5 text-[8px] text-neutral-500 font-bold uppercase border-b border-white/5">Seleccionar Local</div>
                              <div className="px-3 py-1 hover:bg-white/5 text-[9px] text-neutral-400 cursor-pointer">TODAS LAS SUCURSALES</div>
                              <div 
                                onClick={() => handleStepSelect(3)}
                                className="px-3 py-1 bg-red-600/20 text-red-400 text-[9px] font-bold cursor-pointer"
                              >
                                Canelones (Ruta 5 km 45)
                              </div>
                              <div className="px-3 py-1 hover:bg-white/5 text-[9px] text-neutral-400 cursor-pointer">Atlántida (Ruta Interb.)</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Orders Content Area */}
                      <div className="space-y-3 pb-8">
                        {!sim.hasOrder && (
                          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/5 rounded-2xl bg-neutral-950/20">
                            <span className="text-2xl mb-2">🔍</span>
                            <p className="font-bebas text-sm text-neutral-500">Sin pedidos de tu sucursal asignada</p>
                            <p className="text-[9px] text-neutral-600">Espera que ingresen compras en la web.</p>
                          </div>
                        )}

                        {/* Simulated PedidoAdminCard */}
                        {sim.hasOrder && !sim.showSuccess && (
                          <div 
                            className={`rounded-2xl border bg-neutral-900/60 p-4 transition-all duration-300 ${
                              sim.orderStatus === "no_leido" 
                                ? "border-red-500/40 bg-red-500/5 shadow-[0_4px_15px_rgba(239,68,68,0.15)]" 
                                : "border-yellow-500/40 bg-yellow-500/5"
                            }`}
                          >
                            {/* Card Header Pipeline */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                              <div className="flex items-center gap-2">
                                {/* Stepper */}
                                <div className="flex items-center gap-1">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                    sim.orderStatus === "no_leido" ? "bg-red-500 text-white" : "bg-neutral-800 text-neutral-400"
                                  }`}>📥</div>
                                  <div className="w-3 h-0.5 bg-neutral-800" />
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                    sim.orderStatus === "pendiente" ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-400"
                                  }`}>📦</div>
                                  <div className="w-3 h-0.5 bg-neutral-800" />
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold bg-neutral-800 text-neutral-400">🚚</div>
                                </div>
                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-[8px] font-mono text-neutral-400">22:04</span>
                              </div>
                              <span className="text-[8px] text-neutral-500 font-bold">ID: #7ZQRGQ</span>
                            </div>

                            {/* Client & Price */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-display font-bold text-sm text-white">Renato (Entrenamiento)</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[8px] text-neutral-400">3 artículos</span>
                                  <span className="text-neutral-600 text-[6px]">•</span>
                                  <span className={`text-[8px] font-bold tracking-wider ${
                                    sim.orderStatus === "no_leido" ? "text-red-400" : "text-yellow-400"
                                  }`}>
                                    {sim.orderStatus === "no_leido" ? "NO LEÍDO" : "PENDIENTE"}
                                  </span>
                                  <span className="text-neutral-600 text-[6px]">•</span>
                                  <span className="text-[8px] font-extrabold text-[#00E5FF] bg-[#00E5FF]/10 px-1 py-0.2 rounded">
                                    🏪 CANELONES
                                  </span>
                                </div>
                                
                                <div className="mt-2 bg-neutral-950/80 border border-white/5 rounded-lg px-2.5 py-1 text-[8px] text-neutral-300 w-fit">
                                  🏬 RETIRO EN LOCAL · Canelones (Ruta 5 km 45)
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="font-display text-base font-bold text-white">{formatCurrency(1450)}</p>
                              </div>
                            </div>

                            {/* Card Actions */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              <div className="bg-white/5 text-neutral-500 border border-white/5 text-[8.5px] font-black rounded-lg py-2 flex items-center justify-center gap-1">
                                <span>💬</span> WHATSAPP
                              </div>
                              <button 
                                onClick={() => handleStepSelect(5)}
                                className={`text-[8.5px] font-black rounded-lg py-2 flex items-center justify-center border transition-all ${
                                  currentStepIdx === 5 
                                    ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                                    : "bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10"
                                }`}
                              >
                                <span>RECIBO</span>
                              </button>
                              <button 
                                onClick={() => handleStepSelect(5)}
                                className="bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-[8.5px] font-black rounded-lg py-2 flex items-center justify-center"
                              >
                                <span>IMPRIMIR</span>
                              </button>
                            </div>

                            {/* Smart Work Flow Button */}
                            <div className="mt-3">
                              {sim.orderStatus === "no_leido" ? (
                                <button 
                                  onClick={() => handleStepSelect(4)}
                                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-[9px] font-black tracking-widest py-2 rounded-lg transition-all shadow-md shadow-amber-500/10"
                                >
                                  📦 EMPEZAR PREPARACIÓN (PENDIENTE)
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleStepSelect(6)}
                                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-[9px] font-black tracking-widest py-2 rounded-lg transition-all shadow-md shadow-green-500/10"
                                >
                                  🚚 COMPLETAR CARGA (CARGADO)
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Simulated Success completion state */}
                        {sim.showSuccess && (
                          <div className="flex flex-col items-center justify-center py-10 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl text-center p-6 animate-in zoom-in-95 duration-300">
                            <div className="w-12 h-12 bg-emerald-500 text-white text-xl rounded-full flex items-center justify-center mb-3 animate-bounce">
                              ✓
                            </div>
                            <h4 className="font-bebas text-lg text-emerald-400">¡Pedido Despachado Correctamente!</h4>
                            <p className="text-[9.5px] text-neutral-400 mt-1 max-w-[280px]">
                              El pedido se archivó y el camión de reparto lo tiene asignado. ¡Flujo de entrenamiento de empleado completado con éxito!
                            </p>
                            <button 
                              onClick={() => handleStepSelect(0)}
                              className="mt-4 border border-white/10 hover:border-white/20 bg-white/5 text-[9px] font-bold px-3 py-1.5 rounded-lg text-neutral-300 transition-colors"
                            >
                              🔄 Reiniciar Simulación
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SIMULATED PRINT TICKET TIER PREVIEW OVERLAY */}
                {sim.isTicketOpen && (
                  <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-30 animate-in fade-in duration-200">
                    <div className="w-[260px] bg-white text-black p-4 rounded-lg shadow-2xl relative font-mono text-[8px] leading-tight select-none">
                      {/* Ticket Cut Lines */}
                      <div className="absolute -top-1 left-0 right-0 h-1 bg-[linear-gradient(90deg,#fff_0%,#fff_50%,#000_50%,#000_100%)] bg-[length:6px_100%]" />
                      
                      <div className="text-center border-b border-dashed border-black pb-2 mb-2">
                        <h5 className="font-bold text-[10px] tracking-widest">EL REMATE</h5>
                        <p className="text-[6.5px] text-neutral-500 mt-0.5">Distribuidora · Canelones</p>
                        <div className="font-bold text-[8px] bg-black/10 rounded py-0.5 mt-1.5 uppercase">Ticket de Preparación</div>
                      </div>

                      <div className="space-y-0.5 mb-2 pb-1 border-b border-dashed border-neutral-300">
                        <div className="flex justify-between"><span>FECHA:</span><span>03 Jun 2026, 22:04</span></div>
                        <div className="flex justify-between font-bold"><span>CLIENTE:</span><span>RENATO (ENTRENAMIENTO)</span></div>
                        <div className="flex justify-between"><span>TEL:</span><span>099 265 952</span></div>
                        <div className="flex justify-between"><span>ENTREGA:</span><span>🟢 RETIRO EN SUCURSAL</span></div>
                      </div>

                      {/* Items table */}
                      <div className="space-y-1 mb-2 border-b border-dashed border-neutral-300 pb-2">
                        <div className="grid grid-cols-[20px_1fr_40px] font-bold text-[7px] border-b border-black pb-0.5 mb-1">
                          <span>CANT</span><span>DETALLE</span><span className="text-right">SUBTOTAL</span>
                        </div>
                        <div className="grid grid-cols-[20px_1fr_40px] items-start">
                          <span className="font-bold">2</span>
                          <span className="truncate">YERBA MATE PREMIUM 1KG</span>
                          <span className="text-right">$700</span>
                        </div>
                        <div className="grid grid-cols-[20px_1fr_40px] items-start">
                          <span className="font-bold">1</span>
                          <span className="truncate">ACEITE OLIVA EXTRA VIRG.</span>
                          <span className="text-right">$750</span>
                        </div>
                      </div>

                      <div className="text-right font-bold text-[9px] mb-2">
                        TOTAL: {formatCurrency(1450)}
                      </div>

                      <div className="border border-dashed border-black p-1 text-[7px] italic bg-neutral-50 text-neutral-700 leading-normal mb-3 rounded">
                        OBS: Pedido simulado para entrenamiento.
                      </div>

                      <div className="border-t border-black pt-2 text-center text-[7px]">
                        Firma Preparador / Reparto
                      </div>

                      <button 
                        onClick={() => handleStepSelect(6)}
                        className="w-full bg-black text-white hover:bg-neutral-800 text-[8px] font-bold py-1.5 rounded-md mt-4 transition-colors text-center"
                      >
                        Cerrar vista de Impresión ❌
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. GLOWING TOUCH POINTER OVERLAY */}
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
                      <div className="absolute -inset-3.5 rounded-full bg-red-500/40 animate-ping" />
                      {/* Indicator Dot */}
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-red-600 shadow-lg shadow-red-500/50 flex items-center justify-center">
                        <span className="text-[10px]">👇</span>
                      </div>
                      {/* Label tooltip */}
                      <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white font-semibold text-[9px] px-2 py-0.5 rounded border border-white/10 whitespace-nowrap shadow-lg">
                        {activeStep.pointer.label}
                      </div>
                    </div>
                  </div>
                )}

              </div>
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
        <section className="w-full lg:col-span-5 flex flex-col gap-6">
          
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
                  {isPlaying ? activeStep.speechText : "¡Hola! Haz clic en el botón 'Iniciar Guía' o toca el Play para empezar el tutorial paso a paso por voz para empleados."}
                </p>
              </div>
            </div>
          </div>

          {/* STEPS TIMELINE CHECKLIST */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl w-full">
            <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              📋 Pasos de Preparación
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

          {/* TI Support Card */}
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-5 sm:p-6 text-center w-full">
            <h4 className="font-display font-bold text-sm sm:text-base text-white">¿Fallas o incidencias?</h4>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 mb-4 leading-relaxed">
              Puedes comunicarte directamente con el administrador de infraestructura tecnológica de la distribuidora.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="https://wa.me/59892265952"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
              >
                💬 Contactar Soporte TI (Facundo)
              </a>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
