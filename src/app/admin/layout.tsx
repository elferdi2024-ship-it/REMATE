"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/admin/pedidos", label: "Pedidos", icon: "📦" },
  { href: "/admin/precios", label: "Precios", icon: "📋" },
  { href: "/admin/productos", label: "Imágenes", icon: "🖼️" },
  { href: "/admin/stats", label: "Estadísticas", icon: "📊" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    async function checkRole() {
      if (!user) return;
      
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        
        // Superadmin self-repair & bypass
        if (user.email === "rnt.atlantida@gmail.com") {
          if (!snap.exists() || snap.data().role !== "admin") {
            console.log("Repairing superadmin permissions...");
            await setDoc(doc(db, "usuarios", user.uid), {
              email: user.email,
              role: "admin",
              repairedAt: new Date().toISOString()
            }, { merge: true });
          }
          setRole("admin");
          setChecking(false);
          return;
        }

        if (snap.exists()) {
          const userRole = snap.data().role;
          if (userRole === "admin" || userRole === "empleado") {
            setRole(userRole);
          } else {
            router.replace("/admin/login");
          }
        } else {
          router.replace("/admin/login");
        }
      } catch (err) {
        console.error("Error checking role:", err);
        // If it's Renato and it failed (likely rules), still let him see the UI but warn him
        if (user.email === "rnt.atlantida@gmail.com") {
          setRole("admin");
        } else {
          router.replace("/admin/login");
        }
      } finally {
        setChecking(false);
      }
    }

    checkRole();
  }, [user, loading, router]);

  // Enforce access control for empleados
  useEffect(() => {
    if (role === "empleado" && pathname !== "/admin/pedidos" && !pathname.startsWith("/admin/login")) {
      router.replace("/admin/pedidos");
    }
  }, [role, pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00E5FF] border-t-transparent shadow-[0_0_15px_rgba(0,229,255,0.5)]"></div>
          <p className="text-sm font-semibold tracking-widest text-[#00E5FF] uppercase">Verificando Acceso</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050914] px-4 text-center">
        <div className="mb-6 rounded-full bg-red-500/10 p-6 text-6xl shadow-[0_0_50px_rgba(239,35,60,0.2)]">
          🚫
        </div>
        <h1 className="mb-2 font-bebas text-4xl tracking-widest text-white">ACCESO DENEGADO</h1>
        <p className="mb-8 max-w-md text-gray-400">
          Tu cuenta ({user?.email}) no tiene permisos para acceder al panel de administración. 
          Contactá al administrador si creés que esto es un error.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => {
              import("firebase/auth").then(({ getAuth, signOut }) => {
                const auth = getAuth();
                signOut(auth).then(() => {
                  router.push("/admin/login");
                });
              });
            }}
            className="w-full rounded-xl bg-red-500 py-3 font-bold text-white transition-all hover:bg-red-600 shadow-[0_4px_20px_rgba(239,35,60,0.3)]"
          >
            CERRAR SESIÓN
          </button>
          <Link
            href="/catalogo"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 font-bold text-gray-300 transition-all hover:bg-white/10"
          >
            VOLVER AL CATÁLOGO
          </Link>
        </div>
      </div>
    );
  }

  const availableLinks = [...NAV_LINKS];
  if (user?.email === "rnt.atlantida@gmail.com") {
    availableLinks.push({ href: "/admin/usuarios", label: "Usuarios", icon: "👥" });
  }

  const linksToShow = availableLinks.filter((link) => {
    if (role === "empleado") {
      return link.href === "/admin/pedidos";
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#050914] text-gray-200 selection:bg-[#00E5FF] selection:text-black">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-72 flex-col border-r border-white/5 bg-[#0A0F1C] md:flex">
        <div className="flex h-20 items-center justify-center border-b border-white/5 px-6">
          <h1 className="font-bebas text-3xl tracking-widest text-white">
            EL REMATE <span className="text-[#00E5FF]">ADMIN</span>
          </h1>
        </div>
        <nav className="flex-1 space-y-2 p-6">
          {linksToShow.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.1)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-110">{link.icon}</span>
                {link.label}
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></div>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/5 p-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00E5FF] to-blue-600 text-white shadow-lg">
                <span className="font-bold">{user?.email?.[0].toUpperCase() || "U"}</span>
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-semibold text-white">{user?.email}</p>
                <p className="text-xs text-[#00E5FF] capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                import("firebase/auth").then(({ getAuth, signOut }) => {
                  const auth = getAuth();
                  signOut(auth).then(() => {
                    router.push("/admin/login");
                  });
                });
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20"
            >
              Cerrar Sesión
            </button>
          </div>
          <Link
            href="/catalogo"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span>🛍️</span> Ver Catálogo
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#0A0F1C]/80 px-4 backdrop-blur-md md:hidden">
        <h1 className="font-bebas text-2xl tracking-widest text-white">
          EL REMATE <span className="text-[#00E5FF]">ADMIN</span>
        </h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/10"
        >
          ☰
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col transform border-l border-white/5 bg-[#0A0F1C] transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-end border-b border-white/5 px-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-2 p-6">
            {linksToShow.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3.5 font-medium transition-all ${
                    isActive
                      ? "bg-[#00E5FF]/10 text-[#00E5FF]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="shrink-0 border-t border-white/5 p-6 bg-[#0A0F1C]">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00E5FF] to-blue-600 text-white shadow-lg">
                <span className="font-bold">{user?.email?.[0].toUpperCase() || "U"}</span>
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-semibold text-white">{user?.email}</p>
                <p className="text-xs text-[#00E5FF] capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                import("firebase/auth").then(({ getAuth, signOut }) => {
                  const auth = getAuth();
                  signOut(auth).then(() => {
                    router.push("/admin/login");
                  });
                });
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20"
            >
              Cerrar Sesión
            </button>
          </div>
          <Link
            href="/catalogo"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <span>🛍️</span> Ver Catálogo
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-4 pb-24 pt-24 md:px-8 md:pt-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
