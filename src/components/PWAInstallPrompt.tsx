"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/lib/toast-context";
import Image from "next/image";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOSInstall, setIsIOSInstall] = useState(false);
  const { info } = useToast();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) return;

    const ua = window.navigator.userAgent;
    const isTouchMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || isTouchMac;
    setIsIOSInstall(isIOS);

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);

      const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIOS) {
      const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        const timer = window.setTimeout(() => setShowPrompt(true), 4000);
        return () => {
          window.clearTimeout(timer);
          window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
      return;
    }

    info("En iPhone: Safari > Compartir > Agregar a pantalla de inicio.");
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:transition-none">
      <div className="bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 border border-white/30 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner relative">
          <Image src="/icon-512x512.png" alt="App icon" fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-extrabold text-gray-900 leading-tight">Instalar App</h4>
          <p className="text-[12px] text-gray-600 font-semibold truncate">
            {isIOSInstall ? "Abrila desde tu inicio en iPhone" : "Version nativa, rapida y estable"}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-[12px] font-bold text-gray-500 hover:text-gray-700 active:scale-90 transition-all"
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
