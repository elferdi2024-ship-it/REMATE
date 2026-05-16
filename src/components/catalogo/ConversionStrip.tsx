"use client";

export default function ConversionStrip() {
  const items = [
    { title: "Entrega coordinada", desc: "Envío o retiro en 6 sucursales" },
    { title: "Pedido express", desc: "Confirmación rápida por WhatsApp" },
    { title: "Oferta semanal", desc: "Promos activas por categoría" },
    { title: "Stock mayorista", desc: "Volumen para negocio y hogar" },
  ];

  return (
    <section className="conversion-strip" aria-label="Beneficios de compra">
      {items.map((item) => (
        <article key={item.title} className="conversion-item">
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </article>
      ))}
    </section>
  );
}

