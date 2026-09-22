"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import { useTranslation, type TranslateFn } from "@/lib/i18n/LocaleProvider";
import { createTicketTypeSchema, type TicketTypeValues } from "@/features/organizer/schemas";
import {
  useCreateTicketTypeMutation,
  useDeleteTicketTypeMutation,
  useUpdateTicketTypeCapacityMutation,
  useUpdateTicketTypeDetailsMutation,
} from "@/features/organizer/organizerApi";
import type { TicketType } from "@/types/event";

function TicketTypeForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isLoading,
  t,
}: {
  defaultValues: TicketTypeValues;
  submitLabel: string;
  onSubmit: (values: TicketTypeValues) => void;
  isLoading: boolean;
  t: TranslateFn;
}) {
  const ticketTypeSchema = useMemo(() => createTicketTypeSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketTypeValues>({ resolver: zodResolver(ticketTypeSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tt-name">{t("profile.name")}</Label>
        <Input id="tt-name" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tt-price">{t("organizerForm.price")}</Label>
          <Input
            id="tt-price"
            type="number"
            step="0.01"
            aria-invalid={!!errors.price}
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tt-quantity">{t("organizerForm.totalCapacity")}</Label>
          <Input
            id="tt-quantity"
            type="number"
            aria-invalid={!!errors.quantityTotal}
            {...register("quantityTotal", { valueAsNumber: true })}
          />
          {errors.quantityTotal && <p className="text-xs text-destructive">{errors.quantityTotal.message}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditTicketTypeDialog({ eventId, slug, ticketType }: { eventId: string; slug: string; ticketType: TicketType }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [updateDetails, { isLoading: isSavingDetails }] = useUpdateTicketTypeDetailsMutation();
  const [updateCapacity, { isLoading: isSavingCapacity }] = useUpdateTicketTypeCapacityMutation();
  const isLoading = isSavingDetails || isSavingCapacity;

  async function handleSubmit(values: TicketTypeValues) {
    try {
      if (values.name !== ticketType.name || values.price !== ticketType.price) {
        await updateDetails({ eventId, slug, ticketTypeId: ticketType.id, values: { name: values.name, price: values.price } }).unwrap();
      }
      if (values.quantityTotal !== ticketType.quantityTotal) {
        await updateCapacity({ eventId, slug, ticketTypeId: ticketType.id, newQuantityTotal: values.quantityTotal }).unwrap();
      }
      toast.success(t("organizerForm.ticketTypeUpdated"));
      setOpen(false);
    } catch (error) {
      const message = error && typeof error === "object" && "message" in error ? String(error.message) : null;
      toast.error(message || t("organizerForm.ticketTypeUpdateError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon-sm" aria-label={t("organizerForm.editTicketTypeAria")} />}>
        <Pencil className="size-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("organizerForm.editDialogTitle", { name: ticketType.name })}</DialogTitle>
        </DialogHeader>
        <TicketTypeForm
          defaultValues={{ name: ticketType.name, price: ticketType.price, quantityTotal: ticketType.quantityTotal }}
          submitLabel={t("profile.saveChanges")}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          t={t}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddTicketTypeDialog({ eventId, slug }: { eventId: string; slug: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [createTicketType, { isLoading }] = useCreateTicketTypeMutation();

  async function handleSubmit(values: TicketTypeValues) {
    try {
      await createTicketType({ eventId, slug, values }).unwrap();
      toast.success(t("organizerForm.ticketTypeAdded"));
      setOpen(false);
    } catch {
      toast.error(t("organizerForm.ticketTypeAddError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="xs" />}>
        <Plus className="size-3.5" />
        {t("organizerForm.addTicketType")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("organizerForm.addTicketType")}</DialogTitle>
        </DialogHeader>
        <TicketTypeForm
          defaultValues={{ name: "", price: 0, quantityTotal: 50 }}
          submitLabel={t("organizerForm.addTicketType")}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          t={t}
        />
      </DialogContent>
    </Dialog>
  );
}

export function TicketTypesManager({ eventId, slug, ticketTypes }: { eventId: string; slug: string; ticketTypes: TicketType[] }) {
  const { t, locale } = useTranslation();
  const [deleteTicketType, { isLoading: isDeleting }] = useDeleteTicketTypeMutation();

  async function handleDelete(ticketType: TicketType) {
    try {
      await deleteTicketType({ eventId, slug, ticketTypeId: ticketType.id }).unwrap();
      toast.success(t("organizerForm.ticketTypeRemoved"));
    } catch {
      toast.error(t("organizerForm.ticketTypeRemoveError"));
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold">{t("organizerForm.ticketTypes")}</h2>
        <AddTicketTypeDialog eventId={eventId} slug={slug} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("profile.name")}</TableHead>
            <TableHead>{t("organizerForm.price")}</TableHead>
            <TableHead>{t("organizerForm.sold")}</TableHead>
            <TableHead>{t("organizerForm.remaining")}</TableHead>
            <TableHead className="text-end">{t("organizerForm.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ticketTypes.map((tt) => {
            const sold = tt.quantityTotal - tt.quantityRemaining;
            return (
              <TableRow key={tt.id}>
                <TableCell className="font-medium">{tt.name}</TableCell>
                <TableCell>{formatPrice(tt.price, locale)}</TableCell>
                <TableCell>
                  {sold} / {tt.quantityTotal}
                </TableCell>
                <TableCell>{tt.quantityRemaining}</TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-2">
                    <EditTicketTypeDialog eventId={eventId} slug={slug} ticketType={tt} />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("organizerForm.deleteTicketTypeAria")}
                      disabled={sold > 0 || isDeleting}
                      title={sold > 0 ? t("organizerForm.cantRemoveSoldTicketType") : undefined}
                      onClick={() => handleDelete(tt)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
