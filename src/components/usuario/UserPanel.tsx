// filepath: src/components/usuario/UserPanel.tsx
"use client";

import React, { useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────

interface PedidoItem {
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface PedidoRecord {
  id?: string;
  fecha: any;
  items: PedidoItem[];
  total: number;
  notas?: string;
}

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alias: string;
  user: any;
  pedidos: PedidoRecord[];
  onAliasSave: (alias: string) => void;
  /** Legacy: agrega todos los items del pedido */
  onReorder: (pedido: PedidoRecord) => void;
  /** Nuevo: agrega solo items seleccionados con cantidades custom */
  onReorderItems?: (items: PedidoItem[]) => void;
  onLogout: () => void;
  onClearData: () => void;
  onOpenListas?: () => void;
  onOpenAuth?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(date: any): string {
  const now = new Date();
  let d: Date;
  if (date instanceof Date) d = date;
  else if (typeof date === "string") d = new Date(date);
  else if (date?.toDate) d = date.toDate();
  else if (date?.seconds) d = new Date(date.seconds * 1000);
  else return "hace tiempo";

  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "hace 1 día";
  if (diffDays < 30) return `hace ${diffDays} días`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "hace 1 mes";
  return `hace ${diffMonths} meses`;
}

function formatDate(date: any): string {
  let d: Date;
  if (date instanceof Date) d = date;
  else if (typeof date === "string") d = new Date(date);
  else if (date?.toDate) d = date.toDate();
  else if (date?.seconds) d = new Date(date.seconds * 1000);
  else return "";
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${d.getDate()} ${months[d.getMonth()]} · ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ── PedidoCard con historial granular ─────────────────────────────────────

function PedidoCard({
  pedido,
  onReorder,
  onReorderItems,
}: {
  pedido: PedidoRecord;
  onReorder: (p: PedidoRecord) => void;
  onReorderItems?: (items: PedidoItem[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  // Estado local: qty por cada item (usando codigo como key)
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(pedido.items.map((i) => [i.codigo, i.cantidad]))
  );

  const toggleSelect = (codigo: string) => {
    setSelected((prev) => ({ ...prev, [codigo]: !prev[codigo] }));
  };

  const selectAll = () => {
    const allSelected = pedido.items.every((i) => selected[i.codigo]);
    if (allSelected) {
      setSelected({});
    } else {
      setSelected(Object.fromEntries(pedido.items.map((i) => [i.codigo, true])));
    }
  };

  const setQty = (codigo: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [codigo]: Math.max(1, (prev[codigo] ?? 1) + delta),
    }));
  };

  const selectedItems = pedido.items.filter((i) => selected[i.codigo]);
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + (quantities[i.codigo] ?? i.cantidad) * i.precioUnitario,
    0
  );
  const allChecked = pedido.items.length > 0 && pedido.items.every((i) => selected[i.codigo]);
  const someChecked = selectedItems.length > 0 && !allChecked;

  const handleAddSelected = useCallback(() => {
    if (selectedItems.length === 0) return;
    const itemsToAdd = selectedItems.map((i) => ({
      ...i,
      cantidad: quantities[i.codigo] ?? i.cantidad,
    }));
    if (onReorderItems) {
      onReorderItems(itemsToAdd);
    } else {
      // Fallback al comportamiento legacy
      onReorder({ ...pedido, items: itemsToAdd });
    }
  }, [selectedItems, quantities, onReorderItems, onReorder, pedido]);

  return (
    <div className="pedido-card-v2">
      {/* Header del pedido — siempre visible */}
      <button
        className="pedido-card-v2-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="pedido-card-v2-meta">
          <span className="pedido-card-v2-date">{formatDate(pedido.fecha)}</span>
          <span className="pedido-card-v2-items-count">{pedido.items.length} productos</span>
        </div>
        <div className="pedido-card-v2-right">
          <span className="pedido-card-v2-total">{formatPrice(pedido.total)}</span>
          <span className={`pedido-card-v2-chevron${expanded ? " open" : ""}`}>›</span>
        </div>
      </button>

      {/* Preview de items cuando está colapsado */}
      {!expanded && (
        <div className="pedido-card-v2-preview">
          {pedido.items.slice(0, 3).map((item, idx) => (
            <span key={idx} className="pedido-card-v2-preview-chip">
              {item.cantidad}× {item.nombre.length > 20 ? item.nombre.slice(0, 20) + "…" : item.nombre}
            </span>
          ))}
          {pedido.items.length > 3 && (
            <span className="pedido-card-v2-preview-more">+{pedido.items.length - 3} más</span>
          )}
        </div>
      )}

      {/* Expanded — lista completa con checkboxes y steppers */}
      {expanded && (
        <div className="pedido-card-v2-body">
          {/* Seleccionar todos */}
          <div className="pedido-select-all-row">
            <label className="pedido-select-all-label">
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked;
                }}
                onChange={selectAll}
                className="pedido-checkbox"
              />
              <span>Seleccionar todos</span>
            </label>
            <span className="pedido-item-count-badge">{pedido.items.length} items</span>
          </div>

          {/* Lista de items */}
          <div className="pedido-items-list">
            {pedido.items.map((item) => {
              const isSelected = !!selected[item.codigo];
              const qty = quantities[item.codigo] ?? item.cantidad;
              return (
                <div
                  key={item.codigo}
                  className={`pedido-item-row${isSelected ? " selected" : ""}`}
                >
                  {/* Checkbox */}
                  <label className="pedido-item-check-label" aria-label={`Seleccionar ${item.nombre}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.codigo)}
                      className="pedido-checkbox"
                    />
                  </label>

                  {/* Nombre */}
                  <div className="pedido-item-name-wrap">
                    <span className="pedido-item-name">{item.nombre}</span>
                    {item.precioUnitario > 0 && (
                      <span className="pedido-item-price">
                        {formatPrice(item.precioUnitario)} c/u
                      </span>
                    )}
                  </div>

                  {/* Stepper */}
                  <div className={`pedido-item-stepper${!isSelected ? " disabled" : ""}`}>
                    <button
                      onClick={() => {
                        if (!isSelected) toggleSelect(item.codigo);
                        setQty(item.codigo, -1);
                      }}
                      className="pedido-step-btn"
                      aria-label="Disminuir"
                    >
                      −
                    </button>
                    <span className="pedido-step-val">{qty}</span>
                    <button
                      onClick={() => {
                        if (!isSelected) toggleSelect(item.codigo);
                        setQty(item.codigo, 1);
                      }}
                      className="pedido-step-btn"
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer con totales y CTA */}
          <div className="pedido-card-v2-footer">
            {selectedItems.length > 0 ? (
              <>
                <div className="pedido-selected-summary">
                  <span>{selectedItems.length} seleccionado{selectedItems.length > 1 ? "s" : ""}</span>
                  <span className="pedido-selected-total">{formatPrice(selectedTotal)}</span>
                </div>
                <button className="btn-add-selected" onClick={handleAddSelected}>
                  ⚡ Agregar al pedido
                </button>
              </>
            ) : (
              <p className="pedido-select-hint">Seleccioná los productos que querés agregar</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

export default function UserPanel({
  isOpen,
  onClose,
  alias,
  user,
  pedidos,
  onAliasSave,
  onReorder,
  onReorderItems,
  onLogout,
  onClearData,
  onOpenListas,
  onOpenAuth,
}: UserPanelProps) {
  const [aliasInput, setAliasInput] = useState(alias);
  const [editingAlias, setEditingAlias] = useState(!alias);

  const handleSaveAlias = () => {
    if (aliasInput.trim()) {
      onAliasSave(aliasInput.trim());
      setEditingAlias(false);
    }
  };

  const lastPedido = pedidos[0];
  const lastPedidoAgo = lastPedido ? timeAgo(lastPedido.fecha) : null;

  return (
    <>
      {/* Overlay */}
      <div className={`overlay ${isOpen ? "open" : ""}`} onClick={onClose} />

      {/* Panel */}
      <div className={`side-panel left ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="panel-header-dark">
          <div className="panel-header-inner">
            <div className="panel-header-brand">
              <span className="panel-eyebrow">El Remate · Canelones</span>
              <span className="panel-title">
                {user
                  ? (user.displayName || alias || "Mi Cuenta")
                  : alias
                  ? alias
                  : "Tu Espacio"}
              </span>
              <span className="panel-sub">
                {user
                  ? `✓ Usuario registrado${pedidos.length > 0 ? ` · ${pedidos.length} pedidos` : ""}`
                  : alias
                  ? `Invitado · Último pedido ${lastPedidoAgo || "sin pedidos"}`
                  : "Identificate para guardar tu historial"}
              </span>
            </div>
            <button className="panel-close" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="user-panel-body">

          {/* ── Estado A: Sin alias ni user ── */}
          {!alias && !user && (
            <div className="auth-setup">
              <div className="auth-welcome">
                <span className="auth-welcome-emoji">🏪</span>
                <h3>¿Cómo se llama tu negocio?</h3>
                <p>Para guardar tus pedidos y repetirlos fácilmente.</p>
              </div>
              <div className="form-group">
                <input
                  className="field-input"
                  type="text"
                  placeholder="Ej: Almacén Don Pepe"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveAlias()}
                />
                <button className="btn-primary" onClick={handleSaveAlias}>
                  Guardar
                </button>
              </div>
              <div className="auth-divider"><span>o</span></div>
              <button className="btn-secondary-link" onClick={() => onOpenAuth?.()}>
                Crear cuenta gratis — guardar en la nube &#8594;
              </button>
            </div>
          )}

          {/* ── Estado B: Invitado con alias ── */}
          {alias && !user && (
            <div className="guest-panel">
              {/* Alias */}
              <div className="guest-alias-header">
                <span className="guest-alias-eyebrow">NEGOCIO</span>
                <span className="guest-alias-name">{alias.toUpperCase()}</span>
                <button
                  className="btn-edit-alias"
                  onClick={() => { setAliasInput(alias); setEditingAlias(true); }}
                >
                  Editar
                </button>
              </div>

              {editingAlias && (
                <div className="alias-edit-row">
                  <input
                    className="field-input"
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveAlias()}
                  />
                  <div className="alias-edit-actions">
                    <button className="btn-small-primary" onClick={handleSaveAlias}>Guardar</button>
                    <button className="btn-small-secondary" onClick={() => { setEditingAlias(false); setAliasInput(alias); }}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* Historial */}
              {pedidos.length > 0 ? (
                <div className="pedidos-section">
                  <div className="pedidos-section-header">
                    <span className="pedidos-section-title">Historial de pedidos</span>
                    <span className="pedidos-section-hint">Tocá un pedido para elegir qué repetir</span>
                  </div>
                  {pedidos.slice(0, 8).map((p, idx) => (
                    <PedidoCard
                      key={p.id || idx}
                      pedido={p}
                      onReorder={onReorder}
                      onReorderItems={onReorderItems}
                    />
                  ))}
                </div>
              ) : (
                <div className="pedidos-empty">
                  <span className="pedidos-empty-icon">📋</span>
                  <p>Aún no tenés pedidos guardados.</p>
                  <p className="pedidos-empty-sub">Cuando hagas tu primer pedido, lo vas a ver acá.</p>
                </div>
              )}

              <button className="btn-create-account" onClick={() => onOpenAuth?.()}>
                Crear cuenta — historial en la nube &#8594;
              </button>
              <button className="btn-clear-data" onClick={onClearData}>
                Limpiar mis datos
              </button>
            </div>
          )}

          {/* ── Estado C: Usuario registrado ── */}
          {user && (
            <div className="user-panel">
              <div className="user-header">
                <span className="user-alias-eyebrow">NEGOCIO</span>
                <span className="user-alias-name">
                  {(user.displayName || alias || "Usuario").toUpperCase()}
                </span>
                <span className="user-stats">
                  {pedidos.length} pedidos · último {lastPedidoAgo || "reciente"}
                </span>
              </div>

              {/* Historial granular */}
              {pedidos.length > 0 ? (
                <div className="pedidos-section">
                  <div className="pedidos-section-header">
                    <span className="pedidos-section-title">Historial de pedidos</span>
                    <span className="pedidos-section-hint">Tocá un pedido para elegir qué repetir</span>
                  </div>
                  {pedidos.slice(0, 10).map((p, idx) => (
                    <PedidoCard
                      key={p.id || idx}
                      pedido={p}
                      onReorder={onReorder}
                      onReorderItems={onReorderItems}
                    />
                  ))}
                </div>
              ) : (
                <div className="pedidos-empty">
                  <span className="pedidos-empty-icon">📋</span>
                  <p>Sin pedidos registrados aún.</p>
                </div>
              )}

              {onOpenListas && (
                <div className="listas-section">
                  <div className="listas-section-header">
                    <span className="listas-section-title">Mis Listas</span>
                    <button className="btn-new-lista" onClick={onOpenListas}>Nueva lista</button>
                  </div>
                </div>
              )}

              <button className="btn-logout" onClick={onLogout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
