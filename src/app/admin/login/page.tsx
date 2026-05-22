"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { SUCURSALES } from "@/lib/sucursales";

export default function AdminLoginPage() {
  const { signIn, user, loginAsAdminDios } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Estados interactivos para Solicitud de Acceso por WhatsApp
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqBranch, setReqBranch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLocalhost(
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      );
    }
  }, []);

  // Al iniciar sesión, verificar rol
  useEffect(() => {
    if (!user || roleChecked) return;

    async function checkRole() {
      if (!user) return;

      // Superadmin bypass con auto-registro si es Renato
      if (user.email === "rnt.atlantida@gmail.com") {
        try {
           const { getDoc, doc, setDoc } = await import("firebase/firestore");
           const snap = await getDoc(doc(db, "usuarios", user.uid));
           if (!snap.exists() || snap.data().role !== "admin") {
              console.log("Setting up superadmin document...");
              await setDoc(doc(db, "usuarios", user.uid), {
                email: user.email,
                role: "admin",
                setupAt: new Date().toISOString()
              }, { merge: true });
           }
        } catch (e) {
           console.warn("Silent failure setting up superadmin record:", e);
        }
        document.cookie = "session=true; path=/; max-age=86400";
        router.replace("/admin/pedidos");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        
        console.log("DEBUG DATA DE FIRESTORE:", {
          buscando_uid: user.uid,
          documento_existe: snap.exists(),
          data_recibida: snap.exists() ? snap.data() : "DOCUMENTO NO ENCONTRADO"
        });
        
        if (snap.exists() && (snap.data().role === "admin" || snap.data().role === "empleado" || snap.data().role === "owner")) {
          document.cookie = "session=true; path=/; max-age=86400";
          router.replace("/admin/pedidos");
        } else {
          setError("Acceso denegado. No tenés permisos de administrador.");
        }
      } catch (e) {
        console.error("Error in login checkRole:", e);
        setError("Acceso denegado. No tenés permisos de administrador.");
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
            ? "Email o contraseña incorrectos."
            : "Hubo un problema. Intentá de nuevo."
          : "Hubo un problema. Intentá de nuevo.";
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
        <div className="mb-6 text-center select-none">
          <h1
            onClick={() => {
              if (isLocalhost) {
                setClickCount((prev) => prev + 1);
              }
            }}
            className="font-bebas text-3xl tracking-wider text-white cursor-default"
          >
            ADMIN <span style={{ color: "var(--rojo)" }}>EL REMATE</span>
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Ingresá con tu cuenta de administrador
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
              Contraseña
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
              placeholder="••••••••"
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
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Tarjeta Premium de Solicitud de Acceso */}
        <div 
          className="mt-6 rounded-xl p-4 border border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-300"
          style={{ border: "1px solid rgba(34, 197, 94, 0.15)", background: "rgba(0, 0, 0, 0.25)" }}
        >
          {!showRequestForm ? (
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-200 leading-relaxed mb-1">
                ¿No tenés un usuario asignado?
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                Para ingresar, solicitá tu usuario al administrador.
              </p>
              <button
                type="button"
                onClick={() => setShowRequestForm(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-white transition-all shadow-md bg-green-600 hover:bg-green-700 active:scale-95"
                style={{ boxShadow: "0 4px 12px rgba(34, 197, 94, 0.15)" }}
              >
                Solicitar Acceso por WhatsApp
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold text-white">Solicitud de Acceso</p>
                <button 
                  type="button"
                  onClick={() => setShowRequestForm(false)} 
                  className="text-[10px] text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
              
              <div>
                <label htmlFor="req-name" className="mb-0.5 block text-[10px] font-semibold text-gray-400">
                  Nombre Completo
                </label>
                <input
                  id="req-name"
                  type="text"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                  className="w-full rounded-lg px-2.5 py-1.5 text-xs text-white outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "rgba(34, 197, 94, 0.4)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>

              <div>
                <label htmlFor="req-email" className="mb-0.5 block text-[10px] font-semibold text-gray-400">
                  Correo Electrónico
                </label>
                <input
                  id="req-email"
                  type="email"
                  value={reqEmail}
                  onChange={(e) => setReqEmail(e.target.value)}
                  placeholder="Ej: juan@gmail.com"
                  required
                  className="w-full rounded-lg px-2.5 py-1.5 text-xs text-white outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "rgba(34, 197, 94, 0.4)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>

              <div>
                <label htmlFor="req-branch" className="mb-0.5 block text-[10px] font-semibold text-gray-400">
                  Sucursal a asignar
                </label>
                <select
                  id="req-branch"
                  value={reqBranch}
                  onChange={(e) => setReqBranch(e.target.value)}
                  required
                  className="w-full rounded-lg px-2 py-1.5 text-xs text-white outline-none transition-all bg-[#151515]"
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "rgba(34, 197, 94, 0.4)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                >
                  <option value="" disabled className="text-gray-500">Seleccionar sucursal</option>
                  {SUCURSALES.map((s) => (
                    <option key={s.id} value={`${s.nombre} (${s.direccion})`} className="text-white bg-[#151515]">
                      {s.nombre} ({s.direccion})
                    </option>
                  ))}
                  <option value="Depósito Central" className="text-white bg-[#151515]">Depósito Central</option>
                  <option value="Owner / Dueño" className="text-white bg-[#151515]">Owner / Dueño (Ver todo)</option>
                </select>
              </div>

              <a
                href={`https://wa.me/59892265952?text=${encodeURIComponent(
                  `Hola Renato, quiero solicitar un usuario para el sistema administrativo.\n\nNombre: ${reqName}\nCorreo: ${reqEmail}\nSucursal: ${reqBranch}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!reqName || !reqEmail || !reqBranch) {
                    e.preventDefault();
                    alert("Por favor completá todos los campos antes de enviar la solicitud.");
                  }
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg py-2 mt-1 text-xs font-bold text-white transition-all shadow-md bg-green-600 hover:bg-green-700 active:scale-95"
                style={{ boxShadow: "0 4px 12px rgba(34, 197, 94, 0.15)" }}
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" style={{ width: "16px", height: "16px" }}>
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.79-4.596c1.601.951 3.478 1.454 5.398 1.455 5.793 0 10.506-4.707 10.509-10.49.002-2.802-1.089-5.437-3.072-7.422C17.65 1.002 15.02.008 12.22.008c-5.797 0-10.51 4.708-10.514 10.493-.002 1.942.508 3.841 1.478 5.461l-.98 3.582 3.673-.963zm10.702-7.234c-.292-.146-1.73-.854-1.997-.952-.266-.097-.461-.146-.656.146-.195.292-.754.952-.923 1.147-.17.195-.338.219-.63.073-.292-.146-1.234-.454-2.35-1.45-.889-.79-1.635-1.76-2.183-2.85-.146-.292-.016-.45.13-.597.13-.133.292-.341.438-.512.146-.17.195-.292.292-.487.097-.195.048-.365-.024-.512-.072-.146-.656-1.584-.897-2.164-.236-.566-.497-.487-.68-.497-.183-.009-.39-.011-.597-.011-.207 0-.543.078-.827.39-.283.311-1.081 1.058-1.081 2.58 0 1.523 1.107 2.993 1.26 3.197.153.205 2.179 3.327 5.279 4.665.737.318 1.312.509 1.761.651.74.235 1.413.202 1.945.123.593-.088 1.73-.707 1.977-1.39.247-.684.247-1.27.172-1.39-.074-.12-.272-.193-.564-.34z" />
                </svg>
                Enviar por WhatsApp
              </a>
            </div>
          )}
        </div>

        {isLocalhost && clickCount >= 5 && (
          <div className="mt-4 border-t border-white/5 pt-4 text-center animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => {
                if (loginAsAdminDios) {
                  loginAsAdminDios();
                  router.replace("/admin/pedidos");
                }
              }}
              className="w-full rounded-lg py-2.5 text-xs font-bold text-black bg-[#00E5FF] transition-all hover:bg-[#00cce6] shadow-[0_0_15px_rgba(0,229,255,0.3)] animate-pulse"
            >
              ⚡ AUTO-LOGIN ADMIN DIOS (Local)
            </button>
          </div>
        )}

        <div className="mt-5 text-center">
          <button
            onClick={() => router.push("/catalogo")}
            className="text-xs font-semibold text-gray-500 transition-colors hover:text-gray-300"
          >
            ← Volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
