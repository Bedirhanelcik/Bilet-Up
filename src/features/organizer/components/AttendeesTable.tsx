"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatFullDate } from "@/lib/format";
import { ticketStatusLabel } from "@/features/tickets/ticketStatus";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { useGetEventAttendeesQuery } from "@/features/tickets/ticketsApi";
import type { TicketStatus } from "@/types/ticket";

const STATUS_VARIANT: Record<TicketStatus, "default" | "secondary" | "outline" | "destructive"> = {
  valid: "default",
  used: "secondary",
  void: "destructive",
};

export function AttendeesTable({ eventId }: { eventId: string }) {
  const { t, locale } = useTranslation();
  const { data: attendees = [], isLoading, isError } = useGetEventAttendeesQuery(eventId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return attendees.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!term) return true;
      return (
        (a.buyerDisplayName ?? "").toLowerCase().includes(term) ||
        (a.buyerEmail ?? "").toLowerCase().includes(term) ||
        a.ticketTypeName.toLowerCase().includes(term)
      );
    });
  }, [attendees, search, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground">{t("organizerForm.loadAttendeesError")}</p>;
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-base font-semibold">{t("organizerForm.attendeesCount", { count: attendees.length })}</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute start-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("organizerForm.searchAttendeesPlaceholder")}
              className="w-full ps-7 sm:w-56"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | "all")}>
            <SelectTrigger aria-label={t("organizerForm.filterByStatusAria")} className="w-full sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("organizerForm.allStatuses")}</SelectItem>
              <SelectItem value="valid">{ticketStatusLabel("valid", t)}</SelectItem>
              <SelectItem value="used">{ticketStatusLabel("used", t)}</SelectItem>
              <SelectItem value="void">{ticketStatusLabel("void", t)}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {attendees.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("organizerForm.noTicketsSoldYet")}</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("organizerForm.noAttendeesMatch")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("organizerForm.attendee")}</TableHead>
              <TableHead>{t("organizerForm.ticketType")}</TableHead>
              <TableHead>{t("tickets.status")}</TableHead>
              <TableHead>{t("tickets.purchased")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <div className="font-medium">{a.buyerDisplayName ?? t("organizerForm.unnamedAttendee")}</div>
                  {a.buyerEmail && <div className="text-xs text-muted-foreground">{a.buyerEmail}</div>}
                </TableCell>
                <TableCell>{a.ticketTypeName}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[a.status]}>{ticketStatusLabel(a.status, t)}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatFullDate(a.purchasedAt, locale)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
