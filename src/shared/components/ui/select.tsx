import { cn } from "@/shared/lib/utils";
import { forwardRef, type SelectHTMLAttributes } from "react";

/*
 * Select — unified native select component
 *
 * Follows design system:
 *  - Height:        h-9 (36px) — aligns with Input and Button "md"
 *  - Border radius: rounded-[10px]
 *  - Background:    bg-card-bg with custom chevron arrow
 *  - Border:        border-border-subtle → hover/focus: border-border-default
 *  - Text:          text-[13px] text-text-secondary
 */

const CHEVRON_ICON = `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2378776F' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, style, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        // Layout
        "flex h-9 w-full rounded-[10px] px-3 pr-8 py-2",
        // Colours
        "bg-card-bg border border-border-subtle",
        "text-[13px] text-text-secondary",
        // Chevron arrow via bg-image — hides the native arrow
        "appearance-none cursor-pointer bg-no-repeat",
        // Interaction
        "transition-colors duration-100 outline-none",
        "hover:border-border-default",
        "focus:border-border-default",
        "focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-accent",
        // States
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      style={{
        backgroundImage: CHEVRON_ICON,
        backgroundPosition: "right 10px center",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
