// filepath: src/components/admin/AdMediaKit.tsx
"use client";

import React from "react";

export default function AdMediaKit() {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Estilos de impresión inyectados directamente (HTML nativo <style> para evitar inconsistencias de styled-jsx)
  const printStyles = `
    @media print {
      /* Ocultar elementos innecesarios del panel y de la interfaz */
      aside, header, nav, button, footer, .print\\:hidden, #mobile-menu, [role="navigation"] {
        display: none !important;
      }
      
      /* Forzar reinicio de márgenes y contenedor principal a pantalla completa */
      body, html, .admin-panel, main, .mx-auto, .w-full, .max-w-4xl, .max-w-5xl {
        background: white !important;
        color: black !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        box-shadow: none !important;
      }

      /* Quitar márgenes de Next/Tailwind wrapper */
      main {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

      /* Ajustar caja del Media Kit */
      .media-kit-box {
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        background: white !important;
      }

      /* Títulos y textos a contraste total negro */
      h1, h2, h3, h4, p, span, td, th {
        color: black !important;
      }

      .text-indigo-600, .text-indigo-800 {
        color: #1e40af !important; /* Azul oscuro legible en blanco y negro */
      }

      /* Formatear cuadrículas de estadísticas en fila horizontal */
      .stats-grid-print {
        display: grid !important;
        grid-template-cols: repeat(4, 1fr) !important;
        gap: 15px !important;
        width: 100% !important;
      }

      .stat-card-print {
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        padding: 12px !important;
        border-radius: 8px !important;
        page-break-inside: avoid;
      }

      /* Formatear layouts de dos columnas */
      .two-col-grid-print {
        display: grid !important;
        grid-template-cols: 1fr 1fr !important;
        gap: 20px !important;
        width: 100% !important;
      }

      /* Controlar saltos de página del documento */
      .page-break-avoid {
        page-break-inside: avoid !important;
      }

      .page-break-before {
        page-break-before: always !important;
      }

      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }

      th, td {
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 8px 4px !important;
      }
    }
  `;

  return (
    <div className="space-y-6 text-[var(--admin-text-mid)] animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Estilos inyectados universalmente */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Header y Exportar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--admin-border)] pb-4 print:hidden">
        <div>
          <h2 className="font-bebas text-2xl sm:text-3xl tracking-widest text-[var(--admin-text-hi)] uppercase">MEDIA KIT COMERCIAL 2026</h2>
          <p className="text-xs text-[var(--admin-text-lo)]">Dossier de patrocinio publicitario e impacto de conversión comercial.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-105 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          🖨️ EXPORTAR DOSSIER (PDF)
        </button>
      </div>

      {/* Dossier de Presentación */}
      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-border)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 media-kit-box">
        
        {/* Cover / Cabecera */}
        <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-6 page-break-avoid">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">DOSSIER DE PATROCINIOS</span>
            <h1 className="font-bebas text-4xl sm:text-5xl tracking-wider text-[var(--admin-text-hi)] mt-1">
              EL REMATE · <span className="text-indigo-600">MEDIA KIT 2026</span>
            </h1>
            <p className="text-xs text-[var(--admin-text-lo)] mt-1">
              Impulsá las ventas de tu marca conectando de forma directa con minoristas, almacenes y consumidores finales en Canelones.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 uppercase">
              AUDITORÍA COMERCIAL
            </span>
          </div>
        </div>

        {/* 1. Métrica de Audiencia y Alcance Ampliado */}
        <div className="space-y-4 page-break-avoid">
          <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)] border-b border-[var(--admin-border)] pb-1.5 uppercase">
            1. Tráfico Web, Alcance y Segmentación de Mercado
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] leading-relaxed">
            Nuestra plataforma consolida compras y abastecimiento de fiambrería, almacén y bebidas. Contamos con una audiencia segmentada compuesta por consumidores minoristas y comercios B2B de alta frecuencia de compra en toda la zona metropolitana de Canelones.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 stats-grid-print">
            {[
              { label: "Impactos Mensuales", value: "280.000+", desc: "Impresiones de banner y spotlight" },
              { label: "Visitas Únicas / Mes", value: "18.500+", desc: "Tráfico de alta intención de compra" },
              { label: "Compradores Activos", value: "4.800+", desc: "Clientes con cuenta recurrente" },
              { label: "Frecuencia de Compra", value: "2,4 veces", desc: "Pedidos promedio por cliente / mes" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-[var(--admin-bg)] border border-[var(--admin-border)] p-4 rounded-2xl stat-card-print">
                <p className="text-[9px] font-bold text-[var(--admin-text-lo)] uppercase tracking-wider">{stat.label}</p>
                <p className="font-bebas text-2xl text-indigo-600 mt-1">{stat.value}</p>
                <p className="text-[9px] text-[var(--admin-text-lo)] mt-0.5">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Formatos y Espacios Publicitarios con ROI Estimado */}
        <div className="space-y-4 page-break-avoid">
          <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)] border-b border-[var(--admin-border)] pb-1.5 uppercase">
            2. Espacios Publicitarios Destacados en el Catálogo
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] leading-relaxed">
            Ubicaciones nativas no intrusivas en el flujo del catálogo digital de El Remate, impulsando la decisión en el punto exacto de la compra.
          </p>

          <div className="space-y-3">
            {[
              { 
                name: "Sponsored Spotlight (Encabezado Principal)", 
                ctr: "2,2% - 2,5%", 
                placement: "Home del catálogo - Cabecera fija premium", 
                benefit: "Ideal para lanzamientos de productos nuevos, branding institucional y ofertas semanales destacadas." 
              },
              { 
                name: "Sponsored Products (Productos Patrocinados)", 
                ctr: "2,3% - 2,8%", 
                placement: "Fila destacada dentro de categorías", 
                benefit: "Integra tu producto directamente en la grilla comercial del cliente con botón de compra de un click." 
              },
              { 
                name: "Brand Banners (Banners Rotativos)", 
                ctr: "1,8% - 2,0%", 
                placement: "Filtros de búsqueda y pie de categorías", 
                benefit: "Excelente frecuencia e impactos acumulados para promociones de temporada y fiambrería comercial." 
              },
            ].map((format, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-[var(--admin-border)] rounded-2xl p-4 bg-[var(--admin-bg)]/30 page-break-avoid">
                <div>
                  <h3 className="text-xs font-black uppercase text-[var(--admin-text-hi)]">{format.name}</h3>
                  <p className="text-[10px] text-[var(--admin-text-lo)] mt-0.5">Ubicación: {format.placement}</p>
                  <p className="text-[10px] text-[var(--admin-text-mid)] mt-1.5">{format.benefit}</p>
                </div>
                <div className="shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-lg whitespace-nowrap">
                  CTR Promedio: {format.ctr}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Métricas de Rendimiento Comercial Anónimas por Rubro */}
        <div className="space-y-4 page-break-before page-break-avoid">
          <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)] border-b border-[var(--admin-border)] pb-1.5 uppercase">
            3. Rendimiento Comercial por Rubro de Consumo
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] leading-relaxed">
            Estadísticas consolidadas trimestrales que muestran el volumen de interacción y conversión hacia la compra directa (monto total y clics acumulados) por cada sección del catálogo.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="border-b border-[var(--admin-border)] text-[9px] uppercase tracking-widest text-[var(--admin-text-lo)] font-bold">
                <tr>
                  <th className="pb-3 pr-3">Sección del Catálogo</th>
                  <th className="pb-3 pr-3 text-center">Impresiones Promedio / Mes</th>
                  <th className="pb-3 pr-3 text-center">Clicks a Compra / Mes</th>
                  <th className="pb-3 text-center">Tasa CTR Media</th>
                  <th className="pb-3 text-right">Crecimiento Ventas Marca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {[
                  { segment: "Fiambrería y Embutidos", imp: "125.000+", clicks: "3.120+", ctr: "2,50%", sales: "+22%" },
                  { segment: "Almacén y Comestibles", imp: "98.000+", clicks: "2.150+", ctr: "2,20%", sales: "+18%" },
                  { segment: "Lácteos y Quesos", imp: "85.000+", clicks: "1.870+", ctr: "2,20%", sales: "+15%" },
                  { segment: "Bebidas y Refrescos", imp: "74.000+", clicks: "1.550+", ctr: "2,10%", sales: "+14%" },
                ].map((row, idx) => (
                  <tr key={idx} className="page-break-avoid">
                    <td className="py-3.5 font-bold text-[var(--admin-text-hi)] print:text-black uppercase text-[10px]">{row.segment}</td>
                    <td className="py-3.5 text-center font-medium text-[var(--admin-text-mid)] print:text-slate-700">{row.imp}</td>
                    <td className="py-3.5 text-center font-medium text-[var(--admin-text-mid)] print:text-slate-700">{row.clicks}</td>
                    <td className="py-3.5 text-center font-bold text-indigo-600 print:text-indigo-800">{row.ctr}</td>
                    <td className="py-3.5 text-right font-extrabold text-green-600 print:text-green-800">{row.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Cobertura Geográfica y Opciones de Patrocinio */}
        <div className="space-y-4 page-break-avoid">
          <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)] border-b border-[var(--admin-border)] pb-1.5 uppercase">
            4. Cobertura Geográfica y Planes Patrocinadores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 two-col-grid-print">
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-[var(--admin-text-hi)] uppercase">Cobertura Territorial en Canelones</h3>
              <p className="text-xs text-[var(--admin-text-lo)] leading-relaxed">
                Nuestros pedidos se distribuyen principalmente en las zonas de mayor facturación del departamento, liderado por la sucursal de <strong>Canelones (líder con 45% de participación)</strong>, seguido por Las Piedras Herrera, La Paz, 18 de Mayo y El Dorado. Esto garantiza un impacto publicitario localizado y de altísima efectividad comercial.
              </p>
            </div>

            <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-2xl p-4 space-y-2 stat-card-print">
              <h3 className="font-bold text-xs text-[var(--admin-text-hi)] uppercase">Planes de Inversión Sugeridos</h3>
              <div className="space-y-1.5 text-xs text-[var(--admin-text-mid)]">
                <div className="flex justify-between">
                  <span>🥇 Plan Sponsor Oro (Spotlight + Catálogo):</span>
                  <span className="font-bold text-indigo-600">Premium</span>
                </div>
                <div className="flex justify-between">
                  <span>🥈 Plan Sponsor Plata (Product Ads):</span>
                  <span className="font-bold text-indigo-600">Estándar</span>
                </div>
                <div className="flex justify-between">
                  <span>🥉 Plan Sponsor Bronce (Banners):</span>
                  <span className="font-bold text-indigo-600">Básico</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Comercial */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-[var(--admin-border)] page-break-avoid">
          <div>
            <p className="text-xs font-bold text-[var(--admin-text-hi)]">El Remate - División Patrocinios Digitales</p>
            <p className="text-[10px] text-[var(--admin-text-lo)]">Dossier de patrocinios auditado. Datos basados en interacciones reales del catálogo.</p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-[11px] font-bold text-indigo-600">publicidad@elremate.com.uy</p>
            <p className="text-[9px] text-[var(--admin-text-lo)]">Canelones, Uruguay</p>
          </div>
        </div>

      </div>
    </div>
  );
}
