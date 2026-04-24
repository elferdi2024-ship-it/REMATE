import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, DM_Serif_Display } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "El Remate Canelones — Distribuidora Mayorista",
  description:
    "Catálogo mayorista de El Remate Canelones. Más de 1900 productos, precios al público, pedidos por WhatsApp.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${plusJakarta.variable} ${dmSerifDisplay.variable}`}>
      <body style={{ margin: 0, minHeight: "100vh" }}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>{children}</ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
