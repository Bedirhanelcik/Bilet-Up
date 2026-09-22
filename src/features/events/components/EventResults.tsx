"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarX, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/features/events/components/EventCard";
import { EventCardSkeleton } from "@/features/events/components/EventCardSkeleton";
import { filterAndSortEvents } from "@/features/events/filterEvents";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { resetFilters, type EventFilters } from "@/redux/slices/filtersSlice";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { EventSummary } from "@/types/event";

/**
 * Debounces filter changes before recomputing results, so rapid typing/toggling
 * doesn't re-render the grid on every keystroke — this also gives the skeleton
 * state something real to show for. `committedFilters` only updates once the
 * debounce settles; comparing it against the live `filters` (both immutable
 * Redux state) tells us whether a recompute is still pending, with no setState
 * call needed during render.
 */
export function EventResults({ events }: { events: EventSummary[] }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const [committedFilters, setCommittedFilters] = useState<EventFilters>(filters);

  useEffect(() => {
    const timeout = setTimeout(() => setCommittedFilters(filters), 250);
    return () => clearTimeout(timeout);
  }, [filters]);

  const isPending = committedFilters !== filters;
  const results = useMemo(
    () => filterAndSortEvents(events, committedFilters),
    [events, committedFilters]
  );

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {filters.query ? <SearchX className="size-6" /> : <CalendarX className="size-6" />}
        </span>
        <h3 className="font-heading text-lg font-semibold">{t("discover.noResultsTitle")}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{t("discover.noResultsDesc")}</p>
        <Button variant="outline" onClick={() => dispatch(resetFilters())}>
          {t("common.clearFilters")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
