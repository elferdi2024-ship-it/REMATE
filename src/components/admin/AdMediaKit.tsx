// filepath: src/components/admin/AdMediaKit.tsx
"use client";

import React from "react";

export default function AdMediaKit() {
  const formatPercentage = (val: number) => `${val.toFixed(1)}%`;

  return (
    <div className="space-y-6 text-[var(--admin-text-mid)] animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header y Exportar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--admin-border)] pb-4 print:hidden">
        <div>
          <h2 className="font-bebas text-2xl sm:text-3xl tracking-widest text-[var(--admin-text-hi)] uppercase">MEDIA KIT B2B & DOSSIER DE PATROCINIOS</h2>
          <p className="text-xs text-[var(--admin-text-lo)]">Reporte de impacto comercial y audiencias para marcas patrocinantes.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          🖨️ EXPORTAR MEDIA KIT (PDF)
        </button>
      </div>

      {/* Dossier de Presentación (Optimizado para Impresión A4) */}
      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Cover / Header de Reporte */}
        <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 print:text-indigo-800">Media Kit Comercial 2026</span>
            <h1 className="font-bebas text-3xl sm:text-5xl tracking-wider text-[var(--admin-text-hi)] print:text-black mt-1">
              EL REMATE · <span className="text-indigo-600 print:text-indigo-800">B2B ADVERTISING</span>
            </h1>
            <p className="text-xs text-[var(--admin-text-lo)] print:text-slate-600 mt-1">
              Conectando tu marca de forma directa con el canal minorista y almacenero de Canelones.
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 print:border-indigo-800 print:text-indigo-800">
              AUDITORÍA ACTIVA
            </span>
          </div>
        </div>

        {/* 1. Métricas Clave de Audiencia y Alcance */}
        <div className="space-y-4">
          <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)] print:text-black border-b border-[var(--admin-border)] pb-1.5 uppercase">
            1. Perfil de Audiencia y Tráfico General
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] print:text-slate-700 leading-relaxed">
            Nuestra plataforma digital consolida las compras de cientos de clientes finales y comercios minoristas locales de La Paz, Las Piedras, Canelones, 18 de Mayo y El Dorado.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              { label: "Visitas Mensuales", value: "18.500+", desc: "Tráfico altamente calificado" },
              { label: "Usuarios Activos", value: "4.800+", desc: "Compradores recurrentes" },
              { label: "Segmento Comercios (B2B)", value: "35%", desc: "Almacenes y autoservicios" },
              { label: "Tasa de Compra", value: "26,6%", desc: "Visitas que añaden al carro" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-[var(--admin-bg)] border border-[var(--admin-border)] p-4 rounded-2xl print:border-slate-300 print:bg-slate-50">
                <p className="text-[9px] font-bold text-[var(--admin-text-lo)] uppercase tracking-wider print:text-slate-500">{stat.label}</p>
                <p className="font-bebas text-2xl text-indigo-600 print:text-indigo-800 mt-1">{stat.value}</p>
                <p className="text-[9px] text-[var(--admin-text-lo)] mt-0.5 print:text-slate-500">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Formatos y Espacios Publicitarios */}
        <div className="space-y-4">
          <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)] print:text-black border-b border-[var(--admin-border)] pb-1.5 uppercase">
            2. Espacios de Alto Impacto y CTR
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] print:text-slate-700 leading-relaxed">
            Ofrecemos integraciones publicitarias en puntos calientes de decisión de compra del catálogo, asegurando conversión directa al carrito de compras.
          </p>

          <div className="space-y-3">
            {[
              { name: "Sponsored Spotlight (Destacado Principal)", ctr: "2.2% - 2.5%", placement: "Home del Catálogo - Encabezado principal", benefit: "Máxima visibilidad de marca y recordación de producto." },
              { name: "Sponsored Product (Producto Patrocinado)", ctr: "2.3% - 2.8%", placement: "Inserción directa en grilla de categorías", benefit: "Conversión de venta directa con botón de Añadir en 1-click." },
              { name: "Brand Hero Banner (Banner de Marca)", ctr: "1.8% - 2.0%", placement: "Slider rotativo superior y checkout", benefit: "Promociones flash y comunicación de ofertas masivas." },
            ].map((format, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-[var(--admin-border)] rounded-2xl p-4 bg-[var(--admin-bg)]/30 print:border-slate-300 print:bg-slate-50 print:page-break-inside-avoid">
                <div>
                  <h3 className="text-xs font-black uppercase text-[var(--admin-text-hi)] print:text-black">{format.name}</h3>
                  <p className="text-[10px] text-[var(--admin-text-lo)] print:text-slate-500 mt-0.5">Ubicación: {format.placement}</p>
                  <p className="text-[10px] text-[var(--admin-text-mid)] print:text-slate-700 mt-1.5">{format.benefit}</p>
                </div>
                <div className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 print:border-indigo-800 print:text-indigo-800 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-lg whitespace-nowrap">
                  CTR Promedio: {format.ctr}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Métricas Consolidadas Anónimas */}
        <div className="space-y-4">
          <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)] print:text-black border-b border-[var(--admin-border)] pb-1.5 uppercase">
            3. Rendimiento y Tracción de Anuncios
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] print:text-slate-700 leading-relaxed">
            Consolidado general de impresiones y clicks del catálogo del último trimestre, validando el retorno de inversión publicitaria.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="border-b border-[var(--admin-border)] text-[9px] uppercase tracking-widest text-[var(--admin-text-lo)] font-bold print:border-slate-400 print:text-slate-600">
                <tr>
                  <th className="pb-3 pr-3">Categoría de Anuncio</th>
                  <th className="pb-3 pr-3 text-center">Impresiones Promedio / Mes</th>
                  <th className="pb-3 pr-3 text-center">Clicks Directos a Compra</th>
                  <th className="pb-3 text-right">Tasa CTR Media</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)] print:divide-slate-200">
                {[
                  { segment: "Alimentos y Fiambrería", imp: "120.000+", clicks: "2.880", ctr: "2.40%" },
                  { segment: "Bebidas Alcohólicas y Refrescos", imp: "95.000+", clicks: "2.090", ctr: "2.20%" },
                  { segment: "Lácteos y Quesos", imp: "85.000+", clicks: "1.870", ctr: "2.20%" },
                  { segment: "Artículos de Limpieza", imp: "62.000+", clicks: "1.116", ctr: "1.80%" },
                ].map((row, idx) => (
                  <tr key={idx} className="print:page-break-inside-avoid">
                    <td className="py-3 font-bold text-[var(--admin-text-hi)] print:text-black uppercase text-[10px]">{row.segment}</td>
                    <td className="py-3 text-center font-medium text-[var(--admin-text-mid)] print:text-slate-700">{row.imp}</td>
                    <td className="py-3 text-center font-medium text-[var(--admin-text-mid)] print:text-slate-700">{row.clicks}</td>
                    <td className="py-3 text-right font-extrabold text-indigo-600 print:text-indigo-800">{row.ctr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Por qué elegir El Remate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--admin-border)] print:border-slate-300 print:page-break-inside-avoid">
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-[var(--admin-text-hi)] print:text-black uppercase">Ventajas Clave de Patrocinio</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[var(--admin-text-lo)] print:text-slate-600 pl-1">
              <li><strong>Canal Canelones Líder</strong>: Alcance en las zonas de mayor consumo del departamento.</li>
              <li><strong>Intención de Compra Directa</strong>: Los anuncios impactan en el momento exacto en que el usuario agrega productos al carrito.</li>
              <li><strong>Reportes Reales de ROI</strong>: Acceso a métricas de impresiones y clicks transparentes.</li>
            </ul>
          </div>
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex flex-col justify-center print:bg-slate-50 print:border-slate-200">
            <p className="text-[10px] font-bold text-indigo-600 print:text-indigo-800 uppercase tracking-widest mb-1">Contacto Comercial:</p>
            <p className="text-[11px] font-bold text-[var(--admin-text-hi)] print:text-black">El Remate Canelones - Patrocinios Digitales</p>
            <p className="text-[10px] text-[var(--admin-text-lo)] print:text-slate-500 mt-0.5">Correo: publicidad@elremate.com.uy</p>
          </div>
        </div>
      </div>

      {/* Estilos específicos de impresión */}
      <style jsx global>{`
        @media print {
          aside, header, nav, button, footer, .print\\:hidden {
            display: none !important;
          }
          main, .admin-panel, .mx-auto, .w-full, .max-w-4xl {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .rounded-2xl, .rounded-3xl {
            border-radius: 8px !important;
          }
          .shadow-xl {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
