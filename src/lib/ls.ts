// localStorage helpers con tipos seguros
const LS_ALIAS = "elremate_alias";
const LS_TEL = "elremate_tel";
const LS_HISTORY = "elremate_history";
const LS_VISTA = "elremate_vista";
const LS_BUSQUEDAS = "elremate_busquedas";
const LS_SUCURSAL = "el_remate_selected_sucursal";
const LS_DIRECCION = "elremate_direccion";

export function getAlias(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_ALIAS) || "";
}

export function setAlias(v: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ALIAS, v);
}

export function getTelefono(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_TEL) || "";
}

export function setTelefono(v: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_TEL, v);
}

export function getDireccion(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_DIRECCION) || "";
}

export function setDireccion(v: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_DIRECCION, v);
}

export function getHistory(): any[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
  } catch {
    return [];
  }
}

export function setHistory(arr: any[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_HISTORY, JSON.stringify(arr.slice(0, 10)));
}

export function getVista(): "grilla" | "lista" {
  if (typeof window === "undefined") return "grilla";
  return (localStorage.getItem(LS_VISTA) as "grilla" | "lista") || "grilla";
}

export function setVista(v: "grilla" | "lista"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_VISTA, v);
}

export function getBusquedas(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_BUSQUEDAS) || "[]");
  } catch {
    return [];
  }
}

export function setBusquedas(arr: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_BUSQUEDAS, JSON.stringify(arr.slice(0, 10)));
}

export function addBusqueda(q: string): void {
  if (!q.trim()) return;
  const current = getBusquedas();
  const filtered = current.filter(item => item.toLowerCase() !== q.toLowerCase());
  filtered.unshift(q);
  setBusquedas(filtered.slice(0, 10));
}

export function getSelectedSucursal(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_SUCURSAL) || "";
}

export function setSelectedSucursal(v: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_SUCURSAL, v);
}
