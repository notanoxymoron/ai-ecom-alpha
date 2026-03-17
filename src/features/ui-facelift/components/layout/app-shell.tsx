"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-content-bg items-stretch">
      <div className="hidden lg:block w-[260px] shrink-0 relative">
        <Sidebar />
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
