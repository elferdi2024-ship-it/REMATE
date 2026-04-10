"use client";

import React, { useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────

interface PedidoRecord {
  id?: string;
  fecha: any; // Timestamp or Date or ISO string
  items: Array<{ codigo: string; nombre: string; cantidad: number; precioUnitario: number }>;
  total: number;
  notas?: string;
}

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Guest alias from localStorage */
  alias: string;
  /** Firebase user (null if guest) */
  user: any; // Firebase User | null
  /** Recent orders (last 10) */
  pedidos: PedidoRecord[];
  /** Called when alias is saved (localStorage) */
  onAliasSave: (alias: string) => void;
  /** Called when user wants to repeat last order */
  onReorder: (pedido: PedidoRecord) => void;
  /** Called on logout */
  onLogout: () => void;
  /** Called on clear local data */
  onClearData: () => void;
  /** Show "Mis Listas" section */
  onOpenListas?: () => void;
  /** Trigger auth form */
  onOpenAuth?: () => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function timeAgo(date: any): string {
  const now = new Date();
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string") {
    d = new Date(date);
  } else if (date?.toDate) {
    // Firebase Timestamp
    d = date.toDate();
  } else if (date?.seconds) {
    d = new Date(date.seconds * 1000);
  } else {
    return "hace tiempo";
  }

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
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string") {
    d = new Date(date);
  } else if (date?.toDate) {
    d = date.toDate();
  } else if (date?.seconds) {
    d = new Date(date.seconds * 1000);
  } else {
    return "";
  }

  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} · ${hours}:${mins}`;
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ── Component ───────────────────────────────────────────────────────────

export default function UserPanel({
  isOpen,
  onClose,
  alias,
  user,
  pedidos,
  onAliasSave,
  onReorder,
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
              <span className="panel-title">Tu Espacio</span>
              <span className="panel-sub">
                {user ? "Usuario registrado" : alias ? `Invitado · ${alias}` : "Identificate"}
              </span>
            </div>
            <button className="panel-close" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="user-panel-body">
          {/* ── State A: No alias ── */}
          {!alias && !user && (
            <div className="auth-setup">
              <div className="auth-welcome">
                <span className="auth-welcome-emoji">&#127960;</span>
                <h3>¿Cómo se llama tu negocio?</h3>
                <p>Así personalizamos tu pedido.</p>
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
              <div className="auth-divider">
                <span>o</span>
              </div>
              <button
                className="btn-secondary-link"
                onClick={() => onOpenAuth?.()}
              >
                Crear cuenta gratis &#8594;
              </button>
            </div>
          )}

          {/* ── State B: Guest with alias ── */}
          {alias && !user && (
            <div className="guest-panel">
              {/* Alias display */}
              <div className="guest-alias-header">
                <span className="guest-alias-eyebrow">NEGOCIO</span>
                <span className="guest-alias-name">{alias.toUpperCase()}</span>
                <button
                  className="btn-edit-alias"
                  onClick={() => {
                    setAliasInput(alias);
                    setEditingAlias(true);
                  }}
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
                    <button className="btn-small-primary" onClick={handleSaveAlias}>
                      Guardar
                    </button>
                    <button
                      className="btn-small-secondary"
                      onClick={() => {
                        setEditingAlias(false);
                        setAliasInput(alias);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Recent orders */}
              {pedidos.length > 0 && (
                <div className="pedidos-section">
                  <div className="pedidos-section-title">Últimos pedidos</div>
                  {pedidos.slice(0, 5).map((p, idx) => (
                    <PedidoCard
                      key={p.id || idx}
                      pedido={p}
                      onReorder={onReorder}
                    />
                  ))}
                  {pedidos.length > 5 && (
                    <div className="pedidos-more">
                      {pedidos.length - 5} más...
                    </div>
                  )}
                </div>
              )}

              {/* CTA to create account */}
              <button
                className="btn-create-account"
                onClick={() => onOpenAuth?.()}
              >
                Crear cuenta para guardar en la nube &#8594;
              </button>

              {/* Clear data */}
              <button className="btn-clear-data" onClick={onClearData}>
                Limpiar mis datos
              </button>
            </div>
          )}

          {/* ── State C: Registered user ── */}
          {user && (
            <div className="user-panel">
              {/* User header */}
              <div className="user-header">
                <span className="user-alias-eyebrow">NEGOCIO</span>
                <span className="user-alias-name">
                  {(user.displayName || alias || "Usuario").toUpperCase()}
                </span>
                <span className="user-stats">
                  {pedidos.length} pedidos · último hace {lastPedidoAgo || "tiempo"}
                </span>
              </div>

              {/* Recent orders */}
              {pedidos.length > 0 && (
                <div className="pedidos-section">
                  <div className="pedidos-section-title">
                    Últimos pedidos
                  </div>
                  {pedidos.slice(0, 5).map((p, idx) => (
                    <PedidoCard
                      key={p.id || idx}
                      pedido={p}
                      onReorder={onReorder}
                    />
                  ))}
                </div>
              )}

              {/* Mis Listas */}
              {onOpenListas && (
                <div className="listas-section">
                  <div className="listas-section-header">
                    <span className="listas-section-title">Mis Listas</span>
                    <button className="btn-new-lista" onClick={onOpenListas}>
                      Nueva lista
                    </button>
                  </div>
                </div>
              )}

              {/* Repeat last order */}
              {lastPedido && (
                <button
                  className="btn-reorder"
                  onClick={() => onReorder(lastPedido)}
                >
                  Repetir último pedido &#9889;
                </button>
              )}

              {/* Logout */}
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

// ── Sub-components ──────────────────────────────────────────────────────

function PedidoCard({
  pedido,
  onReorder,
}: {
  pedido: PedidoRecord;
  onReorder: (p: PedidoRecord) => void;
}) {
  const totalItems = pedido.items.reduce((s, i) => s + i.cantidad, 0);
  const showItems = pedido.items.slice(0, 2);
  const remaining = pedido.items.length - 2;

  return (
    <div className="pedido-card">
      <div className="pedido-card-header">
        <span className="pedido-card-date">{formatDate(pedido.fecha)}</span>
        <span className="pedido-card-total">{formatPrice(pedido.total)}</span>
      </div>
      <div className="pedido-card-items">
        {showItems.map((item, idx) => (
          <div key={idx} className="pedido-card-item">
            <span className="pedido-card-item-qty">{item.cantidad}x</span>
            <span className="pedido-card-item-name">{item.nombre}</span>
          </div>
        ))}
        {remaining > 0 && (
          <div className="pedido-card-item pedido-card-item-more">
            + {remaining} más...
          </div>
        )}
      </div>
      <button
        className="btn-reorder-small"
        onClick={() => onReorder(pedido)}
      >
        &#9889; Repetir
      </button>
    </div>
  );
}
