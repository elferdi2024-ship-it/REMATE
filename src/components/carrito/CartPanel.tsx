'use client';

import { CartItem } from '@/types';
import CartItemRow from './CartItem';
import CartFooter from './CartFooter';

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
}: CartPanelProps) {
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

        {/* Footer — only show when cart has items */}
        {items.length > 0 && (
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
          />
        )}
      </div>
    </>
  );
}
