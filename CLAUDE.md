# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview
Next.js 16 App Router application ("Genie OS") for autonomous competitor ad scraping and AI-powered analysis. Pulls data from Meta and TikTok ad libraries via Apify actors, standardizes to a shared `ForeplayAd` schema, and feeds into AI analysis (OpenAI) and ad generation (Google Gemini) pipelines.

## Commands
```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run lint     # ESLint
npm run start    # Start production server
```
No test runner is configured.

## Environment Variables (`.env.local`)
```
APIFY_API_TOKEN       # Required for OpenClaw scraping (TikTok requires paid tier)
FOREPLAY_API_KEY      # Required for Foreplay ad discovery endpoints
GOOGLE_AI_API_KEY     # Required for ad generation via Google Gemini
# OpenAI API key is passed client-side per-request (not stored server-side)
```

## Architecture

### Two Parallel Ad Data Sources
The app integrates two independent ad data pipelines that both resolve to `ForeplayAd`:

1. **Foreplay API** (`src/lib/foreplay/client.ts`) — Server-side client hitting `public.api.foreplay.co`. Used on the Discover page for browsing/searching existing ad libraries. Routes in `src/app/api/foreplay/`.

2. **OpenClaw / Apify** (`src/features/openclaw/`) — Autonomous scraping pipeline. Launches Apify actors, polls for completion, parses raw JSON into `ForeplayAd`. Routes in `src/app/api/openclaw/`. The scrape → parse → display flow is:
   - `crawl/route.ts` starts an Apify actor run and returns a `runId`
   - `status/route.ts` polls run status via the Apify client
   - `results/route.ts` fetches completed items and calls parsers
   - `parsers.ts` normalizes Meta/TikTok raw payloads → `ForeplayAd`

### AI Pipeline
- **Analysis** (`src/lib/analysis/analyzer.ts`): POSTs to OpenAI with ad image/copy, returns structured `AdAnalysis` (hook, CTA, color psychology, replication brief, brand relevance score). OpenAI key is provided by the user at runtime and sent via the `/api/analyze` route body — not stored in env.
- **Generation** (`src/lib/generation/generator.ts`): Uses `GOOGLE_AI_API_KEY` (Gemini) to generate ad image variations from the analysis brief. Returns base64 image. Max route duration: 120s.

### State Management
`useAppStore` (Zustand + `persist`) in `src/shared/lib/store.ts` holds global client state: brand profile, competitors, ad analyses, generated ads, usage stats, and error logs. Persisted to `localStorage` as `"ai-ecom-engine-store"` — but `generatedAds` and `analyses` are intentionally excluded from persistence (too large).

### Shared Types
- `src/shared/types/foreplay.ts` — `ForeplayAd`, `ForeplayBrand`, API param interfaces. The canonical ad schema all scrapers normalize to.
- `src/shared/types/index.ts` — App-specific types: `BrandProfile`, `AdAnalysis`, `GeneratedAd`, `Competitor`, `WinnerTier` helpers.
- `src/features/openclaw/types/index.ts` — Scraping-specific types: `CrawlTask`, `ScrapedAd`, `LandingPageIntel`.

### Winner Tier System
Ads are tiered by `running_duration.days`: Proven Winner (≥30d), Strong Performer (≥14d), Potential Winner (≥7d). Logic in `src/shared/types/index.ts` (`getWinnerTier`). TikTok's `lexis-solutions` actor doesn't honor `adStartDate` — `parsers.ts` estimates `runningDays` via ID hashing to produce stable visual tiers.

### App Pages (sidebar navigation)
- `/` — Main dashboard (ad grid)
- `/discover` — Foreplay-powered ad/brand discovery
- `/openclaw` — OpenClaw scrape launcher and results
- `/analytics` — Analytics view
- `/generate` — Ad generation workflow
- `/knowledge-base` — Brand profile + competitor management
- `/errors` — Error log viewer

## Rules & Coding Guidelines
- **Aesthetics:** Follow the dark/glassmorphic brand language in `globals.css`. Dark background (`bg-black`), glassmorphic card styles.
- **Parsers are fragile:** `parsers.ts` has extensive fallback chains for Apify raw JSON. Any actor upgrade that changes the raw payload shape will silently break image/video rendering. Review carefully before touching.
- **File extensions:** `lib/` files → `.ts`; React components → `.tsx`; layouts use `export default function`.
- **Providers:** `src/app/providers.tsx` wraps the app with TanStack Query. Add new providers there.
