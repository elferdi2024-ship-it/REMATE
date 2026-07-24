// filepath: src/app/politica-de-privacidad/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Distribuidora El Remate",
  description: "Política de Privacidad y protección de datos personales de Distribuidora El Remate.",
};

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EE] font-body text-[#111111]">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#3D3226] bg-[#1A1410] px-5 py-4 text-white">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Image
              src="/logo.png"
              alt="Distribuidora El Remate"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-bebas text-xl tracking-widest text-white">
              EL REMATE <span className="text-[#E8302A]">DISTRIBUIDORA</span>
            </span>
          </Link>
          <Link
            href="/catalogo"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            ← Volver a la Tienda
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[850px] px-5 py-12">
        <div className="rounded-3xl border border-[#DDD8D0] bg-white p-8 md:p-12 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-[3px] text-[#E8302A]">
            Legal & Transparencia
          </span>
          <h1 className="font-bebas text-4xl md:text-5xl tracking-wide text-[#1A1410] mt-1 mb-2">
            POLÍTICA DE PRIVACIDAD
          </h1>
          <p className="text-xs text-[#5C4A35] font-semibold mb-8 border-b border-[#F0EBE1] pb-4">
            Última actualización: 24 de Julio de 2026 · Distribuidora El Remate (Canelones, Uruguay)
          </p>

          <div className="space-y-6 text-sm text-[#333333] leading-relaxed">
            <section>
              <h2 className="font-bebas text-xl tracking-wider text-[#1A1410] mb-2 flex items-center gap-2">
                <span>🔒 1. Compromiso de Privacidad</span>
              </h2>
              <p>
                En <strong>Distribuidora El Remate</strong> nos tomamos muy en serio la privacidad y protección de los datos de nuestros clientes. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos la información personal que nos proporcionás al utilizar nuestro catálogo en línea y nuestros formularios de pedido.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wider text-[#1A1410] mb-2 flex items-center gap-2">
                <span>📋 2. Información que Recopilamos</span>
              </h2>
              <p className="mb-2">
                Para poder procesar y entregar tus pedidos de manera eficiente, recopilamos únicamente los siguientes datos esenciales cuando completás el formulario de compra:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-[#444444]">
                <li><strong>Nombre o Nombre de Negocio / Comercio:</strong> Para identificar al destinatario de la compra.</li>
                <li><strong>Número de Teléfono (WhatsApp):</strong> Para enviar la confirmación del pedido, coordinar la entrega y enviar avisos sobre el estado del pedido.</li>
                <li><strong>Dirección de Entrega:</strong> Requerida en caso de optar por envío a domicilio para coordinar la logística local.</li>
                <li><strong>Detalle de Pedidos:</strong> Productos, cantidades y notas adicionales indicadas voluntariamente.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wider text-[#1A1410] mb-2 flex items-center gap-2">
                <span>⚙️ 3. Uso de la Información</span>
              </h2>
              <p className="mb-2">Utilizamos tu información exclusivamente para los siguientes fines:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-[#444444]">
                <li>Procesar, preparar y despachar tus pedidos comerciales.</li>
                <li>Comunicarnos directamente a través de WhatsApp para confirmar detalles de entrega o cambios en el pedido.</li>
                <li>Mejorar tu experiencia de compra guardando localmente en tu dispositivo tus preferencias de sucursal.</li>
              </ul>
              <p className="mt-2 font-semibold text-[#1A1410]">
                ⚠️ No vendemos, no alquilamos ni compartimos tus datos personales con terceros para fines publicitarios ajenos a Distribuidora El Remate.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wider text-[#1A1410] mb-2 flex items-center gap-2">
                <span>🛡️ 4. Seguridad y Cifrado SSL</span>
              </h2>
              <p>
                Toda la comunicación entre tu navegador y nuestra plataforma se realiza mediante cifrado de grado bancario <strong>HTTPS (SSL)</strong>. El procesamiento de datos sigue los estándares normativos de protección de datos personales vigentes en la República Oriental del Uruguay (Ley N° 18.331).
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wider text-[#1A1410] mb-2 flex items-center gap-2">
                <span>🍪 5. Almacenamiento Local (Cookies y LocalStorage)</span>
              </h2>
              <p>
                Utilizamos almacenamiento local en tu navegador (LocalStorage) para recordar los artículos agregados a tu carrito y la sucursal seleccionada, permitiéndote no perder tu compra si cerrás o recargás la página. No utilizamos cookies de rastreo invasivas de terceros.
              </p>
            </section>

            <section>
              <h2 className="font-bebas text-xl tracking-wider text-[#1A1410] mb-2 flex items-center gap-2">
                <span>✍️ 6. Tus Derechos y Cancelación</span>
              </h2>
              <p>
                Tenés derecho a consultar, actualizar o solicitar la eliminación total de tus datos personales de nuestros registros en cualquier momento. Para ejercer estos derechos, simplemente contactanos vía WhatsApp al <strong>099 322 325</strong> o por nuestros canales oficiales de contacto.
              </p>
            </section>

            <section className="border-t border-[#F0EBE1] pt-6">
              <h2 className="font-bebas text-xl tracking-wider text-[#1A1410] mb-2 flex items-center gap-2">
                <span>📞 7. Contacto Directo</span>
              </h2>
              <p className="text-xs md:text-sm text-[#555555]">
                Si tenés alguna duda sobre nuestra Política de Privacidad o el tratamiento de tus datos, podés comunicarte directamente con nuestro equipo:
              </p>
              <div className="mt-3 rounded-2xl bg-[#F8F5F0] p-4 text-xs font-semibold text-[#1A1410] space-y-1 border border-[#EBE5DA]">
                <p>📍 <strong>Distribuidora El Remate</strong> - Canelones, Uruguay</p>
                <p>📱 <strong>WhatsApp Oficial:</strong> +598 99 322 325</p>
                <p>🌐 <strong>Sitio Web:</strong> https://remate-psi.vercel.app</p>
              </div>
            </section>
          </div>

          <div className="mt-10 flex justify-center border-t border-[#F0EBE1] pt-8">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1A1410] px-8 py-3.5 font-bebas text-lg tracking-widest text-white transition hover:bg-[#2D231C]"
            >
              ENTENDIDO, IR AL CATÁLOGO →
            </Link>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-[#3D3226] bg-[#1A1410] py-6 text-center text-xs text-white/40">
        Distribuidora El Remate © {new Date().getFullYear()} · Todos los derechos reservados
      </footer>
    </div>
  );
}
