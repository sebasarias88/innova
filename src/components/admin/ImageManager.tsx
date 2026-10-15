"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import clsx from "clsx";
import { attachImage, deleteImage, moveImage, requestImageUpload, setProjectCover } from "@/app/admin/(panel)/media-actions";

export type ManagedImage = { id: string; path: string; url: string; alt: string | null };

const MAX_SIDE = 1600;
const MAX_BYTES = 5 * 1024 * 1024;

/** Resizes to max 1600px and converts to WebP in the browser (saves storage and bandwidth). */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  return blob && blob.type === "image/webp" ? blob : file;
}

export function ImageManager({
  kind,
  ownerId,
  images,
  uploadBase,
  apiKey,
  coverPath,
}: {
  kind: "product" | "project";
  ownerId: string;
  images: ManagedImage[];
  uploadBase: string;
  apiKey: string;
  coverPath?: string | null;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, start] = useTransition();

  async function upload(files: FileList) {
    setError(undefined);
    const list = Array.from(files);
    for (const [i, file] of list.entries()) {
      setUploading(`Subiendo ${i + 1} de ${list.length}…`);
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" no es una imagen.`);
        continue;
      }
      try {
        const body = await compress(file);
        if (body.size > MAX_BYTES) {
          setError(`"${file.name}" pesa más de 5 MB.`);
          continue;
        }
        const signed = await requestImageUpload({ kind, ownerId, contentType: body.type });
        if (!signed.ok) {
          setError(signed.error);
          break;
        }
        const res = await fetch(`${uploadBase}/${signed.path}?token=${encodeURIComponent(signed.token)}`, {
          method: "PUT",
          headers: { "content-type": body.type, "cache-control": "max-age=31536000", "x-upsert": "false", apikey: apiKey },
          body,
        });
        if (!res.ok) {
          setError(`No se pudo subir "${file.name}".`);
          continue;
        }
        const attached = await attachImage({ kind, ownerId, path: signed.path, alt: file.name.replace(/\.[^.]+$/, "").slice(0, 160) });
        if (!attached.ok) setError(attached.error);
      } catch {
        setError(`No se pudo procesar "${file.name}".`);
      }
    }
    setUploading(undefined);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error);
      router.refresh();
    });

  return (
    <div>
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {images.map((img, i) => {
            const isCover = kind === "project" ? coverPath === img.path : i === 0;
            return (
              <li key={img.id} className={clsx("group relative overflow-hidden rounded-xl border bg-navy-950", isCover ? "border-lime-400/60" : "border-white/10")}>
                <img src={img.url} alt={img.alt ?? ""} className="aspect-square w-full object-cover" loading="lazy" />
                {isCover && (
                  <span className="absolute left-2 top-2 rounded-full bg-lime-400 px-2 py-0.5 text-[10px] font-bold text-navy-900">Principal</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/85 to-transparent p-2 pt-6">
                  <div className="flex gap-1">
                    <IconBtn label="Mover antes" disabled={busy || i === 0} onClick={() => run(() => moveImage({ kind, imageId: img.id, direction: "up" }))}>
                      <ArrowUp className="size-3.5" />
                    </IconBtn>
                    <IconBtn label="Mover después" disabled={busy || i === images.length - 1} onClick={() => run(() => moveImage({ kind, imageId: img.id, direction: "down" }))}>
                      <ArrowDown className="size-3.5" />
                    </IconBtn>
                    {kind === "project" && !isCover && (
                      <IconBtn label="Usar como portada" disabled={busy} onClick={() => run(() => setProjectCover({ projectId: ownerId, path: img.path }))}>
                        <Star className="size-3.5" />
                      </IconBtn>
                    )}
                  </div>
                  <IconBtn
                    label="Eliminar"
                    danger
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm("¿Eliminar esta imagen?")) run(() => deleteImage({ kind, imageId: img.id }));
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </IconBtn>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => e.target.files?.length && upload(e.target.files)} />
      <button
        type="button"
        disabled={!!uploading}
        onClick={() => input.current?.click()}
        className={clsx(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-8 text-sm text-white/60 transition-colors hover:border-lime-400/60 hover:text-white disabled:opacity-60",
          images.length > 0 && "mt-3",
        )}
      >
        {uploading ? <LoaderCircle className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
        {uploading ?? "Agregar imágenes (JPG, PNG o WebP)"}
        {!uploading && <span className="text-xs text-white/40">Se optimizan automáticamente antes de subir.</span>}
      </button>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={clsx("grid size-7 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors disabled:opacity-30", danger ? "hover:bg-red-500" : "hover:bg-white/30")}
    >
      {children}
    </button>
  );
}
