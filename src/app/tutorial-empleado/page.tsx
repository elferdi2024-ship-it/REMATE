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
  videoStart: number; // in seconds
  videoEnd: number; // in seconds
  pointer?: { top: string; left: string; label: string };
}

const TUTORIAL_STEPS: Step[] = [
  {
    id: 1,
    title: "1. Inicio de Sesión",
    shortDesc: "Acceder al sistema",
    description: "Ingresa al panel administrativo usando tu correo y contraseña institucionales para acceder a los pedidos asignados.",
    speechText: "¡Hola, compañero de El Remate! Soy Marti, el martillito del logo. Hoy te enseñaré cómo usar el panel de gestión de pedidos. Primero, inicia sesión con tus credenciales de empleado.",
    videoStart: 0,
    videoEnd: 8.2,
    pointer: { top: "52%", left: "50%", label: "Ingresa tus datos" },
  },
  {
    id: 2,
    title: "2. Panel de Control",
    shortDesc: "Vista general de órdenes",
    description: "Visualiza la vista general de pedidos del día con contadores de ventas y estados no leídos en rojo.",
    speechText: "Este es tu panel principal. Verás las tarjetas de pedidos entrantes junto a estadísticas clave como pedidos pendientes, no leídos en rojo y el total de hoy.",
    videoStart: 8.5,
    videoEnd: 18.2,
    pointer: { top: "25%", left: "50%", label: "Estadísticas del Día" },
  },
  {
    id: 3,
    title: "3. Filtrar por Sucursal",
    shortDesc: "Focalizar en tu zona",
    description: "Selecciona tu sucursal (por ejemplo, Canelones) en la barra lateral para ver únicamente los pedidos de tu zona.",
    speechText: "Como empleado, solo debes gestionar las órdenes de tu sucursal. Usa el menú lateral de filtros para seleccionar tu local de trabajo, por ejemplo, Canelones.",
    videoStart: 18.5,
    videoEnd: 28.2,
    pointer: { top: "22%", left: "15%", label: "Filtro de Sucursales" },
  },
  {
    id: 4,
    title: "4. Recibir Pedidos",
    shortDesc: "Detectar nuevas compras",
    description: "Escucha la alerta sonora cuando ingresa un pedido. Verás la tarjeta del pedido en rojo de estado 'No Leído'.",
    speechText: "Cuando ingresa una orden nueva, el panel emite una alerta de sonido. Las nuevas tarjetas aparecen resaltadas en color rojo con el estado No Leído.",
    videoStart: 28.5,
    videoEnd: 38.2,
    pointer: { top: "45%", left: "45%", label: "Nuevo Pedido" },
  },
  {
    id: 5,
    title: "5. Empezar Preparación",
    shortDesc: "Iniciar empaque",
    description: "Haz clic en 'Preparar' en la tarjeta para indicar que estás recolectando los productos. El estado pasa a amarillo.",
    speechText: "Una vez verificado el stock de los productos, haz clic en el botón Empezar Preparación. El pedido pasará al estado Pendiente en color amarillo.",
    videoStart: 38.5,
    videoEnd: 48.2,
    pointer: { top: "78%", left: "45%", label: "Toca Preparar" },
  },
  {
    id: 6,
    title: "6. Impresión de Ticket",
    shortDesc: "Lista física de picking",
    description: "Haz clic en el botón de impresora para emitir el ticket térmico de preparación de 80mm y llevarlo al depósito.",
    speechText: "Usa la herramienta de Impresión de ticket para ticketeadoras térmicas de ochenta milímetros. Llévalo contigo al depósito para recolectar y empacar los artículos.",
    videoStart: 48.5,
    videoEnd: 58.2,
    pointer: { top: "78%", left: "82%", label: "Imprimir Ticket 80mm" },
  },
  {
    id: 7,
    title: "7. Completar Carga",
    shortDesc: "Archivar orden despachada",
    description: "Haz clic en 'Cargar' una vez empaquetado y cargado en el vehículo de reparto. Se archivará automáticamente.",
    speechText: "Cuando los productos estén embalados y cargados para el reparto o retiro, haz clic en Completar Carga. El pedido pasará a verde y se archivará del panel.",
    videoStart: 58.5,
    videoEnd: 68.5,
    pointer: { top: "78%", left: "55%", label: "Toca Completar Carga" },
  },
];

export default function EmployeeTutorialPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [supportedTTS, setSupportedTTS] = useState(true);

  // Synchronization references
  const currentStepIdxRef = useRef(currentStepIdx);
  const isSpeakingRef = useRef(isSpeaking);
  const isMutedRef = useRef(isMuted);
  const isPlayingRef = useRef(isPlaying);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Trigger step transition after speech ends or step finishes
  const transitionToNextStep = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      if (!isPlayingRef.current) return;
      const nextIdx = currentStepIdxRef.current + 1;
      if (nextIdx < TUTORIAL_STEPS.length) {
        handleStepSelect(nextIdx);
      } else {
        // End of tutorial
        setIsPlaying(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }
    }, 1200); // Natural pacing delay
  };

  // Called when speech narration finishes
  const handleSpeechEnd = () => {
    if (!isPlayingRef.current) return;

    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const currentStep = TUTORIAL_STEPS[currentStepIdxRef.current];

      // If the video reached the end of the step and was paused, trigger next step
      if (videoRef.current.paused || currentTime >= currentStep.videoEnd - 0.6) {
        transitionToNextStep();
      }
    }
  };

  // Handle video timeline checks (TimeUpdate)
  const handleTimeUpdate = () => {
    if (!videoRef.current || !isPlayingRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const currentStep = TUTORIAL_STEPS[currentStepIdxRef.current];

    // If we reach the end boundary of the step
    if (currentTime >= currentStep.videoEnd) {
      // 1. If voice is still speaking, pause the video and wait for speech to finish
      if (isSpeakingRef.current && !isMutedRef.current) {
        videoRef.current.pause();
      } else {
        // 2. If voice is already done or muted, pause and proceed to next step
        videoRef.current.pause();
        transitionToNextStep();
      }
    }
  };

  // Speak step text using Web Speech API
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Clear any scheduled transition timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Cancel current speaking immediately
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-UY";
    
    // Select Uruguayan, Argentine, or generic Spanish voice
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
      handleSpeechEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      handleSpeechEnd();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Handle Step Selection
  const handleStepSelect = (idx: number) => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setCurrentStepIdx(idx);
    const step = TUTORIAL_STEPS[idx];

    if (videoRef.current) {
      videoRef.current.currentTime = step.videoStart;
      if (isPlayingRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }

    // Narration
    if (isPlayingRef.current) {
      speakText(step.speechText);
    }
  };

  // Start Tutorial
  const startTutorial = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setIsPlaying(true);
    isPlayingRef.current = true;

    const step = TUTORIAL_STEPS[currentStepIdx];
    
    if (videoRef.current) {
      // If we are at the end, restart from the beginning
      if (videoRef.current.currentTime >= TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1].videoEnd - 0.5) {
        videoRef.current.currentTime = 0;
        setCurrentStepIdx(0);
        currentStepIdxRef.current = 0;
        speakText(TUTORIAL_STEPS[0].speechText);
      } else {
        videoRef.current.currentTime = step.videoStart;
        speakText(step.speechText);
      }
      videoRef.current.play().catch(() => {});
    }
  };

  // Pause Tutorial
  const pauseTutorial = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    if (videoRef.current) {
      videoRef.current.pause();
    }
    
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
    } else if (isPlaying) {
      speakText(TUTORIAL_STEPS[currentStepIdx].speechText);
    }
  };

  // Reset/Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
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

      {/* Main Layout: Responsive flex for mobile, grid for desktop */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-center lg:items-start">
        
        {/* MOBILE DIALOGUE PANEL: Shown first on mobile screen only */}
        <div className="w-full lg:hidden order-1">
          {/* Mascot Dialogue Bubble */}
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-xl flex items-start gap-4">
            <div className="relative flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center p-0.5">
              <Image
                src={getMascotSrc()}
                alt="Marti El Martillo"
                width={64}
                height={64}
                priority
                className={`object-contain transition-transform duration-200 ${isSpeaking && !isMuted ? "scale-105" : ""}`}
              />
              {isSpeaking && !isMuted && (
                <div className="absolute top-1 right-1 flex gap-0.5">
                  <span className="w-0.5 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-0.5 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="relative bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-neutral-200 shadow-md">
                <div className="absolute top-6 -left-2 w-4 h-4 bg-neutral-900 border-l border-b border-white/10 rotate-45" />
                <h4 className="font-display font-bold text-red-400 text-[10px] tracking-wider uppercase mb-1">
                  Marti — Asistente
                </h4>
                <p className="leading-relaxed text-xs font-medium text-neutral-100 select-none">
                  {isPlaying ? activeStep.speechText : "¡Hola! Toca 'Iniciar Guía' o dale al Play para empezar el tutorial por voz para empleados."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: Desktop Web Browser Mockup (Wide ratio instead of phone) */}
        <section className="w-full lg:col-span-7 flex flex-col items-center order-2 lg:order-none">
          <div className="relative w-full aspect-[16/10] bg-neutral-900 rounded-2xl shadow-2xl border border-white/15 overflow-hidden flex flex-col">
            {/* Browser Header Bar */}
            <div className="w-full h-8 sm:h-10 bg-neutral-800/90 border-b border-white/5 px-3 flex items-center gap-3">
              {/* Traffic light dots */}
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
              </div>
              {/* Mock Address Bar */}
              <div className="flex-1 max-w-md bg-neutral-950/50 border border-white/5 rounded-md px-3 py-0.5 sm:py-1 text-[8px] sm:text-xs text-neutral-400 font-mono truncate select-none text-center">
                https://admin.distribuidoraelremate.uy/pedidos
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className="relative w-full h-full bg-black overflow-hidden group">
              <video
                ref={videoRef}
                src="/simulacion_preparacion_empleado.webm"
                className="w-full h-full object-contain"
                playsInline
                muted
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Glowing Touch Pointer Overlay */}
              {isPlaying && activeStep.pointer && (
                <div
                  className="absolute z-20 pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    top: activeStep.pointer.top,
                    left: activeStep.pointer.left,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="relative">
                    {/* Ripple animation */}
                    <div className="absolute -inset-3 sm:-inset-4 rounded-full bg-red-500/40 animate-ping" />
                    {/* Visual dot */}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-red-600 shadow-lg shadow-red-500/50 flex items-center justify-center">
                      <span className="text-[8px] sm:text-[10px] font-bold text-white">👇</span>
                    </div>
                    {/* Touch label banner */}
                    <div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white font-semibold text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-white/10 whitespace-nowrap shadow-lg">
                      {activeStep.pointer.label}
                    </div>
                  </div>
                </div>
              )}

              {/* Central Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 p-6 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 flex items-center justify-center cursor-pointer shadow-lg shadow-red-600/30 transition-all hover:scale-105" onClick={startTutorial}>
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 fill-white translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base mt-4">¿Cómo preparar pedidos?</h3>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-2 max-w-[240px]">
                    Presiona el botón de Play para iniciar la guía explicada con voz para empleados.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Play Controls */}
          <div className="flex gap-4 mt-4">
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
        <section className="w-full lg:col-span-5 flex flex-col gap-6 order-3 lg:order-none">
          
          {/* DESKTOP DIALOGUE PANEL: Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex relative bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl items-start gap-5 w-full">
            <div className="relative flex-shrink-0 w-24 h-24 rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center p-1">
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
                    {isSpeaking ? "Narrando..." : "Pausa"}
                  </span>
                </div>
                
                <p className="leading-relaxed text-sm select-none font-medium text-neutral-100">
                  {isPlaying ? activeStep.speechText : "¡Hola! Haz clic en el botón 'Iniciar Guía' o toca el Play para empezar el tutorial paso a paso por voz para empleados."}
                </p>
              </div>
            </div>
          </div>

          {/* MOBILE STEP CAROUSEL: Compact slide controls for mobile viewports */}
          <div className="block lg:hidden bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-xl w-full">
            <div className="flex items-center justify-between gap-3 mb-3">
              <button
                onClick={() => currentStepIdx > 0 && handleStepSelect(currentStepIdx - 1)}
                disabled={currentStepIdx === 0}
                className="w-10 h-10 flex items-center justify-center bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-white/5 text-neutral-300 hover:text-white transition-all"
              >
                ◀️
              </button>
              <div className="text-center flex-1 min-w-0">
                <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">
                  Paso {activeStep.id} de {TUTORIAL_STEPS.length}
                </span>
                <h4 className="font-display font-bold text-sm text-white truncate">
                  {activeStep.title}
                </h4>
              </div>
              <button
                onClick={() => currentStepIdx < TUTORIAL_STEPS.length - 1 && handleStepSelect(currentStepIdx + 1)}
                disabled={currentStepIdx === TUTORIAL_STEPS.length - 1}
                className="w-10 h-10 flex items-center justify-center bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-white/5 text-neutral-300 hover:text-white transition-all"
              >
                ▶️
              </button>
            </div>
            
            <p className="text-xs text-neutral-300 text-center leading-relaxed px-3 py-2 bg-neutral-900/60 border border-white/5 rounded-xl min-h-[56px] flex items-center justify-center">
              {activeStep.description}
            </p>

            {/* Carousel Bullet Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {TUTORIAL_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStepSelect(idx)}
                  className={`h-1.5 rounded-full transition-all duration-350 ${
                    idx === currentStepIdx ? "bg-red-500 w-5" : "bg-neutral-800 w-1.5"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* DESKTOP STEPS TIMELINE: Shown only on large screens */}
          <div className="hidden lg:block bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl">
            <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              📋 Pasos de Preparación
            </h3>
            
            <div className="flex flex-col gap-3">
              {TUTORIAL_STEPS.map((step, idx) => {
                const isActive = idx === currentStepIdx;
                return (
                  <div
                    key={step.id}
                    onClick={() => handleStepSelect(idx)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-red-950/30 border-red-500/50 shadow-md"
                        : "bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isActive ? "bg-red-600 text-white" : "bg-neutral-800 text-neutral-400"
                    }`}>
                      {step.id}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className={`font-display font-bold text-sm ${isActive ? "text-red-400" : "text-white"}`}>
                          {step.title}
                        </h4>
                        <span className="text-[10px] text-neutral-400">
                          {step.videoStart}s - {step.videoEnd}s
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
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
