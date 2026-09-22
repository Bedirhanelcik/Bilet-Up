"use client";

import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { completeOnboarding, toggleInterest, INTEREST_CATEGORIES } from "@/redux/slices/onboardingSlice";
import { useUpdateInterestsMutation } from "@/features/profile/profileApi";
import { cn } from "@/lib/utils";
import { categoryDisplayName } from "@/lib/mock/categories";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function OnboardingPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { user, isChecking } = useRequireAuth();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.onboarding.selectedInterests);
  const [updateInterests, { isLoading: isSaving }] = useUpdateInterestsMutation();

  if (isChecking || !user) {
    return <div className="flex flex-1 items-center justify-center py-24 text-muted-foreground">{t("onboarding.loading")}</div>;
  }

  async function handleContinue() {
    if (!user) return;
    await updateInterests({ uid: user.uid, favoriteCategories: selected });
    dispatch(completeOnboarding());
    router.push("/discover");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-heading text-3xl font-bold tracking-tight">{t("onboarding.title")}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{t("onboarding.subtitle")}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {INTEREST_CATEGORIES.map((interest) => {
          const isSelected = selected.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => dispatch(toggleInterest(interest))}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent"
              )}
            >
              {isSelected && <Check className="size-3.5" />}
              {categoryDisplayName(interest, locale)}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.push("/discover")} disabled={isSaving}>
          {t("onboarding.skip")}
        </Button>
        <Button onClick={handleContinue} disabled={isSaving || selected.length === 0} size="lg">
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {t("onboarding.continueBtn")}
        </Button>
      </div>
    </div>
  );
}
