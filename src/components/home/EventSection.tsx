import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EventCard } from "@/features/events/components/EventCard";
import { EventCardSkeleton } from "@/features/events/components/EventCardSkeleton";
import { EventRail } from "@/components/home/EventRail";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { EventSummary } from "@/types/event";

interface EventSectionProps {
  title: string;
  description?: string;
  events: EventSummary[];
  href: string;
  isLoading?: boolean;
  /** Alternates a faint tinted background between sections for visual rhythm on a long page. */
  tinted?: boolean;
  /** "grid" (default) for a static grid; "rail" for a horizontally-scrolling rail — used for
   * sections meant to feel more like a browsable strip (Trending, Past events, city sections). */
  layout?: "grid" | "rail";
}

export function EventSection({ title, description, events, href, isLoading, tinted, layout = "grid" }: EventSectionProps) {
  const { t } = useTranslation();
  if (!isLoading && events.length === 0) return null;

  return (
    <section className={cn("py-12", tinted && "bg-muted/40")}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-end justify-between gap-4"
        >
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
            {description && <p className="mt-1 text-muted-foreground">{description}</p>}
          </div>
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("common.viewAll")}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </motion.div>
        {layout === "rail" ? (
          <EventRail events={events} isLoading={isLoading} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
              : events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </div>
    </section>
  );
}
