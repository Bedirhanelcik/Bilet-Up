"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/features/events/components/EventCard";
import { EventCardSkeleton } from "@/features/events/components/EventCardSkeleton";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { EventSummary } from "@/types/event";

/**
 * A horizontally-scrolling event rail — mouse wheel/trackpad, touch swipe, and keyboard (the
 * scroller itself is a native scroll container) all work without extra plumbing; the arrow
 * buttons are a pointer-device convenience layered on top via scrollBy, not the only way to
 * move the rail. Hidden natively-supported scrollbar (.no-scrollbar in globals.css); snap points
 * keep cards from stopping mid-crop after a swipe or arrow click.
 *
 * Scroll distance is measured from the first card's actual rendered width (+ gap) rather than a
 * fixed pixel count, so one arrow click always advances by exactly one card at the current
 * breakpoint (62vw on mobile, 224px at sm, 256px at lg) instead of over/under-shooting.
 */
export function EventRail({ events, isLoading }: { events: EventSummary[]; isLoading?: boolean }) {
  const { t } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // 1px tolerance for sub-pixel rounding at some zoom levels/DPRs.
    setCanScrollPrev(el.scrollLeft > 1);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, events.length]);

  function scrollByCards(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap || "20");
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 256;
    el.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
  }

  return (
    <div className="group/rail relative">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[62vw] shrink-0 snap-start sm:w-56 lg:w-64">
                <EventCardSkeleton />
              </div>
            ))
          : events.map((event) => (
              <div key={event.id} className="w-[62vw] shrink-0 snap-start sm:w-56 lg:w-64">
                <EventCard event={event} />
              </div>
            ))}
      </div>

      {!isLoading && events.length > 2 && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollByCards(-1)}
            disabled={!canScrollPrev}
            aria-label={t("common.previousEvents")}
            className="absolute top-[38%] -start-3 hidden -translate-y-1/2 rounded-full bg-background opacity-0 shadow-md transition-opacity group-hover/rail:opacity-100 group-hover/rail:disabled:opacity-30 disabled:cursor-not-allowed lg:flex"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => scrollByCards(1)}
            disabled={!canScrollNext}
            aria-label={t("common.nextEvents")}
            className="absolute top-[38%] -end-3 hidden -translate-y-1/2 rounded-full bg-background opacity-0 shadow-md transition-opacity group-hover/rail:opacity-100 group-hover/rail:disabled:opacity-30 disabled:cursor-not-allowed lg:flex"
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
        </>
      )}
    </div>
  );
}
