"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2 } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { attachImage, deleteImage, moveImage, requestImageUpload, setProjectCover } from "@/app/admin/(panel)/media-actions";
import { optimizeImage } from "@/lib/media/optimize";
import { BusyContent, Spinner } from "@/components/ui/Busy";

export type ManagedImage = { id: string; path: string; url: string; alt: string | null };

/** Originals larger than this are rejected before optimizing (very large files can freeze phones). */
const MAX_INPUT_BYTES = 40 * 1024 * 1024;

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
  const confirm = useConfirm();
  const [busy, start] = useTransition();

  async function upload(files: FileList) {
    const list = Array.from(files);
    const setError = (message: string) => toast.error(message);
    let uploaded = 0;
    for (const [i, file] of list.entries()) {
      setUploading(`Subiendo ${i + 1} de ${list.length}…`);
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" no es una imagen.`);
        continue;
      }
      try {
        if (file.size > MAX_INPUT_BYTES) {
          setError(`"${file.name}" es demasiado grande (máx. 40 MB).`);
          continue;
        }
        setUploading(`Optimizando ${i + 1} de ${list.length}…`);
        const { full, thumb } = await optimizeImage(file);
        setUploading(`Subiendo ${i + 1} de ${list.length}…`);
        const signed = await requestImageUpload({ kind, ownerId, contentType: full.type });
        if (!signed.ok) {
          setError(signed.error);
          break;
        }
        const put = (path: string, token: string, body: Blob) =>
          fetch(`${uploadBase}/${path}?token=${encodeURIComponent(token)}`, {
            method: "PUT",
            // Unique file names never change, so browsers and the CDN can keep them for a year.
            headers: { "content-type": body.type, "cache-control": "max-age=31536000", "x-upsert": "false", apikey: apiKey },
            body,
          });
        const [res, thumbRes] = await Promise.all([put(signed.path, signed.token, full), put(signed.thumbPath, signed.thumbToken, thumb)]);
        if (!res.ok) {
          setError(`No se pudo subir "${file.name}".`);
          continue;
        }
        if (!thumbRes.ok) console.warn("[images] thumbnail upload failed; the card will use the full image");
        const attached = await attachImage({ kind, ownerId, path: signed.path, alt: file.name.replace(/\.[^.]+$/, "").slice(0, 160) });
        if (!attached.ok) setError(attached.error);
        else uploaded++;
      } catch {
        setError(`No se pudo procesar "${file.name}". Si es HEIC (iPhone), expórtala como JPG o PNG.`);
      }
    }
    setUploading(undefined);
    if (uploaded) toast.success(uploaded === 1 ? "Imagen subida." : `${uploaded} imágenes subidas.`);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  // Which control is working ("<imageId>:up", ":delete"…): only it shows the spinner.
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const run = (key: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setActiveKey(key); // outside the transition so the spinner shows right away
    start(async () => {
      const r = await fn();
      if (!r.ok) toast.error(r.error ?? "No se pudo completar la acción.");
      router.refresh();
    });
  };

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
                    <IconBtn label="Mover antes" loading={busy && activeKey === `${img.id}:up`} disabled={busy || i === 0} onClick={() => run(`${img.id}:up`, () => moveImage({ kind, imageId: img.id, direction: "up" }))}>
                      <ArrowUp className="size-3.5" />
                    </IconBtn>
                    <IconBtn label="Mover después" loading={busy && activeKey === `${img.id}:down`} disabled={busy || i === images.length - 1} onClick={() => run(`${img.id}:down`, () => moveImage({ kind, imageId: img.id, direction: "down" }))}>
                      <ArrowDown className="size-3.5" />
                    </IconBtn>
                    {kind === "project" && !isCover && (
                      <IconBtn label="Usar como portada" loading={busy && activeKey === `${img.id}:cover`} disabled={busy} onClick={() => run(`${img.id}:cover`, () => setProjectCover({ projectId: ownerId, path: img.path }))}>
                        <Star className="size-3.5" />
                      </IconBtn>
                    )}
                  </div>
                  <IconBtn
                    label="Eliminar"
                    danger
                    loading={busy && activeKey === `${img.id}:delete`}
                    disabled={busy}
                    onClick={async () => {
                      if (await confirm({ title: "¿Eliminar esta imagen?", description: "Se borra de la web y del almacenamiento." }))
                        run(`${img.id}:delete`, () => deleteImage({ kind, imageId: img.id }));
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

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" multiple hidden onChange={(e) => e.target.files?.length && upload(e.target.files)} />
      <button
        type="button"
        disabled={!!uploading}
        aria-busy={!!uploading}
        onClick={() => input.current?.click()}
        className={clsx(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-8 text-sm text-white/60 transition-colors hover:border-lime-400/60 hover:text-white disabled:cursor-wait",
          images.length > 0 && "mt-3",
        )}
      >
        {uploading ? <Spinner className="size-6" label={uploading} /> : <ImagePlus className="size-6" />}
        <span aria-live="polite">{uploading ?? "Agregar imágenes (JPG, PNG o WebP)"}</span>
        {!uploading && <span className="text-xs text-white/40">Se convierten a WebP liviano (máx. ~150 KB) con miniatura automática.</span>}
      </button>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  loading,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-busy={loading}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        "relative grid size-7 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors",
        loading ? "cursor-wait" : "disabled:opacity-30",
        danger ? "hover:bg-red-500" : "hover:bg-white/30",
      )}
    >
      <BusyContent busy={!!loading} spinnerClassName="size-3.5">
        {children}
      </BusyContent>
    </button>
  );
}
