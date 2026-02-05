import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  highlight?: boolean;
}

export const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  highlight,
}: KPICardProps) => {
  return (
    <div
      className={cn(
        "card-elevated p-4 transition-all duration-200",
        highlight && "bg-primary/5 border-primary/20",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "mt-1.5 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
