"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CoverImage } from "@/components/shared/CoverImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EventCard } from "@/features/events/components/EventCard";
import { EventActions } from "@/features/events/components/EventActions";
import { ReviewsSection } from "@/features/events/components/ReviewsSection";
import { TicketSelector } from "@/features/tickets/components/TicketSelector";
import { useGetDiscoverableEventsQuery, useGetEventBySlugQuery } from "@/features/events/eventsApi";
import { selectEventsByOrganizerName, selectEventsByVenue, selectRelatedEvents } from "@/features/events/selectors";
import { formatFullDate, formatPriceFrom, formatShortDate, formatTime } from "@/lib/format";
import { categoryDisplayName } from "@/lib/mock/categories";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { LocaleCode } from "@/lib/i18n/locales";
import type { EventSummary } from "@/types/event";

/** A compact avatar-thumbnail + title + date row for the sidebar's "more events" lists — the
 * same shape used for both the venue and organizer lists, so they read as one visual family. */
function SidebarEventRow({ event, locale }: { event: EventSummary; locale: LocaleCode }) {
  return (
    <Link href={`/events/${event.slug}`} className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-accent">
      <span className="relative size-11 shrink-0 overflow-hidden rounded-full border border-border">
        <CoverImage src={event.coverImageURL} alt="" sizes="44px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{event.title}</span>
        <span className="block truncate text-xs text-muted-foreground">{formatShortDate(event.startAt, locale)}</span>
      </span>
    </Link>
  );
}

function SidebarSection({ title, events, locale }: { title: string; events: EventSummary[]; locale: LocaleCode }) {
  if (events.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="flex flex-col gap-0.5">
        {events.map((e) => (
          <SidebarEventRow key={e.id} event={e} locale={locale} />
        ))}
      </div>
    </div>
  );
}

export function EventDetailContent({ slug }: { slug: string }) {
  const { t, locale } = useTranslation();
  const { data: event, isLoading, isError, refetch } = useGetEventBySlugQuery(slug);
  const { data: allEvents = [] } = useGetDiscoverableEventsQuery();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr_320px]">
          <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="size-6" />
        </span>
        <h1 className="font-heading text-lg font-semibold">
          {isError ? t("eventDetail.loadError") : t("eventDetail.notFoundTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isError ? t("eventDetail.loadErrorDesc") : t("eventDetail.notFoundDesc")}
        </p>
        {isError ? (
          <Button variant="outline" onClick={() => refetch()}>
            {t("common.tryAgain")}
          </Button>
        ) : (
          <Link href="/discover" className={buttonVariants({ variant: "outline" })}>
            {t("checkout.backToDiscover")}
          </Link>
        )}
      </div>
    );
  }

  const related = selectRelatedEvents(allEvents, event);
  const venueEvents = selectEventsByVenue(allEvents, event);
  const organizerEvents = selectEventsByOrganizerName(allEvents, event.organizerName).filter((e) => e.id !== event.id);
  const soldOut = event.capacityRemaining === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      {/* Desktop: a real three-column composition — poster (left), event info (middle), and
          organizer/venue/ticket context (right) — rather than a full-bleed banner with everything
          stacked underneath it. Collapses to a single column below `lg`. */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr_320px]">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border shadow-sm">
            <CoverImage src={event.coverImageURL} alt={event.title} priority sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{categoryDisplayName(event.category, locale)}</Badge>
              {event.status === "live" && <Badge className="bg-destructive text-white">{t("eventDetail.liveNow")}</Badge>}
              {event.status === "completed" && <Badge variant="outline">{t("eventDetail.completed")}</Badge>}
              {soldOut && event.status !== "completed" && <Badge variant="outline">{t("eventDetail.soldOut")}</Badge>}
            </div>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {event.title}
            </h1>

            {event.ratingCount > 0 && (
              <a href="#reviews" className="mt-2 flex w-fit items-center gap-1.5 text-sm">
                <span className="flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("size-3.5", i < Math.round(event.ratingAverage) ? "fill-gold" : "text-muted-foreground")} />
                  ))}
                </span>
                <span className="font-semibold">{event.ratingAverage.toFixed(1)}</span>
                <span className="text-muted-foreground">({event.ratingCount})</span>
                <span className="text-primary hover:underline">{t("eventDetail.rateEvent")}</span>
              </a>
            )}

            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-5">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0" />
                {formatFullDate(event.startAt, locale)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="size-4 shrink-0" />
                {formatTime(event.startAt, locale)} – {formatTime(event.endAt, locale)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                {event.venue}, {event.city}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <Link
                href={`/organizers/${encodeURIComponent(event.organizerName)}`}
                className="flex items-center gap-3 rounded-full border border-border py-1 ps-1 pe-4 transition-colors hover:bg-accent"
              >
                <Avatar>
                  <AvatarImage src={event.organizerLogoURL || undefined} alt="" />
                  <AvatarFallback>{event.organizerName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  <span className="block text-xs text-muted-foreground">{t("eventDetail.organizedBy")}</span>
                  <span className="font-medium">{event.organizerName}</span>
                </span>
              </Link>
              <EventActions eventId={event.id} title={event.title} />
            </div>
          </div>

          <section>
            <h2 className="font-heading text-xl font-semibold">{t("eventDetail.aboutEvent")}</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{event.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">{t("eventDetail.venue")}</dt>
                <dd className="font-medium">{event.venue}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("eventDetail.address")}</dt>
                <dd className="font-medium">{event.address}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("eventDetail.capacity")}</dt>
                <dd className="font-medium">
                  {event.capacityTotal - event.capacityRemaining} / {event.capacityTotal} {t("eventDetail.attending")}
                </dd>
              </div>
            </dl>
          </section>

          {event.faq && event.faq.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-semibold">{t("eventDetail.faq")}</h2>
              <Accordion className="mt-3">
                {event.faq.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          <div id="reviews">
            <ReviewsSection
              eventId={event.id}
              slug={event.slug}
              startAt={event.startAt}
              endAt={event.endAt}
              ratingAverage={event.ratingAverage}
              ratingCount={event.ratingCount}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 text-lg font-bold text-gold">
              {formatPriceFrom(event.priceMin, event.priceMax, locale)}
            </div>
            <TicketSelector eventId={event.id} eventSlug={event.slug} ticketTypes={event.ticketTypes} />
          </div>

          <SidebarSection title={t("eventDetail.moreAtVenue")} events={venueEvents} locale={locale} />
          <SidebarSection title={t("eventDetail.moreFromOrganizer")} events={organizerEvents} locale={locale} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight">{t("eventDetail.relatedEvents")}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
