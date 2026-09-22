"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, MapPin, Ticket as TicketIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CoverImage } from "@/components/shared/CoverImage";
import { formatFullDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { useGetTicketByIdQuery } from "@/features/tickets/ticketsApi";
import { TicketQrCode } from "@/features/tickets/components/TicketQrCode";
import { getTicketEligibility, ticketEligibilityLabel, ticketStatusLabel } from "@/features/tickets/ticketStatus";

const BADGE_VARIANT: Record<ReturnType<typeof getTicketEligibility>, "default" | "secondary" | "outline" | "destructive"> = {
  eligible: "default",
  "not-started": "secondary",
  "event-ended": "outline",
  "already-used": "outline",
  void: "destructive",
};

export function TicketDetailContent({ ticketId }: { ticketId: string }) {
  const { t, locale } = useTranslation();
  const { user, isChecking } = useRequireAuth();
  const { data: ticket, isLoading, isError, refetch } = useGetTicketByIdQuery(ticketId, { skip: !user });

  if (isChecking || !user || isLoading) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="size-6" />
        </span>
        <h1 className="font-heading text-lg font-semibold">{t("tickets.notFoundTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("tickets.notFoundDesc")}</p>
        {isError ? (
          <Button variant="outline" onClick={() => refetch()}>
            {t("common.tryAgain")}
          </Button>
        ) : (
          <Link href="/tickets" className={buttonVariants({ variant: "outline" })}>
            {t("tickets.backToMyTickets")}
          </Link>
        )}
      </div>
    );
  }

  const eligibility = getTicketEligibility(ticket);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Link href="/tickets" className="text-sm text-muted-foreground hover:text-foreground">
        {t("tickets.myTicketsLink")}
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
        <div className="relative h-40 w-full">
          <CoverImage src={ticket.eventCoverImageURL} alt={ticket.eventTitle} className="object-cover" />
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-heading text-xl font-semibold">{ticket.eventTitle}</h1>
              <Badge variant={BADGE_VARIANT[eligibility]} className="shrink-0">
                {ticketEligibilityLabel(eligibility, t)}
              </Badge>
            </div>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0" />
                {formatFullDate(ticket.eventStartAt, locale)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                {ticket.eventVenue}, {ticket.eventCity}
              </span>
              <span className="flex items-center gap-2">
                <TicketIcon className="size-4 shrink-0" />
                {ticket.ticketTypeName}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 border-y border-dashed border-border py-6">
            <TicketQrCode value={ticket.id} />
            <p className="font-mono text-xs tracking-wider text-muted-foreground">{ticket.id}</p>
            <p className="text-center text-xs text-muted-foreground">{t("tickets.showAtEntry")}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("tickets.status")}</dt>
              <dd className="font-medium">{ticketStatusLabel(ticket.status, t)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("tickets.purchased")}</dt>
              <dd className="font-medium">{formatFullDate(ticket.purchasedAt, locale)}</dd>
            </div>
            {ticket.usedAt && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">{t("tickets.checkedIn")}</dt>
                <dd className="font-medium">{formatFullDate(ticket.usedAt, locale)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
