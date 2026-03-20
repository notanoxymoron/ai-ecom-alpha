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
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAppStore } from "@/shared/lib/store";
import { GoldRing } from "@/shared/components/gold-ring";

const mainNavItems = [
  { href: "/discover", label: "Discover", icon: Search, badge: "100M+" },
  { href: "/", label: "Analyze", icon: LayoutDashboard },
  { href: "/generate", label: "Generate", icon: Zap, badge: "AI" },
];

const intelligenceNavItems = [
  { href: "/knowledge-base", label: "Branding", icon: BookMarked },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
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

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const errorCount = useAppStore((s) => s.errorLogs.length);
  const brandName = useAppStore((s) => s.brandProfile.brandName);
  const theme = useAppStore((s) => s.preferences.theme);
  const plateColor = theme === "light" ? "#FFFFFF" : "#0F1117";

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
      <div className={cn(
        "flex items-center border-sidebar-border border-b shrink-0 transition-all duration-200",
        collapsed ? "justify-center px-3 py-[19px]" : "gap-3 px-6 py-[19px]",
      )}>
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
        {!collapsed && (
          <div>
            <div className="font-medium text-[15px] text-sidebar-text-active leading-tight tracking-[-0.01em]">
              Genie OS
            </div>
            <div className="text-[11px] text-sidebar-text-muted tracking-[0.02em]">
              Workspace
            </div>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className={cn("flex-1 py-4 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        {/* Main section */}
        {!collapsed && (
          <div className="px-3 pt-1 pb-2 font-medium text-[10px] text-sidebar-text-muted uppercase tracking-[0.08em]">
            Workspace
          </div>
        )}

        {mainNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center mb-0.5 rounded-[8px] text-[13px] transition-all duration-100",
                collapsed ? "justify-center px-0 py-[9px]" : "gap-2.5 px-3 py-[9px]",
                active
                  ? "text-sidebar-text-active font-medium"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active font-normal",
              )}
            >
              {active && <GoldRing plateColor={plateColor} />}
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0 relative z-[2]",
                  active ? "opacity-90" : "opacity-50",
                )}
                strokeWidth={1.8}
              />
              {!collapsed && (
                <>
                  <span className="relative z-[2] flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="relative z-[2] bg-white/[0.06] px-[7px] py-0.5 rounded-[10px] font-mono font-medium text-[10px] text-sidebar-text-muted">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}

        {/* Intelligence section */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-2 font-medium text-[10px] text-sidebar-text-muted uppercase tracking-[0.08em]">
            Intelligence
          </div>
        )}
        {collapsed && <div className="my-2 mx-2 border-t border-sidebar-border" />}

        {intelligenceNavItems.map((item) => {
          const active = isActive(item.href);
          const count = item.errorBadge && errorCount > 0 ? errorCount : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center mb-0.5 rounded-[8px] text-[13px] transition-all duration-100",
                collapsed ? "justify-center px-0 py-[9px]" : "gap-2.5 px-3 py-[9px]",
                active
                  ? "text-sidebar-text-active font-medium"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active font-normal",
              )}
            >
              {active && <GoldRing variant="red" plateColor={plateColor} />}
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0 relative z-[2]",
                  active ? "opacity-90" : "opacity-50",
                )}
                strokeWidth={1.8}
              />
              {!collapsed && (
                <>
                  <span className="relative z-[2] flex-1">{item.label}</span>
                  {count !== null && (
                    <span className="relative z-[2] bg-white/[0.06] px-[7px] py-0.5 rounded-[10px] font-mono font-medium text-[10px] text-sidebar-text-muted">
                      {count}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Settings link ── */}
      <div className={cn("pb-2 shrink-0", collapsed ? "px-2" : "px-3")}>
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "relative flex items-center rounded-[8px] text-[13px] transition-all duration-100",
            collapsed ? "justify-center px-0 py-[9px]" : "gap-2.5 px-3 py-[9px]",
            isActive("/settings")
              ? "text-sidebar-text-active font-medium"
              : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active font-normal",
          )}
        >
          {isActive("/settings") && <GoldRing variant="gold" plateColor={plateColor} />}
          <Settings
            className={cn("w-[18px] h-[18px] shrink-0 relative z-[2]", isActive("/settings") ? "opacity-90" : "opacity-50")}
            strokeWidth={1.8}
          />
          {!collapsed && <span className="relative z-[2] flex-1">Settings</span>}
        </Link>
      </div>

      {/* ── Collapse toggle ── */}
      <div className={cn("pb-1 shrink-0", collapsed ? "px-2" : "px-3")}>
        <button
          onClick={onToggle}
          className={cn(
            "relative flex items-center w-full rounded-[8px] text-[13px] transition-all duration-100 text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active font-normal py-[9px]",
            collapsed ? "justify-center px-0" : "gap-2.5 px-3",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-[18px] h-[18px] opacity-50" strokeWidth={1.8} />
          ) : (
            <>
              <PanelLeftClose className="w-[18px] h-[18px] opacity-50" strokeWidth={1.8} />
              <span className="flex-1 text-left">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* ── User block ── */}
      <div className={cn(
        "py-4 border-sidebar-border border-t shrink-0 transition-all duration-200",
        collapsed ? "px-2" : "px-4",
      )}>
        <div className={cn(
          "flex items-center hover:bg-sidebar-hover p-2 rounded-[8px] transition-all duration-100 cursor-pointer",
          collapsed ? "justify-center" : "gap-2.5",
        )}>
          <div className="flex justify-center items-center bg-gradient-to-br from-accent to-[#a78bfa] rounded-full w-8 h-8 shrink-0">
            <span className="font-medium text-[11px] text-white">
              {initials}
            </span>
          </div>
          {!collapsed && (
            <>
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
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
