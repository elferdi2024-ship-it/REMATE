"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/admin/pedidos", label: "Pedidos", icon: "\uD83D\uDCE6" },
  { href: "/admin/precios", label: "Precios", icon: "\uD83D\uDCCB" },
  { href: "/admin/stats", label: "Estad\u00EDsticas", icon: "\uD83D\uDCCA" },
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
          return;
        }
      } catch {
        router.replace("/admin/login");
        return;
      } finally {
        setChecking(false);
      }
    }

    checkRole();
  }, [user, loading, router]);

  // Login page should render without the guard
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--oscuro)" }}>
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent"
          />
          <p className="mt-4 text-sm text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* Dark navy header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 shadow-lg"
        style={{ background: "var(--oscuro)", borderBottom: "1px solid rgba(76, 201, 240, 0.15)" }}
      >
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white md:hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            \u2630
          </button>
          <Link href="/admin/pedidos" className="font-bebas text-xl tracking-wider text-white">
            ADMIN <span className="text-cyan-400">EL REMATE</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${pathname === link.href
                ? "text-white"
                : "text-gray-400 hover:text-white"
                }`}
              style={
                pathname === link.href
                  ? { background: "var(--oscuro-2)" }
                  : {}
              }
            >
              <span className="mr-1.5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/catalogo"
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-white"
        >
          Ver cat\u00E1logo \u2192
        </Link>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-200 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{ background: "var(--oscuro)" }}
      >
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: "1px solid rgba(76,201,240,0.12)" }}>
          <span className="font-bebas text-lg tracking-wider text-white">MEN\u00DA</span>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            \u2715
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${pathname === link.href
                ? "text-white"
                : "text-gray-400 hover:text-white"
                }`}
              style={
                pathname === link.href
                  ? { background: "var(--oscuro-2)" }
                  : {}
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <div className="mt-4 border-t" style={{ borderColor: "rgba(76,201,240,0.1)" }} />
          <Link
            href="/catalogo"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-gray-400 transition-colors hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="text-lg">\uD83C\uDFEA</span>
            Ver cat\u00E1logo
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
