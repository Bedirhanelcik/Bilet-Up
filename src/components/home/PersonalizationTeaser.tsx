"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { INTEREST_CATEGORIES } from "@/redux/slices/onboardingSlice";
import { categoryDisplayName } from "@/lib/mock/categories";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function PersonalizationTeaser({ isSignedIn }: { isSignedIn: boolean }) {
  const { t, locale } = useLocale();
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-gradient-to-br from-accent to-card px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="size-6" />
        </span>
        <h2 className="max-w-xl font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {t("sections.personalizationTitle")}
        </h2>
        <p className="max-w-lg text-muted-foreground">
          {isSignedIn ? t("sections.personalizationSignedIn") : t("sections.personalizationGuest")}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {INTEREST_CATEGORIES.map((interest) => (
            <span
              key={interest}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {categoryDisplayName(interest, locale)}
            </span>
          ))}
        </div>
        <Link href={isSignedIn ? "/onboarding" : "/register"} className={buttonVariants({ size: "lg" })}>
          {isSignedIn ? t("sections.personalizationCta") : t("sections.personalizationCtaGuest")}
        </Link>
      </div>
    </section>
  );
}
