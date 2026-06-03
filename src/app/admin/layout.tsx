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
  { href: "/admin/categorias", label: "Categorías", icon: "📁" },
  { href: "/admin/sucursales", label: "Sucursales", icon: "🏪" },
  { href: "/admin/publicidad", label: "Publicidad", icon: "📢" },
  { href: "/admin/ofertas", label: "Ofertas", icon: "🔥" },
  { href: "/admin/stats", label: "Estadísticas", icon: "📊" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Leer tema guardado
  useEffect(() => {
    const saved = localStorage.getItem("elremate_admin_theme") as "light" | "dark" | null;
    if (saved === "dark") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("elremate_admin_theme", next);
  };

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    async function checkRole() {
      if (!user) return;

      // 1. Hardcoded bypass for superadmin (Renato) - Must be BEFORE getDoc to avoid permission errors
      if (user.email === "rnt.atlantida@gmail.com") {
        setRole("admin");
        setChecking(false);
        
        // Silently try to ensure the record exists, but ignore errors if rules block it
        try {
          const { setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "usuarios", user.uid), {
            email: user.email,
            role: "admin",
            repairedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn("Could not auto-repair admin record, manual fix might be needed.");
        }
        return;
      }
      
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        
        if (snap.exists()) {
          const userRole = snap.data().role;
          if (userRole === "admin" || userRole === "empleado" || userRole === "owner") {
            setRole(userRole);
          } else {
            router.replace("/admin/login");
          }
        } else {
          router.replace("/admin/login");
        }
      } catch (err) {
        console.error("Error checking role:", err);
        router.replace("/admin/login");
      } finally {
        setChecking(false);
      }
    }

    checkRole();
  }, [user, loading, router]);

  // Enforce access control for empleados and owners
  useEffect(() => {
    if (role === "empleado" && pathname !== "/admin/pedidos" && !pathname.startsWith("/admin/login")) {
      router.replace("/admin/pedidos");
    } else if (role === "owner" && pathname !== "/admin/pedidos" && pathname !== "/admin/stats" && !pathname.startsWith("/admin/login")) {
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
              signOut();
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
    if (role === "owner") {
      return link.href === "/admin/pedidos" || link.href === "/admin/stats";
    }
    return true;
  });

  return (
    <div className={`flex min-h-screen admin-panel ${theme === "dark" ? "admin-dark" : ""} bg-[var(--admin-bg)] text-[var(--admin-text-mid)] selection:bg-[var(--admin-accent)] selection:text-black transition-colors duration-300`}>
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-72 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)] md:flex transition-colors duration-300">
        <div className="flex h-20 items-center justify-center border-b border-[var(--admin-border)] px-6">
          <h1 className="font-bebas text-3xl tracking-widest text-[var(--admin-text-hi)]">
            EL REMATE <span className="text-[var(--admin-accent)]">ADMIN</span>
          </h1>
        </div>
        <nav className="flex-1 space-y-2 p-6 overflow-y-auto">
          {linksToShow.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--admin-accent-glow)] text-[var(--admin-accent)] shadow-[0_0_20px_var(--admin-accent-glow)]"
                    : "text-[var(--admin-text-lo)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]"
                }`}
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-110">{link.icon}</span>
                {link.label}
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-[var(--admin-accent)] shadow-[0_0_8px_var(--admin-accent)]"></div>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--admin-border)] p-6">
          {/* Theme Selector (Desktop) */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3 text-xs font-semibold text-[var(--admin-text-mid)]">
            <span className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase tracking-wider">Modo Visual</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 bg-[var(--admin-bg)] px-2.5 py-1 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-hi)] shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              {theme === "light" ? "☀️ Claro" : "🌙 Oscuro"}
            </button>
          </div>
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--admin-accent)] to-blue-600 text-white shadow-lg">
                <span className="font-bold">{user?.email?.[0].toUpperCase() || "U"}</span>
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-semibold text-[var(--admin-text-hi)]">{user?.email}</p>
                <p className="text-xs text-[var(--admin-accent)] capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20"
            >
              Cerrar Sesión
            </button>
          </div>
          <Link
            href="/catalogo"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--admin-text-mid)] transition-colors hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]"
          >
            <span>🛍️</span> Ver Catálogo
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-header-bg)] px-4 backdrop-blur-md md:hidden transition-colors duration-300">
        <h1 className="font-bebas text-2xl tracking-widest text-[var(--admin-text-hi)]">
          EL REMATE <span className="text-[var(--admin-accent)]">ADMIN</span>
        </h1>
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--admin-input-bg)] text-[var(--admin-text-hi)] border border-[var(--admin-border)] transition-colors hover:opacity-85"
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
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col transform border-l border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)] transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-end border-b border-[var(--admin-border)] px-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--admin-text-lo)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]"
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
                      ? "bg-[var(--admin-accent-glow)] text-[var(--admin-accent)]"
                      : "text-[var(--admin-text-lo)] hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]"
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="shrink-0 border-t border-[var(--admin-border)] p-6 bg-[var(--admin-sidebar-bg)]">
          {/* Theme Selector (Mobile) */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-3 text-xs font-semibold text-[var(--admin-text-mid)]">
            <span className="text-[10px] font-bold text-[var(--admin-text-lo)] uppercase tracking-wider">Modo Visual</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 bg-[var(--admin-bg)] px-2.5 py-1 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-hi)] shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              {theme === "light" ? "☀️ Claro" : "🌙 Oscuro"}
            </button>
          </div>
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--admin-accent)] to-blue-600 text-white shadow-lg">
                <span className="font-bold">{user?.email?.[0].toUpperCase() || "U"}</span>
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-semibold text-[var(--admin-text-hi)]">{user?.email}</p>
                <p className="text-xs text-[var(--admin-accent)] capitalize">{role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20"
            >
              Cerrar Sesión
            </button>
          </div>
          <Link
            href="/catalogo"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--admin-border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--admin-text-mid)] transition-colors hover:bg-[var(--admin-input-bg)] hover:text-[var(--admin-text-hi)]"
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
