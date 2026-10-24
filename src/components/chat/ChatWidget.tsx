// filepath: src/components/chat/ChatWidget.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { haptic } from "@/lib/haptic";
import { construirLinkWhatsApp } from "@/lib/whatsapp";
import {
  formatChatMarkdown,
  localChatFallback,
  type ChatProductItem,
  type OrderCardData,
  type ChatApiResponse,
} from "@/lib/chat-engine";
import type { Producto } from "@/types";

interface MessageItem {
  id: string;
  role: "user" | "bot";
  text: string;
  products?: ChatProductItem[];
  orderCard?: OrderCardData;
  showHandoffForm?: boolean;
  isMultiList?: boolean;
  totalListApprox?: number;
  isWelcome?: boolean;
}

interface ChatWidgetProps {
  catalog?: Producto[];
  onOpenCart?: () => void;
}

const CHAT_SESSION_KEY = "elremate_chat_session_id";
const CHAT_HISTORY_KEY = "elremate_chat_history_v2";

/**
 * Ícono flotante estilo WhatsApp pero en el Rojo Institucional de El Remate Canelones (#EF233C)
 * Silueta de burbuja de chat universalmente reconocida con puntos sutiles
 */
function WhatsAppStyleRedIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Silueta de burbuja de conversación idéntica en proporción al botón de WhatsApp */}
      <path
        d="M12 2C6.477 2 2 6.477 2 12C2 13.82 2.487 15.526 3.336 16.993L2.087 21.365C1.968 21.782 2.348 22.162 2.765 22.043L7.137 20.794C8.584 21.603 10.246 22.06 12 22.06C17.523 22.06 22 17.583 22 12.06C22 6.537 17.523 2 12 2Z"
        fill="white"
      />
      {/* Tres puntos de diálogo en el color rojo insignia */}
      <circle cx="8" cy="12" r="1.3" fill="#D90429" />
      <circle cx="12" cy="12" r="1.3" fill="#D90429" />
      <circle cx="16" cy="12" r="1.3" fill="#D90429" />
    </svg>
  );
}

/**
 * Ícono para el Header interior del Chat
 */
function ElRemateChatIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 11.5C21.003 9.4 19.8 7.5 18 6.4C16.1 5.3 13.8 5.1 11.8 5.8C9.7 6.6 8.2 8.4 7.7 10.6C7.2 12.8 7.9 15.1 9.4 16.7C10.1 17.4 11 17.9 12 18.2L11 21L15.2 19.4C16.9 19.1 18.5 18.2 19.6 16.8C20.5 15.3 21 13.4 21 11.5Z"
        fill="currentColor"
        fillOpacity="0.22"
      />
      <path
        d="M3 4H5.2L6.8 13.2C6.9 13.9 7.5 14.5 8.3 14.5H16.2C16.9 14.5 17.6 14 17.8 13.3L19.2 8H6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="17.5" r="1.3" fill="currentColor" />
      <circle cx="16" cy="17.5" r="1.3" fill="currentColor" />
      <path
        d="M14.5 3L15.3 4.7L17 5.5L15.3 6.3L14.5 8L13.7 6.3L12 5.5L13.7 4.7L14.5 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ChatWidget({ catalog = [], onOpenCart }: ChatWidgetProps) {
  const { items, total, setItemQty } = useCart();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "🛒 Ejemplo de lista",
    "🏷️ Ofertas y Mayorista",
    "📦 Rastrear pedido",
    "🛵 Horarios y envíos",
    "💬 Hablar con asesor",
  ]);

  const [handoffSubmitting, setHandoffSubmitting] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastScrolledMsgIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generar o recuperar sessionId
  const getSessionId = useCallback(() => {
    if (typeof window === "undefined") return "web_default";
    let sid = localStorage.getItem(CHAT_SESSION_KEY);
    if (!sid) {
      sid = `web_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      try {
        localStorage.setItem(CHAT_SESSION_KEY, sid);
      } catch {}
    }
    return sid;
  }, []);

  // Inicializar conversación
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {}

    const welcomeMsg: MessageItem = {
      id: "welcome_0",
      role: "bot",
      text: "¡Hola! 👋 ¿En qué podemos ayudarte hoy en **El Remate Canelones**?\n\nPodés escribir acá abajo tu lista para armar tu pedido al instante o consultarnos cualquier duda sobre precios mayoristas, stock y envíos:",
      isWelcome: true,
    };
    setMessages([welcomeMsg]);
  }, []);

  // Bloqueo de scroll en body mientras el chat móvil está abierto
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) {
      document.body.classList.add("chat-widget-open");
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("chat-widget-open");
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Guardar mensajes en localStorage
  useEffect(() => {
    if (typeof window === "undefined" || messages.length === 0) return;
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-25)));
    } catch {}
  }, [messages]);

  // Scroll inteligente: cuando responde el bot, alinear al INICIO de su mensaje para leer desde arriba
  useEffect(() => {
    if (!isOpen) return;
    const container = messagesContainerRef.current;
    if (!container) return;

    // Si está cargando respuesta (usuario acaba de enviar), mostrar el indicador de escritura abajo
    if (loading) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
      return;
    }

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    // Evitar re-scrollear si el usuario solo ajustó cantidades (+ / -) dentro de una tarjeta
    if (lastScrolledMsgIdRef.current === lastMsg.id) return;
    lastScrolledMsgIdRef.current = lastMsg.id;

    requestAnimationFrame(() => {
      if (!messagesContainerRef.current) return;
      if (lastMsg.role === "bot") {
        const msgEl = messagesContainerRef.current.querySelector(
          `[data-msg-id="${lastMsg.id}"]`
        ) as HTMLElement | null;
        if (msgEl) {
          messagesContainerRef.current.scrollTo({
            top: Math.max(0, msgEl.offsetTop - 12),
            behavior: "smooth",
          });
          return;
        }
      }
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, isOpen, loading]);

  // Manejar foco en input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Alternar apertura
  const handleToggle = useCallback((open?: boolean) => {
    setIsOpen((prev) => {
      const next = typeof open === "boolean" ? open : !prev;
      if (next) {
        haptic.selection();
      }
      return next;
    });
  }, []);

  // Limpiar conversación
  const handleReset = useCallback(() => {
    haptic.impact();
    try {
      localStorage.removeItem(CHAT_SESSION_KEY);
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch {}
    const welcomeMsg: MessageItem = {
      id: `welcome_${Date.now()}`,
      role: "bot",
      text: "¡Hola! 👋 ¿En qué podemos ayudarte hoy en **El Remate Canelones**?\n\nPodés escribir acá abajo tu lista para armar tu pedido al instante o consultarnos cualquier duda sobre precios mayoristas, stock y envíos:",
      isWelcome: true,
    };
    setMessages([welcomeMsg]);
    setSuggestions([
      "🛒 Ejemplo de lista",
      "🏷️ Ofertas y Mayorista",
      "📦 Rastrear pedido",
      "🛵 Horarios y envíos",
      "💬 Hablar con asesor",
    ]);
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || loading) return;

      haptic.add();
      setInputValue("");

      let queryToSend = text;
      if (
        text.startsWith("🛒 Lista rápida:") ||
        text.startsWith("🛒 Ejemplo") ||
        text.startsWith("🛒 Probar:")
      ) {
        queryToSend = "2 yerba canarias 1kg, 1 aceite optimo, 2 leche";
      } else if (text.includes("Rastrear pedido") || text.includes("Rastrear mi pedido")) {
        const lastCode = typeof window !== "undefined" ? localStorage.getItem("elremate_last_order_code") : "";
        if (lastCode) {
          queryToSend = lastCode;
        } else {
          const userMsg: MessageItem = {
            id: `usr_${Date.now()}`,
            role: "user",
            text: "Rastrear mi pedido",
          };
          const promptMsg: MessageItem = {
            id: `bot_${Date.now() + 1}`,
            role: "bot",
            text: "📦 Escribí acá abajo el código de tu pedido (por ejemplo: **CN-1042**) y te muestro en qué etapa está en tiempo real.",
          };
          setMessages((prev) => [...prev, userMsg, promptMsg]);
          inputRef.current?.focus();
          return;
        }
      } else if (text === "🛒 Ver mi carrito completo") {
        setIsOpen(false);
        onOpenCart?.();
        return;
      } else {
        queryToSend = text.replace(/^[📦🛒🏷️🛵💬]+\s*/, "").trim();
      }

      const userMsg: MessageItem = {
        id: `usr_${Date.now()}`,
        role: "user",
        text: queryToSend,
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const cartSnapshot = items.map((i) => ({
        codigo: i.codigo,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: i.precio,
      }));

      const conversationHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      let apiData: ChatApiResponse | null = null;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: queryToSend,
            sessionId: getSessionId(),
            customerName: typeof window !== "undefined" ? localStorage.getItem("elremate_cust_name") : undefined,
            cartItems: cartSnapshot,
            history: conversationHistory,
          }),
        });
        if (res.ok) {
          apiData = (await res.json()) as ChatApiResponse;
        }
      } catch (err) {
        console.warn("Fallo conectando a /api/chat, utilizando motor local:", err);
      }

      if (!apiData) {
        apiData = localChatFallback(queryToSend, catalog);
      }

      const botMsg: MessageItem = {
        id: `bot_${Date.now()}`,
        role: "bot",
        text: apiData.reply || "Disculpá, no pude procesar la consulta.",
        products: apiData.products,
        orderCard: apiData.orderCard,
        showHandoffForm: apiData.showHandoffForm,
        isMultiList: apiData.isMultiList,
        totalListApprox: apiData.totalListApprox,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (Array.isArray(apiData.suggestions) && apiData.suggestions.length > 0) {
        setSuggestions(apiData.suggestions);
      }
      setLoading(false);
    },
    [loading, items, messages, catalog, getSessionId, onOpenCart]
  );

  // Agregar producto individual al carrito
  const handleAddProduct = useCallback(
    (product: ChatProductItem) => {
      haptic.success();
      const existing = items.find((i) => i.codigo === product.codigo);
      const newQty = (existing?.cantidad || 0) + product.cantidadSugerida;

      setItemQty(
        {
          codigo: product.codigo,
          nombre: product.nombre,
          precio: product.precio,
          escalaPrecios: product.escalaPrecios,
        },
        newQty
      );

      toast.success(`✓ Agregado: ${product.cantidadSugerida}× ${product.nombre}`);
    },
    [items, setItemQty, toast]
  );

  // Agregar todos los productos de la lista
  const handleAddAllProducts = useCallback(
    (productList: ChatProductItem[]) => {
      haptic.success();
      let count = 0;
      for (const prod of productList) {
        const existing = items.find((i) => i.codigo === prod.codigo);
        const newQty = (existing?.cantidad || 0) + prod.cantidadSugerida;
        setItemQty(
          {
            codigo: prod.codigo,
            nombre: prod.nombre,
            precio: prod.precio,
            escalaPrecios: prod.escalaPrecios,
          },
          newQty
        );
        count++;
      }
      toast.success(`🎉 ¡${count} productos sumados a tu pedido!`);
      setSuggestions(["🛒 Ver mi carrito completo", "🏷️ Ofertas y Mayorista", "💬 Hablar con asesor"]);
    },
    [items, setItemQty, toast]
  );

  // Enviar formulario de derivación a asesor
  const handleHandoffSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !phone) {
        toast.error("Completá tu nombre y teléfono");
        return;
      }

      setHandoffSubmitting(true);
      haptic.selection();

      try {
        localStorage.setItem("elremate_cust_name", name);
        localStorage.setItem("elremate_cust_phone", phone);
      } catch {}

      try {
        const res = await fetch("/api/chat/handoff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            message,
            sessionId: getSessionId(),
            cartItems: items,
            totalApprox: total,
          }),
        });
        const data = await res.json().catch(() => ({}));

        const botReply: MessageItem = {
          id: `bot_handoff_${Date.now()}`,
          role: "bot",
          text:
            data.reply ||
            `¡Muchas gracias **${name}**! Ya registramos tu consulta. Un asesor de El Remate Canelones se comunicará contigo al ${phone}.`,
        };
        setMessages((prev) => [...prev, botReply]);
      } catch {
        toast.error("Error al registrar consulta, abriendo WhatsApp…");
      } finally {
        setHandoffSubmitting(false);
      }

      const waText = `¡Hola El Remate Canelones! Soy ${name} (${phone}). ${
        message ? `\nConsulta: ${message}` : ""
      }${items.length > 0 ? `\nTengo ${items.length} productos en mi carrito por $${total.toLocaleString("es-UY")}.` : ""}`;
      const waUrl = construirLinkWhatsApp("59894611400", waText);
      window.open(waUrl, "_blank", "noopener");
    },
    [items, total, getSessionId, toast]
  );

  // ── Cálculo dinámico de posición del FAB móvil para no colisionar ──
  // Si hay carrito: queda flotando sobre la barra roja FloatCartBtn (130px)
  // Si no hay carrito: queda flotando sobre BottomNavBar (74px)
  const fabBottomStyle = items.length > 0
    ? "bottom-[calc(130px+env(safe-area-inset-bottom,8px))] sm:bottom-7"
    : "bottom-[calc(74px+env(safe-area-inset-bottom,8px))] sm:bottom-7";

  return (
    <>
      {/* ── Botón Flotante Redondo Asistente (FAB) — Estilo WhatsApp pero en Rojo Institucional (#EF233C) ── */}
      <div
        className={`fixed z-40 transition-all duration-300 ${
          isOpen ? "opacity-0 pointer-events-none translate-y-4 scale-90" : "opacity-100 translate-y-0 scale-100"
        } right-4 sm:right-6 ${fabBottomStyle}`}
      >
        <button
          type="button"
          onClick={() => handleToggle(true)}
          aria-label="Abrir Asistente de Ventas El Remate Canelones"
          className="group relative flex items-center justify-center w-14 h-14 sm:w-[58px] sm:h-[58px] rounded-full bg-gradient-to-tr from-[#B8001F] via-[#D90429] to-[#EF233C] text-white shadow-[0_8px_24px_rgba(239,35,60,0.48)] hover:shadow-[0_12px_32px_rgba(239,35,60,0.65)] hover:scale-108 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {/* Pulso sutil de atención estilo WhatsApp */}
          <span className="absolute inset-0 rounded-full bg-[#EF233C] animate-ping opacity-20 pointer-events-none" />

          {/* Ícono de burbuja de conversación blanca con puntos rojos reconocible al instante */}
          <WhatsAppStyleRedIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-xs transition-transform duration-200 group-hover:scale-105" />

          {/* Badge delicado con conteo de carrito o notificación */}
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[21px] h-[21px] px-1 rounded-full bg-white text-[#D90429] text-[11px] font-black flex items-center justify-center shadow-md border border-[#EF233C]/20 ring-2 ring-[#EF233C]">
              {items.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Backdrop en Mobile y Desktop (z-[999] por encima de toda barra de navegación y carrito flotante) ── */}
      {isOpen && (
        <div
          onClick={() => handleToggle(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[999] transition-opacity duration-200"
        />
      )}

      {/* ── Ventana del Chatbot Concierge (z-[1000] SIEMPRE AL FRENTE) ── */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="Atención y Pedidos El Remate Canelones"
          className="fixed z-[1000] inset-x-0 bottom-0 h-[92dvh] max-h-[92dvh] sm:h-[640px] sm:max-h-[calc(100dvh-48px)] sm:w-[430px] sm:max-w-[calc(100vw-32px)] sm:right-6 sm:bottom-6 sm:inset-x-auto rounded-t-[26px] sm:rounded-[26px] flex flex-col overflow-hidden bg-[#FAF8F5] border border-slate-200/90 shadow-[0_-16px_50px_rgba(15,23,42,0.4)] animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Manija táctil en Mobile para cerrar o deslizar */}
          <button
            type="button"
            onClick={() => handleToggle(false)}
            aria-label="Minimizar chat"
            className="flex sm:hidden justify-center items-center py-2.5 bg-gradient-to-r from-[#0B0F19] to-[#151D2A] cursor-pointer w-full group border-b border-white/5"
          >
            <span className="w-12 h-1.5 rounded-full bg-white/30 group-hover:bg-white/50 transition-colors" />
          </button>

          {/* ── Header Exclusivo Canelones (Obsidian + Crimson Glow) ── */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#0B0F19] via-[#151D2A] to-[#1E293B] text-white border-b border-[#EF233C]/30 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF233C]/25 to-[#EF233C]/10 border border-[#EF233C]/40 flex items-center justify-center text-[#EF233C] shrink-0 shadow-inner">
                <ElRemateChatIcon className="w-5 h-5 text-[#EF233C]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#EF233C] border-2 border-[#0B0F19]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold tracking-tight truncate text-white">
                    El Remate Canelones
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#EF233C]/20 text-[#FF8596] border border-[#EF233C]/35 text-[9px] font-black uppercase tracking-wider shrink-0">
                    En Línea
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-300 truncate">
                  Atención y Pedidos · {catalog.length > 0 ? `${catalog.length.toLocaleString("es-UY")} productos` : "Canelones Mayorista"}
                </p>
              </div>
            </div>

            {/* Acciones del Header */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={construirLinkWhatsApp("59894611400", "¡Hola El Remate Canelones! Tengo una consulta sobre el catálogo mayorista.")}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir en WhatsApp"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-extrabold shadow-sm transition-transform active:scale-95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleReset}
                title="Reiniciar chat"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleToggle(false)}
                title="Cerrar chat"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Barra Viva del Carrito en el Chat ── */}
          {items.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-[#FFF1F2] border-b border-[#FECDD3] shrink-0">
              <div className="flex items-center gap-2 min-w-0 truncate text-[12px] font-extrabold text-[#9F1239]">
                <span className="w-2 h-2 rounded-full bg-[#EF233C] shrink-0 animate-ping" />
                <span className="truncate">
                  {items.length === 1 ? "1 producto" : `${items.length} productos`} en tu pedido · ${total.toLocaleString("es-UY")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenCart?.();
                }}
                className="px-2.5 py-1 rounded-md bg-[#EF233C] hover:bg-[#D90429] text-white text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                Ver carrito →
              </button>
            </div>
          )}

          {/* ── Área de Mensajes (Con scroll suave y layout amplio) ── */}
          <div
            ref={messagesContainerRef}
            className="relative flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[radial-gradient(circle_at_top_right,rgba(239,35,60,0.05),transparent_55%),#FAF8F5]"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                data-msg-id={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[92%] px-3.5 py-2.5 rounded-[15px] text-[13.5px] leading-relaxed break-words shadow-xs ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#99001A] text-white rounded-br-[4px] font-medium"
                      : "bg-white text-[#0F172A] border border-[#E2E8F0] rounded-bl-[4px]"
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatChatMarkdown(m.text),
                    }}
                  />

                  {/* Bento Grid 2x2 en el mensaje de Bienvenida */}
                  {m.isWelcome && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-1">
                      <button
                        type="button"
                        onClick={() => sendMessage("🛒 Ejemplo de lista")}
                        className="flex flex-col items-start p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FFF5F5] border border-[#E2E8F0] hover:border-[#EF233C] text-left transition-all cursor-pointer group active:scale-95 shadow-xs"
                      >
                        <span className="text-base leading-none mb-1">🛒</span>
                        <b className="text-[12px] font-extrabold text-[#0F172A] group-hover:text-[#EF233C]">
                          Armar lista rápida
                        </b>
                        <small className="text-[10.5px] text-[#64748B] font-medium leading-tight">
                          &ldquo;2 yerba, 1 aceite, 3 leches&rdquo;
                        </small>
                      </button>

                      <button
                        type="button"
                        onClick={() => sendMessage("🏷️ Ofertas y Mayorista")}
                        className="flex flex-col items-start p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FFF5F5] border border-[#E2E8F0] hover:border-[#EF233C] text-left transition-all cursor-pointer group active:scale-95 shadow-xs"
                      >
                        <span className="text-base leading-none mb-1">🏷️</span>
                        <b className="text-[12px] font-extrabold text-[#0F172A] group-hover:text-[#EF233C]">
                          Ofertas y Mayorista
                        </b>
                        <small className="text-[10.5px] text-[#64748B] font-medium leading-tight">
                          Descuentos por bulto y escala
                        </small>
                      </button>

                      <button
                        type="button"
                        onClick={() => sendMessage("📦 Rastrear pedido")}
                        className="flex flex-col items-start p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FFF5F5] border border-[#E2E8F0] hover:border-[#EF233C] text-left transition-all cursor-pointer group active:scale-95 shadow-xs"
                      >
                        <span className="text-base leading-none mb-1">📦</span>
                        <b className="text-[12px] font-extrabold text-[#0F172A] group-hover:text-[#EF233C]">
                          Rastrear mi pedido
                        </b>
                        <small className="text-[10.5px] text-[#64748B] font-medium leading-tight">
                          Estado con código CN-XXXX
                        </small>
                      </button>

                      <button
                        type="button"
                        onClick={() => sendMessage("💬 Hablar con asesor")}
                        className="flex flex-col items-start p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FFF5F5] border border-[#E2E8F0] hover:border-[#EF233C] text-left transition-all cursor-pointer group active:scale-95 shadow-xs"
                      >
                        <span className="text-base leading-none mb-1">💬</span>
                        <b className="text-[12px] font-extrabold text-[#0F172A] group-hover:text-[#EF233C]">
                          Hablar con asesor
                        </b>
                        <small className="text-[10.5px] text-[#64748B] font-medium leading-tight">
                          Atención personalizada
                        </small>
                      </button>
                    </div>
                  )}

                  {/* ── Tarjetas Interactivas de Productos en Chat ── */}
                  {Array.isArray(m.products) && m.products.length > 0 && (
                    <div className="flex flex-col gap-2 mt-3 pt-1">
                      {m.products.map((prod) => {
                        const inCartItem = items.find((i) => i.codigo === prod.codigo);
                        return (
                          <div
                            key={prod.codigo}
                            className="flex items-center justify-between gap-2 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#EF233C]/50 rounded-xl transition-all shadow-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <b className="block text-[12.5px] font-extrabold text-[#0F172A] leading-tight truncate">
                                {prod.nombre}
                              </b>
                              <div className="text-[11.5px] text-[#64748B] font-semibold mt-0.5">
                                {prod.cantidadSugerida > 1 && `${prod.cantidadSugerida}× `}$
                                {prod.precioUnitarioAplicado.toLocaleString("es-UY")} c/u
                                {prod.ahorroTotal > 0 && (
                                  <span className="text-[#EF233C] font-bold ml-1">
                                    · Ahorrás ${prod.ahorroTotal.toLocaleString("es-UY")}
                                  </span>
                                )}
                              </div>
                              {prod.escalaPrecios && prod.escalaPrecios.length > 0 && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-extrabold">
                                  Mayorista desde {prod.escalaPrecios[0].minCantidad} u: $
                                  {prod.escalaPrecios[0].precioUnitario}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddProduct(prod)}
                              className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold shrink-0 transition-transform active:scale-95 cursor-pointer ${
                                inCartItem
                                  ? "bg-[#0F172A] text-white"
                                  : "bg-[#EF233C] hover:bg-[#D90429] text-white shadow-xs"
                              }`}
                            >
                              {inCartItem ? `✓ En pedido (${inCartItem.cantidad})` : `+ Sumar ${prod.cantidadSugerida > 1 ? `(${prod.cantidadSugerida})` : ""}`}
                            </button>
                          </div>
                        );
                      })}

                      {/* Botón Masivo "Sumar todos al pedido" */}
                      {m.isMultiList && m.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddAllProducts(m.products!)}
                          className="w-full mt-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#EF233C] via-[#D90429] to-[#B8001F] hover:from-[#D90429] hover:to-[#99001A] text-white text-[13px] font-extrabold shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer"
                        >
                          <span>🛒</span>
                          <span>
                            Sumar los {m.products.length} productos al pedido ($
                            {(m.totalListApprox || 0).toLocaleString("es-UY")})
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* ── Tarjeta de Seguimiento de Pedido ── */}
                  {m.orderCard && (
                    <div className="mt-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl shadow-xs">
                      <div className="flex items-center justify-between gap-2 pb-1.5">
                        <strong className="text-[13px] font-extrabold text-[#0F172A]">
                          📦 Pedido {m.orderCard.publicCode}
                        </strong>
                        <span className="text-[12px] font-black text-[#EF233C]">
                          ${m.orderCard.totalApprox.toLocaleString("es-UY")}
                        </span>
                      </div>

                      {/* Barra de progreso de 4 etapas */}
                      <div className="grid grid-cols-4 gap-1.5 my-2">
                        {["PENDING", "PREPARING", "OUT_DELIVERY", "DELIVERED"].map((stKey, idx) => {
                          const currentStep =
                            m.orderCard!.status === "DELIVERED" || m.orderCard!.status === "COMPLETED"
                              ? 3
                              : m.orderCard!.status === "OUT_DELIVERY" || m.orderCard!.status === "READY"
                              ? 2
                              : m.orderCard!.status === "PREPARING" || m.orderCard!.status === "CONFIRMED"
                              ? 1
                              : 0;
                          const isActive = idx <= currentStep;
                          return (
                            <div
                              key={stKey}
                              className={`h-1.5 rounded-full ${
                                isActive ? "bg-[#EF233C]" : "bg-[#E2E8F0]"
                              }`}
                            />
                          );
                        })}
                      </div>

                      <div className="text-[12px] font-bold text-[#0F172A] mb-2">
                        {m.orderCard.statusLabel}
                      </div>

                      {Array.isArray(m.orderCard.items) && m.orderCard.items.length > 0 && (
                        <div className="text-[11.5px] text-[#64748B] space-y-0.5 mb-2.5">
                          {m.orderCard.items.slice(0, 3).map((it, i) => (
                            <div key={i}>• {it.quantity}× {it.name}</div>
                          ))}
                        </div>
                      )}

                      <a
                        href={construirLinkWhatsApp(
                          "59894611400",
                          `¡Hola El Remate Canelones! Consulto por el estado de mi pedido ${m.orderCard.publicCode}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 rounded-lg bg-[#EF233C] hover:bg-[#D90429] text-white text-center text-[12px] font-extrabold transition-colors shadow-xs"
                      >
                        Consultar en WhatsApp
                      </a>
                    </div>
                  )}

                  {/* ── Formulario de Derivación a Asesor Comercial ── */}
                  {m.showHandoffForm && (
                    <form
                      onSubmit={handleHandoffSubmit}
                      className="mt-3 p-3 bg-[#FFF5F5] border border-[#FECDD3] rounded-xl flex flex-col gap-2"
                    >
                      <strong className="text-[12px] font-extrabold text-[#0F172A]">
                        📲 Atención con un Asesor Comercial Canelones
                      </strong>
                      <input
                        type="text"
                        name="name"
                        placeholder="Tu nombre o comercio *"
                        required
                        defaultValue={typeof window !== "undefined" ? localStorage.getItem("elremate_cust_name") || "" : ""}
                        className="w-full px-3 py-2 text-[16px] sm:text-[13px] bg-white border border-[#E2E8F0] rounded-lg focus:outline-[#EF233C]"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Tu WhatsApp (ej: 099 123 456) *"
                        required
                        defaultValue={typeof window !== "undefined" ? localStorage.getItem("elremate_cust_phone") || "" : ""}
                        className="w-full px-3 py-2 text-[16px] sm:text-[13px] bg-white border border-[#E2E8F0] rounded-lg focus:outline-[#EF233C]"
                      />
                      <textarea
                        name="message"
                        rows={2}
                        placeholder="Contanos tu consulta o pedido mayorista…"
                        className="w-full px-3 py-2 text-[16px] sm:text-[13px] bg-white border border-[#E2E8F0] rounded-lg focus:outline-[#EF233C]"
                      />
                      <button
                        type="submit"
                        disabled={handoffSubmitting}
                        className="w-full py-2.5 px-3 rounded-lg bg-[#EF233C] hover:bg-[#D90429] text-white text-[13px] font-extrabold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {handoffSubmitting ? "Enviando…" : "📨 Enviar y Avisar a un Asesor"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="px-3.5 py-2.5 rounded-[15px] bg-white text-[#64748B] text-[13px] italic border border-[#E2E8F0] flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#EF233C] animate-ping" />
                  <span>Consultando catálogo y stock de Canelones…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Chips Rápidos Carousel ── */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F1F5F9] border-t border-[#E2E8F0] overflow-x-auto no-scrollbar shrink-0">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(chip)}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-[#0F172A] hover:text-white border border-[#CBD5E1] text-[#0F172A] text-[12px] font-bold whitespace-nowrap shadow-xs transition-colors shrink-0 cursor-pointer active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* ── Barra de Entrada de Mensaje (Accesible, visible y protegida con Safe Area) ── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="relative z-10 flex items-center gap-2 p-2.5 sm:p-3 bg-white border-t border-[#E2E8F0] shrink-0 pb-[calc(env(safe-area-inset-bottom,12px)+8px)]"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribí un producto, tu lista o código CN-..."
              maxLength={400}
              autoComplete="off"
              autoCorrect="off"
              enterKeyHint="send"
              style={{ fontSize: "16px" }}
              className="flex-1 min-w-0 px-3.5 py-2.5 sm:text-[13.5px] bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] focus:border-[#EF233C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF233C]/10 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              aria-label="Enviar mensaje"
              className="w-10 h-10 rounded-xl bg-[#EF233C] hover:bg-[#D90429] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer shrink-0 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
