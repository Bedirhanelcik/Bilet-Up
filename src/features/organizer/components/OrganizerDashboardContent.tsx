"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, PlusCircle, Pencil, Ticket as TicketIcon, TrendingUp, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatFullDate, formatCurrencyAmount } from "@/lib/format";
import { eventStatusLabel } from "@/lib/eventStatusLabel";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { useRequireOrganizer } from "@/features/organizer/useRequireOrganizer";
import { useGetOrganizerEventsQuery } from "@/features/organizer/organizerApi";
import { BecomeOrganizerForm } from "@/features/organizer/components/BecomeOrganizerForm";
import { EditOrganizerProfileForm } from "@/features/organizer/components/EditOrganizerProfileForm";
import type { EventStatus } from "@/types/event";

const STATUS_VARIANT: Record<EventStatus, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  published: "default",
  live: "default",
  completed: "outline",
  cancelled: "destructive",
};

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof TicketIcon; label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="font-heading text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function OrganizerDashboardContent() {
  const { t, locale } = useTranslation();
  const { user, organizerProfile, isChecking } = useRequireOrganizer();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { data: events = [], isLoading } = useGetOrganizerEventsQuery(user?.uid ?? "", {
    skip: !user || !organizerProfile,
  });

  if (isChecking || !user) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!organizerProfile) {
    return <BecomeOrganizerForm uid={user.uid} defaultName={user.displayName ?? ""} />;
  }

  const published = events.filter((e) => e.status === "published").length;
  const live = events.filter((e) => e.status === "live").length;
  const completed = events.filter((e) => e.status === "completed").length;
  const ticketsSold = events.reduce((sum, e) => sum + (e.capacityTotal - e.capacityRemaining), 0);
  const capacityTotal = events.reduce((sum, e) => sum + e.capacityTotal, 0);
  const estimatedRevenue = events.reduce((sum, e) => sum + (e.capacityTotal - e.capacityRemaining) * e.priceMin, 0);
  const recent = [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      {isEditingProfile ? (
        <EditOrganizerProfileForm uid={user.uid} profile={organizerProfile} onDone={() => setIsEditingProfile(false)} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={organizerProfile.logoURL ?? undefined} alt="" />
              <AvatarFallback>{organizerProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight">{organizerProfile.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("organizerDashboard.yourDashboard")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
              <Pencil className="size-3.5" />
              {t("organizerDashboard.editProfile")}
            </Button>
            <Link href="/organizer/events" className={buttonVariants({ variant: "outline" })}>
              {t("organizerDashboard.manageEvents")}
            </Link>
            <Link href="/organizer/events/new" className={buttonVariants()}>
              <PlusCircle className="size-4" />
              {t("organizerDashboard.createEvent")}
            </Link>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard icon={CalendarDays} label={t("organizerDashboard.totalEvents")} value={String(events.length)} />
            <StatCard
              icon={TrendingUp}
              label={t("organizerDashboard.publishedLiveCompleted")}
              value={`${published} / ${live} / ${completed}`}
            />
            <StatCard icon={TicketIcon} label={t("organizerDashboard.ticketsSold")} value={String(ticketsSold)} />
            <StatCard
              icon={Users}
              label={t("organizerDashboard.capacityAttendance")}
              value={`${ticketsSold} / ${capacityTotal}`}
              hint={
                capacityTotal > 0
                  ? t("organizerDashboard.percentFilled", { percent: Math.round((ticketsSold / capacityTotal) * 100) })
                  : undefined
              }
            />
            <StatCard
              icon={TrendingUp}
              label={t("organizerDashboard.estimatedRevenue")}
              value={formatCurrencyAmount(estimatedRevenue, locale)}
              hint={t("organizerDashboard.estimatedRevenueHint")}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-heading text-base font-semibold">{t("organizerDashboard.recentActivity")}</h2>
            {recent.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("organizerDashboard.noEventsYet")}{" "}
                <Link href="/organizer/events/new" className="text-primary underline underline-offset-2">
                  {t("organizerDashboard.createFirstOne")}
                </Link>
                .
              </p>
            ) : (
              <div className="mt-3 flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
                {recent.map((event) => (
                  <Link
                    key={event.id}
                    href={`/organizer/events/${event.id}`}
                    className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("organizerDashboard.created", { date: formatFullDate(event.createdAt, locale) })}
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANT[event.status]} className="shrink-0">
                      {eventStatusLabel(event.status, t)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
