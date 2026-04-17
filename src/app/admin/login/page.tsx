"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLoginPage() {
  const { signIn, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  // After sign-in, check role
  useEffect(() => {
    if (!user || roleChecked) return;

    async function checkRole() {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        console.log("DEBUG ADMIN LOGIN:", {
          uid: user.uid,
          exists: snap.exists(),
          data: snap.exists() ? snap.data() : null
        });
        if (snap.exists() && snap.data().role === "admin") {
          router.replace("/admin/pedidos");
        } else {
          setError("Acceso denegado. No ten\u00E9s permisos de administrador.");
        }
      } catch {
        setError("Acceso denegado. No ten\u00E9s permisos de administrador.");
      } finally {
        setRoleChecked(true);
      }
    }
    checkRole();
  }, [user, router, roleChecked]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setRoleChecked(false);
    setLoading(true);

    try {
      console.log("DEBUG: Iniciando handleSubmit...");
      await signIn(email, password);
      console.log("DEBUG: Auth exitoso. UID:", user?.uid);
    } catch (err: unknown) {
      setLoading(false);
      const message =
        err && typeof err === "object" && "code" in err
          ? err.code === "auth/invalid-credential"
            ? "Email o contrase\u00F1a incorrectos."
            : "Hubo un problema. Intent\u00E1 de nuevo."
          : "Hubo un problema. Intent\u00E1 de nuevo.";
      setError(message);
      return;
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--oscuro)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{
          background: "var(--oscuro-2)",
          border: "1px solid rgba(76, 201, 240, 0.15)",
        }}
      >
        <div className="mb-6 text-center">
          <h1
            className="font-bebas text-3xl tracking-wider text-white"
          >
            ADMIN <span style={{ color: "var(--rojo)" }}>EL REMATE</span>
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Ingres\u00E1 con tu cuenta de administrador
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1 block text-xs font-semibold text-gray-400"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(76,201,240,0.18)",
              }}
              placeholder="admin@elremate.com"
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(76,201,240,0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(76,201,240,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(76,201,240,0.18)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1 block text-xs font-semibold text-gray-400"
            >
              Contrase\u00F1a
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(76,201,240,0.18)",
              }}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(76,201,240,0.5)";
                e.target.style.boxShadow = "0 0 0 3px rgba(76,201,240,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(76,201,240,0.18)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {error && (
            <div
              className="rounded-lg px-3 py-2 text-center text-sm font-semibold"
              style={{
                background: "rgba(239, 35, 60, 0.12)",
                color: "var(--rojo)",
                border: "1px solid rgba(239, 35, 60, 0.25)",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{
              background: "var(--rojo)",
              boxShadow: "0 4px 18px rgba(239, 35, 60, 0.28)",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "var(--rojo-dark)";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "var(--rojo)";
            }}
          >
            {loading ? "Ingresando..." : "Iniciar sesi\u00F3n"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => router.push("/catalogo")}
            className="text-xs font-semibold text-gray-500 transition-colors hover:text-gray-300"
          >
            \u2190 Volver al cat\u00E1logo
          </button>
        </div>
      </div>
    </div>
  );
}
