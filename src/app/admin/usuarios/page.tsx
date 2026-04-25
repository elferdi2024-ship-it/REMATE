"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db, firebaseConfig } from "@/lib/firebase";

interface UserData {
  id: string;
  email: string;
  role: "admin" | "empleado";
}

export default function UsuariosPage() {
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"empleado" | "admin">("empleado");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

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
        <p className="text-xl font-bold text-red-500">Acceso denegado. No tienes permisos para ver esta sección.</p>
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

      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUserId = userCredential.user.uid;

      await setDoc(doc(db, "usuarios", newUserId), {
        email: email,
        role: role
      });

      await signOut(secondaryAuth);

      setMessage({ text: `Usuario ${email} creado exitosamente como ${role.toUpperCase()}`, type: "success" });
      setEmail("");
      setPassword("");
      setRole("empleado");
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

  const handleRoleChange = async (userId: string, newRole: "admin" | "empleado") => {
    try {
      await updateDoc(doc(db, "usuarios", userId), { role: newRole });
      setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      alert("Rol actualizado exitosamente");
    } catch (error) {
      alert("Error al actualizar el rol");
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl tracking-wide text-white">GESTIÓN DE USUARIOS</h2>
          <p className="text-sm text-gray-400">Crea nuevos accesos, edita roles y gestiona contraseñas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Lado izquierdo: Crear Usuario */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-white/5 bg-[#0A0F1C] p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">NUEVO USUARIO</h3>
            <form onSubmit={handleCreateUser} className="space-y-5">
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
                {loading ? "CREANDO..." : "CREAR USUARIO"}
              </button>
            </form>
          </div>
        </div>

        {/* Lado derecho: Lista de Usuarios */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/5 bg-[#0A0F1C] p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-white">USUARIOS ACTUALES</h3>
            
            {loadingUsers ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Correo</th>
                      <th className="px-4 py-3">Rol</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-medium text-white">{u.email}</td>
                        <td className="px-4 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as "admin" | "empleado")}
                            disabled={u.email === "rnt.atlantida@gmail.com"}
                            className="rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-white focus:border-[#00E5FF] focus:outline-none disabled:opacity-50"
                          >
                            <option value="empleado">Empleado</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePasswordReset(u.email)}
                              className="rounded bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors"
                            >
                              Reset Clave
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              disabled={u.email === "rnt.atlantida@gmail.com"}
                              className="rounded bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
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
