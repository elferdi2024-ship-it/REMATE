const getTabIcon = (id: string, isSelected: boolean, cartQty: number) => {
  const iconInner = (() => {
    switch (id) {
      case "inicio":
        return (
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow3d-inicio" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000000" flood-opacity="0.18" />
              </filter>
              <linearGradient id="wall3d" x1="0%" y1="0%" x2="100%" y2="100%">
                {isSelected ? (
                  <>
                    <stop offset="0%" stop-color="#FFF5F5" />
                    <stop offset="35%" stop-color="#FFE3E3" />
                    <stop offset="100%" stop-color="#FCA5A5" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stop-color="#FAFAF9" />
                    <stop offset="50%" stop-color="#F5F5F4" />
                    <stop offset="100%" stop-color="#D6D3D1" />
                  </>
                )}
              </linearGradient>
              <radialGradient id="roof3d" cx="35%" cy="30%" r="75%">
                {isSelected ? (
                  <>
                    <stop offset="0%" stop-color="#FF8A84" />
                    <stop offset="45%" stop-color="#E8302A" />
                    <stop offset="100%" stop-color="#9C1410" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stop-color="#A8A29E" />
                    <stop offset="60%" stop-color="#78716C" />
                    <stop offset="100%" stop-color="#44403C" />
                  </>
                )}
              </radialGradient>
              <linearGradient id="door3d" x1="0%" y1="0%" x2="0%" y2="100%">
                {isSelected ? (
                  <>
                    <stop offset="0%" stop-color="#8F0E0B" />
                    <stop offset="100%" stop-color="#4A0503" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stop-color="#57534E" />
                    <stop offset="100%" stop-color="#292524" />
                  </>
                )}
              </linearGradient>
            </defs>
            <g filter="url(#shadow3d-inicio)">
              <rect x="6" y="14" width="20" height="14" rx="3" fill="url(#wall3d)" />
              <path d="M16 2 L3 13 C2.5 13.4 2.8 14 3.5 14 H28.5 C29.2 14 29.5 13.4 29 13 L16 2 Z" fill="url(#roof3d)" />
              <path d="M16 3.5 L4.8 13 H6.5 L16 5 L25.5 13 H27.2 L16 3.5 Z" fill="#FFFFFF" opacity="0.45" />
              <rect x="12" y="19" width="8" height="9" rx="1.5" fill="rgba(0,0,0,0.08)" />
              <rect x="13" y="20" width="6" height="8" rx="1" fill="url(#door3d)" />
              <circle cx="17.5" cy="24" r="0.8" fill={isSelected ? "#FCD34D" : "#E7E5E4"} />
              <circle cx="16" cy="9.5" r="2.5" fill="rgba(0,0,0,0.15)" />
              <circle cx="16" cy="9.5" r="2" fill={isSelected ? "#FFE4E6" : "#E2E8F0"} />
            </g>
          </svg>
        );
      case "buscar":
        return (
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow3d-buscar" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000000" flood-opacity="0.18" />
              </filter>
              <linearGradient id="metalRing" x1="0%" y1="0%" x2="100%" y2="100%">
                {isSelected ? (
                  <>
                    <stop offset="0%" stop-color="#FF9E9E" />
                    <stop offset="35%" stop-color="#E8302A" />
                    <stop offset="70%" stop-color="#BE123C" />
                    <stop offset="100%" stop-color="#881337" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stop-color="#E2E8F0" />
                    <stop offset="35%" stop-color="#94A3B8" />
                    <stop offset="70%" stop-color="#475569" />
                    <stop offset="100%" stop-color="#1E293B" />
                  </>
                )}
              </linearGradient>
              <radialGradient id="glassLens" cx="30%" cy="30%" r="70%">
                {isSelected ? (
                  <>
                    <stop offset="0%" stop-color="#FFE4E6" stop-opacity="0.85" />
                    <stop offset="50%" stop-color="#FDA4AF" stop-opacity="0.5" />
                    <stop offset="100%" stop-color="#F43F5E" stop-opacity="0.2" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
                    <stop offset="55%" stop-color="#E2E8F0" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.15" />
                  </>
                )}
              </radialGradient>
              <linearGradient id="handle3d" x1="0%" y1="0%" x2="100%" y2="100%">
                {isSelected ? (
                  <>
                    <stop offset="0%" stop-color="#E8302A" />
                    <stop offset="50%" stop-color="#9F1239" />
                    <stop offset="100%" stop-color="#4C0519" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stop-color="#78716C" />
                    <stop offset="50%" stop-color="#44403C" />
                    <stop offset="100%" stop-color="#1C1917" />
                  </>
                )}
              </linearGradient>
            </defs>
            <g filter="url(#shadow3d-buscar)">
              <rect x="20.5" y="20.5" width="5.5" height="11" rx="2.75" transform="rotate(-45 20.5 20.5)" fill="url(#handle3d)" />
              <rect x="22" y="21.5" width="1.5" height="8" rx="0.75" transform="rotate(-45 20.5 20.5)" fill="#FFFFFF" opacity="0.3" />
              <circle cx="13" cy="13" r="10" stroke="url(#metalRing)" stroke-width="3" fill="none" />
              <circle cx="13" cy="13" r="8.5" fill="url(#glassLens)" />
              <path d="M 8.5 9.5 Q 11 7 14.5 8" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.8" />
              <circle cx="10" cy="11" r="1" fill="#FFFFFF" opacity="0.6" />
            </g>
          </svg>
        );
      case "favoritos":
        return (
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow3d-favoritos" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.22" />
              </filter>
              <radialGradient id="heart3d" cx="35%" cy="30%" r="70%">
                {isSelected ? (
                  <>
                    <stop offset="0%" stop-color="#FFA8A3" />
                    <stop offset="30%" stop-color="#FF5A54" />
                    <stop offset="65%" stop-color="#E8302A" />
                    <stop offset="100%" stop-color="#7C0C09" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stop-color="#FFFFFF" />
                    <stop offset="35%" stop-color="#CBD5E1" />
                    <stop offset="75%" stop-color="#64748B" />
                    <stop offset="100%" stop-color="#334155" />
                  </>
                )}
              </radialGradient>
            </defs>
            <g filter="url(#shadow3d-favoritos)">
              <path d="M16 28.5 C16 28.5 3.5 20.2 3.5 11.5 C3.5 6.2 7.7 2.8 12 2.8 C14.6 2.8 15.5 4.2 16 5.0 C16.5 4.2 17.4 2.8 20 C2.8 C24.3 2.8 28.5 6.2 28.5 11.5 C28.5 20.2 16 28.5 16 28.5 Z" fill="url(#heart3d)" />
              <ellipse cx="10" cy="8.5" rx="3.5" ry="1.8" transform="rotate(-35 10 8.5)" fill="#FFFFFF" opacity="0.65" />
              <circle cx="8" cy="11" r="0.8" fill="#FFFFFF" opacity="0.4" />
            </g>
          </svg>
        );
      case "carrito":
        return (
          <div style={{ position: "relative", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="shadow3d-carrito" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000000" flood-opacity="0.18" />
                </filter>
                <linearGradient id="chassisMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                  {isSelected ? (
                    <>
                      <stop offset="0%" stop-color="#FFD2D0" />
                      <stop offset="50%" stop-color="#FF6B66" />
                      <stop offset="100%" stop-color="#A71E1A" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stop-color="#F1F5F9" />
                      <stop offset="50%" stop-color="#94A3B8" />
                      <stop offset="100%" stop-color="#475569" />
                    </>
                  )}
                </linearGradient>
                <radialGradient id="basket3d" cx="30%" cy="30%" r="70%">
                  {isSelected ? (
                    <>
                      <stop offset="0%" stop-color="#FFA4A0" />
                      <stop offset="55%" stop-color="#E8302A" />
                      <stop offset="100%" stop-color="#8F0E0B" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stop-color="#E2E8F0" />
                      <stop offset="55%" stop-color="#64748B" />
                      <stop offset="100%" stop-color="#334155" />
                    </>
                  )}
                </radialGradient>
                <radialGradient id="wheel3d" cx="35%" cy="30%" r="65%">
                  {isSelected ? (
                    <>
                      <stop offset="0%" stop-color="#FCA5A5" />
                      <stop offset="70%" stop-color="#4C0519" />
                      <stop offset="100%" stop-color="#1C0006" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stop-color="#94A3B8" />
                      <stop offset="70%" stop-color="#1E293B" />
                      <stop offset="100%" stop-color="#0F172A" />
                    </>
                  )}
                </radialGradient>
              </defs>
              <g filter="url(#shadow3d-carrito)">
                <path d="M 3 5 H 8 L 12.5 20 H 24.5 L 28.5 8 H 9" stroke="url(#chassisMetal)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                <path d="M 10 9 H 26.5 L 23.5 18 H 12.5 Z" fill="url(#basket3d)" />
                <path d="M 10 9 H 26.5" stroke="#FFFFFF" stroke-width="1" opacity="0.4" stroke-linecap="round" />
                <path d="M 12.5 18 H 23.5" stroke="#000000" stroke-width="1.2" opacity="0.25" stroke-linecap="round" />
                <circle cx="13" cy="24.5" r="3.5" fill="url(#wheel3d)" />
                <circle cx="13" cy="24.5" r="1.2" fill="#FFFFFF" opacity="0.8" />
                <circle cx="23" cy="24.5" r="3.5" fill="url(#wheel3d)" />
                <circle cx="23" cy="24.5" r="1.2" fill="#FFFFFF" opacity="0.8" />
              </g>
            </svg>
            {cartQty > 0 && (
              <span
                className="absolute -top-2.5 -right-2.5 bg-red-600 text-white font-black rounded-full flex items-center justify-center animate-soft-pulse"
                style={{
                  fontSize: "9px",
                  minWidth: "16px",
                  height: "16px",
                  padding: "0 4px",
                  boxShadow: "0 2px 6px rgba(220,38,38,0.4)",
                  zIndex: 10,
                }}
              >
                {cartQty}
              </span>
            )}
          </div>
        );
      case "cuenta":
        return (
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow3d-cuenta" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#000000" flood-opacity="0.18" />
              </filter>
              <radialGradient id="userHead3d" cx="35%" cy="30%" r="70%">
                {isSelected ? (
                  <>
                    <stop offset="0%" stop-color="#FFCCD0" />
                    <stop offset="35%" stop-color="#F43F5E" />
                    <stop offset="75%" stop-color="#BE123C" />
                    <stop offset="100%" stop-color="#67001A" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stop-color="#FFFFFF" />
                    <stop offset="35%" stop-color="#94A3B8" />
                    <stop offset="75%" stop-color="#475569" />
                    <stop offset="100%" stop-color="#1E293B" />
                  </>
                )}
              </radialGradient>
              <radialGradient id="userBody3d" cx="35%" cy="20%" r="80%">
                {isSelected ? (
                  <>
                    <stop offset="0%" stop-color="#FFA3A8" />
                    <stop offset="45%" stop-color="#E8302A" />
                    <stop offset="80%" stop-color="#9F1239" />
                    <stop offset="100%" stop-color="#4C0519" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stop-color="#CBD5E1" />
                    <stop offset="50%" stop-color="#64748B" />
                    <stop offset="85%" stop-color="#334155" />
                    <stop offset="100%" stop-color="#1E293B" />
                  </>
                )}
              </radialGradient>
            </defs>
            <g filter="url(#shadow3d-cuenta)">
              <circle cx="16" cy="10" r="5.5" fill="url(#userHead3d)" />
              <ellipse cx="14.2" cy="8.2" rx="2" ry="1.2" transform="rotate(-30 14.2 8.2)" fill="#FFFFFF" opacity="0.55" />
              <path d="M 6.5 24.5 C 6.5 20 10.5 17.5 16 17.5 C 21.5 17.5 25.5 20 25.5 24.5 V 27.5 C 25.5 28.8 24.3 29.5 23 29.5 H 9 C 7.7 29.5 6.5 28.8 6.5 27.5 Z" fill="url(#userBody3d)" />
              <path d="M 8 23.5 C 10 20.5 13 19 16 19 C 19 19 22 20.5 24 23.5" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.35" />
            </g>
          </svg>
        );
      default:
        return null;
    }
  })();

  return iconInner;
};

interface BottomNavBarProps {
  activeTab: string;
  onTabSelect: (tab: string) => void;
  cartQty: number;
  onOpenCart: () => void;
  onOpenUser: () => void;
}

export default function BottomNavBar({
  activeTab,
  onTabSelect,
  cartQty,
  onOpenCart,
  onOpenUser,
}: BottomNavBarProps) {
  const tabs = [
    { id: "inicio", label: "Inicio" },
    { id: "buscar", label: "Buscar" },
    { id: "favoritos", label: "Favoritos" },
    { id: "carrito", label: "Carrito" },
    { id: "cuenta", label: "Cuenta" },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === "carrito") {
      onOpenCart();
    } else if (tabId === "cuenta") {
      onOpenUser();
    } else {
      onTabSelect(tabId);
    }
  };

  return (
    <div
      className="bottom-nav md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(17,11,8,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 12px)",
        paddingTop: "8px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.03)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              background: "transparent",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              color: isSelected ? "var(--rojo, #E8302A)" : "var(--muted, #5C5550)",
              cursor: "pointer",
              padding: "6px 12px",
              minWidth: "64px",
              transition: "color 0.2s ease, transform 0.1s ease",
              transform: isSelected ? "scale(1.05)" : "scale(1)",
            }}
            aria-label={tab.label}
          >
            <div style={{ transition: "transform 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center" }} className={isSelected ? "scale-110" : ""}>
              {getTabIcon(tab.id, isSelected, cartQty)}
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: isSelected ? 800 : 500,
                letterSpacing: "0.2px",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
