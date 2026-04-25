"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/lib/toast-context";
import Image from "next/image";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { info } = useToast();

  useEffect(() => {
    // 1. Detectar si ya está instalada (Standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
                         || (window.navigator as any).standalone 
                         || document.referrer.includes("android-app://");

    if (isStandalone) return;

    // 2. Manejar evento de instalación en Android/Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Solo mostramos si no se ha mostrado en esta sesión
      const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. Detectar iOS (Safari no soporta beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone) {
      const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        // En iOS mostramos el aviso después de unos segundos
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } else {
      // Caso iOS o manual
      info("Para instalar: Pulsa el icono de compartir y luego 'Agregar a la pantalla de inicio'");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 border border-white/20 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner relative">
          <Image 
            src="/icon-512x512.png" 
            alt="App Icon" 
            fill
            className="object-cover" 
          />
        </div>
        <div className="flex-1">
          <h4 className="text-[15px] font-extrabold text-gray-900 leading-tight">Instalar App</h4>
          <p className="text-[12px] text-gray-500 font-medium">Experiencia nativa y fluida</p>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={handleDismiss}
            className="px-3 py-2 text-[12px] font-bold text-gray-400 hover:text-gray-600 active:scale-90 transition-all"
          >
            Ahora no
          </button>
          <button 
            onClick={handleInstall}
            className="px-5 py-2 text-[13px] font-black bg-red-600 text-white rounded-xl shadow-[0_10px_20px_rgba(220,38,38,0.3)] active:scale-95 transition-all hover:bg-red-700"
          >
            INSTALAR
          </button>
        </div>
      </div>
    </div>
  );
}
