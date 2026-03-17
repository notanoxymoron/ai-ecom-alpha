"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import {
  LayoutDashboard,
  Search,
  BookMarked,
  BarChart3,
  Zap,
  FileText,
  Bot,
  AlertTriangle,
} from "lucide-react";
import { useAppStore } from "@/shared/lib/store";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discover", label: "Discovery", icon: Search, badge: "100M+" },
  { href: "/knowledge-base", label: "Knowledge Feed", icon: BookMarked },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/generate", label: "Generate", icon: Zap, badge: "AI" },
  // { href: "/briefs",        label: "Briefs",     icon: FileText },
];

const intelligenceNavItems = [
  { href: "/openclaw", label: "Openclaw", icon: Bot },
  { href: "/errors", label: "Reports", icon: AlertTriangle, errorBadge: true },
];

const platforms = [
  { name: "Meta", color: "#1877F2", count: "24" },
  { name: "TikTok", color: "#FF0050", count: "18" },
  { name: "LinkedIn", color: "#0A66C2", count: "7" },
  { name: "YouTube", color: "#FF0000", count: "12" },
  { name: "Google", color: "#4285F4", count: "9" },
];

export function Sidebar() {
  const pathname = usePathname();
  const errorCount = useAppStore((s) => s.errorLogs.length);
  const brandName = useAppStore((s) => s.brandProfile.brandName);

  const initials = brandName
    ? brandName
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "GO";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="top-0 sticky flex flex-col bg-sidebar-bg border-sidebar-border border-r w-full h-screen overflow-hidden">
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 px-6 py-[19px] border-sidebar-border border-b shrink-0">
        <div className="flex justify-center items-center bg-sidebar-accent rounded-[10px] w-9 h-9 shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            className="w-[18px] h-[18px]"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div className="font-medium text-[15px] text-sidebar-text-active leading-tight tracking-[-0.01em]">
            AdEngine
          </div>
          <div className="text-[11px] text-sidebar-text-muted tracking-[0.02em]">
            Workspace
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Main section */}
        <div className="px-3 pt-1 pb-2 font-medium text-[10px] text-sidebar-text-muted uppercase tracking-[0.08em]">
          Main
        </div>

        {mainNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 mb-0.5 px-3 py-[9px] rounded-[6px] text-[13px] transition-all duration-100",
                active
                  ? "bg-sidebar-accent-muted text-sidebar-text-active font-medium"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active font-normal",
              )}
            >
              {active && (
                <span className="top-1/2 left-[-12px] absolute bg-sidebar-accent rounded-r-sm w-[3px] h-5 -translate-y-1/2" />
              )}
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0",
                  active ? "opacity-90" : "opacity-50",
                )}
                strokeWidth={1.8}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-white/[0.06] px-[7px] py-0.5 rounded-[10px] font-mono font-medium text-[10px] text-sidebar-text-muted">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Intelligence section */}
        <div className="px-3 pt-4 pb-2 font-medium text-[10px] text-sidebar-text-muted uppercase tracking-[0.08em]">
          Intelligence
        </div>

        {intelligenceNavItems.map((item) => {
          const active = isActive(item.href);
          const count = item.errorBadge && errorCount > 0 ? errorCount : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 mb-0.5 px-3 py-[9px] rounded-[6px] text-[13px] transition-all duration-100",
                active
                  ? "bg-sidebar-accent-muted text-sidebar-text-active font-medium"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active font-normal",
              )}
            >
              {active && (
                <span className="top-1/2 left-[-12px] absolute bg-sidebar-accent rounded-r-sm w-[3px] h-5 -translate-y-1/2" />
              )}
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0",
                  active ? "opacity-90" : "opacity-50",
                )}
                strokeWidth={1.8}
              />
              <span className="flex-1">{item.label}</span>
              {count !== null && (
                <span className="bg-white/[0.06] px-[7px] py-0.5 rounded-[10px] font-mono font-medium text-[10px] text-sidebar-text-muted">
                  {count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Platforms label */}
        {/* <div className="px-3 pt-4 pb-2 font-medium text-[10px] text-sidebar-text-muted uppercase tracking-[0.08em]">
          Platforms
        </div> */}
      </nav>

      {/* ── Platform list ── */}
      {/* <div className="px-3 pb-3 shrink-0">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-2.5 hover:bg-sidebar-hover px-3 py-[7px] rounded-[6px] text-[12px] text-sidebar-text-muted hover:text-sidebar-text transition-all duration-100 cursor-pointer"
          >
            <span
              className="rounded-full w-[7px] h-[7px] shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <span className="flex-1">{p.name}</span>
            <span className="font-mono text-[11px]">{p.count}</span>
          </div>
        ))}
      </div> */}

      {/* ── User block ── */}
      <div className="px-4 py-4 border-sidebar-border border-t shrink-0">
        <div className="flex items-center gap-2.5 hover:bg-sidebar-hover p-2 rounded-[8px] transition-all duration-100 cursor-pointer">
          <div className="flex justify-center items-center bg-gradient-to-br from-accent to-[#a78bfa] rounded-full w-8 h-8 shrink-0">
            <span className="font-medium text-[11px] text-white">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sidebar-text-active text-xs truncate">
              {brandName || "Genie OS"}
            </div>
            <div className="text-[10px] text-sidebar-text-muted">Admin</div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-sidebar-text-muted shrink-0"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
