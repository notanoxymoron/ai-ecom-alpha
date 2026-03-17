import { cn } from "@/shared/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

/*
 * Input — unified text input component
 *
 * Follows design system:
 *  - Height:        h-9 (36px) — aligns with Button "md"
 *  - Border radius: rounded-[10px]
 *  - Background:    bg-card-bg (white)
 *  - Border:        border-border-subtle → hover/focus: border-border-default
 *  - Text:          text-[13px] text-text-primary
 *  - Placeholder:   text-text-tertiary
 *
 * Padding variants:
 *  - Default:       px-3
 *  - With left icon: add pl-9 via className
 *  - With right element: add pr-8 via className
 */

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        // Layout
        "flex h-9 w-full rounded-[10px] px-3 py-2",
        // Colours
        "bg-card-bg border border-border-subtle",
        "text-[13px] text-text-primary",
        "placeholder:text-text-tertiary",
        // Interaction
        "transition-colors duration-100 outline-none",
        "hover:border-border-default",
        "focus:border-border-default",
        "focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-accent",
        // States
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
