"use client";

import { useState } from "react";
import { isLocalListingPhoto } from "@/lib/media";

export function SafeImage({
  src,
  alt,
  className,
  loading = "lazy",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed || !isLocalListingPhoto(src)) {
    return <div className={`bg-gradient-to-br from-ivory-warm to-muted ${className ?? ""}`} aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
