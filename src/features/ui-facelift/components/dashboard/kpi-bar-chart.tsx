"use client";

import { cn } from "@/shared/lib/utils";

const DAYS = [
  { label: "M", height: "14px", opacity: 0.35, isToday: false },
  { label: "T", height: "22px", opacity: 0.45, isToday: false },
  { label: "W", height: "18px", opacity: 0.4, isToday: false },
  { label: "T", height: "32px", opacity: 0.6, isToday: false },
  { label: "F", height: "28px", opacity: 0.55, isToday: false },
  { label: "S", height: "36px", opacity: 0.7, isToday: false },
  { label: "S", height: "42px", opacity: 0.9, isToday: true },
];

export function KPIBarChart() {
  return (
    <div className="flex gap-[5px] mt-3.5 h-12 items-end">
      {DAYS.map((day, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-info rounded-[3px] transition-all duration-300 transform origin-bottom hover:opacity-100"
            style={{
              height: day.height,
              opacity: day.opacity,
            }}
          />
          <span
            className={cn(
              "text-[9px] font-mono",
              day.isToday ? "text-text-secondary font-medium" : "text-text-tertiary"
            )}
          >
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}
