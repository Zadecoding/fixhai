import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/database";

const statusConfig: Record<
  BookingStatus,
  { label: string; color: string; pulse: boolean }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    pulse: true,
  },
  assigned: {
    label: "Technician Assigned",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    pulse: true,
  },
  on_the_way: {
    label: "On the Way",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    pulse: true,
  },
  diagnosis_complete: {
    label: "Diagnosis Complete",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    pulse: false,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pulse: false,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    pulse: false,
  },
};

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        config.color,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          config.pulse ? "animate-pulse" : "",
          // Derive dot color from text color class
          status === "pending" && "bg-yellow-500",
          status === "assigned" && "bg-blue-500",
          status === "on_the_way" && "bg-indigo-500",
          status === "diagnosis_complete" && "bg-purple-500",
          status === "completed" && "bg-green-500",
          status === "cancelled" && "bg-red-500"
        )}
      />
      {config.label}
    </span>
  );
}
