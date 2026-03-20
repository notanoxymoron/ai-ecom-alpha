/**
 * GoldRing — Liquid spinning ring effect for active nav items (or any element)
 *
 * USAGE
 * -----
 * 1. Wrap the target element in `position: relative` (or add `relative` class in Tailwind).
 * 2. Drop <GoldRing /> as the first child — it is absolutely positioned and fills the parent.
 * 3. Ensure all sibling content has `z-[2]` so it renders above the ring layers.
 * 4. Set the inner plate color (`plateColor`) to match your background.
 *
 * DEPENDENCIES
 * ------------
 *   - motion/react  (Framer Motion)  — for the conic-gradient rotation
 *   - Tailwind CSS  — for layout utilities
 *
 * EXAMPLE
 * -------
 *   <div className="relative flex items-center px-3 py-2 rounded-[8px]">
 *     <GoldRing variant="gold" borderWidth={2} borderRadius={8} plateColor="#0F1117" />
 *     <span className="relative z-[2]">Dashboard</span>
 *   </div>
 *
 * HOW IT WORKS (4-layer stack)
 * ----------------------------
 *   Layer 1 · Glow      — blurred warm colored box-shadow behind the ring
 *   Layer 2 · Clip      — overflow:hidden + border-radius clips the spinning gradient
 *   Layer 3 · Spinner   — 250×250% square conic-gradient spins 180° via Framer Motion,
 *                         then a solid overlay fades in to settle the ring to one color
 *   Layer 4 · Plate     — inset fills the center, leaving only `borderWidth`px of ring
 *
 *   Why Framer Motion instead of CSS @keyframes:
 *   CSS @property fails in React-injected <style> tags on Next.js. Rotating a
 *   rectangular element with CSS transforms distorts the conic into sweeping lines.
 *   Framer Motion's independent transform channels keep the square centred while
 *   only the rotation animates.
 */

"use client";

import { motion } from "motion/react";

// ─── Ring color presets ────────────────────────────────────────────────────────

export interface RingColors {
  /** box-shadow value for the outer glow layer */
  glow: string;
  /** conic-gradient for the spinning layer */
  gradient: string;
  /** solid color the ring settles to after the spin */
  settled: string;
}

export const RING_PRESETS = {
  /** Yellow-green gold */
  green: {
    glow: "0 0 10px 2px rgba(180,175,50,0.10)",
    gradient:
      "conic-gradient(from 0deg, #000000 0%, #b8b040 12.5%, #ffffff 25%, #b8b040 37.5%, #000000 50%, #b8b040 62.5%, #ffffff 75%, #b8b040 87.5%, #000000 100%)",
    settled: "#b8b040",
  },
  /** Warm champagne gold */
  gold: {
    glow: "0 0 10px 2px rgba(232,175,72,0.10)",
    gradient:
      "conic-gradient(from 0deg, #000000 0%, #ddc278 12.5%, #ffffff 25%, #ddc278 37.5%, #000000 50%, #ddc278 62.5%, #ffffff 75%, #ddc278 87.5%, #000000 100%)",
    settled: "#ddc278",
  },
  /** Burnt orange-red */
  red: {
    glow: "0 0 10px 2px rgba(210,120,50,0.10)",
    gradient:
      "conic-gradient(from 0deg, #000000 0%, #e05530 12.5%, #ffffff 25%, #e05530 37.5%, #000000 50%, #e05530 62.5%, #ffffff 75%, #e05530 87.5%, #000000 100%)",
    settled: "#e05530",
  },
  /** Electric blue */
  blue: {
    glow: "0 0 10px 2px rgba(56,130,246,0.10)",
    gradient:
      "conic-gradient(from 0deg, #000000 0%, #3882f6 12.5%, #ffffff 25%, #3882f6 37.5%, #000000 50%, #3882f6 62.5%, #ffffff 75%, #3882f6 87.5%, #000000 100%)",
    settled: "#3882f6",
  },
  /** Soft violet */
  purple: {
    glow: "0 0 10px 2px rgba(139,92,246,0.10)",
    gradient:
      "conic-gradient(from 0deg, #000000 0%, #8b5cf6 12.5%, #ffffff 25%, #8b5cf6 37.5%, #000000 50%, #8b5cf6 62.5%, #ffffff 75%, #8b5cf6 87.5%, #000000 100%)",
    settled: "#8b5cf6",
  },
} satisfies Record<string, RingColors>;

export type RingPreset = keyof typeof RING_PRESETS;

// ─── Component ────────────────────────────────────────────────────────────────

export interface GoldRingProps {
  /**
   * Use a named preset or supply your own `RingColors` object for full control.
   * @default "green"
   */
  variant?: RingPreset | RingColors;

  /**
   * Thickness of the visible ring in px.
   * @default 2
   */
  borderWidth?: number;

  /**
   * Border radius of the outer ring and inner plate in px.
   * The outer ring uses this value; the plate uses (borderRadius - borderWidth).
   * @default 8
   */
  borderRadius?: number;

  /**
   * Background color of the inner plate — should match the element's background.
   * @default "#0F1117"
   */
  plateColor?: string;

  /**
   * Duration of the initial spin in seconds.
   * @default 1
   */
  spinDuration?: number;

  /**
   * Delay before the settle overlay fades in, in seconds.
   * @default 0.5
   */
  settleDelay?: number;
}

export function GoldRing({
  variant = "green",
  borderWidth = 2,
  borderRadius = 8,
  plateColor = "#0F1117",
  spinDuration = 0.5,
  settleDelay = 0.25,
}: GoldRingProps) {
  const ring: RingColors =
    typeof variant === "string" ? RING_PRESETS[variant] : variant;

  const outerRadius = `${borderRadius}px`;
  const innerRadius = `${Math.max(0, borderRadius - borderWidth)}px`;
  const inset = `${borderWidth}px`;

  return (
    <>
      {/* Layer 1 · Glow */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: outerRadius,
          pointerEvents: "none",
          boxShadow: ring.glow,
        }}
      />

      {/* Layer 2 · Clip container */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: outerRadius,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Layer 3a · Spinning conic-gradient */}
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            width: "250%",
            aspectRatio: "1 / 1",
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
            background: ring.gradient,
            pointerEvents: "none",
          }}
          animate={{ rotate: 180 }}
          transition={{ duration: spinDuration, ease: "linear" }}
        />

        {/* Layer 3b · Solid overlay that settles the ring to a uniform color */}
        <motion.span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: ring.settled,
            pointerEvents: "none",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: spinDuration * 0.5,
            delay: settleDelay,
            ease: "easeInOut",
          }}
        />
      </span>

      {/* Layer 4 · Inner plate */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset,
          borderRadius: innerRadius,
          background: plateColor,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    </>
  );
}
