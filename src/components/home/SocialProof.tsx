"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const AVATARS = [
  "https://picsum.photos/seed/testimonial-deniz/80/80",
  "https://picsum.photos/seed/testimonial-selin/80/80",
  "https://picsum.photos/seed/testimonial-kaan/80/80",
];

export function SocialProof() {
  const { t, dict } = useLocale();
  const quotes = dict.testimonials;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        {t("sections.socialProofTitle")}
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {quotes.map((q, i) => (
          <figure key={q.name} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, star) => (
                <Star key={star} className="size-4 fill-gold" />
              ))}
            </div>
            <blockquote className="flex-1 text-sm text-foreground">&ldquo;{q.quote}&rdquo;</blockquote>
            <figcaption className="flex items-center gap-3">
              <div className="relative size-9 overflow-hidden rounded-full">
                <Image src={AVATARS[i]} alt="" fill className="object-cover" />
              </div>
              <div className="text-sm">
                <div className="font-medium">{q.name}</div>
                <div className="text-xs text-muted-foreground">{q.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
