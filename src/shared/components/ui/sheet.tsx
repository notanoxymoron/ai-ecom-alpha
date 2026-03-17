"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Side the drawer slides in from (default: right) */
  side?: "right" | "left";
  /** Width class (default: w-80) */
  width?: string;
}

/**
 * Lightweight sheet / side-drawer — no Radix dependency.
 * Slides in from left or right with a backdrop overlay.
 */
export function Sheet({ open, onClose, title, children, side = "right", width = "w-80" }: SheetProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed top-0 bottom-0 z-50 flex flex-col",
          "bg-card-bg border-border-subtle shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
          "transition-transform duration-250 ease-[cubic-bezier(0.32,0.72,0,1)]",
          width,
          side === "right"
            ? ["right-0 border-l", open ? "translate-x-0" : "translate-x-full"]
            : ["left-0 border-r", open ? "translate-x-0" : "-translate-x-full"]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
          {title && (
            <span className="text-[14px] font-semibold text-text-primary tracking-tight">
              {title}
            </span>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-content-bg transition-colors duration-100"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </>
  );
}
