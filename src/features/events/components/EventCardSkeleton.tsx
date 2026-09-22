import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <div className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-border/60">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="relative flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-16 bg-background/40" />
        <Skeleton className="h-5 w-4/5 bg-background/40" />
        <Skeleton className="h-4 w-3/5 bg-background/40" />
        <Skeleton className="mt-1 h-4 w-1/3 bg-background/40" />
      </div>
    </div>
  );
}
