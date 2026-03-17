import { cn } from "@/shared/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

/*
 * Button — unified CTA + action component
 *
 * Variants (visual hierarchy):
 *   "default"     → Primary CTA  — solid accent fill, white text. Use for the 1 key action per screen.
 *   "outline"     → Secondary CTA — bordered card-bg, muted text. Use for secondary/destructive-lite actions.
 *   "ghost"       → Ghost         — no border, subtle hover. Use for toolbar icons or low-priority actions.
 *   "destructive" → Danger CTA   — solid red fill. Use for irreversible destructive actions.
 *   "link"        → Text link     — no button affordance. Use ONLY for navigation, not actions.
 *                   Visually distinct from all CTAs: colored underline, no background/border.
 *
 * Sizes:
 *   "sm"   → h-8  (32px)  — compact toolbars, table rows
 *   "md"   → h-9  (36px)  — default for most UI  ← default
 *   "lg"   → h-10 (40px)  — hero CTAs, page headers
 *   "icon" → 36×36 square  — icon-only buttons
 */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const isLink = variant === "link";

    return (
      <button
        ref={ref}
        className={cn(
          // ── Base (all variants) ──────────────────────────────
          "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-100 cursor-pointer",
          "disabled:opacity-50 disabled:pointer-events-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",

          // ── Variants ────────────────────────────────────────
          // Primary CTA — the ONE call-to-action on a screen
          variant === "default" && [
            "bg-accent text-white rounded-[10px]",
            "hover:bg-accent-hover hover:-translate-y-px",
            "active:scale-[0.98]",
          ],

          // Secondary CTA — supporting actions alongside primary
          variant === "outline" && [
            "bg-card-bg text-text-secondary border border-border-subtle rounded-[10px]",
            "hover:border-border-default hover:text-text-primary",
          ],

          // Ghost — low-emphasis, no border, usually in toolbars
          variant === "ghost" && [
            "text-text-secondary rounded-md",
            "hover:bg-content-bg hover:text-text-primary",
          ],

          // Danger — irreversible destructive actions only
          variant === "destructive" && [
            "bg-losing text-white rounded-[10px]",
            "hover:opacity-90 active:scale-[0.98]",
          ],

          // Link — navigation, NOT actions. No button affordance.
          // Clearly distinct from CTAs: text color + underline, zero padding.
          variant === "link" && [
            "text-text-link underline-offset-4",
            "hover:underline hover:opacity-80",
          ],

          // ── Sizes (skipped for link variant) ─────────────────
          !isLink && size === "sm"   && "h-8 px-3 text-xs",
          !isLink && size === "md"   && "h-9 px-4 text-[13px]",
          !isLink && size === "lg"   && "h-10 px-5 text-sm",
          !isLink && size === "icon" && "h-9 w-9",

          // Link gets its own sizing (inherits surrounding text size)
          isLink && "text-[13px] h-auto px-0 py-0",

          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
