'use client';

// filepath: src/components/carrito/AdPopup.tsx

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface AdPopupProps {
  isCartOpen: boolean;
  imageSrc: string;
  altText?: string;
  linkUrl?: string;
}

export default function AdPopup({
  isCartOpen,
  imageSrc,
  altText = 'Promoción especial',
  linkUrl,
}: AdPopupProps) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Al abrir el carrito → mostrar el ad (con pequeño delay para que el panel
  // termine su animación). Al cerrarlo → ocultar.
  useEffect(() => {
    if (isCartOpen && !dismissed) {
      const t = setTimeout(() => setVisible(true), 180);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isCartOpen, dismissed]);

  // Volver a mostrar si el carrito se vuelve a abrir (sesión nueva)
  useEffect(() => {
    if (!isCartOpen) {
      // reseteamos dismissed solo si la sesión de carrito terminó
      // para permitirlo en la próxima apertura
      const t = setTimeout(() => setDismissed(false), 600);
      return () => clearTimeout(t);
    }
  }, [isCartOpen]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 300);
  };

  const content = (
    <div
      className={`ad-popup ${visible ? 'ad-popup--visible' : ''}`}
      role="complementary"
      aria-label="Publicidad"
    >
      {/* Botón de cierre */}
      <button
        className="ad-popup__close"
        onClick={handleDismiss}
        aria-label="Cerrar publicidad"
      >
        ✕
      </button>

      {/* Etiqueta discreta */}
      <span className="ad-popup__label">Publicidad</span>

      {/* Imagen */}
      {linkUrl ? (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ad-popup__link"
          tabIndex={visible ? 0 : -1}
        >
          <Image
            src={imageSrc}
            alt={altText}
            width={340}
            height={420}
            className="ad-popup__img"
            priority
          />
        </a>
      ) : (
        <Image
          src={imageSrc}
          alt={altText}
          width={340}
          height={420}
          className="ad-popup__img"
          priority
        />
      )}
    </div>
  );

  return content;
}
