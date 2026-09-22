"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 sm:py-20">
      {/* Brand-primary, not a raw black/foreground slab — `bg-primary`/`text-primary-foreground`
          are theme tokens with correct light *and* dark values, so this reads as an intentional
          brand-colored banner in both themes instead of an unstyled dark patch in light mode. */}
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:py-20">
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-5">
          <h2 className="max-w-lg font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t("sections.ctaTitle")}
          </h2>
          <p className="max-w-md text-primary-foreground/75">{t("sections.ctaDesc")}</p>
          <Link
            href="/organizer"
            className={cn(buttonVariants({ size: "lg" }), "bg-coral text-coral-foreground hover:bg-coral/90")}
          >
            {t("sections.ctaButton")}
          </Link>
        </div>
      </div>
    </section>
  );
}
