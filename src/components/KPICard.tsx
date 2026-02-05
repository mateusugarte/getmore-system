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
}

export const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: KPICardProps) => {
  return (
    <div
      className={cn(
        "card-elevated p-6 transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                trend.isPositive
                  ? "badge-concluida"
                  : "badge-contato text-destructive dark:text-red-400"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
