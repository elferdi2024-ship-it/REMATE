// filepath: src/components/ads/adStyles.ts

export const AD_TOKENS = {
  // ─── Tamaños por formato ──────────────────────────────────────────────────
  size: {
    spotlight: {
      desktop: { height: "480px", borderRadius: "20px" },
      mobile:  { height: "260px", borderRadius: "16px" },
    },
    banner: {
      desktop: { height: "160px", borderRadius: "16px" },
      mobile:  { height: "120px", borderRadius: "12px" },
    },
    videoCard: {
      desktop: { gridColumn: "span 5", aspectRatio: "21/9", borderRadius: "18px" },
      mobile:  { gridColumn: "span 2", aspectRatio: "16/9", borderRadius: "12px" },
    },
    sponsoredProduct: {
      desktop: { scale: "1.04", borderWidth: "2px" },
      mobile:  { scale: "1.02", borderWidth: "1.5px" },
    },
  },

  // Mantenido por compatibilidad
  borderRadius: {
    modal: "20px",
  },

  // ─── Tier colors ─────────────────────────────────────────────────────────
  tier: {
    oro:    { border: "#C9A84C", glow: "rgba(201,168,76,0.35)",  label: "ORO",   bg: "rgba(201,168,76,0.15)"  },
    plata:  { border: "#A0A0A0", glow: "rgba(160,160,160,0.25)", label: "PLATA", bg: "rgba(160,160,160,0.12)" },
    bronce: { border: "#CD7F32", glow: "rgba(205,127,50,0.2)",   label: "BRONCE",bg: "rgba(205,127,50,0.1)"  },
  },

  // ─── Label "Publicidad" unificado ─────────────────────────────────────────
  adLabel: {
    fontSize: "9px",
    fontWeight: 600 as const,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase" as const,
    letterSpacing: "1.4px",
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  
  // Mantenido por compatibilidad con V3 en la transición
  publicidadLabel: {
    fontSize: "9px",
    fontWeight: 600 as const,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase" as const,
    letterSpacing: "1.4px",
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  
  // ─── Brand Pill ───────────────────────────────────────────────────────────
  brandPill: (tierBorder: string) => ({
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#fff" as const,
    fontSize: "8px",
    fontWeight: 800 as const,
    textTransform: "uppercase" as const,
    padding: "3px 8px",
    borderRadius: "5px",
    letterSpacing: "0.8px",
    border: `1px solid ${tierBorder}`,
  }),

  // ─── Animaciones de entrada ───────────────────────────────────────────────
  entrance: {
    hidden:  { opacity: 0, transform: "translateY(20px)" },
    visible: { opacity: 1, transform: "translateY(0)", transition: "opacity 0.5s ease, transform 0.5s ease" },
    delay: (i: number) => `${i * 0.08}s`,
  },
  
  // Mantenido por compatibilidad
  fadeIn: (visible: boolean, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  }),

  // ─── Hover states ─────────────────────────────────────────────────────────
  hover: {
    spotlight: "scale(1.008) translateY(-2px)",
    banner:    "scale(1.005) translateY(-1px)",
    product:   "scale(1.04) translateY(-3px)",
  },

} as const;
