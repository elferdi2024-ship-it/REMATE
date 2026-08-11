// filepath: src/app/admin/usuarios/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db, firebaseConfig } from "@/lib/firebase";
import { SUCURSALES } from "@/lib/sucursales";
import { normalizarEmail } from "@/lib/format";

interface UserData {
  id: string;
  email: string;
  role: "admin" | "empleado" | "owner";
  sucursalId?: string | null;
  contrasena?: string;
}

export default function UsuariosPage() {
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"empleado" | "admin" | "owner">("empleado");
  const [sucursalId, setSucursalId] = useState<string>("la-paz");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.email === "rnt.atlantida@gmail.com") {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const fetchedUsers: UserData[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedUsers.push({ id: docSnap.id, ...docSnap.data() } as UserData);
      });
      setUsersList(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Security check: only Renato can access
  if (user?.email !== "rnt.atlantida@gmail.com") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-xl font-bold text-red-500 dark:text-red-400">Acceso denegado. No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const appName = "SecondaryApp";
      let secondaryApp;
      try {
        secondaryApp = getApp(appName);
      } catch {
        secondaryApp = initializeApp(firebaseConfig, appName);
      }

      const emailNormalizado = normalizarEmail(email);
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, emailNormalizado, password);
      const newUserId = userCredential.user.uid;

      await setDoc(doc(db, "usuarios", newUserId), {
        email: emailNormalizado,
        role: role,
        contrasena: password,
        sucursalId: role === "empleado" ? sucursalId : null
      });

      await signOut(secondaryAuth);

      setMessage({ text: `Usuario ${email} creado exitosamente como ${role.toUpperCase()}`, type: "success" });
      setEmail("");
      setPassword("");
      setRole("empleado");
      setSucursalId("la-paz");
      fetchUsers(); // Refresh list

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

  const handleRoleChange = async (userId: string, newRole: "admin" | "empleado" | "owner") => {
    try {
      const updateData: any = { role: newRole };
      if (newRole !== "empleado") {
        updateData.sucursalId = null;
      } else {
        updateData.sucursalId = "la-paz";
      }
      await updateDoc(doc(db, "usuarios", userId), updateData);
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole, sucursalId: newRole === "empleado" ? "la-paz" : null }
            : u
        )
      );
      alert("Rol actualizado exitosamente");
    } catch (error) {
      alert("Error al actualizar el rol");
    }
  };
  
  const handleBranchChange = async (userId: string, newBranchId: string) => {
    try {
      await updateDoc(doc(db, "usuarios", userId), { sucursalId: newBranchId });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, sucursalId: newBranchId } : u))
      );
      alert("Sucursal reasignada exitosamente");
    } catch (error) {
      alert("Error al reasignar la sucursal");
    }
  };

  const handlePasswordReset = async (userEmail: string) => {
    if (confirm(`Se enviará un correo a ${userEmail} con un link seguro para crear una nueva contraseña. ¿Continuar?`)) {
      try {
        const authInstance = getAuth();
        await sendPasswordResetEmail(authInstance, userEmail);
        alert(`Correo de recuperación enviado a ${userEmail}`);
      } catch (error) {
        alert("Error al enviar el correo. Intenta de nuevo.");
      }
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (userEmail === "rnt.atlantida@gmail.com") {
      alert("No puedes eliminar la cuenta principal.");
      return;
    }
    if (confirm(`¿Estás seguro de eliminar el acceso de ${userEmail}? Esto borrará sus permisos (aunque su cuenta en Auth debe borrarse desde la consola).`)) {
      try {
        await deleteDoc(doc(db, "usuarios", userId));
        setUsersList((prev) => prev.filter((u) => u.id !== userId));
        alert("Acceso revocado exitosamente.");
      } catch (error) {
        alert("Error al eliminar el usuario.");
      }
    }
  };

  return (
    <div className="space-y-8 text-[var(--admin-text-mid)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl tracking-wide text-[var(--admin-text-hi)]">GESTIÓN DE USUARIOS</h2>
          <p className="text-sm text-[var(--admin-text-lo)]">Crea nuevos accesos, edita roles y gestiona contraseñas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Lado izquierdo: Crear Usuario */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-[var(--admin-text-hi)]">NUEVO USUARIO</h3>
            <form onSubmit={handleCreateUser} className="space-y-5">
              {message && (
                <div className={`rounded-lg p-4 text-sm font-semibold ${message.type === "success" ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"}`}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--admin-text-mid)]">Usuario / Correo Electrónico</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="remate1@canelones o correo"
                  className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-2.5 text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/55 focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--admin-text-mid)]">Contraseña (mínimo 6 caracteres)</label>
                <div className="relative">
                  <input
                    type={showFormPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••"
                    className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-2.5 pr-20 text-[var(--admin-text-hi)] placeholder-[var(--admin-text-lo)]/55 focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-2.5 text-xs text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)] font-bold uppercase tracking-wider"
                  >
                    {showFormPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--admin-text-mid)]">Nivel de Acceso (Rol)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "empleado" | "admin" | "owner")}
                  className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-2.5 text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                >
                  <option value="empleado" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">Empleado (Solo ve Pedidos del Local)</option>
                  <option value="owner" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">Dueño (Ve Pedidos y Estadísticas)</option>
                  <option value="admin" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">Administrador (Acceso Total)</option>
                </select>
              </div>

              {role === "empleado" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="mb-1 block text-sm font-medium text-[var(--admin-accent)]">Asignar Local / Sucursal</label>
                  <select
                    value={sucursalId}
                    onChange={(e) => setSucursalId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--admin-accent)]/30 bg-[var(--admin-bg)] px-4 py-2.5 text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                  >
                    {SUCURSALES.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">
                        {s.nombre} ({s.direccion})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--admin-accent)] px-4 py-3 font-bold text-[var(--admin-sidebar-bg)] transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "CREANDO..." : "CREAR USUARIO"}
              </button>
            </form>
          </div>
        </div>

        {/* Lado derecho: Lista de Usuarios */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-[var(--admin-text-hi)]">USUARIOS ACTUALES</h3>
            
            {loadingUsers ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--admin-accent)] border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[var(--admin-text-lo)]">
                  <thead className="bg-[var(--admin-bg)] text-xs uppercase text-[var(--admin-text-lo)]">
                    <tr>
                      <th className="px-4 py-3">Usuario / Correo</th>
                      <th className="px-4 py-3">Contraseña</th>
                      <th className="px-4 py-3">Rol</th>
                      <th className="px-4 py-3">Local Asignado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-input-bg)]/30 transition-colors">
                        <td className="px-4 py-4 font-medium text-[var(--admin-text-hi)]">{u.email}</td>
                        <td className="px-4 py-4 font-mono text-xs">
                          {u.contrasena ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--admin-text-hi)]">
                                {revealedPasswords[u.id] ? u.contrasena : "••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedPasswords((prev) => ({
                                    ...prev,
                                    [u.id]: !prev[u.id],
                                  }))
                                }
                                className="text-[10px] font-extrabold text-[var(--admin-accent)] uppercase hover:underline"
                              >
                                {revealedPasswords[u.id] ? "Ocultar" : "Mostrar"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[var(--admin-text-lo)]/40 italic">No disponible</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as "admin" | "empleado" | "owner")}
                            disabled={u.email === "rnt.atlantida@gmail.com"}
                            className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2 py-1 text-xs text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none disabled:opacity-50"
                          >
                            <option value="empleado" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">Empleado</option>
                            <option value="owner" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">Dueño</option>
                            <option value="admin" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">Administrador</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          {u.role === "empleado" ? (
                            <select
                              value={u.sucursalId || "la-paz"}
                              onChange={(e) => handleBranchChange(u.id, e.target.value)}
                              className="rounded-lg border border-[var(--admin-accent)]/20 bg-[var(--admin-bg)] px-2 py-1 text-xs text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
                            >
                              {SUCURSALES.map((s) => (
                                <option key={s.id} value={s.id} className="bg-[var(--admin-card-bg)] text-[var(--admin-text-hi)]">
                                  {s.nombre}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-[var(--admin-text-lo)]/50">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePasswordReset(u.email)}
                              className="rounded bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                            >
                              Reset Clave
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              disabled={u.email === "rnt.atlantida@gmail.com"}
                              className="rounded bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              Revocar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
