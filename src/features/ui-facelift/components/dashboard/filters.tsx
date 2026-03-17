"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Sheet } from "@/shared/components/ui/sheet";

export interface FilterValues {
  search: string;
  order: string;
  minDays: string;
  platform: string;
  niche: string;
}

interface FiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  competitorOptions?: { id: string; name: string }[];
  selectedCompetitor?: string;
  onCompetitorChange?: (id: string) => void;
}

const NICHE_OPTIONS = [
  { value: "", label: "All niches" },
  { value: "beauty", label: "Beauty" },
  { value: "fashion", label: "Fashion" },
  { value: "health", label: "Health" },
  { value: "food", label: "Food" },
  { value: "technology", label: "Technology" },
  { value: "travel", label: "Travel" },
  { value: "fitness", label: "Fitness" },
  { value: "home", label: "Home" },
  { value: "pets", label: "Pets" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
];

// Shared styles for select controls inside the drawer
const drawerSelectCls =
  "flex h-9 w-full rounded-[10px] px-3 pr-8 py-2 " +
  "bg-content-bg border border-border-subtle " +
  "text-[13px] text-text-secondary " +
  "appearance-none cursor-pointer bg-no-repeat " +
  "transition-colors duration-100 outline-none " +
  "hover:border-border-default focus:border-border-default " +
  "focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-accent " +
  "disabled:opacity-50";

const CHEVRON = `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2378776F' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

// Inline (compact) select — used only for the sort dropdown in the toolbar
const inlineSelectCls =
  "h-8 px-2 pr-6 bg-card-bg border border-border-subtle rounded-[8px] " +
  "text-[13px] text-text-secondary " +
  "appearance-none cursor-pointer bg-no-repeat outline-none " +
  "transition-colors duration-100 " +
  "hover:border-border-default focus:border-border-default " +
  "focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-accent";

export function Filters({
  filters,
  onFiltersChange,
  competitorOptions,
  selectedCompetitor,
  onCompetitorChange,
}: FiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const update = (key: keyof FilterValues, value: string) =>
    onFiltersChange({ ...filters, [key]: value });

  const clearAdvanced = () =>
    onFiltersChange({ ...filters, minDays: "", platform: "", niche: "" });

  const activeFilterCount = [
    filters.minDays,
    filters.platform,
    filters.niche,
    selectedCompetitor && selectedCompetitor !== "all" ? selectedCompetitor : "",
  ].filter(Boolean).length;

  return (
    <>
      {/* ── Compact toolbar row ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search ads..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className={cn(
              "w-full h-8 pl-8 pr-7 bg-card-bg border border-border-subtle rounded-[8px]",
              "text-[13px] text-text-primary placeholder:text-text-tertiary",
              "transition-colors duration-100 outline-none",
              "hover:border-border-default focus:border-border-default",
              "focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-accent"
            )}
          />
          {filters.search && (
            <button
              onClick={() => update("search", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary p-0.5 flex"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort — stays inline as a quick access control */}
        <select
          value={filters.order}
          onChange={(e) => update("order", e.target.value)}
          className={cn(inlineSelectCls, "w-[168px]")}
          style={{ backgroundImage: CHEVRON, backgroundPosition: "right 8px center" }}
        >
          <option value="longest_running">Longest running</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        {/* Filters trigger */}
        <button
          onClick={() => setSheetOpen(true)}
          className={cn(
            "relative flex items-center gap-1.5 h-8 px-2.5 border rounded-[8px]",
            "text-[13px] font-medium cursor-pointer transition-all duration-100 whitespace-nowrap",
            activeFilterCount > 0
              ? "bg-accent-muted border-accent text-accent"
              : "bg-card-bg border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
          )}
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-accent text-white leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter Sheet ────────────────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters" width="w-[320px]">
        <div className="flex flex-col gap-5">

          {/* Competitor */}
          {competitorOptions && competitorOptions.length > 0 && (
            <FilterSection label="Competitor">
              <select
                value={selectedCompetitor || "all"}
                onChange={(e) => onCompetitorChange?.(e.target.value)}
                className={drawerSelectCls}
                style={{ backgroundImage: CHEVRON, backgroundPosition: "right 10px center" }}
              >
                <option value="all">All competitors</option>
                {competitorOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FilterSection>
          )}

          {/* Minimum running days */}
          <FilterSection label="Minimum running days">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "", label: "Any" },
                { value: "7", label: "7+ days" },
                { value: "14", label: "14+ days" },
                { value: "30", label: "30+ days" },
                { value: "60", label: "60+ days" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update("minDays", opt.value)}
                  className={cn(
                    "h-9 rounded-[10px] border text-[13px] font-medium transition-all duration-100",
                    filters.minDays === opt.value
                      ? "bg-accent-muted border-accent text-accent"
                      : "bg-content-bg border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Platform */}
          <FilterSection label="Platform">
            <div className="flex gap-2">
              {[
                { value: "", label: "All" },
                { value: "facebook", label: "Facebook" },
                { value: "instagram", label: "Instagram" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update("platform", opt.value)}
                  className={cn(
                    "flex-1 h-9 rounded-[10px] border text-[13px] font-medium transition-all duration-100",
                    filters.platform === opt.value
                      ? "bg-accent-muted border-accent text-accent"
                      : "bg-content-bg border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Niche */}
          <FilterSection label="Niche">
            <select
              value={filters.niche}
              onChange={(e) => update("niche", e.target.value)}
              className={drawerSelectCls}
              style={{ backgroundImage: CHEVRON, backgroundPosition: "right 10px center" }}
            >
              {NICHE_OPTIONS.map((n) => (
                <option key={n.value} value={n.value}>{n.label}</option>
              ))}
            </select>
          </FilterSection>

          {/* Clear */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                clearAdvanced();
                if (onCompetitorChange) onCompetitorChange("all");
              }}
              className="w-full h-9 rounded-[10px] border border-border-subtle bg-card-bg text-[13px] text-text-secondary hover:border-border-default hover:text-text-primary transition-all duration-100"
            >
              Clear all filters
            </button>
          )}
        </div>
      </Sheet>
    </>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-medium text-text-secondary uppercase tracking-[0.06em]">
        {label}
      </span>
      {children}
    </div>
  );
}
