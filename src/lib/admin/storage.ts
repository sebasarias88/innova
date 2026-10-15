import "server-only";
import { supabaseUrl } from "@/lib/supabase/env";

export const MEDIA_BUCKET = "media";

/** Public URL of a file in the `media` bucket (public read, admin-only writes). */
export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${supabaseUrl()}/storage/v1/object/public/${MEDIA_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

/** Base used by the browser uploader to send files with a signed token. */
export function storageUploadBase() {
  return `${supabaseUrl()}/storage/v1/object/upload/sign/${MEDIA_BUCKET}`;
}
