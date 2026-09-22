"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FiltersBar } from "@/features/events/components/FiltersBar";
import { EventResults } from "@/features/events/components/EventResults";
import { EventCardSkeleton } from "@/features/events/components/EventCardSkeleton";
import { useGetDiscoverableEventsQuery } from "@/features/events/eventsApi";
import { useAppDispatch } from "@/redux/hooks";
import { setCategory, setLocation, setQuery, setSort, setTimeframe, type SortOption, type Timeframe } from "@/redux/slices/filtersSlice";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function DiscoverContent() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const appliedInitialParams = useRef(false);
  const { data: events = [], isLoading: isQueryLoading, isError: isQueryError, refetch } = useGetDiscoverableEventsQuery();
  // The server never runs this query, so it always renders as loading/no-error. RTK Query's
  // cache persists across client-side navigations, though, so a client re-visiting /discover
  // after already loading (or failing to load) it once this session has a different
  // isLoading/isError on its very first render — a text/markup mismatch against the
  // server-rendered HTML. Treating every render before the first effect as "still loading,
  // no error yet" (regardless of cache state) keeps the client's pre-hydration render identical
  // to the server's, so there's nothing to mismatch.
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isLoading = !hasMounted || isQueryLoading;
  const isError = hasMounted && isQueryError;

  useEffect(() => {
    if (appliedInitialParams.current) return;
    appliedInitialParams.current = true;

    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const sort = searchParams.get("sort");
    const timeframe = searchParams.get("timeframe");

    if (q) dispatch(setQuery(q));
    if (category) dispatch(setCategory(category));
    if (location) dispatch(setLocation(location));
    if (sort) dispatch(setSort(sort as SortOption));
    if (timeframe === "upcoming" || timeframe === "past" || timeframe === "all") {
      dispatch(setTimeframe(timeframe as Timeframe));
    }
  }, [dispatch, searchParams]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{t("discover.title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {isLoading
            ? t("discover.loading")
            : t("discover.countLabel", { count: events.length, cities: new Set(events.map((e) => e.city)).size })}
        </p>
      </div>
      <FiltersBar />
      {isError ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <AlertCircle className="size-6" />
          </span>
          <h3 className="font-heading text-lg font-semibold">{t("discover.errorTitle")}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">{t("discover.errorDesc")}</p>
          <Button variant="outline" onClick={() => refetch()}>
            {t("common.tryAgain")}
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <EventResults events={events} />
      )}
    </div>
  );
}
