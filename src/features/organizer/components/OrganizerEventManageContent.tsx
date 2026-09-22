"use client";

import Link from "next/link";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventStatusLabel } from "@/lib/eventStatusLabel";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { useRequireOrganizer } from "@/features/organizer/useRequireOrganizer";
import { useGetOrganizerEventDetailQuery, useUpdateEventStatusMutation } from "@/features/organizer/organizerApi";
import { EventDetailsForm } from "@/features/organizer/components/EventDetailsForm";
import { TicketTypesManager } from "@/features/organizer/components/TicketTypesManager";
import { AttendeesTable } from "@/features/organizer/components/AttendeesTable";
import { CheckInPanel } from "@/features/organizer/components/CheckInPanel";
import type { EventStatus } from "@/types/event";

const STATUS_VARIANT: Record<EventStatus, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  published: "default",
  live: "default",
  completed: "outline",
  cancelled: "destructive",
};

const ALL_STATUSES: EventStatus[] = ["draft", "published", "live", "completed", "cancelled"];

export function OrganizerEventManageContent({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const { user, organizerProfile, isChecking } = useRequireOrganizer();
  const { data: event, isLoading, isError } = useGetOrganizerEventDetailQuery(eventId, { skip: !user });
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateEventStatusMutation();

  if (isChecking || !user || isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // Firestore rules already stop a client-provided/mismatched organizerId from ever writing to
  // this event; this check is the UX layer that keeps a non-owner from even seeing the manage
  // screen for one of their own *published* events (which the read rule does allow reading).
  const isOwner = !!organizerProfile && !!event && event.organizerId === user.uid;

  if (isError || !event || !isOwner) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="size-6" />
        </span>
        <h1 className="font-heading text-lg font-semibold">{t("organizerForm.eventNotFoundTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("organizerForm.eventNotFoundDesc")}</p>
        <Link href="/organizer/events" className={buttonVariants({ variant: "outline" })}>
          {t("organizerForm.backToYourEvents")}
        </Link>
      </div>
    );
  }

  async function handleStatusChange(status: EventStatus) {
    try {
      await updateStatus({ eventId, organizerUid: user!.uid, slug: event!.slug, status }).unwrap();
      toast.success(t("organizerForm.statusUpdated"));
    } catch {
      toast.error(t("organizerForm.statusUpdateError"));
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <Link href="/organizer/events" className="text-sm text-muted-foreground hover:text-foreground">
        {t("organizerForm.backToYourEvents")}
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight">{event.title}</h1>
          <Badge variant={STATUS_VARIANT[event.status]}>{eventStatusLabel(event.status, t)}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={event.status} onValueChange={(v) => handleStatusChange(v as EventStatus)}>
            <SelectTrigger aria-label={t("organizerForm.changeStatusAria")} disabled={isUpdatingStatus}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {eventStatusLabel(status, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href={`/events/${event.slug}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t("organizerForm.viewPublicPage")}
          </Link>
        </div>
      </div>

      <Tabs defaultValue="details" className="mt-6">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max">
            <TabsTrigger value="details">{t("organizerForm.tabDetails")}</TabsTrigger>
            <TabsTrigger value="tickets">{t("organizerForm.ticketTypes")}</TabsTrigger>
            <TabsTrigger value="attendees">{t("organizerForm.tabAttendees")}</TabsTrigger>
            <TabsTrigger value="checkin">{t("organizerForm.tabCheckIn")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <EventDetailsForm event={event} organizerUid={user.uid} />
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="mt-4">
          <TicketTypesManager eventId={event.id} slug={event.slug} ticketTypes={event.ticketTypes} />
        </TabsContent>

        <TabsContent value="attendees" className="mt-4">
          <AttendeesTable eventId={event.id} />
        </TabsContent>

        <TabsContent value="checkin" className="mt-4">
          <CheckInPanel eventId={event.id} organizerUid={user.uid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
