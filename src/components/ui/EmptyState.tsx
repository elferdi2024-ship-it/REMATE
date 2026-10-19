// filepath: src/components/ui/EmptyState.tsx
// Lucian UX/UI Prompt #092 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#092
"use client";

import React from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  minHeight?: string;
}

export default function EmptyState({
  title,
  description,
  actionText,
  onAction,
  minHeight = "40vh",
}: EmptyStateProps) {
  return (
    <div
      className="ux flex flex-col items-center justify-center text-center w-full px-6 py-10 bg-white border border-slate-200/80 rounded-3xl shadow-[0_8px_30px_-14px_rgba(15,23,42,0.06)] my-4"
      style={{ minHeight }}
    >
      {/* Ilustración de estanterías y lupa móvil estilo Lucian #092 (.u092-art) */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="relative w-[164px] h-[100px] mb-4 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/70 px-3"
        aria-hidden="true"
      >
        <svg viewBox="0 0 150 92" className="w-full h-full overflow-visible">
          <path
            d="M8 30h134M8 56h134M8 82h134"
            stroke="rgba(15, 23, 42, 0.16)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="2 9"
            fill="none"
          />
          <g style={{ animation: "u092-scan 3.6s ease-in-out infinite" }}>
            <circle
              cx="34"
              cy="38"
              r="20"
              fill="rgba(239, 35, 60, 0.10)"
              stroke="#0F172A"
              strokeWidth="4.5"
            />
            <path
              d="M24 30a12 12 0 0 1 8-5"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.85"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M48 52l14 14"
              fill="none"
              stroke="#EF233C"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </motion.div>

      <motion.h3
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.14 }}
        className="text-slate-500 text-xs sm:text-sm font-medium max-w-md mb-6 leading-relaxed"
      >
        {description}
      </motion.p>

      {actionText && onAction && (
        <motion.button
          type="button"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={onAction}
          className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-[#EF233C] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-[0_10px_24px_-8px_rgba(15,23,42,0.3)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-rotate-45"
          >
            <path d="M2.5 8a5.5 5.5 0 1 0 1.5-3.8M2.5 2v2.8h2.8" />
          </svg>
          <span>{actionText}</span>
        </motion.button>
      )}
    </div>
  );
}
