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
          <p className="text-xs text-[var(--admin-text-lo)]">Dossier de patrocinios y potencial de conversión digital.</p>
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
              Una herramienta pensada para que tu marca crezca junto a nosotros. Facilitamos el abastecimiento de los comercios locales y conectamos tus productos directamente con las góndolas de Canelones.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="inline-block px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-600 uppercase">
              PROPUESTA COMERCIAL
            </span>
          </div>
        </div>

        {/* Nota de Transparencia y Crecimiento Real */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 text-xs leading-relaxed text-[var(--admin-text-mid)] page-break-avoid">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2 uppercase tracking-wider text-[10px]">
            <span>📢</span> Nuestra historia digital y camino de crecimiento
          </div>
          <p className="text-[var(--admin-text-lo)] leading-relaxed">
            Nuestra plataforma web cuenta con <strong>3 meses de operación activa</strong>. El primer mes fue un periodo de test técnico y operativo para asegurar que la experiencia sea impecable. Los siguientes 2 meses han sido un trabajo de acompañamiento cara a cara, enfocado en capacitar y migrar de forma progresiva a nuestra fiel cartera de clientes físicos existentes para que comiencen a realizar sus pedidos semanales desde la web. Por esto, los números de compras digitales varían semana a semana: estamos en plena etapa de adopción digital y aprendizaje. 
            <br className="mb-2" />
            Lo más interesante es que <strong>aún no hemos iniciado pautas ni campañas publicitarias para atraer clientes nuevos digitales</strong>. Este paso forma parte de nuestro plan de expansión inmediata, lo que representa una oportunidad de captación de mercado única para las marcas patrocinadoras que nos acompañen desde el inicio.
          </p>
        </div>

        {/* 1. Métrica de Audiencia y Alcance Ampliado */}
        <div className="space-y-4 page-break-avoid">
          <h2 className="font-bebas text-xl sm:text-2xl tracking-widest text-[var(--admin-text-hi)] border-b border-[var(--admin-border)] pb-1.5 uppercase">
            1. Nuestra Comunidad y Tráfico Digital
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] leading-relaxed">
            Detrás de cada número hay un comercio o una familia. Somos el nexo diario de confianza para cientos de pequeños comerciantes y almaceneros de La Paz, Las Piedras, Canelones, 18 de Mayo y El Dorado. Les brindamos la comodidad de reponer su stock las 24 horas y elegir las mejores marcas locales.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 stats-grid-print">
            {[
              { label: "Impactos Mensuales", value: "280.000+", desc: "Exposiciones de banner y spotlight" },
              { label: "Visitas Únicas / Mes", value: "18.500+", desc: "Tráfico enfocado puramente en compras" },
              { label: "Compradores Activos", value: "4.800+", desc: "Clientes con cuenta recurrente" },
              { label: "Frecuencia de Compra", value: "2,4 veces", desc: "Pedidos promedio por cliente al mes" },
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
            2. Espacios pensados para destacar tu marca
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] leading-relaxed">
            Diseñamos espacios nativos no invasivos para que tu marca aparezca de forma orgánica en los momentos clave de decisión de compra del catálogo.
          </p>

          <div className="space-y-3">
            {[
              { 
                name: "Sponsored Spotlight (Destacado en Cabecera)", 
                ctr: "2,2% - 2,5%", 
                placement: "Home del catálogo - Espacio de cabecera fija", 
                benefit: "Perfecto para el lanzamiento de nuevos productos, promociones especiales y posicionamiento destacado." 
              },
              { 
                name: "Sponsored Products (Productos Sugeridos)", 
                ctr: "2,3% - 2,8%", 
                placement: "Fila destacada dentro de las categorías", 
                benefit: "Muestra tu producto directamente en la lista de compras del cliente con un botón rápido para añadir al carrito." 
              },
              { 
                name: "Brand Banners (Banners Informativos)", 
                ctr: "1,8% - 2,0%", 
                placement: "Pie de categorías y filtros de búsqueda", 
                benefit: "Fomenta la recordación de marca y ofertas estacionales de fiambrería y almacén de forma constante." 
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
            3. Tracción e Interacción por Categoría de Productos
          </h2>
          <p className="text-xs text-[var(--admin-text-lo)] leading-relaxed">
            Analizamos qué secciones generan mayor interés en el catálogo para orientar la pauta de tu marca de manera inteligente y efectiva.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="border-b border-[var(--admin-border)] text-[9px] uppercase tracking-widest text-[var(--admin-text-lo)] font-bold">
                <tr>
                  <th className="pb-3 pr-3">Familia de Productos</th>
                  <th className="pb-3 pr-3 text-center">Impresiones Mensuales</th>
                  <th className="pb-3 pr-3 text-center">Clicks Recibidos / Mes</th>
                  <th className="pb-3 text-center">CTR Promedio</th>
                  <th className="pb-3 text-right">Impulso de Ventas</th>
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
            4. Dónde estamos y cómo sumarte
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 two-col-grid-print">
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-[var(--admin-text-hi)] uppercase">Presencia en el Territorio</h3>
              <p className="text-xs text-[var(--admin-text-lo)] leading-relaxed">
                Nuestros pedidos se distribuyen principalmente en las zonas de mayor facturación del departamento de Canelones, liderado por la sucursal de <strong>Canelones (líder con 45% de participación)</strong>, seguido por Las Piedras Herrera, La Paz, 18 de Mayo y El Dorado. Esto garantiza un impacto publicitario localizado y de altísima efectividad comercial.
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
