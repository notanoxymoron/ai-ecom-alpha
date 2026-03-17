"use client";

import { useMediaQuery } from "@/features/ui-facelift/lib/use-media-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { month: "Jan", generated: 18, approved: 12 },
  { month: "Feb", generated: 22, approved: 16 },
  { month: "Mar", generated: 26, approved: 19 },
  { month: "Apr", generated: 28, approved: 22 },
  { month: "May", generated: 24, approved: 18 },
  { month: "Jun", generated: 30, approved: 24 },
  { month: "Jul", generated: 34, approved: 26 },
  { month: "Aug", generated: 32, approved: 28 },
  { month: "Sep", generated: 36, approved: 29 },
  { month: "Oct", generated: 38, approved: 32 },
  { month: "Nov", generated: 42, approved: 35 },
  { month: "Dec", generated: 46, approved: 38 },
];

export function PerformanceChart() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3.5 bg-content-bg rounded-[10px]">
          <div className="font-mono text-[22px] font-semibold tracking-tight text-winning">78%</div>
          <div className="text-[11px] text-text-tertiary mt-1">Approval rate</div>
        </div>
        <div className="text-center p-3.5 bg-content-bg rounded-[10px]">
          <div className="font-mono text-[22px] font-semibold tracking-tight">312</div>
          <div className="text-[11px] text-text-tertiary mt-1">Total generated</div>
        </div>
        <div className="text-center p-3.5 bg-content-bg rounded-[10px]">
          <div className="font-mono text-[22px] font-semibold tracking-tight">243</div>
          <div className="text-[11px] text-text-tertiary mt-1">Approved</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <div className="w-2 h-2 rounded-full bg-accent" /> Generated
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <div className="w-2 h-2 rounded-full bg-winning" /> Approved
        </div>
      </div>

      <div className="relative rounded-md overflow-hidden bg-content-bg mb-4">
        <ResponsiveContainer width="100%" height={isMobile ? 140 : 200}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradGenerated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.18} />
                <stop offset="60%" stopColor="#6C5CE7" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.12} />
                <stop offset="60%" stopColor="#10B981" stopOpacity={0.04} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#78776F", fontFamily: "var(--font-mono)" }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "#18181B",
                border: "none",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "#fff",
                padding: "4px 10px",
              }}
              itemStyle={{ color: "#fff" }}
              cursor={{ stroke: "#78776F", strokeWidth: 0.5, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="generated"
              stroke="#6C5CE7"
              strokeWidth={2}
              fill="url(#gradGenerated)"
              activeDot={{ r: 4, fill: "#6C5CE7", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="approved"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#gradApproved)"
              activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between py-2.5 border-b border-border-subtle text-[13px]">
          <span className="text-text-secondary">Avg cost per generated ad</span>
          <span className="font-mono font-medium">$1.55</span>
        </div>
        <div className="flex items-center justify-between py-2.5 text-[13px]">
          <span className="text-text-secondary">Total generation spend</span>
          <span className="font-mono font-medium">$482.60</span>
        </div>
      </div>
    </div>
  );
}
