"use client";

import React, { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import * as ls from "@/lib/ls";

interface AuthFormProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after successful account creation to migrate localStorage data */
  onMigrate?: () => void;
}

export default function AuthForm({
  isOpen,
  onClose,
  onMigrate,
}: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!email.trim() || !password.trim()) {
        setError("Completá todos los campos.");
        return;
      }

      if (mode === "register" && !nombre.trim()) {
        setError("Ingresá el nombre de tu negocio.");
        return;
      }

      setLoading(true);

      try {
        if (mode === "register") {
          await signUp(email.trim(), password, nombre.trim());
          toast.success("¡Cuenta creada! Bienvenido.");
          // Migrate localStorage to Firestore
          onMigrate?.();
        } else {
          await signIn(email.trim(), password);
          toast.success("¡Sesión iniciada!");
        }
        onClose();
      } catch (err: any) {
        const msg =
          err?.code === "auth/email-already-in-use"
            ? "Ese email ya tiene cuenta. ¿Querés iniciar sesión?"
            : err?.code === "auth/weak-password"
            ? "La contraseña debe tener al menos 6 caracteres."
            : err?.code === "auth/invalid-email"
            ? "Ese email no tiene formato válido."
            : err?.code === "auth/user-not-found" ||
              err?.code === "auth/wrong-password"
            ? "Email o contraseña incorrectos."
            : "Hubo un problema. Intentá de nuevo.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [mode, email, password, nombre, signUp, signIn, toast, onMigrate, onClose]
  );

  const switchMode = useCallback(() => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError("");
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="overlay open" onClick={onClose} />

      {/* Panel */}
      <div className="side-panel left open">
        <div className="panel-header-dark">
          <div className="panel-header-inner">
            <div className="panel-header-brand">
              <span className="panel-eyebrow">El Remate · Canelones</span>
              <span className="panel-title">
                {mode === "register" ? "Crear Cuenta" : "Iniciar Sesión"}
              </span>
              <span className="panel-sub">
                {mode === "register"
                  ? "Guardá tu historial en la nube"
                  : "Accedé a tu cuenta"}
              </span>
            </div>
            <button className="panel-close" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </div>
        </div>

        <div className="user-panel-body">
          <form onSubmit={handleSubmit} className="auth-form-body">
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                className="field-input"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">
                Contraseña
              </label>
              <input
                id="auth-password"
                className="field-input"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {mode === "register" && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-nombre">
                  Nombre del negocio
                </label>
                <input
                  id="auth-nombre"
                  className="field-input"
                  type="text"
                  placeholder="Ej: Almacén Don Pepe"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-primary btn-primary-full"
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : mode === "register"
                ? "Crear cuenta"
                : "Iniciar sesión"}
            </button>

            <div className="auth-switch">
              {mode === "register" ? (
                <>
                  ¿Ya tenés cuenta?{" "}
                  <button
                    type="button"
                    className="auth-link"
                    onClick={switchMode}
                  >
                    Iniciar sesión
                  </button>
                </>
              ) : (
                <>
                  ¿No tenés cuenta?{" "}
                  <button
                    type="button"
                    className="auth-link"
                    onClick={switchMode}
                  >
                    Crear cuenta gratis
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
