// filepath: src/components/ui/HardwareAcceleratedMotion.tsx
"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface HardwareAcceleratedMotionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

/**
 * Contenedor de animación garantizada a 60FPS.
 * Solo opera transformaciones de composición (scale3d, translate3d, opacity)
 * previniendo recálculos de Layout (Reflow/Repaint) en navegadores móviles.
 */
export default function HardwareAcceleratedMotion({
  children,
  className = "",
  ...props
}: HardwareAcceleratedMotionProps) {
  return (
    <motion.div
      className={`gpu-accelerated ${className}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.18,
        ease: [0.16, 1, 0.3, 1], // Curve cubic-bezier instantánea
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
