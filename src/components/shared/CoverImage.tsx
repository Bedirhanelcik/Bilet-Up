"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drop-in replacement for a bare `<Image fill .../>` cover image. Falls back to a plain muted
 * placeholder — never a broken-image icon or an empty slot — when there's no URL yet, or the
 * URL fails to load (a deleted Storage object, a stale/expired external URL, etc.).
 */
export function CoverImage({
  src,
  alt,
  priority,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div className={cn("absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground", className)}>
        <ImageOff className="size-8" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
