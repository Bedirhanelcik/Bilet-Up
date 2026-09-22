"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Skeleton } from "@/components/ui/skeleton";

/** Renders `value` (the ticket's own opaque doc id — never anything guessable) as an inline SVG QR code, generated locally with no third-party request. */
export function TicketQrCode({ value, size = 176 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(value, { type: "svg", margin: 1, width: size })
      .then((result) => {
        if (!cancelled) setSvg(result);
      })
      .catch(() => {
        if (!cancelled) setSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!svg) return <Skeleton style={{ width: size, height: size }} className="rounded-xl" />;

  return (
    <div
      className="overflow-hidden rounded-xl bg-white p-2 [&>svg]:size-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
