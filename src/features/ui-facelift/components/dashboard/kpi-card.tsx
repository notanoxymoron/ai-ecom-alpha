"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface KPICardProps {
  label: string;
  icon: LucideIcon;
  iconVariant: "purple" | "blue" | "green" | "amber";
  children: React.ReactNode;
}

const iconVariants = {
  purple: "bg-accent-muted text-accent",
  blue: "bg-info-bg text-info-text",
  green: "bg-winning-bg text-winning-text",
  amber: "bg-testing-bg text-testing-text",
};

const topBorderVariants = {
  purple: "after:bg-accent",
  blue: "after:bg-info",
  green: "after:bg-winning",
  amber: "after:bg-testing",
};

export function KPICard({ label, icon: Icon, iconVariant, children }: KPICardProps) {
  return (
    <div
      className={cn(
        "relative bg-card-bg border border-card-border rounded-xl p-5 overflow-hidden transition-all duration-150 hover:border-border-default hover:-translate-y-px",
        "after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-150",
        topBorderVariants[iconVariant]
      )}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-xs text-text-secondary font-medium tracking-tight">
          {label}
        </span>
        <div
          className={cn(
            "w-[34px] h-[34px] rounded-md flex items-center justify-center",
            iconVariants[iconVariant]
          )}
        >
          <Icon size={17} />
        </div>
      </div>
      {children}
    </div>
  );
}
