"use client";

import Link from "next/link";
import { Bell, Check, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useGetDiscoverableEventsQuery } from "@/features/events/eventsApi";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notifications/notificationsApi";
import type { AppNotification } from "@/types/notification";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  if (type === "favorite-added") return <Heart className="size-4 text-destructive" />;
  return <Bell className="size-4 text-primary" />;
}

export function NotificationBell() {
  const { t, locale } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const { data: notifications = [], isLoading, isError, refetch } = useGetNotificationsQuery(user?.uid ?? "", {
    skip: !user,
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  // Notifications store the event's Firestore doc id (consistent with orders/tickets elsewhere),
  // but routes are slug-based — resolve via the already-cached discoverable events list rather
  // than adding a redundant slug field to the notification schema.
  const { data: events = [] } = useGetDiscoverableEventsQuery(undefined, { skip: !user });
  const eventSlugById = new Map(events.map((e) => [e.id, e.slug]));

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" className="relative" aria-label={t("common.notifications")} />}
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-sm font-semibold">{t("common.notifications")}</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => markAllRead({ uid: user.uid, notificationIds: notifications.filter((n) => !n.read).map((n) => n.id) })}
            >
              <Check className="size-3.5" />
              {t("common.markAllRead")}
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-xs text-muted-foreground">{t("common.couldntLoadNotifications")}</p>
              <Button variant="outline" size="xs" onClick={() => refetch()}>
                {t("common.tryAgain")}
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-8 text-center">
              <Bell className="size-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("common.noNotificationsYet")}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {notifications.map((n) => {
                const content = (
                  <div className="flex flex-1 items-start gap-2 text-start">
                    <span className="mt-0.5 shrink-0">
                      <NotificationIcon type={n.type} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                        <span className="truncate text-sm font-medium">{n.title}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatShortDate(n.createdAt, locale)}</p>
                    </div>
                  </div>
                );

                const slug = n.eventId ? eventSlugById.get(n.eventId) : undefined;

                return (
                  <li
                    key={n.id}
                    className={cn(
                      "group flex items-start gap-1 rounded-lg p-2 hover:bg-accent",
                      !n.read && "bg-accent/50"
                    )}
                  >
                    {slug ? (
                      <Link
                        href={`/events/${slug}`}
                        onClick={() => !n.read && markRead({ uid: user.uid, notificationId: n.id })}
                        className="flex flex-1 items-start gap-2"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => !n.read && markRead({ uid: user.uid, notificationId: n.id })}
                        className="flex flex-1 items-start gap-2"
                      >
                        {content}
                      </button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="shrink-0 opacity-0 group-hover:opacity-100"
                      aria-label={t("common.deleteNotification")}
                      onClick={() => deleteNotification({ uid: user.uid, notificationId: n.id })}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
