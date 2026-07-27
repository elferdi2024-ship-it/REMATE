// filepath: src/app/admin/marketing/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { MarketingCampaign, CampaignType } from "@/types/campaigns";

export default function AdminMarketingPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [currentCampaign, setCurrentCampaign] = useState<Partial<MarketingCampaign>>({
    tipo: "top_bar",
    nombreInterno: "",
    titulo: "",
    subtitulo: "",
    ctaTexto: "VER OFERTAS",
    ctaUrl: "/catalogo",
    colorFondo: "#1A1410",
    colorTexto: "#FFFFFF",
    colorAccent: "#E53935",
    activa: true,
    sucursalIds: [],
    prioridad: 1,
    fechaInicio: new Date().toISOString().slice(0, 16),
    fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "campanas"), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MarketingCampaign[];
      setCampaigns(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCampaign.titulo || !currentCampaign.nombreInterno) {
      alert("Por favor complete los campos obligatorios.");
      return;
    }

    const campaignId = currentCampaign.id || `camp_${Date.now()}`;
    const payload: MarketingCampaign = {
      id: campaignId,
      tipo: currentCampaign.tipo as CampaignType,
      nombreInterno: currentCampaign.nombreInterno || "",
      titulo: currentCampaign.titulo || "",
      subtitulo: currentCampaign.subtitulo || "",
      ctaTexto: currentCampaign.ctaTexto || "",
      ctaUrl: currentCampaign.ctaUrl || "",
      colorFondo: currentCampaign.colorFondo || "#1A1410",
      colorTexto: currentCampaign.colorTexto || "#FFFFFF",
      colorAccent: currentCampaign.colorAccent || "#E53935",
      fechaInicio: new Date(currentCampaign.fechaInicio || Date.now()).toISOString(),
      fechaFin: new Date(currentCampaign.fechaFin || Date.now()).toISOString(),
      activa: currentCampaign.activa ?? true,
      sucursalIds: currentCampaign.sucursalIds || [],
      prioridad: Number(currentCampaign.prioridad) || 1,
      createdAt: currentCampaign.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "campanas", campaignId), payload);
    setIsEditing(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar esta campaña?")) {
      await deleteDoc(doc(db, "campanas", id));
    }
  };

  const toggleStatus = async (campaign: MarketingCampaign) => {
    await setDoc(doc(db, "campanas", campaign.id), {
      ...campaign,
      activa: !campaign.activa,
      updatedAt: new Date().toISOString(),
    });
  };

  const resetForm = () => {
    setCurrentCampaign({
      tipo: "top_bar",
      nombreInterno: "",
      titulo: "",
      subtitulo: "",
      ctaTexto: "VER OFERTAS",
      ctaUrl: "/catalogo",
      colorFondo: "#1A1410",
      colorTexto: "#FFFFFF",
      colorAccent: "#E53935",
      activa: true,
      sucursalIds: [],
      prioridad: 1,
      fechaInicio: new Date().toISOString().slice(0, 16),
      fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    });
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto font-sans text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestor de Campañas & Marketing Self-Service</h1>
          <p className="text-sm text-gray-500">Creá, editá y programá avisos, top-bars y banners de oferta sin depender de desarrollo.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsEditing(true); }}
          className="bg-[#E8302A] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#C4231E] transition-colors shadow-xs"
        >
          + Nueva Campaña
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border shadow-lg mb-8 space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">
            {currentCampaign.id ? "Editar Campaña" : "Crear Nueva Campaña"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Nombre Interno (Admin)</label>
              <input
                type="text"
                required
                placeholder="ej: Promo Lácteos Canelones"
                value={currentCampaign.nombreInterno || ""}
                onChange={(e) => setCurrentCampaign({ ...currentCampaign, nombreInterno: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Tipo de Campaña</label>
              <select
                value={currentCampaign.tipo || "top_bar"}
                onChange={(e) => setCurrentCampaign({ ...currentCampaign, tipo: e.target.value as CampaignType })}
                className="w-full border p-2 rounded text-sm bg-white"
              >
                <option value="top_bar">Top Bar Superior (Fija)</option>
                <option value="hero_banner">Banner Hero Principal</option>
                <option value="flash_offer">Oferta Relámpago (con Timer)</option>
                <option value="lead_modal">Popup Captura Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Prioridad (1 = Mayor)</label>
              <input
                type="number"
                min={1}
                value={currentCampaign.prioridad || 1}
                onChange={(e) => setCurrentCampaign({ ...currentCampaign, prioridad: Number(e.target.value) })}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Título Visible</label>
              <input
                type="text"
                required
                placeholder="ej: 🔥 15% OFF en Yerba y Café este fin de semana"
                value={currentCampaign.titulo || ""}
                onChange={(e) => setCurrentCampaign({ ...currentCampaign, titulo: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Subtítulo (Opcional)</label>
              <input
                type="text"
                placeholder="ej: Válido abonando en efectivo o transferencia"
                value={currentCampaign.subtitulo || ""}
                onChange={(e) => setCurrentCampaign({ ...currentCampaign, subtitulo: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Fecha Inicio</label>
              <input
                type="datetime-local"
                required
                value={currentCampaign.fechaInicio || ""}
                onChange={(e) => setCurrentCampaign({ ...currentCampaign, fechaInicio: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Fecha Expiración (Honesta)</label>
              <input
                type="datetime-local"
                required
                value={currentCampaign.fechaFin || ""}
                onChange={(e) => setCurrentCampaign({ ...currentCampaign, fechaFin: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Texto CTA</label>
              <input
                type="text"
                value={currentCampaign.ctaTexto || ""}
                onChange={(e) => setCurrentCampaign({ ...currentCampaign, ctaTexto: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">URL CTA</label>
              <input
                type="text"
                value={currentCampaign.ctaUrl || ""}
                onChange={(e) => setCurrentCampaign({ ...currentCampaign, ctaUrl: e.target.value })}
                className="w-full border p-2 rounded text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-black text-white font-bold rounded hover:bg-gray-800"
            >
              Guardar Campaña
            </button>
          </div>
        </form>
      )}

      {/* Lista de Campañas */}
      {loading ? (
        <p className="text-gray-500 text-sm">Cargando campañas de marketing...</p>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b text-xs font-bold uppercase text-gray-600">
              <tr>
                <th className="p-3">Estado</th>
                <th className="p-3">Campaña</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Vigencia</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50/50">
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(camp)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase cursor-pointer ${
                        camp.activa ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {camp.activa ? "ACTIVA" : "PAUSADA"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-gray-900">{camp.nombreInterno}</div>
                    <div className="text-xs text-gray-500">{camp.titulo}</div>
                  </td>
                  <td className="p-3">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-mono">
                      {camp.tipo}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-600">
                    {new Date(camp.fechaInicio).toLocaleDateString()} - {new Date(camp.fechaFin).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => { setCurrentCampaign(camp); setIsEditing(true); }}
                      className="text-blue-600 font-semibold hover:underline text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(camp.id)}
                      className="text-red-600 font-semibold hover:underline text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No hay campañas creadas aún. Hacé clic en &quot;+ Nueva Campaña&quot; para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
