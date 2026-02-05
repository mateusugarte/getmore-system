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
        "group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
        highlight && "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20",
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                trend.isPositive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
            highlight 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
