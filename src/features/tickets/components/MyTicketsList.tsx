"use client";

import { Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventTemporalState } from "@/lib/eventTiming";
import { useGetMyTicketsQuery } from "@/features/tickets/ticketsApi";
import { TicketCard } from "@/features/tickets/components/TicketCard";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function MyTicketsList({ uid }: { uid: string }) {
  const { t } = useTranslation();
  const { data: tickets = [], isLoading, isError, refetch } = useGetMyTicketsQuery(uid);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card py-10 text-center">
        <p className="text-sm text-muted-foreground">{t("tickets.loadError")}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          {t("common.tryAgain")}
        </Button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-center">
        <TicketIcon className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("tickets.empty")}</p>
      </div>
    );
  }

  const upcoming = tickets.filter((ticket) => getEventTemporalState(ticket.eventStartAt, ticket.eventEndAt) !== "completed");
  const past = tickets.filter((ticket) => getEventTemporalState(ticket.eventStartAt, ticket.eventEndAt) === "completed");

  return (
    <div className="flex flex-col gap-8">
      {upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-base font-semibold">{t("tickets.upcoming")}</h2>
          {upcoming.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </section>
      )}
      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-base font-semibold text-muted-foreground">{t("tickets.past")}</h2>
          {past.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </section>
      )}
    </div>
  );
}
