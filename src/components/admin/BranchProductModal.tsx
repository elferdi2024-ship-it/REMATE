// filepath: src/components/admin/BranchProductModal.tsx
"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { CATEGORIAS, type Producto } from "@/types";
import { cleanProductCode } from "@/lib/catalog-importer";

interface BranchProductModalProps {
  isOpen: boolean;
  sucursalNombre: string;
  initialProduct: Producto | null;
  existingCodes: Set<string>;
  onClose: () => void;
  onSave: (producto: Producto, isEdit: boolean) => Promise<void>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export default function BranchProductModal({
  isOpen,
  sucursalNombre,
  initialProduct,
  existingCodes,
  onClose,
  onSave,
}: BranchProductModalProps) {
  const isEdit = Boolean(initialProduct);

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState<string>(CATEGORIAS[0]);
  const [marca, setMarca] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState("");
  const [deshabilitado, setDeshabilitado] = useState(false);

  const [uploadingImg, setUploadingImg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (initialProduct) {
      setCodigo(initialProduct.codigo);
      setNombre(initialProduct.nombre);
      setPrecio(String(initialProduct.precio ?? 0));
      setCategoria(
        CATEGORIAS.includes(initialProduct.categoria as (typeof CATEGORIAS)[number])
          ? initialProduct.categoria
          : "OTROS"
      );
      setMarca(initialProduct.marca || "");
      setContenido(initialProduct.contenido || "");
      setImagen(initialProduct.imagen || "");
      setDeshabilitado(Boolean(initialProduct.deshabilitado));
    } else {
      setCodigo("");
      setNombre("");
      setPrecio("");
      setCategoria("OTROS");
      setMarca("");
      setContenido("");
      setImagen("");
      setDeshabilitado(false);
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }
    if (!storage) {
      setError("Firebase Storage no está configurado.");
      return;
    }

    setUploadingImg(true);
    setError(null);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });
      const extFromName = compressed.name.split(".").pop()?.toLowerCase();
      const ext =
        extFromName && ["jpg", "jpeg", "png", "webp"].includes(extFromName)
          ? extFromName
          : "jpg";
      const safeCode = cleanProductCode(codigo) || String(Date.now());
      const fileName = `${slugify(nombre || "producto")}-${safeCode}.${ext}`;
      const storageRef = ref(storage, `productos/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, compressed);
      const url = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          undefined,
          (err) => reject(err),
          async () => {
            try {
              resolve(await getDownloadURL(uploadTask.snapshot.ref));
            } catch (e) {
              reject(e);
            }
          }
        );
      });
      setImagen(url);
    } catch (err) {
      console.error(err);
      setError("No se pudo subir la imagen. Podés pegar una URL manualmente.");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = cleanProductCode(codigo);
    const cleanName = nombre.trim().toUpperCase();
    const numericPrice = parseFloat(precio.replace(",", "."));

    if (!cleanCode) {
      setError("El código / SKU es obligatorio.");
      return;
    }
    if (!isEdit && existingCodes.has(cleanCode)) {
      setError(`Ya existe un producto con el código "${cleanCode}" en esta sucursal.`);
      return;
    }
    if (!cleanName) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    if (isNaN(numericPrice) || numericPrice < 0) {
      setError("Ingresá un precio válido (0 o mayor).");
      return;
    }

    const payload: Producto = {
      ...(initialProduct || {}),
      codigo: cleanCode,
      nombre: cleanName,
      precio: numericPrice,
      categoria,
      deshabilitado,
      ...(marca.trim() ? { marca: marca.trim() } : { marca: undefined }),
      ...(contenido.trim() ? { contenido: contenido.trim() } : { contenido: undefined }),
      ...(imagen.trim() ? { imagen: imagen.trim() } : { imagen: undefined }),
    };

    setSaving(true);
    try {
      await onSave(payload, isEdit);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!saving && !uploadingImg) onClose();
      }}
    >
      <div
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] shadow-2xl text-[var(--admin-text-mid)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-bg)] px-6 py-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--admin-accent)]">
              Sucursal {sucursalNombre}
            </span>
            <h3 className="font-bebas text-2xl tracking-wider text-[var(--admin-text-hi)]">
              {isEdit ? "Editar Producto de Sucursal" : "Agregar Producto Manual"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || uploadingImg}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-sm font-bold text-[var(--admin-text-lo)] hover:text-[var(--admin-text-hi)] disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-500">
              ⚠️ {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
                Código / SKU *
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                disabled={isEdit || saving}
                placeholder="Ej: 7730989000123"
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3.5 py-2.5 text-sm font-mono text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
                Precio ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                disabled={saving}
                placeholder="Ej: 245"
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3.5 py-2.5 text-sm font-bold text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={saving}
              placeholder="Ej: YERBA CANARIAS 1 KG"
              className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3.5 py-2.5 text-sm font-semibold text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
                Categoría *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={saving}
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2.5 text-xs font-bold text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
                Marca (opcional)
              </label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                disabled={saving}
                placeholder="Ej: Canarias"
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3.5 py-2.5 text-sm text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
                Contenido / Presentación (opcional)
              </label>
              <input
                type="text"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                disabled={saving}
                placeholder="Ej: 1 Kg / Pack x 12"
                className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3.5 py-2.5 text-sm text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-2.5">
                <span className="text-xs font-bold text-[var(--admin-text-hi)]">
                  Visible en catálogo web
                </span>
                <input
                  type="checkbox"
                  checked={!deshabilitado}
                  onChange={(e) => setDeshabilitado(!e.target.checked)}
                  className="h-4 w-4 accent-[var(--admin-accent)]"
                />
              </label>
            </div>
          </div>

          {/* Imagen */}
          <div className="space-y-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]/60 p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--admin-text-lo)]">
              Imagen del Producto (URL o subir archivo)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative h-16 w-16 shrink-0 rounded-xl border border-[var(--admin-border)] bg-white overflow-hidden flex items-center justify-center">
                {imagen ? (
                  <Image src={imagen} alt={nombre || "Preview"} fill className="object-contain p-1" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="url"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  disabled={saving || uploadingImg}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-2 text-xs text-[var(--admin-text-hi)] focus:border-[var(--admin-accent)] focus:outline-none"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-1.5 text-xs font-bold text-[var(--admin-text-hi)] hover:border-[var(--admin-accent)] transition-colors">
                  <span>{uploadingImg ? "⏳ Subiendo..." : "📸 Subir imagen desde PC"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImg || saving}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageFile(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--admin-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || uploadingImg}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--admin-text-mid)] hover:text-[var(--admin-text-hi)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImg}
              className="rounded-xl bg-[var(--admin-accent)] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--admin-sidebar-bg)] hover:opacity-90 disabled:opacity-50 shadow-md"
            >
              {saving ? "Guardando..." : isEdit ? "Guardar Cambios" : "Agregar a Sucursal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
