"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

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

export function Filters({
  filters,
  onFiltersChange,
  competitorOptions,
  selectedCompetitor,
  onCompetitorChange,
}: FiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof FilterValues, value: string) =>
    onFiltersChange({ ...filters, [key]: value });

  const hasAdvancedFilters =
    filters.minDays || filters.platform || filters.niche;

  return (
    <div className="bg-bg-surface border-b border-border-subtle py-2.5 px-4 flex flex-col gap-2">
      {/* Primary toolbar row */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-[360px]">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search ads..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="w-full h-8 pl-8 pr-7 bg-bg-inset border border-border-subtle rounded-md text-text-primary text-sm focus:border-border-strong outline-none transition-all duration-120"
          />
          {filters.search && (
            <button
              onClick={() => update("search", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-tertiary flex p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Competitor selector */}
        {competitorOptions && competitorOptions.length > 0 && (
          <select
            value={selectedCompetitor || "all"}
            onChange={(e) => onCompetitorChange?.(e.target.value)}
            className="h-8 px-2 bg-bg-inset border border-border-subtle rounded-md text-text-secondary text-sm outline-none cursor-pointer appearance-none bg-no-repeat w-[176px]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b6a66' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundPosition: "right 8px center",
              paddingRight: "24px",
            }}
          >
            <option value="all">All competitors</option>
            {competitorOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {/* Sort */}
        <select
          value={filters.order}
          onChange={(e) => update("order", e.target.value)}
          className="h-8 px-2 bg-bg-inset border border-border-subtle rounded-md text-text-secondary text-sm outline-none cursor-pointer appearance-none bg-no-repeat w-[168px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b6a66' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundPosition: "right 8px center",
            paddingRight: "24px",
          }}
        >
          <option value="longest_running">Longest running</option>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 h-8 px-2.5 border border-border-default rounded-md text-sm font-medium cursor-pointer transition-all duration-120 whitespace-nowrap",
            expanded || hasAdvancedFilters
              ? "bg-accent-primary-muted text-accent"
              : "bg-transparent text-text-secondary"
          )}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasAdvancedFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          )}
        </button>
      </div>

      {/* Advanced filters row */}
      {expanded && (
        <div className="flex items-center gap-4 pl-0.5">
          <FilterGroup label="Min days">
            <select
              value={filters.minDays}
              onChange={(e) => update("minDays", e.target.value)}
              className="h-8 px-2 bg-bg-inset border border-border-subtle rounded-md text-text-secondary text-sm outline-none cursor-pointer appearance-none bg-no-repeat w-[112px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b6a66' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 8px center",
                paddingRight: "24px",
              }}
            >
              <option value="">Any</option>
              <option value="7">7+ days</option>
              <option value="14">14+ days</option>
              <option value="30">30+ days</option>
              <option value="60">60+ days</option>
            </select>
          </FilterGroup>

          <FilterGroup label="Platform">
            <select
              value={filters.platform}
              onChange={(e) => update("platform", e.target.value)}
              className="h-8 px-2 bg-bg-inset border border-border-subtle rounded-md text-text-secondary text-sm outline-none cursor-pointer appearance-none bg-no-repeat w-[128px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b6a66' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 8px center",
                paddingRight: "24px",
              }}
            >
              <option value="">All</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </select>
          </FilterGroup>

          <FilterGroup label="Niche">
            <select
              value={filters.niche}
              onChange={(e) => update("niche", e.target.value)}
              className="h-8 px-2 bg-bg-inset border border-border-subtle rounded-md text-text-secondary text-sm outline-none cursor-pointer appearance-none bg-no-repeat w-[128px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b6a66' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 8px center",
                paddingRight: "24px",
              }}
            >
              {NICHE_OPTIONS.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </FilterGroup>

          {hasAdvancedFilters && (
            <button
              onClick={() =>
                onFiltersChange({ ...filters, minDays: "", platform: "", niche: "" })
              }
              className="text-xs text-text-tertiary bg-transparent border-none cursor-pointer p-0 transition-all duration-120 hover:text-text-secondary"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-text-tertiary whitespace-nowrap">
        {label}
      </span>
      {children}
    </div>
  );
}
