"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CoverImage } from "@/components/shared/CoverImage";
import { formatFullDate, formatPrice } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { useGetEventBySlugQuery } from "@/features/events/eventsApi";
import { useCheckoutMutation } from "@/features/tickets/ticketsApi";
import { useAppSelector } from "@/redux/hooks";

export function CheckoutContent() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { user, isChecking } = useRequireAuth();
  const selection = useAppSelector((s) => s.ticketSelection);
  const {
    data: event,
    isLoading: isLoadingEvent,
    isError: isEventError,
    refetch,
  } = useGetEventBySlugQuery(selection.eventSlug ?? "", { skip: !selection.eventSlug });
  const [checkout, { isLoading: isPurchasing }] = useCheckoutMutation();

  if (isChecking || !user) {
    return <div className="flex flex-1 items-center justify-center py-24 text-muted-foreground">{t("common.loading")}</div>;
  }

  if (!selection.eventSlug || selection.items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-6" />
        </span>
        <h1 className="font-heading text-lg font-semibold">{t("checkout.noTicketsTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("checkout.noTicketsDesc")}</p>
        <Link href="/discover" className={buttonVariants({ variant: "outline" })}>
          {t("checkout.browseEvents")}
        </Link>
      </div>
    );
  }

  if (isLoadingEvent) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (isEventError || !event) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="size-6" />
        </span>
        <h1 className="font-heading text-lg font-semibold">{t("checkout.loadEventError")}</h1>
        <p className="text-sm text-muted-foreground">{t("checkout.loadEventErrorDesc")}</p>
        {isEventError ? (
          <Button variant="outline" onClick={() => refetch()}>
            {t("common.tryAgain")}
          </Button>
        ) : (
          <Link href="/discover" className={buttonVariants({ variant: "outline" })}>
            {t("checkout.backToDiscover")}
          </Link>
        )}
      </div>
    );
  }

  const liveQuantityById = new Map(event.ticketTypes.map((tt) => [tt.id, tt.quantityRemaining]));
  const total = selection.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalTickets = selection.items.reduce((sum, i) => sum + i.quantity, 0);
  const soldOutItem = selection.items.find((i) => (liveQuantityById.get(i.ticketTypeId) ?? 0) < i.quantity);

  async function handleConfirm() {
    if (!user || !event) return;
    try {
      const result = await checkout({
        uid: user.uid,
        event: {
          id: event.id,
          slug: event.slug,
          title: event.title,
          coverImageURL: event.coverImageURL,
          venue: event.venue,
          city: event.city,
          startAt: event.startAt,
          endAt: event.endAt,
        },
        items: selection.items.map((i) => ({ ticketTypeId: i.ticketTypeId, quantity: i.quantity })),
      }).unwrap();
      toast.success(t("checkout.purchaseSuccess", { count: result.ticketIds.length }));
      router.push("/tickets");
    } catch (error) {
      const message = error && typeof error === "object" && "message" in error ? String(error.message) : null;
      toast.error(message || t("checkout.purchaseError"));
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16">
      <h1 className="font-heading text-2xl font-bold tracking-tight">{t("checkout.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("checkout.subtitle")}</p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
          <CoverImage src={event.coverImageURL} alt={event.title} className="object-cover" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium">{event.title}</div>
          <div className="text-sm text-muted-foreground">{formatFullDate(event.startAt, locale)}</div>
          <div className="text-sm text-muted-foreground">
            {event.venue}, {event.city}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-base font-semibold">{t("checkout.orderSummary")}</h2>
        <div className="flex flex-col divide-y divide-border">
          {selection.items.map((item) => {
            const remaining = liveQuantityById.get(item.ticketTypeId) ?? 0;
            const short = remaining < item.quantity;
            return (
              <div key={item.ticketTypeId} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-medium">
                    {item.name} × {item.quantity}
                  </div>
                  <div className="text-muted-foreground">
                    {formatPrice(item.price, locale)} {t("checkout.each")}
                  </div>
                  {short && (
                    <div className="mt-0.5 text-xs font-medium text-destructive">
                      {t("checkout.onlyLeftNow", { count: remaining })}
                    </div>
                  )}
                </div>
                <div className="font-medium">{formatPrice(item.price * item.quantity, locale)}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">{t("checkout.total", { count: totalTickets })}</span>
          <span className="font-heading text-lg font-semibold">{formatPrice(total, locale)}</span>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={isPurchasing || !!soldOutItem}
        onClick={handleConfirm}
      >
        {isPurchasing && <Loader2 className="size-4 animate-spin" />}
        {t("checkout.confirmPurchase")}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">{t("checkout.demoDisclaimer")}</p>
    </div>
  );
}
