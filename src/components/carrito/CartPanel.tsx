// filepath: src/components/carrito/CartPanel.tsx
'use client';

import { CartItem, Producto } from '@/types';
import type { MetodoEntrega } from '@/lib/sucursales';
import Image from 'next/image';
import CartItemRow from './CartItem';
import CartFooter from './CartFooter';
import { AdSlotPlacement } from '@/components/ads';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';

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
  const { config } = useTiendaConfig();
  
  // Configuración de la barra de progreso de envío gratis (Fase 3: CRO & Marketing)
  const MIN_TICKET = config.minimoEnvioGratis;
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
            <div className="cart-progress-bar">
              <div className="cart-progress-text">
                <span>
                  {isEligible ? (
                    <span className="cart-progress-text--eligible">
                      🚚 ¡Tus costos de envío están bonificados!
                    </span>
                  ) : (
                    <span>
                      Te faltan <strong className="cart-progress-text--missing">${missingAmount.toLocaleString('es-UY')}</strong> para envío gratis
                    </span>
                  )}
                </span>
                <span className="cart-progress-text--percent">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              
              <div className="cart-progress-track">
                <div 
                  className="cart-progress-fill"
                  style={{ width: `${progressPercent}%` }}
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

          {/* ── Banner de disponibilidad ── */}
          {items.length > 0 && (
            <div className="cart-availability-banner">
              <span className="cart-availability-icon">ℹ️</span>
              <p className="cart-availability-text">
                Los productos están sujetos a disponibilidad según el stock de cada sucursal. 
                Si algún producto no está disponible, te contactaremos con alternativas.
              </p>
            </div>
          )}

          {/* ── Carrusel táctil de Up-selling Semántico (Fase 3) ── */}
          {items.length > 0 && relatedProducts.length > 0 && (
            <div className="cart-upsell-section">
              <div className="cart-upsell-title">
                <span>✨ Agregados Frecuentes</span>
              </div>
              
              <div className="cart-upsell-rail scrollbar-none">
                {relatedProducts.map((prod) => (
                  <div 
                    key={prod.codigo} 
                    className="cart-upsell-card hover:border-amber-500/40"
                  >
                    <div className="cart-upsell-card-img">
                      {prod.imagen ? (
                        <Image src={prod.imagen} alt={prod.nombre} fill sizes="70px" style={{ objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '1.5rem' }}>📦</span>
                      )}
                    </div>
                    
                    <div className="cart-upsell-card-name">
                      {prod.nombre}
                    </div>
                    
                    <div className="cart-upsell-card-footer">
                      <span className="cart-upsell-card-price">
                        ${prod.precio.toLocaleString('es-UY')}
                      </span>
                      <button
                        onClick={(e) => onAddProduct && onAddProduct(prod, e)}
                        className="cart-upsell-add-btn hover:scale-110 active:scale-95"
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
