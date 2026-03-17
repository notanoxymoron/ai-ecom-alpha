# Genie OS — Feature Changelog

A running log of every feature, improvement, and fix made during the AI-assisted build sessions.

---

## Session 1 — Foundation

### Dashboard UI & Analytics Redesign
- Built the full split-mode layout: dark sidebar (`#0F1117`) + light content area (`#F6F5F2`)
- Established design token system in `design-tokens.css` using `--color-*` CSS variables
- Added Shadcn compatibility aliases in `@theme` so legacy utility classes resolve in light mode
- Built `KPIRingGauge`, `KPIBarChart`, `KPISparkline`, `KPITrendLine` dashboard widgets

### Core Architecture
- Set up **Zustand** stores: `useAppStore` (competitors, analyses, usage) and `useGenerateStore` (variations)
- Integrated **React Query** (`@tanstack/react-query`) with `staleTime`, `gcTime`, and no-refetch-on-focus config
- Connected **Foreplay API** (`https://public.api.foreplay.co`) with a typed `ForeplayAd` interface
- Set up feature-folder architecture for team-scale collaboration

### OpenClaw Integration
- Built the Openclaw competitor intelligence page with AI-powered ad analysis
- Wired up analysis results to the shared `analyses` store so scores persist across pages

---

## Session 2 — Design System Consistency

### Unified Input System
- **Problem:** Input fields, search boxes, and select dropdowns each had different heights, radii, borders, and focus rings — visually inconsistent across every page.
- **Fix:** Rewrote `Input` and `Select` shared components to a single token-based design pattern. All controls are now `h-9`, `rounded-[10px]`, use `--border-subtle` at rest and `--border-default` on hover/focus, with a consistent `outline-accent` focus ring.
- `Select` got a custom SVG chevron to replace the OS-native arrow, matching `Input` height exactly.
- Applied `forwardRef` to both so they work with React Hook Form and other ref-based libraries.

### Add Competitor CTA on Dashboard
- **Problem:** No direct way to add a competitor from the main dashboard — users had to know to go to Knowledge Base.
- **Fix:** Added a prominent "Add Competitor" button in the dashboard page header that links to `/knowledge-base`. Visible at all times even when the feed is empty.

---

## Session 3 — Analytics & UX Improvements

### Dynamic Charts
- **Problem:** `KPIRingGauge` was hardcoded to 78%. `PerformanceChart` showed static numbers (312, 243).
- **Fix:** Both components now accept data props. The analytics page derives real values from the Zustand store — approval rate, total generated, total approved, spend, cost-per-ad — and passes them down. `KPIRingGauge` uses `requestAnimationFrame` for a smooth animation when the value changes.
- Note: The area chart shape remains decorative because `GeneratedVariation` records have no `createdAt` timestamp. Summary stats are fully live.

### Filter Side Drawer
- **Problem:** Expanding filters inline pushed page content down and felt clunky on smaller screens.
- **Fix:** Rewrote `filters.tsx` to a Sheet/drawer pattern. Search and sort stay in the inline toolbar for quick access. All advanced filters (competitor, minimum days, platform, niche) live inside the drawer with pill-button selectors for better touch UX. An active-filter count badge on the trigger button shows how many filters are applied without opening the drawer.

### Loading State with Quotes
- **Built:** `LoadingState` component — 8 rotating motivational ad-world quotes (Ogilvy, Burnett, Bernbach, Ford, etc.) with a fade transition every 4 seconds. Used on every page that fetches data.
- Each page passes a contextual `message` prop (e.g. "Scanning competitor ads…", "Searching millions of ads…").

### Empty States with Illustrations
- **Built:** `EmptyState` component with 5 inline SVG illustrations: `competitor`, `search`, `ads`, `filters`, `chart`.
- Every blank/empty/error state across the app now has a relevant illustration, a title, a description, and an optional action button. No more blank white rectangles.

---

## Session 4 — Ad Card & Data Fetching

### Ad Card Redesign (API-mapped)
- **Research first:** Audited the full `ForeplayAd` API response to understand every available field before touching the UI.
- **Rebuilt `ad-card.tsx` completely**, mapping all available fields:
  - `cta_title` → CTA chip on the card
  - `link_url` → domain badge + external link icon
  - `live` → animated "Live" badge with a pulsing green dot
  - `display_format` / `video` → format badge (Image / Video / Carousel)
  - `cards` → carousel slide count
  - `publisher_platform` → colored dot + platform label
  - `niches` → tag chips at the bottom
- **Tier badge redesign:** Old badge used a semi-transparent CSS variable — unreadable over colorful ad images. Fixed with solid dark hex backgrounds:
  - Proven Winner → dark green bg + mint text
  - Strong Signal → dark amber bg + yellow text
  - Early Traction → dark indigo bg + lavender text
- Labels updated: `proven` → "Proven Winner", `strong` → "Strong Signal", `potential` → "Early Traction". All thresholds are data-driven (based on `running_duration.days`).

### Cost-Optimised Data Fetching
- Added `FetchOptions` interface with `revalidate` to the Foreplay client. Each endpoint now uses ISR at different intervals:
  - Brand feeds: 3 min (cursor pages skip cache)
  - Discover: 5 min
  - Brand lists: 10 min
  - Ad details: 1 hour
- Added `Cache-Control: public, s-maxage=…, stale-while-revalidate=60` headers on all API routes.
- Default page size reduced from 50 → 24 to reduce payload and Foreplay API quota usage.

### Rate Limiting
- Built `rate-limiter.ts` — sliding window, 30 req/60s per IP, in-memory `Map<ip, timestamp[]>`.
- Probabilistic GC (0.5% chance per call) keeps memory clean without a dedicated cleanup job.
- All Foreplay API routes return `429` with a `Retry-After` header when the limit is hit. The frontend shows a friendly error message.

---

## Session 5 — Ad Feed Improvements

### Deduplication
- **Problem:** Multiple brand IDs can return the same ad, causing visual duplicates in the feed.
- **Fix:** `useMemo` with a `Set<string>` filter on `ad.id` across all `useInfiniteQuery` pages on both the dashboard and discover pages.

### Infinite Scroll
- Replaced cursor-based "Load More" buttons with `IntersectionObserver` on a sentinel `<div>` at the bottom of each feed.
- `rootMargin: "300px"` pre-fetches the next page before the user reaches the bottom, making scrolling feel seamless.
- Sentinel also shows a spinner while loading, a manual "Load more" fallback if the observer misfires, and a "N ads found" / "you're all caught up" message when exhausted.
- Applied to both `/` (dashboard feed) and `/discover`.

### Ad Detail Modal (2-column popup)
- **Replaced** the 420px side drawer with a centred 2-column modal (max 900px wide, 88vh tall).
- **Left column (340px fixed):** Large ad creative with overlaid badges (Live, tier, format), a quick-stats strip (days running / platform dots / format), Analyze + Duplicate action buttons, carousel slide thumbnails.
- **Right column (flex-1, independent scroll):** Ad copy, then all API detail rows — running duration, start date + time-ago, publisher platforms (coloured pills), display format, CTA title + type, destination URL, niches, categories, product category, languages, market target, full transcription, ad ID.
- **Header bar:** Brand avatar + name + domain + tier badge + external link icon + close button — visible at a glance.
- Backdrop click and Escape key both close the modal. Body scroll is locked while open.
- Applied to both `/` and `/discover`.

---

## Session 6 — Discover Page Search UX

### Recent Searches (localStorage)
- **Built `useRecentSearches` hook** — persists up to 8 searches in `localStorage`, SSR-safe (hydrates after mount).
- Deduplicates by label. Most recent search is always at the top.
- Stores full param set: `{ query, niche, minDays, order }`.
- **Dropdown** appears below the search input on focus — shows a clock icon + human-readable label per entry (e.g. "skincare · Beauty · 30+ days"), individual ✕ to remove one, "Clear all" button.
- Clicking a saved search **restores all four filter fields** and immediately fires the search — no extra click needed.
- Each successful search is automatically saved.

### Active Search Pill
- After running a search on the discover page, a small tinted pill appears above the results showing the active query summary (e.g. "skincare · Beauty · 30+ days") with a one-click ✕ to clear everything.
- Shows live result count next to the pill once data is loaded.

---

## Session 7 — Knowledge Base

### Competitor Count Visibility
- **Problem:** The competitors tab showed a list but gave no at-a-glance sense of scale — users weren't sure how many they'd already added.
- **Fix (3 places):**
  1. **Tab pill badge** — the tab button now shows a count pill that turns primary-tinted when the tab is active (`bg-primary/15 text-primary`).
  2. **Section heading** — "Tracked Competitors" title with the same count pill beside it.
  3. **Dynamic subtitle** — live calculation: *"Monitoring 4,821 ads across 3 brands"* (sums `adCount` across all competitors). Shows "No competitors added yet" when empty.
- The "Add Competitor" button moved into the section header row, aligned opposite the title, instead of floating alone at the top.

---

## Session 8 — Topbar Replacement

### Removed
- Fake global search bar (⌘K shortcut, not wired up)
- Non-functional bell notifications icon
- "New campaign" button with no destination

### Replaced With
- **Left — Dynamic page breadcrumb:** Small icon in a rounded tile + current page name + muted description (e.g. *"Discover · Search 100M+ ads"*). Derived from `usePathname()` matched against the nav map. Updates automatically on navigation.
- **Right — Live workspace stats (3 chips):**
  - `👥 N competitors` → navigates to `/knowledge-base`
  - `🧪 N analysed` → navigates to `/analytics`
  - `📈 N variations` → navigates to `/generate` (accent-tinted when non-zero)
  - All values pulled live from Zustand — update in real time as you work.
  - Labels hidden on small screens to keep it compact.

---

## Component Inventory

| Component | Location | Purpose |
|-----------|----------|---------|
| `Input` | `shared/components/ui/input.tsx` | Unified text input |
| `Select` | `shared/components/ui/select.tsx` | Unified select / dropdown |
| `Sheet` | `shared/components/ui/sheet.tsx` | Side drawer (used for filters) |
| `LoadingState` | `shared/components/ui/loading-state.tsx` | Quote-cycling loading screen |
| `EmptyState` | `shared/components/ui/empty-state.tsx` | Illustrated empty/error states |
| `Spinner` | `shared/components/ui/spinner.tsx` | Inline loading spinner |
| `AdCard` | `dashboard/ad-card.tsx` | Full API-mapped ad card with tier badge |
| `AdDetailModal` | `dashboard/ad-detail-modal.tsx` | 2-column ad detail popup |
| `Filters` | `dashboard/filters.tsx` | Inline toolbar + Sheet drawer for filters |
| `KPIRingGauge` | `dashboard/kpi-ring-gauge.tsx` | Animated approval-rate ring |
| `PerformanceChart` | `dashboard/performance-chart.tsx` | Stats summary + area chart |
| `Topbar` | `layout/topbar.tsx` | Page breadcrumb + live workspace stats |
| `Sidebar` | `layout/sidebar.tsx` | Dark nav sidebar with brand/user block |
| `useRecentSearches` | `features/discover/hooks/` | localStorage recent searches hook |
| `rate-limiter.ts` | `lib/foreplay/rate-limiter.ts` | Sliding-window per-IP rate limiter |

---

*Last updated: March 2026*
