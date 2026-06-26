"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import * as ls from "@/lib/ls";
import type { Producto } from "@/types";
import { formatPrice } from "@/lib/format";

interface BuscadorProps {
  value: string;
  onChange: (term: string) => void;
  placeholder?: string;
  onSearchCommit?: (term: string, hasResults: boolean) => void;
  suggestedProducts?: Producto[];
  onSelectSuggestion?: (term: string) => void;
  variant?: "light" | "dark";
}

type SpeechRecognitionInstance = any;

export default function Buscador({
  value,
  onChange,
  placeholder = "Buscar productos...",
  onSearchCommit,
  suggestedProducts = [],
  onSelectSuggestion,
  variant = "dark",
}: BuscadorProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(ls.getBusquedas());
  }, []);

  // Check SpeechRecognition support
  useEffect(() => {
    const SR =
      (typeof window !== "undefined" &&
        (window as any).SpeechRecognition) ||
      (typeof window !== "undefined" &&
        (window as any).webkitSpeechRecognition);
    setVoiceSupported(!!SR);
    if (SR) {
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "es-UY";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        onChange(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onChange]);

  // Sync external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce handler: 200ms
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(val);
      }, 200);
    },
    [onChange]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setRecentSearches(ls.getBusquedas());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRecentClick = useCallback(
    (term: string) => {
      setInputValue(term);
      onChange(term);
      setIsFocused(false);
      if (onSelectSuggestion) {
        onSelectSuggestion(term);
      }
      inputRef.current?.focus();
    },
    [onChange, onSelectSuggestion]
  );

  const handleSuggestionClick = useCallback(
    (term: string) => {
      setInputValue(term);
      onChange(term);
      setIsFocused(false);
      if (onSelectSuggestion) {
        onSelectSuggestion(term);
      }
      // Save to recent searches
      const current = ls.getBusquedas();
      const filtered = current.filter((s) => s !== term);
      ls.setBusquedas([term, ...filtered].slice(0, 10));
      setRecentSearches(ls.getBusquedas());
    },
    [onChange, onSelectSuggestion]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const term = inputValue.trim();
        if (term) {
          if (onSearchCommit) {
            onSearchCommit(term, true);
          }
          // Save to search history
          const current = ls.getBusquedas();
          const filtered = current.filter((s) => s !== term);
          ls.setBusquedas([term, ...filtered].slice(0, 10));
          setRecentSearches(ls.getBusquedas());
          setIsFocused(false);
        }
      }
      if (e.key === "Escape") {
        handleClear();
        setIsFocused(false);
      }
    },
    [inputValue, handleClear, onSearchCommit]
  );

  return (
    <div ref={containerRef} className={variant === "light" ? "w-full relative" : "buscador-wrap"} style={{ position: "relative" }}>
      <div className={variant === "light" ? "relative w-full flex items-center" : "buscador-input-wrap"}>
        <input
          ref={inputRef}
          type="text"
          className={
            variant === "light"
              ? "results-search-input w-full py-2.5 pl-11 pr-20 bg-white border border-stone-200 focus:border-[#E8302A] rounded-full text-stone-800 placeholder-stone-400 font-semibold text-sm outline-none transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:shadow-[0_4px_16px_rgba(232,48,42,0.06)]"
              : "results-search-input buscador-input"
          }
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label="Buscar productos"
        />
        {inputValue && (
          <button
            className={
              variant === "light"
                ? `absolute text-stone-400 hover:text-stone-700 text-lg cursor-pointer p-1 transition-colors ${
                    voiceSupported ? "right-11" : "right-4"
                  }`
                : "buscador-clear"
            }
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            type="button"
          >
            ×
          </button>
        )}
        <span
          className={
            variant === "light"
              ? "absolute left-4 text-stone-400 text-sm pointer-events-none"
              : "buscador-icon"
          }
          aria-hidden="true"
        >
          &#128269;
        </span>
        {voiceSupported && (
          <button
            className={
              variant === "light"
                ? `absolute right-3 w-7 h-7 rounded-full flex items-center justify-center border border-stone-200 hover:bg-stone-50 transition-colors ${
                    isListening ? "bg-red-50 border-red-200 text-red-500 animate-pulse" : "text-stone-500"
                  }`
                : `buscador-voice ${isListening ? "listening" : ""}`
            }
            onClick={toggleVoice}
            aria-label={isListening ? "Detener búsqueda por voz" : "Búsqueda por voz"}
            type="button"
          >
            {isListening ? "🔴" : "🎙️"}
          </button>
        )}
      </div>

      {/* Dropdown de Búsqueda (Recientes o Sugerencias) */}
      {isFocused && (recentSearches.length > 0 || (inputValue.trim() && suggestedProducts.length > 0)) && (
        <div
          className={
            variant === "light"
              ? "absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl p-3 shadow-xl z-[999] overflow-hidden"
              : "buscador-recent"
          }
        >
          {!inputValue.trim() ? (
            /* Búsquedas recientes */
            <>
              <div className="buscador-recent-label">Búsquedas recientes</div>
              <div className="buscador-chips">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    className="buscador-chip"
                    onClick={() => handleRecentClick(term)}
                    type="button"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Sugerencias predictivas */
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              <div className="buscador-recent-label px-1">Sugerencias de productos</div>
              {suggestedProducts.length > 0 ? (
                suggestedProducts.map((p) => (
                  <button
                    key={p.codigo}
                    className="w-full flex items-center gap-3 p-2 hover:bg-stone-100 rounded-lg transition-colors text-left border-b border-stone-50 last:border-b-0 group"
                    onClick={() => handleSuggestionClick(p.nombre)}
                    type="button"
                  >
                    <div className="w-10 h-10 bg-white border border-stone-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                      {p.imagen ? (
                        <Image
                          src={p.imagen}
                          alt={p.nombre}
                          width={36}
                          height={36}
                          className="object-contain transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-stone-800 truncate group-hover:text-[#E8302A] transition-colors">
                        {p.nombre}
                      </div>
                      <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                        {p.categoria}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-[#E8302A] shrink-0">
                      {formatPrice(p.precio)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-stone-500">
                  No se encontraron sugerencias
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
