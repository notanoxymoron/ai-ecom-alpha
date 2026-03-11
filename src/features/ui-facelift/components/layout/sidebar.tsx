"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import {
  LayoutDashboard,
  Search,
  Zap,
  BookOpen,
  BarChart3,
  AlertTriangle,
  Sparkles,
  User,
  Bot,
} from "lucide-react";
import { useAppStore } from "@/shared/lib/store";

const navItems = [
  { href: "/", label: "Ad Feed", icon: LayoutDashboard },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/openclaw", label: "OpenClaw", icon: Bot },
  { href: "/generate", label: "Generate", icon: Zap },
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/errors", label: "Errors", icon: AlertTriangle },
];

export function Sidebar() {
  const pathname = usePathname();
  const errorCount = useAppStore((s) => s.errorLogs.length);
  const brandName = useAppStore((s) => s.brandProfile.brandName);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-black flex flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Genie OS</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const isErrors = item.href === "/errors";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : isErrors && errorCount > 0
                    ? "text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {isErrors && errorCount > 0 && (
                <span className="ml-auto text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-bold">
                  {errorCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Brand profile card */}
      <div className="px-4 py-4 border-t border-border">
        {brandName ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{brandName}</p>
              <p className="text-[10px] text-muted-foreground">Genie OS v1.0</p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Genie OS v1.0</div>
        )}
      </div>
    </aside>
  );
}
