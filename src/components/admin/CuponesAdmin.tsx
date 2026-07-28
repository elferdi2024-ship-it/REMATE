// filepath: src/components/admin/CuponesAdmin.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getCuponesConfig, saveCuponesConfig, type Cupon, type ConfigCupones } from "@/lib/cupones";
import { toast } from "sonner";

export default function CuponesAdmin() {
  const [config, setConfig] = useState<ConfigCupones>({ sistemaActivo: false, cupones: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Nuevo cupón form state
  const [codigo, setCodigo] = useState("");
  const [descuento, setDescuento] = useState(100);
  const [tipo, setTipo] = useState<"fijo" | "porcentaje">("fijo");
  const [minimoCompra, setMinimoCompra] = useState(1000);
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    setConfig(getCuponesConfig());
  }, []);

  const handleToggleSistema = (activo: boolean) => {
    const next = { ...config, sistemaActivo: activo };
    setConfig(next);
    saveCuponesConfig(next);
    toast.success(activo ? "Sistema de cupones ACTIVADO" : "Sistema de cupones DESACTIVADO");
  };

  const handleToggleCupon = (id: string, activo: boolean) => {
    const nextCupones = config.cupones.map((c) => (c.id === id ? { ...c, activo } : c));
    const next = { ...config, cupones: nextCupones };
    setConfig(next);
    saveCuponesConfig(next);
    toast.success(`Cupón ${activo ? "activado" : "desactivado"}`);
  };

  const handleSaveCupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) {
      toast.error("El código del cupón es obligatorio");
      return;
    }

    const cleanCodigo = codigo.trim().toUpperCase().replace(/\s+/g, "");

    let nextCupones: Cupon[];
    if (editingId) {
      nextCupones = config.cupones.map((c) =>
        c.id === editingId
          ? {
              ...c,
              codigo: cleanCodigo,
              descuento: Number(descuento),
              tipo,
              minimoCompra: Number(minimoCompra),
              descripcion,
            }
          : c
      );
      toast.success("Cupón actualizado correctamente");
    } else {
      const newCupon: Cupon = {
        id: `cup-${Date.now()}`,
        codigo: cleanCodigo,
        descuento: Number(descuento),
        tipo,
        minimoCompra: Number(minimoCompra),
        descripcion,
        activo: false, // Por defecto inactivo hasta que el admin decida activarlo
      };
      nextCupones = [...config.cupones, newCupon];
      toast.success("Nuevo cupón creado (inactivo por defecto)");
    }

    const next = { ...config, cupones: nextCupones };
    setConfig(next);
    saveCuponesConfig(next);

    // Reset form
    setEditingId(null);
    setCodigo("");
    setDescuento(100);
    setTipo("fijo");
    setMinimoCompra(1000);
    setDescripcion("");
  };

  const handleEdit = (c: Cupon) => {
    setEditingId(c.id);
    setCodigo(c.codigo);
    setDescuento(c.descuento);
    setTipo(c.tipo);
    setMinimoCompra(c.minimoCompra);
    setDescripcion(c.descripcion || "");
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Deseas eliminar este cupón de descuento?")) return;
    const nextCupones = config.cupones.filter((c) => c.id !== id);
    const next = { ...config, cupones: nextCupones };
    setConfig(next);
    saveCuponesConfig(next);
    toast.success("Cupón eliminado");
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <h1 className="text-xl font-black text-stone-900">Gestión de Cupones de Descuento</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Los cupones están **DESACTIVADOS por defecto**. Activálos únicamente cuando desees lanzar campañas promocionales.
          </p>
        </div>

        {/* Global Master Switch */}
        <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3">
          <span className="text-xs font-extrabold text-stone-800">
            {config.sistemaActivo ? "🟢 Sistema ACTIVADO" : "🔴 Sistema DESACTIVADO"}
          </span>
          <button
            type="button"
            onClick={() => handleToggleSistema(!config.sistemaActivo)}
            className={`px-4 py-2 rounded-lg text-xs font-black text-white transition-all shadow-sm ${
              config.sistemaActivo
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {config.sistemaActivo ? "Desactivar Sistema" : "Activar Sistema"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulador de Cupones */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          <h2 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
            <span>{editingId ? "✏️ Editar Cupón" : "➕ Crear Nuevo Cupón"}</span>
          </h2>

          <form onSubmit={handleSaveCupon} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Código del Cupón (Ej: REMATE100)
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="EJ: REMATE100"
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold uppercase text-stone-900 focus:outline-none focus:border-[#E8302A]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Descuento
                </label>
                <input
                  type="number"
                  value={descuento}
                  onChange={(e) => setDescuento(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#E8302A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as "fijo" | "porcentaje")}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#E8302A]"
                >
                  <option value="fijo">Monto Fijo ($)</option>
                  <option value="porcentaje">Porcentaje (%)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Mínimo de Compra requerida ($)
              </label>
              <input
                type="number"
                value={minimoCompra}
                onChange={(e) => setMinimoCompra(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#E8302A]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Descripción / Términos
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Válido en compras mayores a $1000"
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#E8302A]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#E8302A] text-white py-2 rounded-xl text-xs font-extrabold hover:bg-[#c9241f] transition-all shadow-sm"
              >
                {editingId ? "Guardar Cambios" : "Crear Cupón (Inactivo)"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setCodigo("");
                    setDescuento(100);
                  }}
                  className="px-3 py-2 bg-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-300"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Listado de Cupones */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-black text-stone-900 flex items-center justify-between">
            <span>📋 Cupones Creados ({config.cupones.length})</span>
            <span className="text-xs text-stone-500 font-normal">
              Usá los switches para activar/desactivar individualmente
            </span>
          </h2>

          {config.cupones.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500 text-xs font-semibold">
              No hay cupones configurados. Crea el primero desde el formulario.
            </div>
          ) : (
            <div className="space-y-2.5">
              {config.cupones.map((c) => (
                <div
                  key={c.id}
                  className={`bg-white border rounded-2xl p-4 transition-all shadow-xs flex items-center justify-between gap-4 ${
                    c.activo
                      ? "border-emerald-300 ring-2 ring-emerald-500/10"
                      : "border-stone-200 opacity-75"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-stone-900 tracking-wider">
                        {c.codigo}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          c.tipo === "fijo"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {c.tipo === "fijo" ? `-$${c.descuento}` : `-${c.descuento}%`}
                      </span>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          c.activo
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {c.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 font-medium">
                      {c.descripcion || `Descuento directo en compras de $${c.minimoCompra}+`}
                    </p>

                    <div className="text-[10px] text-stone-400 font-bold">
                      Min. Compra: ${c.minimoCompra.toLocaleString("es-UY")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCupon(c.id, !c.activo)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                        c.activo
                          ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                          : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                      }`}
                    >
                      {c.activo ? "Pausar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(c)}
                      className="px-2.5 py-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg text-xs font-bold"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
