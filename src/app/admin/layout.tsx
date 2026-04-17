"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/admin/pedidos", label: "Pedidos", icon: "📦" },
  { href: "/admin/precios", label: "Precios", icon: "📋" },
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
  const [isAdmin, setIsAdmin] = useState(false);
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
        if (snap.exists() && snap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setChecking(false);
      }
    }

    checkRole();
  }, [user, loading, router]);

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

  if (!isAdmin) return null;

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
          {NAV_LINKS.map((link) => {
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#00E5FF] to-blue-600 text-white shadow-lg">
                <span className="font-bold">A</span>
              </div>
              <div className="overflow-hidden">
                <p className="truncate font-semibold text-white">{user?.email}</p>
                <p className="text-xs text-[#00E5FF]">Administrador</p>
              </div>
            </div>
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
        className={`fixed inset-y-0 right-0 z-50 w-72 transform border-l border-white/5 bg-[#0A0F1C] transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-end px-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>
        <nav className="space-y-2 p-6">
          {NAV_LINKS.map((link) => {
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24 pt-24 md:px-8 md:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
