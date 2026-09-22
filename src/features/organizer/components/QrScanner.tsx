"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { AlertCircle, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

type ScannerState = "starting" | "scanning" | "permission-denied" | "unavailable";

/**
 * Camera-based QR scanner: reads frames from `getUserMedia` onto an offscreen canvas and decodes
 * with jsQR (a small, dependency-free decoder — chosen over a full scanning library since all
 * this needs is "decode one frame", not a pre-built camera UI). Every ticket QR just encodes the
 * ticket's own Firestore doc id as plain text (see TicketQrCode.tsx) — there's no custom payload
 * format to parse, so a successful decode is fed straight to `onScan` unmodified.
 */
export function QrScanner({ onScan }: { onScan: (value: string) => void }) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [state, setState] = useState<ScannerState>(() =>
    typeof navigator !== "undefined" && navigator.mediaDevices ? "starting" : "unavailable"
  );
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (state !== "starting") return;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setState("scanning");
      })
      .catch((error: DOMException) => {
        if (cancelled) return;
        setState(error.name === "NotFoundError" ? "unavailable" : "permission-denied");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // Intentionally mount-once: `state` here only ever reads the lazily-computed initial value
    // (were it a real dependency, the cleanup above would stop the stream the instant this
    // effect's own .then()/.catch() flips `state` away from "starting").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state !== "scanning" || paused) return;

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(imageData.data, imageData.width, imageData.height);
          if (result?.data) {
            setPaused(true);
            onScan(result.data);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state, paused, onScan]);

  if (state === "permission-denied") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
        <AlertCircle className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t("checkIn.cameraDenied")}</p>
        <p className="max-w-xs text-xs text-muted-foreground">{t("checkIn.cameraDeniedDesc")}</p>
      </div>
    );
  }

  if (state === "unavailable") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-8 text-center">
        <CameraOff className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t("checkIn.noCameraTitle")}</p>
        <p className="max-w-xs text-xs text-muted-foreground">{t("checkIn.noCameraDesc")}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      {state === "starting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-sm">{t("checkIn.startingCamera")}</span>
        </div>
      )}
      {state === "scanning" && (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="size-48 rounded-2xl border-2 border-white/70 sm:size-56" />
          </div>
          {paused && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-white">
              <span className="text-sm font-medium">{t("checkIn.ticketScanned")}</span>
              <Button size="sm" variant="secondary" onClick={() => setPaused(false)}>
                {t("checkIn.scanAnother")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
