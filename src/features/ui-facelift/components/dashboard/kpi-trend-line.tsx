"use client";

export function KPITrendLine() {
  return (
    <div className="mt-2.5 h-11 relative">
      <svg viewBox="0 0 200 44" preserveAspectRatio="none" className="w-full h-full block">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 8 C20 7,35 10,50 14 C65 18,80 20,100 24 C120 28,140 30,160 34 C175 37,190 39,200 40 V44 H0 Z"
          fill="url(#trendGrad)"
        />
        <path
          d="M0 8 C20 7,35 10,50 14 C65 18,80 20,100 24 C120 28,140 30,160 34 C175 37,190 39,200 40"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="200" cy="40" r="3" fill="#F59E0B" opacity="0.8" />
        <circle cx="0" cy="8" r="3" fill="#F59E0B" opacity="0.3" />
      </svg>
    </div>
  );
}
