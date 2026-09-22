"use client";

import Link from "next/link";
import { CalendarDays, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { selectOrganizers } from "@/features/events/selectors";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { EventSummary } from "@/types/event";

export function OrganizerSection({ events, isLoading }: { events: EventSummary[]; isLoading?: boolean }) {
  const { t, intlTag } = useLocale();
  const organizers = selectOrganizers(events, 6);
  if (!isLoading && organizers.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{t("sections.organizersTitle")}</h2>
          <p className="mt-1 text-muted-foreground">{t("sections.organizersDesc")}</p>
        </div>
        <Link href="/organizers" className="shrink-0 text-sm font-medium text-primary hover:underline">
          {t("common.viewAll")}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
          : organizers.map((organizer) => (
              <Link
                key={organizer.name}
                href={`/organizers/${encodeURIComponent(organizer.name)}`}
                className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card p-5 text-center transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <Avatar size="lg">
                  <AvatarImage src={organizer.logoURL || undefined} alt="" />
                  <AvatarFallback>{organizer.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="line-clamp-1 font-heading text-sm font-semibold">{organizer.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 fill-gold text-gold" />
                  {organizer.avgRating.toLocaleString(intlTag, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  <span aria-hidden>·</span>
                  <CalendarDays className="size-3" />
                  {organizer.eventCount}
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
}
