// filepath: src/components/chat/ChatWidget.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { haptic } from "@/lib/haptic";
import { construirLinkWhatsApp } from "@/lib/whatsapp";
import {
  cleanEncoding,
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

export default function ChatWidget({ catalog = [], onOpenCart }: ChatWidgetProps) {
  const { items, total, addItem, setItemQty } = useCart();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

    // Mensaje de bienvenida inicial si no hay historial
    const welcomeMsg: MessageItem = {
      id: "welcome_0",
      role: "bot",
      text: "¡Hola! 👋 ¿En qué podemos ayudarte hoy?\n\nPodés escribir acá abajo tu lista para armar tu pedido al instante o consultarnos cualquier duda sobre precios, stock y envíos:",
      isWelcome: true,
    };
    setMessages([welcomeMsg]);
  }, []);

  // Guardar mensajes
  useEffect(() => {
    if (typeof window === "undefined" || messages.length === 0) return;
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.slice(-25)));
    } catch {}
  }, [messages]);

  // Scroll al final al recibir mensajes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Manejar foco al abrir
  useEffect(() => {
    if (isOpen && window.innerWidth > 640) {
      setTimeout(() => inputRef.current?.focus(), 150);
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
      text: "¡Hola! 👋 ¿En qué podemos ayudarte hoy?\n\nPodés escribir acá abajo tu lista para armar tu pedido al instante o consultarnos cualquier duda sobre precios, stock y envíos:",
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

      // ── Acciones rápidas predefinidas ──
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

      // Fallback local ultraveloz si la API no respondió
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

      // Link directo a WhatsApp con resumen
      const waText = `¡Hola El Remate Canelones! Soy ${name} (${phone}). ${
        message ? `\nConsulta: ${message}` : ""
      }${items.length > 0 ? `\nTengo ${items.length} productos en mi carrito por $${total.toLocaleString("es-UY")}.` : ""}`;
      const waUrl = construirLinkWhatsApp("59894611400", waText);
      window.open(waUrl, "_blank", "noopener");
    },
    [items, total, getSessionId, toast]
  );

  return (
    <>
      {/* ── Botón Flotante Asistente (FAB) ── */}
      <div
        className={`fixed z-40 transition-all duration-300 ${
          isOpen ? "opacity-0 pointer-events-none translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"
        } right-4 sm:right-6 bottom-[calc(1.2rem+env(safe-area-inset-bottom))]`}
      >
        <button
          type="button"
          onClick={() => handleToggle(true)}
          aria-label="Abrir Asistente y Pedidos El Remate"
          className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-br from-[#0F1E15] via-[#173824] to-[#1FA855] text-white shadow-[0_12px_32px_rgba(10,28,17,0.38)] border border-emerald-400/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="relative w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-300/40 flex items-center justify-center text-emerald-300">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
              <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#122419] animate-pulse" />
          </div>

          <div className="flex flex-col items-start text-left leading-tight pr-1">
            <span className="text-[13px] font-extrabold tracking-tight text-white flex items-center gap-1.5">
              El Remate <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">IA</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-200/90 hidden sm:inline">
              Atención y Pedidos en vivo
            </span>
          </div>

          {items.length > 0 && (
            <span className="ml-0.5 px-2 py-0.5 rounded-full bg-emerald-400 text-[#0F1E15] text-[10.5px] font-black shadow-xs">
              {items.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Backdrop en Mobile ── */}
      {isOpen && (
        <div
          onClick={() => handleToggle(false)}
          className="fixed inset-0 bg-[#0C1610]/50 backdrop-blur-xs z-50 transition-opacity duration-200 sm:hidden"
        />
      )}

      {/* ── Ventana del Chatbot Concierge ── */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="Atención y Pedidos El Remate Canelones"
          className="fixed z-50 flex flex-col overflow-hidden bg-[#F9F7F1] border border-[#DCD8CC] shadow-[0_24px_64px_rgba(10,24,15,0.34)] sm:rounded-[22px] sm:right-5 sm:bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:w-[420px] sm:max-w-[calc(100vw-28px)] sm:h-[620px] sm:max-h-[calc(100dvh-100px)] inset-x-0 bottom-0 h-[88dvh] max-h-[680px] rounded-t-[24px] border-b-0 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Manija táctil en Mobile */}
          <div className="flex sm:hidden justify-center items-center py-2 bg-[#122118]">
            <span className="w-10 h-1 rounded-full bg-white/30" />
          </div>

          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#122118] via-[#173824] to-[#1D3828] text-white border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shrink-0">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                  <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#122118]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold tracking-tight truncate text-white">
                    El Remate
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black uppercase tracking-wider shrink-0">
                    En Línea
                  </span>
                </div>
                <p className="text-[11px] font-medium text-emerald-100/80 truncate">
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
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#1FA855] hover:bg-[#188a46] text-white text-[11px] font-extrabold shadow-sm transition-transform active:scale-95"
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
            <div className="flex items-center justify-between px-3 py-2 bg-[#E8F6EE] border-b border-[#CBE7D5] shrink-0">
              <div className="flex items-center gap-2 min-w-0 truncate text-[12px] font-extrabold text-[#14532D]">
                <span className="w-2 h-2 rounded-full bg-[#1FA855] shrink-0" />
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
                className="px-2.5 py-1 rounded-md bg-[#16241B] hover:bg-black text-white text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer"
              >
                Ver carrito →
              </button>
            </div>
          )}

          {/* ── Área de Mensajes ── */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[radial-gradient(circle_at_top_right,rgba(31,168,85,0.06),transparent_55%),#F9F7F1]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[92%] px-3.5 py-2.5 rounded-[15px] text-[13.5px] leading-relaxed break-words shadow-xs ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-[#16241B] to-[#1F3A28] text-white rounded-br-[4px] font-medium"
                      : "bg-white text-[#1B2620] border border-[#E4E1D8] rounded-bl-[4px]"
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
                        className="flex flex-col items-start p-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F2FBF5] border border-[#E5E2D8] hover:border-[#1FA855] text-left transition-all cursor-pointer group active:scale-95"
                      >
                        <span className="text-base leading-none mb-1">🛒</span>
                        <b className="text-[12px] font-extrabold text-[#16241B] group-hover:text-[#1FA855]">
                          Armar lista rápida
                        </b>
                        <small className="text-[10.5px] text-[#626B64] font-medium leading-tight">
                          "2 yerba, 1 aceite, 3 leches"
                        </small>
                      </button>

                      <button
                        type="button"
                        onClick={() => sendMessage("🏷️ Ofertas y Mayorista")}
                        className="flex flex-col items-start p-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F2FBF5] border border-[#E5E2D8] hover:border-[#1FA855] text-left transition-all cursor-pointer group active:scale-95"
                      >
                        <span className="text-base leading-none mb-1">🏷️</span>
                        <b className="text-[12px] font-extrabold text-[#16241B] group-hover:text-[#1FA855]">
                          Ofertas y Mayorista
                        </b>
                        <small className="text-[10.5px] text-[#626B64] font-medium leading-tight">
                          Descuentos por bulto y escala
                        </small>
                      </button>

                      <button
                        type="button"
                        onClick={() => sendMessage("📦 Rastrear pedido")}
                        className="flex flex-col items-start p-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F2FBF5] border border-[#E5E2D8] hover:border-[#1FA855] text-left transition-all cursor-pointer group active:scale-95"
                      >
                        <span className="text-base leading-none mb-1">📦</span>
                        <b className="text-[12px] font-extrabold text-[#16241B] group-hover:text-[#1FA855]">
                          Rastrear mi pedido
                        </b>
                        <small className="text-[10.5px] text-[#626B64] font-medium leading-tight">
                          Estado con código CN-XXXX
                        </small>
                      </button>

                      <button
                        type="button"
                        onClick={() => sendMessage("💬 Hablar con asesor")}
                        className="flex flex-col items-start p-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#F2FBF5] border border-[#E5E2D8] hover:border-[#1FA855] text-left transition-all cursor-pointer group active:scale-95"
                      >
                        <span className="text-base leading-none mb-1">💬</span>
                        <b className="text-[12px] font-extrabold text-[#16241B] group-hover:text-[#1FA855]">
                          Hablar con asesor
                        </b>
                        <small className="text-[10.5px] text-[#626B64] font-medium leading-tight">
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
                            className="flex items-center justify-between gap-2 p-2.5 bg-[#FAF8F3] border border-[#E5E2D9] hover:border-emerald-300 rounded-xl transition-all"
                          >
                            <div className="min-w-0 flex-1">
                              <b className="block text-[12.5px] font-extrabold text-[#16241B] leading-tight truncate">
                                {prod.nombre}
                              </b>
                              <div className="text-[11.5px] text-[#5B645D] font-semibold mt-0.5">
                                {prod.cantidadSugerida > 1 && `${prod.cantidadSugerida}× `}$
                                {prod.precioUnitarioAplicado.toLocaleString("es-UY")} c/u
                                {prod.ahorroTotal > 0 && (
                                  <span className="text-emerald-700 ml-1">
                                    · Ahorrás ${prod.ahorroTotal.toLocaleString("es-UY")}
                                  </span>
                                )}
                              </div>
                              {prod.escalaPrecios && prod.escalaPrecios.length > 0 && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
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
                                  ? "bg-[#16241B] text-white"
                                  : "bg-[#1FA855] hover:bg-[#168341] text-white shadow-xs"
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
                          className="w-full mt-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1FA855] to-[#14793B] hover:from-[#188a46] hover:to-[#0f602e] text-white text-[13px] font-extrabold shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer"
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
                    <div className="mt-3 p-3 bg-[#FAF8F3] border border-[#D5E8DC] rounded-xl">
                      <div className="flex items-center justify-between gap-2 pb-1.5">
                        <strong className="text-[13px] font-extrabold text-[#16241B]">
                          📦 Pedido {m.orderCard.publicCode}
                        </strong>
                        <span className="text-[12px] font-black text-emerald-700">
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
                                isActive ? "bg-[#1FA855]" : "bg-[#E2DFD7]"
                              }`}
                            />
                          );
                        })}
                      </div>

                      <div className="text-[12px] font-bold text-[#1B2620] mb-2">
                        {m.orderCard.statusLabel}
                      </div>

                      {Array.isArray(m.orderCard.items) && m.orderCard.items.length > 0 && (
                        <div className="text-[11.5px] text-[#525B54] space-y-0.5 mb-2.5">
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
                        className="block w-full py-2 rounded-lg bg-[#1FA855] hover:bg-[#188a46] text-white text-center text-[12px] font-extrabold transition-colors"
                      >
                        Consultar en WhatsApp
                      </a>
                    </div>
                  )}

                  {/* ── Formulario de Derivación a Asesor Comercial ── */}
                  {m.showHandoffForm && (
                    <form
                      onSubmit={handleHandoffSubmit}
                      className="mt-3 p-3 bg-[#F6F4EC] border border-[#DFDCD2] rounded-xl flex flex-col gap-2"
                    >
                      <strong className="text-[12px] font-extrabold text-[#16241B]">
                        📲 Atención con un Asesor Comercial
                      </strong>
                      <input
                        type="text"
                        name="name"
                        placeholder="Tu nombre o comercio *"
                        required
                        defaultValue={typeof window !== "undefined" ? localStorage.getItem("elremate_cust_name") || "" : ""}
                        className="w-full px-3 py-2 text-[13px] bg-white border border-[#D5D2C8] rounded-lg focus:outline-emerald-500"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Tu WhatsApp (ej: 099 123 456) *"
                        required
                        defaultValue={typeof window !== "undefined" ? localStorage.getItem("elremate_cust_phone") || "" : ""}
                        className="w-full px-3 py-2 text-[13px] bg-white border border-[#D5D2C8] rounded-lg focus:outline-emerald-500"
                      />
                      <textarea
                        name="message"
                        rows={2}
                        placeholder="Contanos tu consulta o pedido especial…"
                        className="w-full px-3 py-2 text-[13px] bg-white border border-[#D5D2C8] rounded-lg focus:outline-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={handoffSubmitting}
                        className="w-full py-2 px-3 rounded-lg bg-[#D5382A] hover:bg-[#b52a1e] text-white text-[12.5px] font-extrabold transition-colors disabled:opacity-50 cursor-pointer"
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
                <div className="px-3.5 py-2.5 rounded-[15px] bg-white text-[#5B645D] text-[13px] italic border border-[#E4E1D8] flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Consultando catálogo y stock de Canelones…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Chips Rápidos Carousel ── */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F2EFE6] border-t border-[#E5E2D9] overflow-x-auto no-scrollbar shrink-0">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(chip)}
                className="px-3 py-1 rounded-full bg-white hover:bg-[#16241B] hover:text-white border border-[#D5D2C8] text-[#1B2620] text-[12px] font-bold whitespace-nowrap shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* ── Barra de Entrada de Mensaje ── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="flex items-center gap-2 p-2.5 bg-white border-t border-[#E5E2D9] shrink-0 pb-[calc(0.6rem+env(safe-area-inset-bottom))]"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribí un producto, tu lista o código CN-..."
              maxLength={400}
              className="flex-1 min-w-0 px-3.5 py-2.5 text-[13.5px] bg-[#FAF8F3] text-[#1B2620] border border-[#DDD9CE] focus:border-[#1FA855] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              aria-label="Enviar mensaje"
              className="w-10 h-10 rounded-xl bg-[#1FA855] hover:bg-[#168341] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer shrink-0 shadow-xs"
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
