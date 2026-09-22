"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { CoverImage } from "@/components/shared/CoverImage";
import { CATEGORIES, categoryDisplayName } from "@/lib/mock/categories";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { EventSummary } from "@/types/event";

export function CategoryGrid({ events }: { events: EventSummary[] }) {
  const { t, locale } = useLocale();
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      if (e.status === "completed") continue;
      map.set(e.category, (map.get(e.category) ?? 0) + 1);
    }
    return map;
  }, [events]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        {t("sections.categoriesTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((category, i) => {
          const Icon = (Icons[category.icon as keyof typeof Icons] ?? Icons.Ticket) as Icons.LucideIcon;
          const count = counts.get(category.slug) ?? 0;
          return (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Link
                href={`/discover?category=${category.slug}`}
                className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-border cursor-pointer"
              >
                <CoverImage
                  src={category.image}
                  alt=""
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="pointer-events-none absolute end-2.5 top-2.5 flex size-7 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                  <Icon className="size-3.5" />
                </span>
                <div className="relative z-10 flex flex-col gap-0.5 p-3">
                  <span className="text-sm font-semibold text-white sm:text-base">
                    {categoryDisplayName(category.slug, locale)}
                  </span>
                  {count > 0 && (
                    <span className="text-xs text-white/75">{t("sections.eventCount", { count })}</span>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
