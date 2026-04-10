"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import * as ls from "@/lib/ls";

interface BuscadorProps {
  value: string;
  onChange: (term: string) => void;
  placeholder?: string;
  onSearchCommit?: (term: string, hasResults: boolean) => void;
}

type SpeechRecognitionInstance = any;

export default function Buscador({
  value,
  onChange,
  placeholder = "Buscar productos...",
  onSearchCommit,
}: BuscadorProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isListening, setIsListening] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
        // Commit search
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
  }, []);

  // Sync external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // eslint-disable-next-line react-hooks/exhaustive-deps

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
    setShowRecent(true);
    setRecentSearches(ls.getBusquedas());
  }, []);

  const handleBlur = useCallback(() => {
    // Delay to allow chip clicks
    setTimeout(() => setShowRecent(false), 150);
  }, []);

  const handleRecentClick = useCallback(
    (term: string) => {
      setInputValue(term);
      onChange(term);
      setShowRecent(false);
      inputRef.current?.focus();
    },
    [onChange]
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
        if (term && onSearchCommit) {
          onSearchCommit(term, true);
          // Save to search history
          const current = ls.getBusquedas();
          const filtered = current.filter((s) => s !== term);
          ls.setBusquedas([term, ...filtered].slice(0, 10));
        }
      }
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [inputValue, handleClear, onSearchCommit]
  );

  // Save search to history when committed with results
  useEffect(() => {
    if (onSearchCommit) {
      // This is handled via the onSearchCommit prop from parent
    }
  }, [onSearchCommit]);

  return (
    <div className="buscador-wrap" style={{ position: "relative" }}>
      <div className="buscador-input-wrap">
        <input
          ref={inputRef}
          type="text"
          className="buscador-input"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-label="Buscar productos"
        />
        {inputValue && (
          <button
            className="buscador-clear"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            type="button"
          >
            ×
          </button>
        )}
        <span className="buscador-icon" aria-hidden="true">
          &#128269;
        </span>
        {voiceSupported && (
          <button
            className={`buscador-voice ${isListening ? "listening" : ""}`}
            onClick={toggleVoice}
            aria-label={isListening ? "Detener búsqueda por voz" : "Búsqueda por voz"}
            type="button"
          >
            {isListening ? "\ud83d\udd34" : "\ud83c\udfa4"}
          </button>
        )}
      </div>

      {/* Recent searches dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div className="buscador-recent">
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
        </div>
      )}
    </div>
  );
}
