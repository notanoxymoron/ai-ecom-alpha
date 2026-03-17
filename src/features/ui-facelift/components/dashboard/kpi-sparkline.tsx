"use client";

import { useEffect, useState } from "react";

export function KPISparkline() {
  const [draw, setDraw] = useState(false);

  // Trigger animation after mount
  useEffect(() => {
    setDraw(true);
  }, []);

  return (
    <div className="mt-3 h-9 relative">
      <svg viewBox="0 0 200 36" preserveAspectRatio="none" className="w-full h-full block">
        <defs>
          <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 28 Q15 24,30 22 T60 18 T90 20 T120 14 T150 10 T180 8 T200 4 V36 H0 Z"
          fill="url(#sparklineGrad)"
        />
        <path
          d="M0 28 Q15 24,30 22 T60 18 T90 20 T120 14 T150 10 T180 8 T200 4"
          fill="none"
          stroke="#6C5CE7"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            strokeDasharray: 600,
            strokeDashoffset: draw ? 0 : 600,
            transition: "stroke-dashoffset 1.2s ease",
          }}
        />
        <circle cx="200" cy="4" r="3" fill="#6C5CE7" />
      </svg>
    </div>
  );
}
