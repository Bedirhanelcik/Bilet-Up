"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Ticket as TicketIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setQuantity, startSelection } from "@/redux/slices/ticketSelectionSlice";
import type { TicketType } from "@/types/event";

export function TicketSelector({
  eventId,
  eventSlug,
  ticketTypes,
}: {
  eventId: string;
  eventSlug: string;
  ticketTypes: TicketType[];
}) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const selection = useAppSelector((s) => s.ticketSelection);

  useEffect(() => {
    dispatch(startSelection({ eventId, eventSlug }));
  }, [dispatch, eventId, eventSlug]);

  const quantities = useMemo(() => {
    const map = new Map(selection.items.map((i) => [i.ticketTypeId, i.quantity]));
    return ticketTypes.map((tt) => ({ ticket: tt, quantity: map.get(tt.id) ?? 0 }));
  }, [selection.items, ticketTypes]);

  const subtotal = quantities.reduce((sum, q) => sum + q.quantity * q.ticket.price, 0);
  const totalTickets = quantities.reduce((sum, q) => sum + q.quantity, 0);

  function updateQuantity(ticket: TicketType, quantity: number) {
    const clamped = Math.max(0, Math.min(quantity, ticket.quantityRemaining, 10));
    dispatch(
      setQuantity({ ticketTypeId: ticket.id, name: ticket.name, price: ticket.price, quantity: clamped })
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
        <TicketIcon className="size-5 text-primary" />
        {t("ticketSelector.title")}
      </h3>

      <div className="flex flex-col divide-y divide-border">
        {quantities.map(({ ticket, quantity }) => {
          const soldOut = ticket.quantityRemaining === 0;
          return (
            <div key={ticket.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="text-sm font-medium">{ticket.name}</div>
                <div className="text-sm text-muted-foreground">{formatPrice(ticket.price, locale)}</div>
                {soldOut ? (
                  <div className="mt-0.5 text-xs font-medium text-destructive">{t("ticketSelector.soldOut")}</div>
                ) : ticket.quantityRemaining <= 10 ? (
                  <div className="mt-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    {t("ticketSelector.onlyLeft", { count: ticket.quantityRemaining })}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={soldOut || quantity === 0}
                  onClick={() => updateQuantity(ticket, quantity - 1)}
                  aria-label={t("ticketSelector.decreaseQuantity", { name: ticket.name })}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="w-5 text-center text-sm font-medium tabular-nums">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={soldOut || quantity >= Math.min(10, ticket.quantityRemaining)}
                  onClick={() => updateQuantity(ticket, quantity + 1)}
                  aria-label={t("ticketSelector.increaseQuantity", { name: ticket.name })}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">{t("ticketSelector.subtotal", { count: totalTickets })}</span>
        <span className="font-heading text-base font-semibold">{formatPrice(subtotal, locale)}</span>
      </div>

      <Button
        size="lg"
        disabled={totalTickets === 0}
        onClick={() => {
          if (!user) {
            toast.error(t("ticketSelector.signInToBuy"));
            router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
            return;
          }
          router.push("/checkout");
        }}
      >
        {t("ticketSelector.continueToCheckout")}
      </Button>
      <p className="text-center text-xs text-muted-foreground">{t("ticketSelector.demoNote")}</p>
    </div>
  );
}
