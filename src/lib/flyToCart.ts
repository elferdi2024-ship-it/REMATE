export function flyToCart(e: React.MouseEvent | React.TouchEvent, imageUrl?: string, emoji?: string) {
  // Solo correr en cliente
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const target = e.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  
  // Posición inicial (donde se hizo clic)
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  // Buscar el botón del carrito flotante
  const cartBtn = document.querySelector(".float-cart-btn");
  if (!cartBtn) return; // Si no hay botón, no hay animación

  const cartRect = cartBtn.getBoundingClientRect();
  
  // Posición final (centro del carrito flotante)
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  // Crear el elemento volador
  const flyer = document.createElement("div");
  flyer.style.position = "fixed";
  flyer.style.zIndex = "9999";
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.width = "40px";
  flyer.style.height = "40px";
  flyer.style.marginTop = "-20px";
  flyer.style.marginLeft = "-20px";
  flyer.style.borderRadius = "50%";
  flyer.style.display = "flex";
  flyer.style.alignItems = "center";
  flyer.style.justifyContent = "center";
  flyer.style.pointerEvents = "none";
  flyer.style.transition = "all 0.6s cubic-bezier(0.2, 1, 0.3, 1)";
  flyer.style.transform = "scale(1)";
  flyer.style.opacity = "1";
  flyer.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
  flyer.style.background = "white";

  if (imageUrl) {
    flyer.style.backgroundImage = `url(${imageUrl})`;
    flyer.style.backgroundSize = "contain";
    flyer.style.backgroundPosition = "center";
    flyer.style.backgroundRepeat = "no-repeat";
  } else if (emoji) {
    flyer.innerText = emoji;
    flyer.style.fontSize = "24px";
  } else {
    flyer.style.background = "var(--rojo, #E8302A)";
  }

  document.body.appendChild(flyer);

  // Forzar reflow
  flyer.getBoundingClientRect();

  // Iniciar animación hacia el carrito
  requestAnimationFrame(() => {
    flyer.style.left = `${endX}px`;
    flyer.style.top = `${endY}px`;
    flyer.style.transform = "scale(0.3) rotate(360deg)";
    flyer.style.opacity = "0.5";
  });

  // Efecto en el carrito cuando llega
  setTimeout(() => {
    cartBtn.classList.add("cart-bounce");
    if (typeof window.navigator.vibrate === "function") {
      window.navigator.vibrate(50); // Haptic feedback si está soportado
    }
    
    setTimeout(() => {
      cartBtn.classList.remove("cart-bounce");
    }, 300);
    
    // Limpiar flyer
    flyer.remove();
  }, 600);
}
