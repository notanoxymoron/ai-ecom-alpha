# Analytics Dashboard — Implementation Prompt

> This prompt is scoped to a single task: implement the redesigned analytics dashboard page in the `ai-ecom-engine` Next.js project. The attached HTML mockup (`analytics-dashboard-v2.html`) is the pixel-level source of truth. Build it as production React components inside the `src/features/ui-facelift/` feature folder.

---

## What you're building

The analytics dashboard is the welcome/home screen of the app. It shows the user's ad engine usage at a glance. The layout is a **split-mode theme**: dark sidebar on the left, light content area on the right.

### Page structure (top to bottom)
1. **Top bar** — sticky white bar with search box (⌘K trigger), notification icon, settings icon, "New campaign" primary CTA
2. **Page header** — "Dashboard" title + subtitle, period selector dropdown, filter button, export button
3. **4 KPI cards** — each with a UNIQUE micro-visualization (no two cards share the same chart type)
4. **2-column panel grid** — Generation performance panel (left, wider) + Top analyzed ads panel (right)
5. **Full-width data table** — Recently generated ads with thumbnails, status badges, scores, costs

---

## Tech stack & dependencies

```bash
# Install these before starting
npm install recharts motion @radix-ui/react-dialog @radix-ui/react-tooltip
```

Already installed: `next@16`, `react@19`, `tailwindcss@4`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `zustand`

### Fonts — DM Sans + JetBrains Mono

Both via `next/font/google`. Set up in `src/app/layout.tsx`:

```tsx
import { DM_Sans, JetBrains_Mono } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

// In the <html> tag:
<html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
```

---

## Design tokens

Create `src/features/ui-facelift/styles/design-tokens.css` and import it in `src/app/globals.css`:

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "../features/ui-facelift/styles/design-tokens.css";
```

```css
/* src/features/ui-facelift/styles/design-tokens.css */
@theme {
  /* ===== SIDEBAR — dark ===== */
  --color-sidebar-bg: #0F1117;
  --color-sidebar-surface: #181A22;
  --color-sidebar-border: rgba(255, 255, 255, 0.06);
  --color-sidebar-text: #B0AFA8;
  --color-sidebar-text-muted: #807F79;
  --color-sidebar-text-active: #FFFFFF;
  --color-sidebar-accent: #7C6BF0;
  --color-sidebar-accent-muted: rgba(124, 107, 240, 0.10);
  --color-sidebar-hover: rgba(255, 255, 255, 0.04);

  /* ===== CONTENT — light ===== */
  --color-content-bg: #F6F5F2;
  --color-card-bg: #FFFFFF;
  --color-card-border: rgba(0, 0, 0, 0.06);
  --color-card-hover: #FAFAF8;
  --color-text-primary: #18181B;
  --color-text-secondary: #52525B;
  --color-text-tertiary: #78776F;
  --color-text-link: #5B4ACF;
  --color-border-subtle: rgba(0, 0, 0, 0.06);
  --color-border-default: rgba(0, 0, 0, 0.10);

  /* ===== ACCENT ===== */
  --color-accent: #6C5CE7;
  --color-accent-hover: #5A4BD6;
  --color-accent-muted: rgba(108, 92, 231, 0.08);

  /* ===== SEMANTIC (WCAG AA verified) ===== */
  --color-winning: #10B981;
  --color-winning-bg: #ECFDF5;
  --color-winning-text: #047857;

  --color-losing: #EF4444;
  --color-losing-bg: #FEF2F2;
  --color-losing-text: #B91C1C;

  --color-testing: #F59E0B;
  --color-testing-bg: #FFF8EB;
  --color-testing-text: #B45309;

  --color-info: #3B82F6;
  --color-info-bg: #EFF6FF;
  --color-info-text: #2563EB;

  /* ===== LAYOUT ===== */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --sidebar-width: 260px;
  --sidebar-width-collapsed: 56px;

  /* ===== FONTS ===== */
  --font-sans: 'DM Sans', ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
}
```

### Color rules
- **Green/red/yellow are ONLY for performance states.** Green = winning/approved. Red = losing/rejected. Yellow = testing/pending. Never use for generic UI actions.
- **Accent (#6C5CE7)** is for CTAs, active states, focus rings. Not for decoration.
- **All text colors are WCAG AA verified.** Do not modify them without re-checking contrast ratios.

---

## Files to create

All inside `src/features/ui-facelift/`:

```
src/features/ui-facelift/
├── styles/
│   └── design-tokens.css
├── lib/
│   ├── animations.ts           ← Motion presets
│   ├── theme.ts                ← Color constants for Recharts/SVGs
│   └── use-media-query.ts      ← Responsive hook
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── app-shell.tsx       ← Composes sidebar + topbar + content slot
│   └── dashboard/
│       ├── kpi-card.tsx         ← CVA wrapper with accent variants
│       ├── kpi-sparkline.tsx    ← Card 1: SVG area sparkline
│       ├── kpi-bar-chart.tsx    ← Card 2: Day-of-week bars
│       ├── kpi-ring-gauge.tsx   ← Card 3: Donut gauge
│       ├── kpi-trend-line.tsx   ← Card 4: Mini area trend
│       ├── performance-chart.tsx ← Recharts dual area chart
│       ├── top-ads-list.tsx
│       ├── recent-ads-table.tsx
│       ├── panel.tsx            ← Reusable panel wrapper
│       ├── metric-row.tsx       ← Key-value cost rows
│       └── status-badge.tsx     ← Approved/rejected/pending badge
```

Then wire it up in `src/app/page.tsx` (or `src/app/analytics/page.tsx`).

---

## Component specifications

### Typography rules (apply everywhere)
- Base text: `text-sm` (14px), `font-normal` (400), `text-text-primary`
- Two weights only: `font-normal` (400) and `font-medium` (500). NEVER use `font-semibold` or `font-bold`.
- All numbers (metrics, costs, percentages, dates): `font-mono`
- Sentence case everywhere. No Title Case. No ALL CAPS.
- Line height: `leading-snug` for body, `leading-tight` for headings.

---

### `kpi-card.tsx` — wrapper with accent stripe on hover

```tsx
// Props
interface KPICardProps {
  label: string;
  icon: LucideIcon;
  iconVariant: 'purple' | 'blue' | 'green' | 'amber';
  children: React.ReactNode; // value + delta + visualization go here
}
```

**Visual spec:**
- Container: `bg-card-bg border border-card-border rounded-[14px] p-5 overflow-hidden`
- Hover: `hover:border-border-default hover:-translate-y-px transition-all duration-150`
- Top accent stripe on hover: 3px tall, full width, colored by variant. Use `after:` pseudo-element with `after:opacity-0 hover:after:opacity-100 after:transition-opacity`
  - purple: `after:bg-accent`
  - blue: `after:bg-info`
  - green: `after:bg-winning`
  - amber: `after:bg-testing`
- Label: `text-xs text-text-secondary font-medium`
- Icon box: `w-[34px] h-[34px] rounded-[6px]` with muted semantic bg + semantic text color
- Stagger animation on mount: each card delays 50ms more than the previous (0ms, 50ms, 100ms, 150ms)

---

### Card 1 — `kpi-sparkline.tsx` (Competitors tracked)

SVG area sparkline with gradient fill. Color: `#6C5CE7` (accent purple).

- Container height: 36px
- SVG with `viewBox="0 0 200 36"` and `preserveAspectRatio="none"` so it stretches to fill width
- Gradient: `linearGradient` from `#6C5CE7` at 20% opacity → 0% opacity (top to bottom)
- Line: smooth curve via `<path>` with quadratic bezier, `stroke="#6C5CE7" stroke-width="2" stroke-linecap="round"`
- End dot: `<circle r="3" fill="#6C5CE7"/>` at the rightmost point
- Animate line draw on mount: `stroke-dasharray` + `stroke-dashoffset` animation, 1.2s ease

---

### Card 2 — `kpi-bar-chart.tsx` (Ads analyzed)

7 vertical bars representing Mon–Sun. Color: `#3B82F6` (info blue).

- Container height: 48px + labels
- Each bar: `flex:1`, variable heights (14px to 42px), `rounded-[3px]`, opacity ramp from 0.35 (Mon) to 0.90 (Sun)
- Day labels directly under each bar: single letter (M T W T F S S), `text-[9px] font-mono text-text-tertiary`
- Today's bar (e.g., Sunday) should have the strongest opacity (0.90) and its label uses `text-text-secondary font-medium`
- Gap between bars: `gap-[5px]`

---

### Card 3 — `kpi-ring-gauge.tsx` (Ads generated)

SVG donut showing approval rate. Color: `#10B981` (winning green).

- Ring size: **52px × 52px** (large enough to read at a glance)
- Background track: `stroke="#E5E7EB" stroke-width="4"`
- Progress arc: `stroke="#10B981" stroke-width="4" stroke-linecap="round"`
  - Circumference = `2 × π × 20 = 125.6`
  - For 78% fill: `stroke-dasharray="125.6" stroke-dashoffset="27.6"` (125.6 × 0.22)
  - `transform="rotate(-90 26 26)"` to start from top
- Center text: `font-mono text-[11px] font-semibold text-text-primary` — shows "78%"
- Context text next to ring: delta badge + "243 of 312 approved"

---

### Card 4 — `kpi-trend-line.tsx` (Generation cost)

SVG area trend line. Color: `#F59E0B` (testing amber — matches the card's theme color).

- Container height: 44px
- SVG with `viewBox="0 0 200 44"` and `preserveAspectRatio="none"`
- Gradient: `linearGradient` from `#F59E0B` at 14% opacity → 0%
- Line: smooth downward curve (cost is dropping), `stroke="#F59E0B" stroke-width="2" opacity="0.6"`
- Start dot: `r="3" fill="#F59E0B" opacity="0.3"` (faded, past)
- End dot: `r="3" fill="#F59E0B" opacity="0.8"` (current, prominent)
- No arrow icons. The delta badge above (`-3.1%` in green = good) communicates the meaning.

**Delta badge logic for cost card:**
- Cost dropping → badge uses `bg-winning-bg text-winning-text` (green = good, cost down)
- Cost rising → badge uses `bg-losing-bg text-losing-text` (red = bad, cost up)
- The chart color stays amber regardless — it's the card's theme, not a state indicator.

---

### `performance-chart.tsx` — Stripe-style dual area line chart

Use `recharts` (`ResponsiveContainer`, `AreaChart`, `Area`, `XAxis`, `CartesianGrid`, `Tooltip`).

**Layout inside the panel:**
1. Mini metrics row: 3 equal columns (Approval rate, Total generated, Approved) — each in a `bg-content-bg rounded-[10px] p-3.5 text-center` box
2. Legend: two items with colored dots — "Generated" (accent purple) and "Approved" (winning green, dashed line)
3. Chart area: `height={200}` on desktop, `height={140}` on mobile
4. X-axis: months (Jan–Dec), `font-mono text-[10px] text-text-tertiary`, no axis line, no tick marks
5. Grid: horizontal lines only, `stroke="rgba(0,0,0,0.06)"`, no vertical grid
6. Cost breakdown rows below chart: two key-value rows with `border-b border-border-subtle`

**Recharts config:**
```tsx
<ResponsiveContainer width="100%" height={200}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="gradGenerated" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.18} />
        <stop offset="60%" stopColor="#6C5CE7" stopOpacity={0.06} />
        <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10B981" stopOpacity={0.12} />
        <stop offset="60%" stopColor="#10B981" stopOpacity={0.04} />
        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.06)" vertical={false} />
    <XAxis
      dataKey="month"
      axisLine={false}
      tickLine={false}
      tick={{ fontSize: 10, fill: '#78776F', fontFamily: 'var(--font-mono)' }}
    />
    <YAxis hide />
    <Tooltip
      contentStyle={{
        background: '#18181B',
        border: 'none',
        borderRadius: 6,
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        color: '#fff',
        padding: '4px 10px',
      }}
    />
    <Area type="monotone" dataKey="generated" stroke="#6C5CE7" strokeWidth={2} fill="url(#gradGenerated)" />
    <Area type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} strokeDasharray="5 3" fill="url(#gradApproved)" />
  </AreaChart>
</ResponsiveContainer>
```

---

### `top-ads-list.tsx` — ranked ad list

Each item:
- Thumbnail: 44px square `rounded-[6px]` with muted semantic bg + icon placeholder (when no real image)
- Name: `text-[13px] font-medium text-text-primary truncate`
- Meta: platform dot (7px circle, brand color) + platform name + relative time, `text-[11px] text-text-tertiary`
- Score badge (right-aligned): `font-mono text-xs font-medium px-2 py-0.5 rounded-full`
  - 80+: `bg-winning-bg text-winning-text`
  - 60-79: `bg-testing-bg text-testing-text`
  - <60: `bg-losing-bg text-losing-text`
- Row: `bg-content-bg rounded-[10px] p-2.5 hover:bg-[#EFEEEB] cursor-pointer transition-colors`

---

### `recent-ads-table.tsx` — data table (desktop) / card list (mobile)

**Desktop (≥768px):** HTML `<table>` with columns: Creative, Platform, Status, Score, Generated, Cost

- Header row: `text-[11px] font-medium text-text-tertiary uppercase tracking-wider`
- Data rows: `h-12`, `text-[13px]`, `border-b border-border-subtle`, `hover:bg-content-bg cursor-pointer`
- Creative column: 36px thumbnail + name + subtitle (format + type)
- Platform: `font-mono text-xs text-text-secondary`
- Status: `<StatusBadge>` component
- Score: `font-mono text-xs` colored by performance tier
- Generated: `font-mono text-xs text-text-secondary` relative time
- Cost: `font-mono text-xs text-right`

**Mobile (<768px):** Render as stacked cards instead of table. Each card shows thumbnail + name on top, chips (status, score, cost) in a horizontal row below.

```tsx
const isMobile = useMediaQuery('(max-width: 767px)');

{isMobile ? (
  <div className="flex flex-col gap-3">
    {ads.map(ad => <AdCard key={ad.id} {...ad} />)}
  </div>
) : (
  <table>...</table>
)}
```

---

### `status-badge.tsx`

```tsx
const variants = {
  approved: 'bg-winning-bg text-winning-text',
  rejected: 'bg-losing-bg text-losing-text',
  pending: 'bg-testing-bg text-testing-text',
};

// Renders: colored dot (5px) + label text
<span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full', variants[status])}>
  <span className="w-[5px] h-[5px] rounded-full bg-current" />
  {label}
</span>
```

---

## Responsive grid summary

```tsx
// KPI cards
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">

// Panels (performance chart + top ads)
<div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3.5">

// Page content padding
<div className="px-4 py-5 md:px-6 md:py-6 xl:px-8 xl:py-7">

// Chart height
<ResponsiveContainer width="100%" height={isMobile ? 140 : 200}>
```

---

## Animation (motion library)

### Page entrance
```tsx
import { motion } from 'motion/react';

// Wrap each section
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
>
```

### KPI card stagger
```tsx
{cards.map((card, i) => (
  <motion.div
    key={card.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
  >
    <KPICard {...card} />
  </motion.div>
))}
```

### Sparkline draw animation (CSS)
```css
@keyframes drawLine {
  from { stroke-dashoffset: 600; }
  to { stroke-dashoffset: 0; }
}
.line-draw {
  stroke-dasharray: 600;
  animation: drawLine 1.2s ease forwards;
}
```

### Reduced motion
```tsx
// Always check before animating
const prefersReduced = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Skip animation if true
transition={{ duration: prefersReduced ? 0 : 0.35 }}
```

---

## Accessibility checklist

- [ ] All KPI values are in real text (not images) — screen readers can read them
- [ ] Status badges include text labels ("Approved", not just a green dot)
- [ ] Chart data has `aria-label` or sr-only text describing the trend
- [ ] Focus rings: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`
- [ ] Table uses proper `<thead>`, `<th scope="col">` for headers
- [ ] Color is never the only indicator — always paired with text, icon, or pattern
- [ ] Touch targets on mobile are minimum 44×44px
- [ ] Period selector and filter buttons are keyboard-accessible

---

## Import paths

```tsx
// From your feature folder
import { KPICard } from '@/features/ui-facelift/components/dashboard/kpi-card';
import { KPISparkline } from '@/features/ui-facelift/components/dashboard/kpi-sparkline';
import { KPIBarChart } from '@/features/ui-facelift/components/dashboard/kpi-bar-chart';
import { KPIRingGauge } from '@/features/ui-facelift/components/dashboard/kpi-ring-gauge';
import { KPITrendLine } from '@/features/ui-facelift/components/dashboard/kpi-trend-line';
import { PerformanceChart } from '@/features/ui-facelift/components/dashboard/performance-chart';
import { TopAdsList } from '@/features/ui-facelift/components/dashboard/top-ads-list';
import { RecentAdsTable } from '@/features/ui-facelift/components/dashboard/recent-ads-table';
import { Panel } from '@/features/ui-facelift/components/dashboard/panel';
import { StatusBadge } from '@/features/ui-facelift/components/dashboard/status-badge';
import { AppShell } from '@/features/ui-facelift/components/layout/app-shell';

// From shared
import { cn } from '@/shared/lib/utils';

// From libraries
import { Eye, Box, ImageIcon, DollarSign, Activity, Star, ChevronRight } from 'lucide-react';
```

---

## Reference

The HTML mockup file `analytics-dashboard-v2.html` is the pixel-level source of truth for:
- Exact spacing, colors, and typography
- Card layout and chart styles
- Table structure and status badge appearance
- Sidebar navigation items and platform list

Match it exactly, then improve with React interactivity (tooltips, hover states, animated transitions) and responsive behavior (mobile card list, collapsed sidebar, bottom nav).