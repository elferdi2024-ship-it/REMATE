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
  icon = "🔎",
  title,
  description,
  actionText,
  onAction,
  minHeight = "40vh"
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center w-full px-6"
      style={{ minHeight }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner border border-zinc-200"
      >
        {icon}
      </motion.div>
      
      <motion.h3 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-black text-zinc-800 tracking-tight mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-zinc-500 font-medium max-w-sm mb-8"
      >
        {description}
      </motion.p>
      
      {actionText && onAction && (
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onAction}
          className="bg-zinc-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-900/20"
        >
          {actionText}
        </motion.button>
      )}
    </div>
  );
}
