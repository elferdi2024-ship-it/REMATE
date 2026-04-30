// filepath: src/components/ads/adStyles.ts

export const AD_TOKENS = {
  borderRadius: {
    card: "14px",      // BrandSpotlight card
    banner: "16px",    // SponsoredBanner
    modal: "20px",     // BrandMediaModal
    wide: "16px",      // BrandVideoCard wide
  },
  
  publicidadLabel: {
    fontSize: "7px",
    fontWeight: 700 as const,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase" as const,
    letterSpacing: "1.2px",
    background: "rgba(0,0,0,0.3)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  
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
  
  overlay: {
    card: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 45%)",
    banner: "linear-gradient(135deg, rgba(0,0,0,0.35) 0%, transparent 60%)",
    tall: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
  },
  
  fadeIn: (visible: boolean, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
  }),
} as const;
