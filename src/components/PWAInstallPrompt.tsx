"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/lib/toast-context";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

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
      toast.info("Para instalar: Pulsa el icono de compartir y luego 'Agregar a la pantalla de inicio'");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img src="/icon-512x512.png" alt="App Icon" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900">Instalar El Remate</h4>
          <p className="text-xs text-gray-500">Acceso rápido y mejor experiencia</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDismiss}
            className="px-3 py-2 text-xs font-medium text-gray-400 hover:text-gray-600"
          >
            Ahora no
          </button>
          <button 
            onClick={handleInstall}
            className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
