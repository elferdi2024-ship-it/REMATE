export function formatPrice(n: number): string {
  return `$${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function timeAgo(date: Date | string | { seconds: number } | { toDate: () => Date } | null | undefined): string {
  if (!date) return "hace tiempo";
  const now = new Date();
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string") {
    d = new Date(date);
  } else if (typeof date === "object" && "toDate" in date && typeof (date as any).toDate === "function") {
    d = (date as { toDate: () => Date }).toDate();
  } else if (typeof date === "object" && "seconds" in date && typeof (date as any).seconds === "number") {
    d = new Date((date as { seconds: number }).seconds * 1000);
  } else {
    return "hace tiempo";
  }

  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "hace 1 día";
  if (diffDays < 30) return `hace ${diffDays} días`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "hace 1 mes";
  return `hace ${diffMonths} meses`;
}

export function getCatColorVar(cat: string): string {
  const map: Record<string, string> = {
    "Aceites y Aderezos":             "var(--cat-aceites,  #92400E)",
    "Bebidas":                         "var(--cat-bebidas,  #1D4ED8)",
    "Café, Té y Yerba":               "var(--cat-cafe,     #5C3317)",
    "Cereales y Granola":             "var(--cat-cereales, #C26A00)",
    "Congelados":                      "var(--cat-congelados,#0369A1)",
    "Conservas y Enlatados":          "var(--cat-pescado,  #0F766E)",
    "Descartables y Embalaje":        "var(--cat-descart,  #4B5563)",
    "Especias y Condimentos":         "var(--cat-especias, #065F46)",
    "Fiambres y Carnes":              "var(--cat-fiambres, #991B1B)",
    "Golosinas y Dulces":             "var(--cat-golosinas,#6D28D9)",
    "Harinas, Pastas y Legumbres":    "var(--cat-harinas,  #78350F)",
    "Higiene Personal":               "var(--cat-higiene,  #0369A1)",
    "Lácteos":                         "var(--cat-lacteos,  #9A3412)",
    "Limpieza":                        "var(--cat-limpieza, #0E7490)",
    "Mermeladas y Conservas Dulces":  "var(--cat-mermeladas,#9D174D)",
    "Otros":                           "var(--cat-otros,    #374151)",
    "Panadería":                       "var(--cat-panaderia,#2A6B3E)",
    "Papel e Higiene":                "var(--cat-papel,    #374151)",
  };
  return map[cat] || "var(--border, #DDD8D0)";
}

export function formatDate(date: any): string {
  let d: Date;
  if (date instanceof Date) d = date;
  else if (typeof date === "string") d = new Date(date);
  else if (date?.toDate && typeof date.toDate === "function") d = date.toDate();
  else if (date?.seconds && typeof date.seconds === "number") d = new Date(date.seconds * 1000);
  else return "";
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${d.getDate()} ${months[d.getMonth()]} · ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}

