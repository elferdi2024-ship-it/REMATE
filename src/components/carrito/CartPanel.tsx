// filepath: src/components/carrito/CartPanel.tsx
'use client';

import { CartItem, Producto } from '@/types';
import type { MetodoEntrega } from '@/lib/sucursales';
import type { ZonaEnvio } from '@/lib/envio-config';
import { UMBRAL_ENVIO_GRATIS, COSTOS_ENVIO } from '@/lib/envio-config';
import Image from 'next/image';
import CartItemRow from './CartItem';
import CartFooter from './CartFooter';
import { AdSlotPlacement } from '@/components/ads';
import { useTiendaConfig } from '@/hooks/useTiendaConfig';
import EmptyState from '@/components/ui/EmptyState';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (codigo: string, delta: number) => void;
  onRemove: (codigo: string) => void;
  total: number;
  subtotal?: number;
  costoEnvio?: number;
  zonaEnvio?: ZonaEnvio;
  onZonaEnvioChange?: (zona: ZonaEnvio) => void;
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
  subtotal,
  costoEnvio = 0,
  zonaEnvio = 'canelones',
  onZonaEnvioChange,
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
  
  // Configuración de la barra de progreso de envío gratis
  const baseSubtotal = subtotal ?? items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const MIN_TICKET = config.minimoEnvioGratis || UMBRAL_ENVIO_GRATIS;
  const progressPercent = Math.min(100, (baseSubtotal / MIN_TICKET) * 100);
  const isEligible = baseSubtotal >= MIN_TICKET;
  const missingAmount = Math.max(0, MIN_TICKET - baseSubtotal);

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
              <span className="panel-eyebrow">El Remate · Distribuidora</span>
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
          
          {/* ── Barra de progreso dinámico del ticket mínimo ── */}
          {items.length > 0 && (
            <div className="cart-progress-bar">
              <div className="cart-progress-text">
                <span>
                  {isEligible ? (
                    <span className="cart-progress-text--eligible">
                      🚚 ¡Tus costos de envío están bonificados! (Envío Gratis)
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

              {!isEligible && (
                <div className="text-[11px] text-stone-500 mt-1.5 pt-1 border-t border-stone-200/60 flex justify-between font-medium">
                  <span>Tarifas sub-umbrales:</span>
                  <span className="font-bold text-stone-700">
                    Canelones ${COSTOS_ENVIO.canelones.costo} · Montevideo ${COSTOS_ENVIO.montevideo.costo}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Items list */}
          <div className="cart-items">
            {items.length === 0 ? (
              <EmptyState 
                icon="🛒"
                title="Tu carrito está vacío"
                description="Agregá productos desde el catálogo para armar tu pedido express."
                actionText="Ver Catálogo"
                onAction={onClose}
              />
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

          {/* ── Carrusel táctil de Up-selling Semántico ── */}
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

          {/* Footer — solo cuando hay items en carrito */}
          {items.length > 0 && (
            <>
              <AdSlotPlacement slot="cart-upsell" />
              <CartFooter
                total={total}
                subtotal={baseSubtotal}
                costoEnvio={costoEnvio}
                zonaEnvio={zonaEnvio}
                onZonaEnvioChange={onZonaEnvioChange}
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
