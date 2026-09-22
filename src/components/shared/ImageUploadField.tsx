"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteImage, uploadImage, validateImageFile } from "@/lib/firebase/storage";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

/**
 * A form field that uploads directly to a fixed Firebase Storage path and reports back the
 * resulting download URL — a drop-in replacement for what used to be a plain "paste an image
 * URL" text input, so it composes with react-hook-form (via Controller) exactly the same way:
 * `value`/`onChange` carry the same URL string the rest of the form (and its zod schema) already
 * expects. `storagePath` is a fixed, owner-scoped path (see src/lib/firebase/storage.ts) — every
 * upload overwrites the same object, which is what makes "replace" a plain re-upload instead of
 * a delete-then-create.
 */
export function ImageUploadField({
  value,
  onChange,
  storagePath,
  shape = "cover",
  label,
  disabled,
  fallbackLabel,
}: {
  value: string;
  onChange: (url: string) => void;
  storagePath: string;
  shape?: "cover" | "circle";
  label?: string;
  disabled?: boolean;
  /** Shown in the empty/no-image state instead of the camera icon — e.g. a name's initial. */
  fallbackLabel?: string;
}) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("imageUpload.uploadImage");
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const isBusy = progress !== null;
  const isCircle = shape === "circle";

  async function handleFileSelected(file: File) {
    const validationError = validateImageFile(file, t);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setBroken(false);
    setProgress(0);
    try {
      const url = await uploadImage(storagePath, file, setProgress);
      onChange(url);
    } catch {
      setError(t("imageUpload.uploadFailed"));
    } finally {
      setProgress(null);
    }
  }

  async function handleRemove() {
    setError(null);
    try {
      await deleteImage(storagePath);
      onChange("");
    } catch {
      setError(t("imageUpload.removeFailed"));
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-border bg-muted",
          isCircle ? "size-16 rounded-full" : "aspect-[16/10] w-40 rounded-xl"
        )}
      >
        {value && !broken ? (
          <Image src={value} alt={resolvedLabel} fill className="object-cover" onError={() => setBroken(true)} />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            {fallbackLabel ? (
              <span className="font-heading text-lg font-semibold">{fallbackLabel}</span>
            ) : (
              <Camera className="size-5" />
            )}
          </div>
        )}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isBusy}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {value ? t("imageUpload.replaceImage") : t("imageUpload.uploadImage")}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" disabled={disabled || isBusy} onClick={handleRemove}>
              <Trash2 className="size-3.5" />
              {t("imageUpload.remove")}
            </Button>
          )}
        </div>
        {isBusy && <p className="text-xs text-muted-foreground">{t("imageUpload.uploading", { percent: progress ?? 0 })}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {!isBusy && !error && <p className="text-xs text-muted-foreground">{t("imageUpload.fileTypeHint")}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        aria-label={resolvedLabel}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFileSelected(file);
        }}
      />
    </div>
  );
}
