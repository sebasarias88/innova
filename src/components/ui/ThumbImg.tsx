"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { thumbUrl } from "@/lib/media/paths";

/**
 * Shows the light 640 px thumbnail of an uploaded image and falls back to the
 * full image when the thumbnail does not exist (images uploaded before thumbnails).
 */
export function ThumbImg({ src, ...props }: { src: string } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src">) {
  const [failed, setFailed] = useState(false);
  return <img {...props} alt={props.alt ?? ""} src={failed ? src : thumbUrl(src)} onError={() => setFailed(true)} />;
}
