"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, firebaseConfig } from "@/lib/firebase";

export default function UsuariosPage() {
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"empleado" | "admin">("empleado");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Security check: only Renato can access
  if (user?.email !== "rnt.atlantida@gmail.com") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-xl font-bold text-red-500">Acceso denegado. No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Initialize a secondary Firebase instance so we don't log out the current admin
      const appName = "SecondaryApp";
      let secondaryApp;
      try {
        secondaryApp = getApp(appName);
      } catch {
        secondaryApp = initializeApp(firebaseConfig, appName);
      }

      const secondaryAuth = getAuth(secondaryApp);

      // 2. Create the user
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUserId = userCredential.user.uid;

      // 3. Save role to Firestore (using the primary db instance)
      await setDoc(doc(db, "usuarios", newUserId), {
        email: email,
        role: role
      });

      // 4. Sign out the secondary instance to clean up
      await signOut(secondaryAuth);

      setMessage({ text: `Usuario ${email} creado exitosamente como ${role.toUpperCase()}`, type: "success" });
      setEmail("");
      setPassword("");
      setRole("empleado");

    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      let errorMsg = "Error al crear el usuario. Verifica los datos o intenta de nuevo.";
      if (error.code === "auth/email-already-in-use") {
        errorMsg = "El correo ya está registrado.";
      } else if (error.code === "auth/weak-password") {
        errorMsg = "La contraseña debe tener al menos 6 caracteres.";
      }
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl tracking-wide text-white">GESTIÓN DE USUARIOS</h2>
          <p className="text-sm text-gray-400">Crea nuevos accesos para empleados y administradores.</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#0A0F1C] p-6 shadow-2xl">
        <form onSubmit={handleCreateUser} className="space-y-5 max-w-md">
          
          {message && (
            <div className={`rounded-lg p-4 text-sm font-semibold ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@correo.com"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Contraseña (mínimo 6 caracteres)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••"
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Nivel de Acceso (Rol)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "empleado" | "admin")}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-white focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
            >
              <option value="empleado">Empleado (Solo ve Pedidos)</option>
              <option value="admin">Administrador (Acceso Total)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#00E5FF] px-4 py-3 font-bold text-black transition-all hover:bg-[#00cce6] disabled:opacity-50"
          >
            {loading ? "CREANDO USUARIO..." : "CREAR USUARIO"}
          </button>
        </form>
      </div>
    </div>
  );
}
