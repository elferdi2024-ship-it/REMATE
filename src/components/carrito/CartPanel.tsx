import { useState } from 'react';
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
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  
  // Configuración de la barra de progreso de envío gratis
  const baseSubtotal = subtotal ?? items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const MIN_TICKET = config.minimoEnvioGratis || UMBRAL_ENVIO_GRATIS;
  const progressPercent = Math.min(100, (baseSubtotal / MIN_TICKET) * 100);
  const isEligible = baseSubtotal >= MIN_TICKET;
  const missingAmount = Math.max(0, MIN_TICKET - baseSubtotal);

  const totalQty = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <>
      {/* ── Overlay ── */}
      <div
        className={`overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* ── Slide-in panel ── */}
      <div className={`side-panel right ${isOpen ? 'open' : ''}`}>
        {/* Header con navegación limpia de 2 Pasos */}
        <div className="panel-header-dark bg-[#0F172A] border-b border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {step === 'checkout' && (
                <button 
                  onClick={() => setStep('cart')}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-sm hover:bg-slate-700 active:scale-95 transition-all"
                  aria-label="Volver a productos"
                >
                  ←
                </button>
              )}
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#EF233C] uppercase block">El Remate · Canelones</span>
                <h2 className="text-base font-extrabold text-white leading-tight">
                  {step === 'cart' ? `Tu Carrito (${totalQty})` : 'Datos de Entrega'}
                </h2>
              </div>
            </div>
            <button className="panel-close text-slate-400 hover:text-white text-lg p-1" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </div>

          {/* Stepper Tabs Visuales */}
          {items.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  step === 'cart' ? 'bg-[#EF233C] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>1. Productos</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  step === 'checkout' ? 'bg-[#EF233C] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>2. Entrega</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="cart-body flex-1 overflow-y-auto p-4 space-y-4">
          
          {step === 'cart' ? (
            <>
              {/* ── PASO 1: BARRA DE ENVÍO GRATIS Y LISTA DE PRODUCTOS ── */}
              {items.length > 0 && (
                <div className="cart-progress-bar bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1.5">
                    <span>
                      {isEligible ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <span>🚚</span> ¡Envío Gratis Bonificado!
                        </span>
                      ) : (
                        <span>
                          Faltan <strong className="text-[#EF233C]">${missingAmount.toLocaleString('es-UY')}</strong> para envío gratis
                        </span>
                      )}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                  
                  <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isEligible ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#EF233C] to-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items list */}
              <div className="cart-items divide-y divide-slate-100">
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

              {/* ── Carrusel táctil de Up-selling Semántico ── */}
              {items.length > 0 && relatedProducts.length > 0 && (
                <div className="cart-upsell-section pt-2 border-t border-slate-100">
                  <div className="cart-upsell-title text-xs font-extrabold text-slate-900 mb-2">
                    <span>✨ Agregados Frecuentes</span>
                  </div>
                  
                  <div className="cart-upsell-rail flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {relatedProducts.map((prod) => (
                      <div 
                        key={prod.codigo} 
                        className="cart-upsell-card shrink-0 w-28 bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex flex-col justify-between hover:border-amber-400 transition-all"
                      >
                        <div className="relative w-full h-14 mb-1">
                          {prod.imagen ? (
                            <Image src={prod.imagen} alt={prod.nombre} fill sizes="70px" style={{ objectFit: 'contain' }} />
                          ) : (
                            <span className="text-2xl flex items-center justify-center h-full">📦</span>
                          )}
                        </div>
                        
                        <div className="text-[10px] font-semibold text-slate-800 line-clamp-2 leading-tight mb-1">
                          {prod.nombre}
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs font-extrabold text-slate-900">
                            ${prod.precio.toLocaleString('es-UY')}
                          </span>
                          <button
                            onClick={(e) => onAddProduct && onAddProduct(prod, e)}
                            className="w-6 h-6 rounded-lg bg-[#EF233C] text-white font-extrabold text-xs flex items-center justify-center hover:bg-[#C01730] active:scale-90 transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* ── PASO 2: FORMULARIO DE CHECKOUT Y DATOS ── */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <div>
                    <div className="font-extrabold text-slate-900">{totalQty} productos en pedido</div>
                    <div className="text-slate-500 text-[11px]">Revisá los datos antes de enviar</div>
                  </div>
                </div>
                <button 
                  onClick={() => setStep('cart')}
                  className="text-[#EF233C] font-extrabold text-[11px] underline"
                >
                  Editar ítems
                </button>
              </div>

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

          {/* Sticky CTA solo para Paso 1 */}
          {step === 'cart' && items.length > 0 && (
            <div className="pt-3 border-t border-slate-200 mt-auto sticky bottom-0 bg-white/95 backdrop-blur-sm p-3 -mx-4 -mb-4 shadow-lg flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Subtotal</span>
                <span className="text-xl font-extrabold text-slate-900 font-price">${baseSubtotal.toLocaleString('es-UY')}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="bg-[#EF233C] hover:bg-[#C01730] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md shadow-[#EF233C]/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>CONTINUAR A ENTREGA</span>
                <span>➔</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

