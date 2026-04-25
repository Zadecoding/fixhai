import { PackageX, CalendarX, Search, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: "package" | "calendar" | "search" | "alert";
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const icons = {
  package: PackageX,
  calendar: CalendarX,
  search: Search,
  alert: AlertCircle,
};

export function EmptyState({
  icon = "package",
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = icons[icon];
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-[var(--muted)] flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-[var(--muted-foreground)]" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <>
          {action.href ? (
            <Link href={action.href}>
              <Button size="md">{action.label}</Button>
            </Link>
          ) : (
            <Button size="md" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
