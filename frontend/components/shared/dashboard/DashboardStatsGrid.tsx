"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardStatItem = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "neutral" | "primary" | "chart1" | "chart2" | "chart3" | "chart4" | "chart5" | "destructive";
};

type DashboardStatsGridProps = {
  items: DashboardStatItem[];
  loading?: boolean;
  className?: string;
};

const toneClassNames: Record<
  NonNullable<DashboardStatItem["tone"]>,
  {
    card: string;
    icon: string;
    value: string;
  }
> = {
  neutral: {
    card: "border-border bg-card",
    icon: "bg-muted text-muted-foreground",
    value: "text-foreground",
  },
  primary: {
    card: "border-primary/30 bg-primary/10",
    icon: "bg-primary/15 text-primary",
    value: "text-primary",
  },
  chart1: {
    card: "border-chart-1/35 bg-chart-1/10",
    icon: "bg-chart-1/15 text-chart-1",
    value: "text-chart-1",
  },
  chart2: {
    card: "border-chart-2/35 bg-chart-2/10",
    icon: "bg-chart-2/15 text-chart-2",
    value: "text-chart-2",
  },
  chart3: {
    card: "border-chart-3/35 bg-chart-3/10",
    icon: "bg-chart-3/15 text-chart-3",
    value: "text-chart-3",
  },
  chart4: {
    card: "border-chart-4/35 bg-chart-4/10",
    icon: "bg-chart-4/15 text-chart-4",
    value: "text-chart-4",
  },
  chart5: {
    card: "border-chart-5/35 bg-chart-5/10",
    icon: "bg-chart-5/15 text-chart-5",
    value: "text-chart-5",
  },
  destructive: {
    card: "border-destructive/30 bg-destructive/10",
    icon: "bg-destructive/15 text-destructive",
    value: "text-destructive",
  },
};

export default function DashboardStatsGrid({ items, loading = false, className }: DashboardStatsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4",
        loading && "pointer-events-none opacity-50",
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const tone = item.tone || "neutral";

        return (
          <div
            key={item.label}
            className={cn(
              "rounded-lg border p-4 transition-colors",
              toneClassNames[tone].card
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className={cn("mt-3 text-2xl font-bold sm:text-3xl", toneClassNames[tone].value)}>{item.value}</p>
              </div>
              <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", toneClassNames[tone].icon)}>
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
