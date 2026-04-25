import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string;
  width?: string;
  rounded?: string;
}

export function Skeleton({
  className,
  height,
  width,
  rounded = "rounded-xl",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", rounded, className)}
      style={{ height, width }}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
      <Skeleton height="1.25rem" width="60%" />
      <Skeleton height="1rem" width="80%" />
      <Skeleton height="1rem" width="40%" />
      <Skeleton height="2.5rem" rounded="rounded-xl" />
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton height="1rem" width="40%" />
        <Skeleton height="1.5rem" width="5rem" rounded="rounded-full" />
      </div>
      <Skeleton height="1.25rem" width="70%" />
      <Skeleton height="1rem" width="55%" />
      <Skeleton height="1rem" width="45%" />
    </div>
  );
}
