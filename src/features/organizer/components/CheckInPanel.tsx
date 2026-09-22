"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Loader2, QrCode, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFullDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { getTicketEligibility, ticketEligibilityLabel } from "@/features/tickets/ticketStatus";
import { useCheckInTicketMutation, useGetTicketByIdQuery } from "@/features/tickets/ticketsApi";
import { QrScanner } from "@/features/organizer/components/QrScanner";

export function CheckInPanel({ eventId, organizerUid }: { eventId: string; organizerUid: string }) {
  const { t, locale } = useTranslation();
  const [input, setInput] = useState("");
  const [lookupId, setLookupId] = useState("");
  const {
    data: ticket,
    isFetching,
    isError,
  } = useGetTicketByIdQuery(lookupId, { skip: !lookupId });
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInTicketMutation();

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupId(input.trim());
  }

  // The scanner hands back the QR's raw decoded text — which, for a BiletUP ticket, is always
  // just the ticket's own Firestore doc id (see TicketQrCode.tsx) — so it feeds the exact same
  // lookup path manual entry uses. There is no separate "scanned ticket" code path to secure:
  // whatever produced the id, the same useGetTicketByIdQuery/useCheckInTicketMutation calls, and
  // the same firestore.rules checks, run against it.
  const handleScan = useCallback((value: string) => {
    const ticketId = value.trim();
    setInput(ticketId);
    setLookupId(ticketId);
  }, []);

  async function handleCheckIn() {
    if (!ticket) return;
    try {
      await checkIn({ ticketId: ticket.id, eventId, organizerUid }).unwrap();
      toast.success(t("checkIn.successToast"));
    } catch {
      toast.error(t("checkIn.errorToast"));
    }
  }

  const wrongEvent = ticket && ticket.eventId !== eventId;
  const eligibility = ticket && !wrongEvent ? getTicketEligibility(ticket) : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-heading text-base font-semibold">{t("checkIn.title")}</h2>

      <Tabs defaultValue="scan">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="scan" className="gap-1.5">
            <QrCode className="size-4" />
            {t("checkIn.scanQr")}
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-1.5">
            <Search className="size-4" />
            {t("checkIn.manualEntry")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-3">
          <QrScanner onScan={handleScan} />
        </TabsContent>

        <TabsContent value="manual" className="mt-3">
          <p className="mb-3 text-sm text-muted-foreground">{t("checkIn.instructions")}</p>
          <form onSubmit={handleLookup} className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label htmlFor="ticket-lookup">{t("checkIn.ticketId")}</Label>
              <Input
                id="ticket-lookup"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("checkIn.ticketIdPlaceholder", { id: "x8LZBH2tG17njBd4azkV" })}
                className="font-mono"
              />
            </div>
            <Button type="submit" disabled={!input.trim() || isFetching} className="shrink-0">
              {isFetching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              {t("checkIn.lookup")}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {lookupId && !isFetching && (
        <div className="rounded-xl border border-border p-4">
          {isError || !ticket ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="size-4 shrink-0" />
              {t("checkIn.notFoundOrNoAccess")}
            </div>
          ) : wrongEvent ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="size-4 shrink-0" />
              {t("checkIn.wrongEvent", { title: ticket.eventTitle })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{ticket.ticketTypeName}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("checkIn.purchasedOn", { date: formatFullDate(ticket.purchasedAt, locale) })}
                  </div>
                  {ticket.usedAt && (
                    <div className="text-xs text-muted-foreground">
                      {t("checkIn.checkedInOn", { date: formatFullDate(ticket.usedAt, locale) })}
                    </div>
                  )}
                </div>
                <Badge variant={eligibility === "eligible" ? "default" : "destructive"}>
                  {eligibility ? ticketEligibilityLabel(eligibility, t) : ""}
                </Badge>
              </div>

              {eligibility === "eligible" ? (
                <Button onClick={handleCheckIn} disabled={isCheckingIn} className="self-start">
                  {isCheckingIn ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  {t("checkIn.checkInBtn")}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">{t("checkIn.notEligibleNow")}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
