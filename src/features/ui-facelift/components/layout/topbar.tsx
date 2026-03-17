"use client";

import { Search, Bell, Menu } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card-bg border-b border-card-border lg:px-8">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-text-secondary">
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-content-bg border border-border-subtle rounded-md px-3.5 py-2 min-w-[280px] transition-colors duration-150 hover:border-border-default cursor-text">
          <Search size={16} className="text-text-tertiary" />
          <span className="text-[13px] text-text-tertiary">Search ads, boards, brands...</span>
          <span className="ml-auto text-[10px] font-mono text-text-tertiary bg-card-bg border border-border-subtle px-1.5 py-0.5 rounded">⌘K</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shadow-sm">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-sm border border-border-default bg-card-bg text-text-secondary cursor-pointer transition-all duration-100 hover:border-text-tertiary hover:bg-content-bg">
          <Bell size={16} />
          <span className="absolute top-[7px] right-[7px] w-1.5 h-1.5 rounded-full bg-losing border-[1.5px] border-card-bg" />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-md text-[13px] font-medium transition-all duration-120 hover:bg-accent-hover active:scale-[0.98]">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
           New campaign
        </button>
      </div>
    </header>
  );
}
