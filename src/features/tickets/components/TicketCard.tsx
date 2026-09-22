import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CoverImage } from "@/components/shared/CoverImage";
import { formatFullDate } from "@/lib/format";
import { getTicketEligibility, ticketEligibilityLabel } from "@/features/tickets/ticketStatus";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { Ticket } from "@/types/ticket";

const BADGE_VARIANT: Record<ReturnType<typeof getTicketEligibility>, "default" | "secondary" | "outline" | "destructive"> = {
  eligible: "default",
  "not-started": "secondary",
  "event-ended": "outline",
  "already-used": "outline",
  void: "destructive",
};

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const { t, locale } = useTranslation();
  const eligibility = getTicketEligibility(ticket);

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
        <CoverImage src={ticket.eventCoverImageURL} alt={ticket.eventTitle} className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-heading text-base font-semibold">{ticket.eventTitle}</h3>
          <Badge variant={BADGE_VARIANT[eligibility]} className="shrink-0">
            {ticketEligibilityLabel(eligibility, t)}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" />
          {formatFullDate(ticket.eventStartAt, locale)}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {ticket.eventVenue}, {ticket.eventCity}
          </span>
        </div>
        <div className="mt-1 text-sm font-medium">{ticket.ticketTypeName}</div>
      </div>
    </Link>
  );
}
