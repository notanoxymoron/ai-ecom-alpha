"use client";

import { useEffect, useState } from "react";

export function KPIRingGauge() {
  const percentage = 78;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    setOffset(circumference - (percentage / 100) * circumference);
  }, [circumference, percentage]);

  return (
    <div className="flex items-center gap-3.5 mt-3">
      <div className="relative w-[52px] h-[52px] shrink-0">
        <svg viewBox="0 0 52 52" width="52" height="52" className="transform -rotate-90">
          <circle cx="26" cy="26" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="4" />
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-semibold font-mono text-text-primary">
            {percentage}%
          </span>
        </div>
      </div>
      <div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium font-mono px-2 py-0.5 rounded-full bg-winning-bg text-winning-text">
          +8.2%
        </span>
        <span className="text-[11px] text-text-tertiary ml-1.5">vs last period</span>
        <div className="text-[11px] text-text-tertiary mt-1">243 of 312 approved</div>
      </div>
    </div>
  );
}
