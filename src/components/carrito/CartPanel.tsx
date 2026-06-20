// filepath: src/components/carrito/CartPanel.tsx
'use client';

import { CartItem, Producto } from '@/types';
import type { MetodoEntrega } from '@/lib/sucursales';
import Image from 'next/image';
import CartItemRow from './CartItem';
import CartFooter from './CartFooter';
import AdPopup from './AdPopup';
import { AdSlotPlacement } from '@/components/ads';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (codigo: string, delta: number) => void;
  onRemove: (codigo: string) => void;
  total: number;
  onSendWA: () => void;
  alias: string;
  onAliasChange: (alias: string) => void;
  onShare: () => void;
  onClear: () => void;
  shareLink: string | null;
  onCopyShareLink: () => void;
  telefono: string;
  onTelefonoChange: (tel: string) => void;
  clientNotes?: string;
  onClientNotesChange?: (notes: string) => void;
  direccion?: string;
  onDireccionChange?: (dir: string) => void;
  onSaveLista?: () => void;
  isProcessing?: boolean;
  metodoEntrega: MetodoEntrega;
  onMetodoEntregaChange: (m: MetodoEntrega) => void;
  sucursalId: string | null;
  onSucursalChange: (id: string) => void;
  isTiendaCerrada?: boolean;
  relatedProducts?: Producto[];
  onAddProduct?: (p: Producto, e?: React.MouseEvent) => void;
}

export default function CartPanel({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  total,
  onSendWA,
  alias,
  onAliasChange,
  onShare,
  onClear,
  shareLink,
  onCopyShareLink,
  telefono,
  onTelefonoChange,
  clientNotes,
  onClientNotesChange,
  direccion,
  onDireccionChange,
  onSaveLista,
  isProcessing,
  metodoEntrega,
  onMetodoEntregaChange,
  sucursalId,
  onSucursalChange,
  isTiendaCerrada = false,
  relatedProducts = [],
  onAddProduct,
}: CartPanelProps) {
  // Configuración de la barra de progreso de envío gratis (Fase 3: CRO & Marketing)
  const MIN_TICKET = 3000;
  const progressPercent = Math.min(100, (total / MIN_TICKET) * 100);
  const isEligible = total >= MIN_TICKET;
  const missingAmount = Math.max(0, MIN_TICKET - total);

  return (
    <>
      {/* ── Overlay ── */}
      <div
        className={`overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* ── Ad Popup (Doña Coca) ── */}
      <AdPopup
        isCartOpen={isOpen}
        imageSrc="/ads/donacoca.png"
        altText="Doña Coca - Oferta especial"
      />

      {/* ── Slide-in panel ── */}
      <div className={`side-panel right ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="panel-header-dark">
          <div className="panel-header-inner">
            <div className="panel-header-brand">
              <span className="panel-eyebrow">El Remate · Canelones</span>
              <span className="panel-title">Tu Pedido</span>
              <span className="panel-sub">Revisá y enviá por WhatsApp</span>
            </div>
            <button className="panel-close" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="cart-body">
          
          {/* ── Barra de progreso dinámico del ticket mínimo (Fase 3) ── */}
          {items.length > 0 && (
            <div 
              style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, rgba(248,150,30,0.06) 0%, rgba(248,150,30,0.02) 100%)', 
                borderBottom: '1px solid rgba(248, 150, 30, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>
                  {isEligible ? (
                    <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🚚 ¡Tus costos de envío están bonificados!
                    </span>
                  ) : (
                    <span>
                      Te faltan <strong style={{ color: 'var(--ambar, #F8961E)' }}>${missingAmount.toLocaleString('es-UY')}</strong> para envío gratis
                    </span>
                  )}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginLeft: 'auto' }}>
                  {Math.round(progressPercent)}%
                </span>
              </div>
              
              <div 
                style={{ 
                  width: '100%', 
                  height: '8px', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div 
                  style={{ 
                    width: `${progressPercent}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #F8961E 0%, #F37021 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="cart-items">
            {items.length === 0 ? (
              <div className="cart-empty">
                <span className="cart-empty-icon">🛒</span>
                <strong>Todavía no agregaste nada</strong>
                <p>Agregá productos desde el catálogo para armar tu pedido.</p>
              </div>
            ) : (
              items.map((item) => (
                <CartItemRow
                  key={item.codigo}
                  item={item}
                  onUpdateQty={onUpdateQty}
                  onRemove={onRemove}
                />
              ))
            )}
          </div>

          {/* ── Carrusel táctil de Up-selling Semántico (Fase 3) ── */}
          {items.length > 0 && relatedProducts.length > 0 && (
            <div 
              style={{ 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted, #9C8570)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✨ Agregados Frecuentes</span>
              </div>
              
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  overflowX: 'auto', 
                  paddingBottom: '8px', 
                  scrollSnapType: 'x mandatory', 
                  WebkitOverflowScrolling: 'touch',
                }}
                className="scrollbar-none"
              >
                {relatedProducts.map((prod) => (
                  <div 
                    key={prod.codigo} 
                    style={{ 
                      scrollSnapAlign: 'start', 
                      flex: '0 0 140px', 
                      width: '140px', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1.5px solid var(--border, #E8DDD0)', 
                      borderRadius: 'var(--r-md, 12px)', 
                      padding: '8px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '4px', 
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    className="hover:border-amber-500/40"
                  >
                    <div style={{ position: 'relative', width: '100%', height: '70px', borderRadius: '6px', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {prod.imagen ? (
                        <Image src={prod.imagen} alt={prod.nombre} fill sizes="70px" style={{ objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '1.5rem' }}>📦</span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text, #1A1410)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4em', lineHeight: '1.2em' }}>
                      {prod.nombre}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--rojo, #E8302A)' }}>
                        ${prod.precio.toLocaleString('es-UY')}
                      </span>
                      <button
                        onClick={(e) => onAddProduct && onAddProduct(prod, e)}
                        style={{ 
                          background: 'var(--rojo, #E8302A)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '50%', 
                          width: '22px', 
                          height: '22px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 'bold', 
                          fontSize: '0.9rem',
                          cursor: 'pointer', 
                          transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }}
                        className="hover:scale-110 active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer — only show when cart has items */}
          {items.length > 0 && (
            <>
              <AdSlotPlacement slot="cart-upsell" />
              <CartFooter
                total={total}
                alias={alias}
                onAliasChange={onAliasChange}
                onSendWA={onSendWA}
                onShare={onShare}
                onClear={onClear}
                shareLink={shareLink}
                onCopyShareLink={onCopyShareLink}
                telefono={telefono}
                onTelefonoChange={onTelefonoChange}
                clientNotes={clientNotes}
                onClientNotesChange={onClientNotesChange}
                direccion={direccion}
                onDireccionChange={onDireccionChange}
                onSaveLista={onSaveLista}
                isProcessing={isProcessing}
                metodoEntrega={metodoEntrega}
                onMetodoEntregaChange={onMetodoEntregaChange}
                sucursalId={sucursalId}
                onSucursalChange={onSucursalChange}
                isTiendaCerrada={isTiendaCerrada}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
