import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Bebas_Neue } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import { FavoritosProvider } from "@/lib/favoritos-context";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "El Remate Canelones — Distribuidora Mayorista",
  description:
    "Catálogo mayorista de El Remate Canelones. Más de 1900 productos, precios al público, pedidos por WhatsApp.",
  keywords: [
    "distribuidora el remate",
    "mayorista canelones",
    "almacen mayorista uruguay",
    "distribuidora de alimentos",
    "compras por mayor canelones",
    "ofertas mayoristas",
    "catalogo whatsapp el remate"
  ],
  authors: [{ name: "Distribuidora El Remate" }],
  metadataBase: new URL("https://distribuidoraelremate.uy"),
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "El Remate",
  },
  icons: {
    icon: "/icon-512x512.png",
    apple: "/icon-512x512.png",
  },
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: "https://distribuidoraelremate.uy",
    title: "El Remate Canelones — Distribuidora Mayorista",
    description: "Catálogo mayorista en línea. Más de 1900 productos activos con precios insuperables y pedido express directo por WhatsApp.",
    siteName: "Distribuidora El Remate",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Distribuidora El Remate Canelones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "El Remate Canelones — Distribuidora Mayorista",
    description: "Catálogo mayorista en línea. Más de 1900 productos con entrega a domicilio y pedido por WhatsApp.",
    images: ["/logo.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EF233C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${plusJakarta.variable} ${bebasNeue.variable}`}>
      <body style={{ margin: 0, minHeight: "100vh" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WholesaleStore",
              "name": "Distribuidora El Remate",
              "image": "https://distribuidoraelremate.uy/logo.png",
              "@id": "https://distribuidoraelremate.uy/#store",
              "url": "https://distribuidoraelremate.uy",
              "telephone": "+59899322325",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Ruta 5",
                "addressLocality": "Canelones",
                "addressCountry": "UY"
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday"
                ],
                "opens": "08:00",
                "closes": "18:00"
              }
            })
          }}
        />
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <FavoritosProvider>
                {children}
                <PWAInstallPrompt />
              </FavoritosProvider>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
