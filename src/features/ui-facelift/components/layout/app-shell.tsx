"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAppStore } from "@/shared/lib/store";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const theme = useAppStore((s) => s.preferences.theme);

  return (
    <div className="flex min-h-screen bg-content-bg items-stretch" data-theme={theme === "contrast" ? undefined : theme}>
      <div
        className="hidden lg:block shrink-0 relative transition-[width] duration-200 ease-out"
        style={{ width: collapsed ? 68 : 260 }}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-content-bg">
        <Topbar />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6 xl:px-8 xl:py-7 w-full mx-auto max-w-[1280px]">
          {children}
        </main>
      </div>
    </div>
  );
}
