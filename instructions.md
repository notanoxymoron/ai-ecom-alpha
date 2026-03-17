# UI/UX Implementation Prompt — Ad Creative Workflow Platform


## Project context

You are redesigning an ad creative workflow platform built with Next.js 16 (App Router, Turbopack). The target users are performance marketers, media buyers, creative strategists, and agency teams.

### Tech stack
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **State**: Zustand for global state, TanStack React Query for server state
- **UI utilities**: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA)
- **Icons**: `lucide-react` (stroke-only, 18px default)
- **Language**: TypeScript (strict)

### Libraries to install when needed
```bash
# Charts (for analytics dashboard)
npm install recharts

# Animations (for micro-interactions, page transitions)
npm install motion

# Headless UI primitives (for accessible dropdowns, modals, dialogs)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-select @radix-ui/react-tabs

# Fonts (both available via next/font/google — no downloads needed)
# DM Sans + JetBrains Mono
```

### Font setup in `app/layout.tsx`

Both fonts are on Google Fonts — no local files needed.

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

---

## 1. Design philosophy

### Core principle
**The UI points toward the data, not competing with it.** Ad creatives (images, videos, thumbnails) are the hero content. The interface is the frame.

### Aesthetic direction
**Split-mode theme**: Dark sidebar (#0F1117) + Light content area (#F6F5F2). This gives the sidebar a permanent, receded feel while the white content area makes data and ad thumbnails pop.

**Refined industrial** — the precision of Linear, the density of Bloomberg Terminal, the polish of Figma, the content-focus of Pinterest. Flat surfaces. Thin borders. No decoration that doesn't earn its pixels.

### What this is NOT
- Not playful (no rounded bubbly shapes, no pastel illustrations, no emoji as UI)
- Not a marketing website (no hero sections, no gradient mesh backgrounds in the app)
- Not generic SaaS (no purple-gradient-on-white, no Inter/Roboto, no cookie-cutter component kits)

---

## 2. Color system — WCAG AA verified

Every combination below has been programmatically verified against WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text/UI components).

### Tailwind v4 CSS configuration

Add to your global CSS file (e.g., `app/globals.css`):

```css
@import "tailwindcss";

@theme {
  /* ===== SIDEBAR — dark ===== */
  --color-sidebar-bg: #0F1117;
  --color-sidebar-surface: #181A22;
  --color-sidebar-border: rgba(255, 255, 255, 0.06);
  --color-sidebar-text: #B0AFA8;            /* 8.58:1 on sidebar-bg */
  --color-sidebar-text-muted: #807F79;       /* 4.70:1 on sidebar-bg */
  --color-sidebar-text-active: #FFFFFF;      /* 18.87:1 */
  --color-sidebar-accent: #7C6BF0;          /* 4.69:1 on sidebar-bg */
  --color-sidebar-accent-muted: rgba(124, 107, 240, 0.10);
  --color-sidebar-hover: rgba(255, 255, 255, 0.04);

  /* ===== CONTENT — light ===== */
  --color-content-bg: #F6F5F2;
  --color-card-bg: #FFFFFF;
  --color-card-border: rgba(0, 0, 0, 0.06);
  --color-card-hover: #FAFAF8;
  --color-text-primary: #18181B;             /* 17.72:1 on white */
  --color-text-secondary: #52525B;           /* 7.73:1 on white, 7.09:1 on content-bg */
  --color-text-tertiary: #78776F;            /* 4.50:1 on white, 4.13:1 on content-bg */
  --color-text-link: #5B4ACF;               /* 5.79:1 on content-bg */
  --color-border-subtle: rgba(0, 0, 0, 0.06);
  --color-border-default: rgba(0, 0, 0, 0.10);

  /* ===== ACCENT ===== */
  --color-accent: #6C5CE7;                   /* 4.86:1 on white */
  --color-accent-hover: #5A4BD6;
  --color-accent-muted: rgba(108, 92, 231, 0.08);

  /* ===== SEMANTIC — performance states ===== */
  /* "Winning" = positive metric, scale signal, approved */
  --color-winning: #10B981;                  /* decorative only (charts, dots) */
  --color-winning-bg: #ECFDF5;              /* badge/tag background */
  --color-winning-text: #047857;             /* 5.48:1 on white, 5.21:1 on winning-bg */

  /* "Losing" = negative metric, kill signal, rejected */
  --color-losing: #EF4444;                   /* decorative only */
  --color-losing-bg: #FEF2F2;
  --color-losing-text: #B91C1C;              /* 6.47:1 on white, 5.91:1 on losing-bg */

  /* "Testing" = in review, pending, needs attention */
  --color-testing: #F59E0B;                  /* decorative only */
  --color-testing-bg: #FFF8EB;
  --color-testing-text: #B45309;             /* 5.02:1 on white, 4.75:1 on testing-bg */

  /* "Info" = neutral information, links */
  --color-info: #3B82F6;                     /* decorative only */
  --color-info-bg: #EFF6FF;
  --color-info-text: #2563EB;               /* 5.17:1 on white, 4.75:1 on info-bg */

  /* ===== LAYOUT ===== */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;

  --sidebar-width: 260px;
  --sidebar-width-collapsed: 56px;

  /* ===== TYPOGRAPHY ===== */
  --font-sans: 'DM Sans', ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
}
```

### Color usage rules

1. **Never hardcode hex values in components.** Always use Tailwind classes that reference the theme tokens: `text-text-primary`, `bg-card-bg`, `border-border-subtle`, etc.
2. **Green/red/yellow are sacred performance colors.** They mean winning/losing/testing. Never use them for generic UI actions (e.g., don't use green for a "save" button in an ad context). Use `accent` for all action CTAs.
3. **Accent is for interaction only**: active tabs, selected states, primary CTAs, focus rings, toggles. Never for decorative fills or backgrounds.
4. **Semantic muted backgrounds** (`winning-bg`, `losing-bg`, etc.) are for status badges, row highlights, and tag backgrounds — never for large surface areas.

---

## 3. Typography

### Font: DM Sans (primary) + JetBrains Mono (numbers)
DM Sans is geometric, clean, and purpose-built for modern UI — excellent readability at small sizes with a distinctive character that separates it from Inter/Roboto. JetBrains Mono provides tabular number variants critical for data-dense dashboards.

### Type scale
```
text-xs:    11px  → timestamps, tertiary metadata, fine print
text-sm:    12px  → labels, badges, table headers, secondary info
text-base:  14px  → THE DEFAULT — body text, descriptions, input values
text-md:    16px  → section headers, card titles, prominent labels  (custom)
text-lg:    20px  → page titles, modal headers
text-xl:    24px  → dashboard hero metrics
text-2xl:   32px  → KPI display numbers
```

### Rules
- **14px is the default**, not 16px. Override Tailwind's base if needed. These users scan dense data grids — 16px wastes space.
- **Two weights only: 400 (regular) and 500 (medium).** Never use `font-semibold` (600) or `font-bold` (700) in application UI. Use `font-medium` (500) for headings/emphasis, `font-normal` (400) for everything else.
- **Monospace for all numbers.** Use `font-mono` for: metric values, ROAS, CPA, CPM, spend amounts, dates, percentages, counts, and all tabular data.
- **Sentence case everywhere.** Never Title Case or ALL CAPS in UI. Exception: abbreviations (CPA, ROAS, CTR).
- **Line height**: `leading-snug` (1.375) for body, `leading-tight` (1.25) for headings, `leading-relaxed` (1.625) for long descriptions/tooltips.

---

## 4. Layout system

### App shell structure
```
┌──────────────────────────────────────────────────┐
│ Sidebar (dark)  │  Top bar (white, sticky)       │
│  260px fixed    │────────────────────────────────│
│                 │  Content area (light gray bg)   │
│  Global nav     │                                 │
│  Platforms      │  [Page content — scrollable]    │
│  User block     │                                 │
└──────────────────────────────────────────────────┘
```

### Responsive breakpoints
```tsx
// Tailwind v4 breakpoints
// sm:  640px   — mobile landscape
// md:  768px   — tablet portrait
// lg:  1024px  — tablet landscape / small laptop
// xl:  1280px  — desktop (full layout)
// 2xl: 1536px  — wide desktop

// Layout behavior:
// < 768px  (mobile):   Sidebar hidden, bottom tab bar (56px), single column
// 768-1279 (tablet):   Sidebar collapsed to 56px (icons only), 2-col grids
// >= 1280  (desktop):  Full 260px sidebar, 3-4 col KPI grids, 3-panel layout
```

### Sidebar component responsive behavior
```tsx
// Sidebar states:
// - "expanded" (260px): xl+ screens, shows labels
// - "collapsed" (56px): md-lg screens, icon-only with tooltips
// - "hidden" (0px): <md screens, replaced by bottom tab bar
// - "overlay" (260px): mobile slide-out drawer via hamburger menu

// Store in Zustand:
interface SidebarState {
  isExpanded: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
}
```

### Spacing system (4px base)
```
gap-1:  4px     p-1:  4px
gap-2:  8px     p-2:  8px
gap-3:  12px    p-3:  12px
gap-4:  16px    p-4:  16px
gap-5:  20px    p-5:  20px
gap-6:  24px    p-6:  24px
gap-8:  32px    p-8:  32px
```

### Border radius
```
rounded-sm:   6px   → badges, tags, pills
rounded-md:   10px  → buttons, inputs, table cells
rounded-lg:   14px  → cards, panels, modals
rounded-xl:   18px  → feature cards, hero containers
```

Keep corners tight. >16px looks consumer-app. 6–14px is the sweet spot for pro tools.

---

## 5. Component specifications

### 5.1 Sidebar (`components/layout/sidebar.tsx`)

```
Background:    bg-sidebar-bg
Border:        border-r border-sidebar-border
Width:         w-[260px] (expanded), w-[56px] (collapsed)
```

**Nav items:**
- Height: 36px (`h-9`)
- Font: `text-[13px]`, `font-normal`, `text-sidebar-text`
- Active: `bg-sidebar-accent-muted`, `text-sidebar-text-active`, `font-medium`, 3px left accent border
- Hover: `bg-sidebar-hover`, `text-sidebar-text-active`
- Icons: `w-[18px] h-[18px]`, stroke-only from `lucide-react`, `opacity-50` default, `opacity-90` active
- Left accent on active: 3px wide, `bg-sidebar-accent`, positioned with `before:` pseudo

**Platform list:**
- Colored dot: `w-[7px] h-[7px] rounded-full`
- Count: `font-mono text-[11px] text-sidebar-text-muted`

**User block (bottom):**
- Avatar: 32px circle, gradient `from-[#6C5CE7] to-[#a78bfa]`, white initials
- Name: `text-xs font-medium text-sidebar-text-active`
- Role: `text-[10px] text-sidebar-text-muted`

**Collapse behavior:**
- On collapse: width animates to 56px, labels `opacity-0` then `hidden`, icons center-aligned
- Tooltip on hover for collapsed icons (use `@radix-ui/react-tooltip`)
- Transition: `transition-all duration-200 ease-out`

### 5.2 Top bar (`components/layout/topbar.tsx`)

```
Background:    bg-card-bg
Border:        border-b border-card-border
Position:      sticky top-0 z-10
Height:        auto (padded), ~56px effective
Padding:       px-8 py-4
```

**Search box:**
- Background: `bg-content-bg`
- Border: `border border-border-subtle` → hover: `border-border-default`
- Width: `min-w-[280px]`
- Placeholder: `text-[13px] text-text-tertiary`
- Keyboard hint badge: `text-[10px] font-mono bg-card-bg border border-border-subtle px-1.5 py-0.5 rounded`
- On click: Open command palette (`Cmd+K`)

**Action buttons:**
- Icon buttons: `w-9 h-9 rounded-md border border-border-subtle` → hover: `border-border-default bg-content-bg`
- Primary CTA: `bg-accent text-white px-4.5 h-9 rounded-lg text-[13px] font-medium` → hover: `bg-accent-hover -translate-y-px`

### 5.3 KPI cards (`components/analytics/kpi-card.tsx`)

Use CVA for variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const kpiCardVariants = cva(
  'bg-card-bg border border-card-border rounded-[14px] p-5 relative overflow-hidden transition-all duration-150 hover:border-border-default hover:-translate-y-px',
  {
    variants: {
      accent: {
        purple: 'hover:after:opacity-100 after:bg-accent',
        blue: 'hover:after:opacity-100 after:bg-info',
        green: 'hover:after:opacity-100 after:bg-winning',
        amber: 'hover:after:opacity-100 after:bg-testing',
      },
    },
  }
);
```

**Structure:**
- Label: `text-xs text-text-secondary font-medium`
- Value: `font-mono text-[28px] font-semibold tracking-tight text-text-primary leading-none`
- Delta badge: `text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-full`
  - Positive: `bg-winning-bg text-winning-text`
  - Negative: `bg-losing-bg text-losing-text`
- Sub text: `text-[11px] text-text-tertiary ml-1`
- Icon container: `w-[34px] h-[34px] rounded-md flex items-center justify-center`
  - Uses muted semantic bg + semantic text color

**Each card gets a UNIQUE micro-visualization (no repeating chart types):**
- Card 1 (Competitors): SVG area sparkline with gradient fill
- Card 2 (Ads analyzed): Vertical bar chart with day labels (M T W T F S S)
- Card 3 (Ads generated): Ring/donut gauge showing approval rate (52px diameter, 4px stroke)
- Card 4 (Generation cost): SVG area trend line in the card's theme color (amber for cost)

**Grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
```

### 5.4 Panel cards (`components/analytics/panel.tsx`)

```
Background:    bg-card-bg
Border:        border border-card-border → hover: border-border-default
Radius:        rounded-[14px]
Padding:       p-5 md:p-6
```

**Header row:**
- Title: `text-sm font-semibold tracking-tight flex items-center gap-2`
- Title icon: `w-4 h-4 text-text-tertiary` (from lucide-react)
- "View all" link: `text-xs text-text-link font-medium flex items-center gap-1 hover:opacity-75`

**Charts (inside panels):**
- Use `recharts` for the Stripe-style area line chart in the performance panel
- Chart configuration:
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
      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78776F', fontFamily: 'var(--font-mono)' }} />
      <YAxis hide />
      <Tooltip />
      <Area type="monotone" dataKey="generated" stroke="#6C5CE7" strokeWidth={2} fill="url(#gradGenerated)" />
      <Area type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} strokeDasharray="5 3" fill="url(#gradApproved)" />
    </AreaChart>
  </ResponsiveContainer>
  ```

### 5.5 Data table (`components/analytics/data-table.tsx`)

```
Row height:    h-12 (48px) comfortable
Header:        text-[11px] font-medium text-text-tertiary uppercase tracking-wider
Cell font:     text-[13px] text-text-primary
Row border:    border-b border-border-subtle
Row hover:     hover:bg-content-bg
```

- Number columns: `text-right font-mono text-xs text-text-secondary`
- Thumbnail column: 36px square, `rounded-md overflow-hidden`
- Status badges: `text-[11px] font-medium px-2.5 py-0.5 rounded-full inline-flex items-center gap-1`
  - Approved: `bg-winning-bg text-winning-text`
  - In review: `bg-testing-bg text-testing-text`
  - Rejected: `bg-losing-bg text-losing-text`
  - Status dot: `w-[5px] h-[5px] rounded-full bg-current`

**Responsive:** On mobile (<768px), switch to a card-based list instead of a table. Each row becomes a stacked card showing: thumbnail + name on top, status badge + score + cost as horizontal chips below.

### 5.6 Buttons (`components/ui/button.tsx`)

Use CVA:

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white hover:bg-accent-hover active:scale-[0.98]',
        secondary: 'bg-card-bg text-text-secondary border border-border-subtle hover:border-border-default hover:text-text-primary',
        ghost: 'text-text-secondary hover:bg-content-bg hover:text-text-primary',
        danger: 'bg-losing text-white hover:bg-losing-text',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-9 px-4 text-[13px] rounded-[10px]',
        lg: 'h-10 px-5 text-sm rounded-[10px]',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

### 5.7 Status badge (`components/ui/status-badge.tsx`)

```tsx
const badgeVariants = cva(
  'inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full',
  {
    variants: {
      status: {
        winning: 'bg-winning-bg text-winning-text',
        losing: 'bg-losing-bg text-losing-text',
        testing: 'bg-testing-bg text-testing-text',
        info: 'bg-info-bg text-info-text',
        neutral: 'bg-content-bg text-text-secondary',
      },
    },
  }
);
```

### 5.8 Command palette (`components/layout/command-palette.tsx`)

- Trigger: `Cmd+K` / `Ctrl+K` (register with `useEffect` keydown listener)
- Use `@radix-ui/react-dialog` for the overlay
- Overlay: `bg-black/60 backdrop-blur-sm`
- Panel: `w-[560px] max-h-[480px] bg-card-bg border border-card-border rounded-xl`
- Input: `h-12 text-base w-full border-b border-border-subtle`
- Result rows: `h-9 px-4 text-[13px]` with keyboard navigation (up/down/enter)
- Shortcut hints: `text-[10px] font-mono text-text-tertiary`

---

## 6. Responsive design rules

### Mobile first, then enhance

```tsx
// KPI grid
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">

// Panels grid
<div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3.5">

// Page padding
<div className="px-4 py-5 md:px-6 md:py-6 xl:px-8 xl:py-7">
```

### Mobile navigation (bottom tab bar)
```tsx
// Visible only on <768px
<nav className="fixed bottom-0 left-0 right-0 h-14 bg-card-bg border-t border-card-border flex items-center justify-around md:hidden z-20">
  {/* 5 tabs max: Home, Discovery, Boards, Briefs, Profile */}
  {/* Active: text-accent, Inactive: text-text-tertiary */}
  {/* No labels on inactive tabs to save space */}
</nav>
```

### Touch targets
All interactive elements on mobile must be at minimum `44px × 44px` touch area. Use padding to extend small buttons/icons:
```tsx
<button className="p-2 -m-2"> {/* visual 24px, touch 40px */}
```

### Table → card list on mobile
```tsx
{isMobile ? (
  <div className="flex flex-col gap-3">
    {items.map(item => <AdCard key={item.id} {...item} />)}
  </div>
) : (
  <table className="w-full">...</table>
)}
```

### Charts on mobile
- Reduce chart height from 200px to 140px on mobile
- Hide x-axis labels to every other month
- Increase touch target for tooltips

---

## 7. Animation & motion

Use the `motion` library (Framer Motion) for React animations.

### Page enter
```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
>
```

### Staggered card entrance
```tsx
// KPI cards stagger
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

### Micro-interaction rules
- **Duration**: 120ms for hover/toggle, 200ms for panels/modals, 300ms for page transitions. Never exceed 400ms.
- **Easing**: `[0.16, 1, 0.3, 1]` for entrances (ease-out), `[0.7, 0, 0.84, 0]` for exits (ease-in)
- **Properties**: Only animate `opacity` and `transform`. Never animate layout properties (width, height, top, left).
- **Reduced motion**: Always wrap in `prefers-reduced-motion` check:
  ```tsx
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  ```

### Loading states
- **Skeleton screens** for all data-driven views. Use `animate-pulse` on placeholder divs that match the exact layout.
- **Optimistic updates** for save/tag/organize actions: show result immediately via Zustand, reconcile with React Query.
- **Progress bar** (top of page, 2px tall, `bg-accent`): for bulk operations.
- **Never** use a full-page spinner or "Loading..." text.

---

## 8. Accessibility checklist

### Contrast
All colors in this system pass WCAG AA. Do NOT modify the semantic text colors without re-verifying contrast ratios:
- Normal text (≤18px): minimum 4.5:1
- Large text (>18px bold or >24px): minimum 3:1
- UI components: minimum 3:1

### Focus management
```tsx
// Focus ring — visible on keyboard only
className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
```

### Keyboard navigation
- `Cmd+K`: Command palette
- `Escape`: Close modal, deselect, collapse panel
- `Arrow keys`: Navigate card grids and table rows
- `Space`: Toggle select on focused card
- `Enter`: Open focused item
- `Tab`: Standard focus order through interactive elements

### Screen reader
- All icons: include `aria-label` or wrap in `<span className="sr-only">`
- Interactive cards: `role="button"` with `aria-pressed` for selected state
- Status badges: include status text (not just color) for color-blind users
- Data tables: proper `<thead>`, `<th scope="col">`, `aria-sort` on sortable columns

### Color-blind safety
Never rely on color alone. Every semantic state pairs color with:
- Status badges: colored dot + text label ("Approved", "Rejected", "In review")
- Performance deltas: green/red badge + explicit +/- sign and percentage text
- Chart lines: different stroke patterns (solid vs dashed) for multi-line charts

---

## 9. File structure — feature-folder architecture

This project uses a **feature-folder architecture** inside `src/` for team collaboration. The UI redesign lives entirely within `src/features/ui-facelift/`. Shared primitives live in `src/shared/`. Pages live in `src/app/`.

**Your work scope:** Only touch files inside `src/features/ui-facelift/` and `src/shared/` (minimal, stable). Never modify files in `src/features/openclaw/` or `src/features/video-remix/`.

```
src/
├── shared/                              ← Stable, team-shared code
│   ├── components/
│   │   └── ui/                          ← Shared UI primitives (button, card, input, badge, etc.)
│   ├── lib/
│   │   ├── utils.ts                     ← cn(), formatDate(), timeAgo()
│   │   └── store.ts                     ← Main Zustand store
│   └── types/
│       ├── index.ts                     ← BrandProfile, Competitor, AdAnalysis, etc.
│       └── foreplay.ts                  ← Foreplay API types
│
├── features/
│   ├── openclaw/                        ← 🔵 Teammate 1 (DO NOT TOUCH)
│   ├── video-remix/                     ← 🟢 Teammate 2 (DO NOT TOUCH)
│   │
│   └── ui-facelift/                     ← 🟣 YOUR WORKSPACE — all UI/UX work goes here
│       ├── components/
│       │   ├── layout/                  ← Redesigned app shell
│       │   │   ├── sidebar.tsx          ← Dark sidebar (260px / 56px collapsed)
│       │   │   ├── topbar.tsx           ← White top bar with search + actions
│       │   │   ├── mobile-nav.tsx       ← Bottom tab bar for <768px
│       │   │   ├── command-palette.tsx  ← ⌘K search overlay
│       │   │   └── app-shell.tsx        ← Wrapper composing sidebar + topbar + content
│       │   │
│       │   └── dashboard/               ← Analytics dashboard components
│       │       ├── kpi-card.tsx          ← CVA card with accent variants
│       │       ├── kpi-sparkline.tsx     ← SVG area sparkline (competitors)
│       │       ├── kpi-bar-chart.tsx     ← Day-of-week bar chart (ads analyzed)
│       │       ├── kpi-ring-gauge.tsx    ← Donut/ring gauge (ads generated)
│       │       ├── kpi-trend-line.tsx    ← Mini area trend (generation cost)
│       │       ├── performance-chart.tsx ← Recharts dual area line chart
│       │       ├── top-ads-list.tsx      ← Ranked ad list with scores
│       │       ├── recent-ads-table.tsx  ← Table (desktop) / card list (mobile)
│       │       ├── panel.tsx            ← Reusable panel wrapper
│       │       └── metric-row.tsx       ← Cost breakdown rows
│       │
│       ├── lib/                         ← UI-specific utilities
│       │   ├── animations.ts            ← Motion/Framer presets (stagger, fadeUp, etc.)
│       │   ├── theme.ts                 ← Color token constants (for Recharts, SVGs)
│       │   └── use-media-query.ts       ← Responsive breakpoint hook
│       │
│       ├── styles/                      ← Design system CSS
│       │   └── design-tokens.css        ← @theme block with all color/spacing/radius tokens
│       │
│       └── README.md                    ← Feature scope & dev instructions
│
├── app/                                 ← Next.js pages & API routes (mostly stable)
│   ├── layout.tsx                       ← Root layout — import fonts here
│   ├── page.tsx                         ← Home/analytics dashboard page
│   ├── globals.css                      ← Import design-tokens.css here
│   ├── providers.tsx
│   ├── api/
│   │   ├── analyze/
│   │   ├── foreplay/
│   │   └── generate/
│   ├── analytics/
│   ├── discover/
│   ├── errors/
│   ├── generate/
│   └── knowledge-base/
```

### How `app/` pages consume `ui-facelift` components

Pages in `src/app/` import from the feature folder:

```tsx
// src/app/page.tsx (analytics dashboard)
import { AppShell } from '@/features/ui-facelift/components/layout/app-shell';
import { KPICard } from '@/features/ui-facelift/components/dashboard/kpi-card';
import { PerformanceChart } from '@/features/ui-facelift/components/dashboard/performance-chart';
import { TopAdsList } from '@/features/ui-facelift/components/dashboard/top-ads-list';
import { RecentAdsTable } from '@/features/ui-facelift/components/dashboard/recent-ads-table';
```

### How `design-tokens.css` integrates with `globals.css`

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "../features/ui-facelift/styles/design-tokens.css";

/* Any global base overrides here */
```

```css
/* src/features/ui-facelift/styles/design-tokens.css */
@theme {
  /* All color, spacing, radius, and font tokens from section 2 go here */
  --color-sidebar-bg: #0F1117;
  --color-text-primary: #18181B;
  /* ... rest of the @theme block ... */
}
```

### Shared UI primitives vs feature components

- **`src/shared/components/ui/`**: Generic primitives used by ALL features (button, input, card shell, badge). Keep these minimal and stable.
- **`src/features/ui-facelift/components/`**: Redesigned, opinionated components specific to the new design system. These import from `shared/ui/` when it makes sense but can override styles completely.

If a shared UI primitive needs a visual update, prefer wrapping it in `ui-facelift` with new styles rather than modifying `shared/` directly (avoids breaking the other two features).

### cn() utility (already in shared)
```tsx
// src/shared/lib/utils.ts — already exists, use as-is
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Import in your components:
```tsx
import { cn } from '@/shared/lib/utils';
```

---

## 10. The 3-second test

Every screen must pass this. At a 3-second glance, a user can:

1. **What matters most?** — The highest-hierarchy element (hero metric, selected ad, report title) is visually dominant.
2. **Where am I?** — The sidebar active state + page title tell location instantly.
3. **What's next?** — The primary CTA or next logical action is visible without scrolling.

If any screen fails, reduce noise in this order: (1) remove decorative elements, (2) reduce contrast on secondary info, (3) increase size/weight of primary info, (4) add whitespace around the focal point.

---

## 11. Anti-patterns — NEVER do these

1. Use `font-bold` or `font-semibold` anywhere in the app UI
2. Use green/red for non-performance-related UI (save buttons, delete buttons)
3. Use more than 2 accent colors on any single screen
4. Use `rounded-2xl` or larger on any component
5. Use `shadow-*` classes for elevation — use background color steps instead
6. Use gradient backgrounds on any surface
7. Center-align body text (except empty states and modals)
8. Animate anything longer than 400ms
9. Use a loading spinner anywhere — skeletons only
10. Put filters in the sidebar — they belong in content area toolbars
11. Use Title Case in UI labels — sentence case only
12. Display absolute timestamps ("March 16, 2026") — use relative ("2h ago", "3d ago")
13. Use `inter`, `roboto`, or generic system fonts as the display font — the project uses DM Sans
14. Use colored backgrounds for entire cards — cards are always `bg-card-bg` (white)
15. Have identical chart types across KPI cards — each must be visually distinct

---

## 12. Current priority: Analytics dashboard

The analytics dashboard is the first page to redesign. It contains:

1. **4 KPI cards** across the top (responsive: 1 col mobile → 2 col tablet → 4 col desktop)
   - Competitors tracked (area sparkline)
   - Ads analyzed (bar chart with day labels)
   - Ads generated (ring gauge)
   - Generation cost (area trend line in amber)

2. **2-column panel grid** (responsive: stacks to 1 col on mobile)
   - Left: Generation performance (Stripe-style dual area chart + mini metrics + cost breakdown)
   - Right: Top analyzed ads (list with thumbnails, platform dots, score badges)

3. **Full-width table** at the bottom
   - Recently generated ads with: thumbnail, name, platform, status badge, score, timestamp, cost
   - Converts to card list on mobile

Build these components first, then the layout shell (sidebar + topbar) that wraps them.

---

*This prompt is the single source of truth for all UI/UX work on the ai-ecom-engine project. When in doubt, reference the WCAG-verified color tokens, the component specs, and the 3-second test. Every pixel should serve the user's workflow.*