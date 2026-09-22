"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { EventSummary } from "@/types/event";

/**
 * An infinite horizontal city rail — cities are never hardcoded, only ever derived from real
 * discoverable events (the same query every other homepage section already fetches). The track
 * renders the city sequence twice back-to-back and animates by exactly -50% of its own width
 * (see .animate-marquee in globals.css), which is what makes the loop seamless with no visible
 * jump — a shorter city list just repeats around the viewport sooner, it never leaves a gap.
 */
export function CityMarquee({ events }: { events: EventSummary[] }) {
  const { t, intlTag } = useLocale();
  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      if (e.status === "completed") continue;
      counts.set(e.city, (counts.get(e.city) ?? 0) + 1);
    }
    return Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, intlTag));
  }, [events, intlTag]);

  if (cities.length === 0) return null;

  // Duplicated only when there's enough content that hover-pausing mid-loop wouldn't look like
  // a static, obviously-doubled list — with very few cities the animation is skipped by CSS's
  // `prefers-reduced-motion` guard anyway, but keeping this list singular below ~4 cities avoids
  // an awkward half-empty-looking track on a fresh/small dataset.
  const track = cities.length > 3 ? [...cities, ...cities] : cities;

  return (
    <div
      className="group relative overflow-hidden border-y border-border bg-muted/40 py-3.5"
      role="region"
      aria-label={t("common.citiesRegion")}
    >
      <div
        className="flex w-max items-center gap-10 animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
      >
        {track.map((city, i) => (
          <Link
            key={`${city}-${i}`}
            href={`/discover?location=${encodeURIComponent(city)}`}
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            tabIndex={i < cities.length ? 0 : -1}
            aria-hidden={i >= cities.length}
          >
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {city}
          </Link>
        ))}
      </div>
    </div>
  );
}
