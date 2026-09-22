"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatFullDate } from "@/lib/format";
import { eventStatusLabel } from "@/lib/eventStatusLabel";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { useRequireOrganizer } from "@/features/organizer/useRequireOrganizer";
import { useGetOrganizerEventsQuery, useUpdateEventStatusMutation } from "@/features/organizer/organizerApi";
import { BecomeOrganizerForm } from "@/features/organizer/components/BecomeOrganizerForm";
import type { EventStatus } from "@/types/event";

const STATUS_VARIANT: Record<EventStatus, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  published: "default",
  live: "default",
  completed: "outline",
  cancelled: "destructive",
};

export function OrganizerEventsListContent() {
  const { t, locale } = useTranslation();
  const { user, organizerProfile, isChecking } = useRequireOrganizer();
  const { data: events = [], isLoading } = useGetOrganizerEventsQuery(user?.uid ?? "", {
    skip: !user || !organizerProfile,
  });
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateEventStatusMutation();

  if (isChecking || !user) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!organizerProfile) {
    return <BecomeOrganizerForm uid={user.uid} defaultName={user.displayName ?? ""} />;
  }

  async function handleTogglePublish(event: (typeof events)[number]) {
    const nextStatus: EventStatus = event.status === "draft" ? "published" : "draft";
    try {
      await updateStatus({ eventId: event.id, organizerUid: user!.uid, slug: event.slug, status: nextStatus }).unwrap();
      toast.success(nextStatus === "published" ? t("organizerForm.eventPublished") : t("organizerForm.eventUnpublished"));
    } catch {
      toast.error(t("organizerForm.eventUpdateError"));
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("organizerForm.yourEvents")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("organizerForm.manageEventsDesc")}</p>
        </div>
        <Link href="/organizer/events/new" className={buttonVariants()}>
          <PlusCircle className="size-4" />
          {t("organizerDashboard.createEvent")}
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-6 flex flex-col gap-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ) : events.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">{t("organizerForm.noEventsCreatedYet")}</p>
          <Link href="/organizer/events/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
            {t("organizerForm.createFirstEvent")}
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("organizerForm.event")}</TableHead>
                <TableHead>{t("tickets.status")}</TableHead>
                <TableHead>{t("organizerForm.date")}</TableHead>
                <TableHead>{t("organizerForm.attendance")}</TableHead>
                <TableHead className="text-end">{t("organizerForm.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="max-w-56 truncate font-medium">{event.title}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[event.status]}>{eventStatusLabel(event.status, t)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatFullDate(event.startAt, locale)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.capacityTotal - event.capacityRemaining} / {event.capacityTotal}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      {(event.status === "draft" || event.status === "published") && (
                        <Button
                          variant="outline"
                          size="xs"
                          disabled={isUpdatingStatus}
                          onClick={() => handleTogglePublish(event)}
                        >
                          {event.status === "draft" ? t("organizerForm.publish") : t("organizerForm.unpublish")}
                        </Button>
                      )}
                      <Link href={`/organizer/events/${event.id}`} className={buttonVariants({ variant: "outline", size: "xs" })}>
                        {t("organizerForm.manage")}
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
