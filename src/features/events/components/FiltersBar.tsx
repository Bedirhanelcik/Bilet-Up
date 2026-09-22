"use client";

import { useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { CalendarIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CATEGORIES, categoryDisplayName } from "@/lib/mock/categories";
import { useGetDiscoverableEventsQuery } from "@/features/events/eventsApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  resetFilters,
  setCategory,
  setDateRange,
  setLocation,
  setPriceRange,
  setQuery,
  setSort,
  setTimeframe,
  type SortOption,
  type Timeframe,
} from "@/redux/slices/filtersSlice";
import { formatShortDate, ltrIsolate } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function FiltersBar() {
  const { t, locale } = useLocale();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  // Same cache entry DiscoverContent already reads — RTK Query dedupes this, no extra fetch.
  const { data: events = [] } = useGetDiscoverableEventsQuery();
  const [priceMinInput, setPriceMinInput] = useState(filters.priceMin?.toString() ?? "");
  const [priceMaxInput, setPriceMaxInput] = useState(filters.priceMax?.toString() ?? "");

  const cities = useMemo(() => Array.from(new Set(events.map((e) => e.city))).sort(), [events]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "date-asc", label: t("filters.sortSoonest") },
    { value: "date-desc", label: t("filters.sortLatest") },
    { value: "price-asc", label: t("filters.sortPriceAsc") },
    { value: "price-desc", label: t("filters.sortPriceDesc") },
    { value: "popularity", label: t("filters.sortPopular") },
  ];

  const timeframeOptions: { value: Timeframe; label: string }[] = [
    { value: "upcoming", label: t("filters.upcoming") },
    { value: "past", label: t("filters.past") },
    { value: "all", label: t("filters.all") },
  ];

  const hasActiveFilters =
    filters.query || filters.category || filters.location || filters.dateFrom || filters.priceMin != null || filters.priceMax != null;

  function applyPriceRange() {
    const min = priceMinInput.trim() === "" ? null : Number(priceMinInput);
    const max = priceMaxInput.trim() === "" ? null : Number(priceMaxInput);
    dispatch(setPriceRange({ min: Number.isNaN(min) ? null : min, max: Number.isNaN(max) ? null : max }));
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border bg-background/95 py-4 backdrop-blur-sm sm:sticky sm:top-16 sm:z-30">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(e) => dispatch(setQuery(e.target.value))}
            placeholder={t("filters.searchPlaceholder")}
            aria-label={t("filters.searchLabel")}
            className="ps-9"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1" role="group" aria-label={t("filters.upcoming")}>
          {timeframeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => dispatch(setTimeframe(opt.value))}
              aria-pressed={filters.timeframe === opt.value}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filters.timeframe === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Select
          items={{ all: t("filters.allCities"), ...Object.fromEntries(cities.map((c) => [c, c])) }}
          value={filters.location ?? "all"}
          onValueChange={(v) => dispatch(setLocation(v === "all" ? null : v))}
        >
          <SelectTrigger aria-label={t("filters.location")}>
            <SelectValue placeholder={t("filters.location")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allCities")}</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            <CalendarIcon className="size-4" />
            {filters.dateFrom
              ? ltrIsolate(`${formatShortDate(filters.dateFrom, locale)}${filters.dateTo ? ` – ${formatShortDate(filters.dateTo, locale)}` : ""}`)
              : t("filters.anyDate")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
                to: filters.dateTo ? new Date(filters.dateTo) : undefined,
              }}
              onSelect={(range) =>
                dispatch(
                  setDateRange({
                    from: range?.from ? range.from.toISOString() : null,
                    to: range?.to ? range.to.toISOString() : null,
                  })
                )
              }
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            {filters.priceMin != null || filters.priceMax != null ? t("filters.priceSet") : t("filters.price")}
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder={t("filters.min")}
                  value={priceMinInput}
                  onChange={(e) => setPriceMinInput(e.target.value)}
                  onBlur={applyPriceRange}
                  aria-label={t("filters.min")}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  min={0}
                  placeholder={t("filters.max")}
                  value={priceMaxInput}
                  onChange={(e) => setPriceMaxInput(e.target.value)}
                  onBlur={applyPriceRange}
                  aria-label={t("filters.max")}
                />
              </div>
              <Button size="sm" onClick={applyPriceRange}>
                {t("filters.apply")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Select
          items={Object.fromEntries(sortOptions.map((o) => [o.value, o.label]))}
          value={filters.sort}
          onValueChange={(v) => dispatch(setSort(v as SortOption))}
        >
          <SelectTrigger aria-label={t("filters.sortBy")} className="ms-auto">
            <SelectValue placeholder={t("filters.sortBy")} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPriceMinInput("");
              setPriceMaxInput("");
              dispatch(resetFilters());
            }}
          >
            <X className="size-4" />
            {t("filters.clear")}
          </Button>
        )}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => dispatch(setCategory(null))}
          aria-pressed={filters.category === null}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            filters.category === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          {t("filters.allCategories")}
        </button>
        {CATEGORIES.map((category) => {
          const Icon = (Icons[category.icon as keyof typeof Icons] ?? Icons.Ticket) as Icons.LucideIcon;
          const isActive = filters.category === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => dispatch(setCategory(isActive ? null : category.slug))}
              aria-pressed={isActive}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {categoryDisplayName(category.slug, locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
