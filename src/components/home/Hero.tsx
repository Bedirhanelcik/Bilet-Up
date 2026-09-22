"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CoverImage } from "@/components/shared/CoverImage";
import { cn } from "@/lib/utils";
import { formatPriceFrom, formatShortDate } from "@/lib/format";
import { categoryDisplayName } from "@/lib/mock/categories";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { EventSummary } from "@/types/event";

const AUTO_ADVANCE_MS = 6500;
const MAX_SLIDES = 5;
const MIN_SLIDES = 3;

/**
 * A count-up that always lands on the real target and can't get stuck mid-animation — a plain
 * rAF loop owned by this component's own lifecycle, not a GSAP timeline sharing cleanup timing
 * with React's (double-invoked in dev) effect scheduler.
 */
function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(active ? 0 : target);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const duration = 1100;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return value;
}

function Stat({ label, value, active, intlTag }: { label: string; value: number; active: boolean; intlTag: string }) {
  const shown = useCountUp(value, active);
  return (
    <div className="flex flex-col items-start">
      <dt className="sr-only">{label}</dt>
      <dd className="font-heading text-2xl font-bold text-white sm:text-3xl">
        {shown.toLocaleString(intlTag)}+
      </dd>
      <span className="mt-1 text-xs text-white/70 sm:text-sm">{label}</span>
    </div>
  );
}

/**
 * A full-bleed, cinematic hero carousel — 3-5 real featured events, each filling the entire
 * screen with its own cover photo (never a generic stock/marketing image), auto-advancing with
 * pointer/keyboard-accessible manual controls layered on top. The headline, date/venue, price,
 * and CTA all come straight from the event itself, not from static marketing copy — this is a
 * showcase of the catalog, not a billboard in front of it.
 */
export function Hero({ events }: { events: EventSummary[] }) {
  const prefersReducedMotion = useReducedMotion();
  const { t, locale, intlTag } = useLocale();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides = useMemo(() => {
    const discoverable = events.filter((e) => e.status === "published" || e.status === "live");
    const byDate = (a: EventSummary, b: EventSummary) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    const featured = discoverable.filter((e) => e.featured).sort(byDate);
    if (featured.length >= MIN_SLIDES) return featured.slice(0, MAX_SLIDES);
    // Not enough curated picks yet — top up with the soonest upcoming events so the hero never
    // ends up with fewer than 3 real slides, without ever inventing a fake one.
    const extra = discoverable
      .filter((e) => !e.featured)
      .sort(byDate)
      .slice(0, MIN_SLIDES - featured.length);
    return [...featured, ...extra].slice(0, MAX_SLIDES);
  }, [events]);

  const stats = useMemo(() => {
    const discoverable = events.filter((e) => e.status !== "completed");
    const attendees = events.reduce((sum, e) => sum + e.attendeeCount, 0);
    return [
      { label: t("hero.statEvents"), value: discoverable.length },
      { label: t("hero.statCities"), value: new Set(events.map((e) => e.city)).size },
      { label: t("hero.statTickets"), value: attendees },
    ];
  }, [events, t]);

  // Derived rather than stored: if the slide list ever shrinks (e.g. a refetch drops the
  // previously-active event), this clamps back to a valid slide without an effect round-trip.
  const safeIndex = slides.length === 0 ? 0 : index % slides.length;

  useEffect(() => {
    if (prefersReducedMotion || paused || slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [prefersReducedMotion, paused, slides.length]);

  function go(delta: 1 | -1) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    go(delta > 0 ? -1 : 1);
  }

  const slide = slides[safeIndex];
  if (!slide) {
    return <section className="min-h-[60vh] bg-muted" aria-hidden />;
  }

  return (
    <section
      className="relative flex min-h-[88vh] items-end overflow-hidden sm:min-h-[92vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      aria-roledescription="carousel"
      aria-label={t("sections.featured")}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className={cn("absolute inset-0", !prefersReducedMotion && "animate-hero-zoom")}>
            <CoverImage src={slide.coverImageURL} alt="" priority sizes="100vw" className="object-cover" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* A light, even wash keeps text readable without crushing the photo to black; the second
          layer only darkens the top (badge) and bottom (headline/CTAs/stats) edges, leaving the
          vivid stage-light middle of the frame untouched. */}
      <div aria-hidden className="absolute inset-0 bg-black/20" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/35" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-28 sm:px-8 lg:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex max-w-2xl flex-col items-start text-start"
          >
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
              {t("sections.featured")} · {categoryDisplayName(slide.category, locale)}
            </span>
            <Link href={`/events/${slide.slug}`} className="group">
              <h1 className="mt-6 line-clamp-3 font-heading text-3xl font-bold leading-[1.08] tracking-tight text-white transition-colors group-hover:text-white/90 sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85 sm:text-base">
              <span>{formatShortDate(slide.startAt, locale)}</span>
              <span aria-hidden className="size-1 rounded-full bg-white/50" />
              <span className="truncate">
                {slide.venue} · {slide.city}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-white/50" />
              <span className="font-bold text-gold">{formatPriceFrom(slide.priceMin, slide.priceMax, locale)}</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/events/${slide.slug}`}
                className={cn(buttonVariants({ size: "lg" }), "gap-2 rounded-full px-7")}
              >
                {t("hero.ctaTickets")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
              <Link
                href="/discover"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "gap-2 rounded-full border-white/30 bg-white/5 px-7 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                )}
              >
                <Compass className="size-4" />
                {t("hero.ctaDiscover")}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-wrap items-end justify-between gap-8">
          <dl className="flex flex-wrap gap-8 sm:gap-12">
            {stats.map((stat) => (
              <Stat key={stat.label} label={stat.label} value={stat.value} active={!prefersReducedMotion} intlTag={intlTag} />
            ))}
          </dl>

          {slides.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={t("common.previousEvents")}
                className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
              >
                <ChevronLeft className="size-4 rtl:rotate-180" />
              </button>
              <div className="flex items-center gap-2" role="tablist" aria-label={t("sections.featured")}>
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === safeIndex}
                    aria-label={s.title}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === safeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={t("common.nextEvents")}
                className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
              >
                <ChevronRight className="size-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
