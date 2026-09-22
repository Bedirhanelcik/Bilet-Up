import type { TranslateFn } from "@/lib/i18n/LocaleProvider";
import type { EventStatus } from "@/types/event";

const EVENT_STATUS_KEY: Record<EventStatus, string> = {
  draft: "eventStatus.draft",
  published: "eventStatus.published",
  live: "eventStatus.live",
  completed: "eventStatus.completed",
  cancelled: "eventStatus.cancelled",
};

export function eventStatusLabel(status: EventStatus, t: TranslateFn): string {
  return t(EVENT_STATUS_KEY[status]);
}
