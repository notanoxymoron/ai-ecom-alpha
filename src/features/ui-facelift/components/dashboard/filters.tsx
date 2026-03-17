"use client";

import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export interface FilterValues {
  search: string;
  order: string;
  minDays: string;
  platform: string;
  niche: string;
  mediaType: "image" | "video" | "all";
}

interface FiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  competitorOptions?: { id: string; name: string }[];
  selectedCompetitor?: string;
  onCompetitorChange?: (id: string) => void;
}

const NICHE_OPTIONS = [
  "All Niches",
  "beauty",
  "fashion",
  "health",
  "food",
  "technology",
  "travel",
  "fitness",
  "home",
  "pets",
  "finance",
  "education",
];

export function Filters({
  filters,
  onFiltersChange,
  competitorOptions,
  selectedCompetitor,
  onCompetitorChange,
}: FiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof FilterValues, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ads..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="pl-9"
          />
        </div>

        {competitorOptions && competitorOptions.length > 0 && (
          <Select
            value={selectedCompetitor || "all"}
            onChange={(e) => onCompetitorChange?.(e.target.value)}
            className="w-48"
          >
            <option value="all">All Competitors</option>
            {competitorOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}

        <Select
          value={filters.order}
          onChange={(e) => update("order", e.target.value)}
          className="w-44"
        >
          <option value="longest_running">Longest Running</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-1.5" />
          Filters
        </Button>
      </div>

      {expanded && (
        <div className="flex items-center gap-3 pl-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Min days:</span>
            <Select
              value={filters.minDays}
              onChange={(e) => update("minDays", e.target.value)}
              className="w-28"
            >
              <option value="">Any</option>
              <option value="7">7+ days</option>
              <option value="14">14+ days</option>
              <option value="30">30+ days</option>
              <option value="60">60+ days</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Platform:</span>
            <Select
              value={filters.platform}
              onChange={(e) => update("platform", e.target.value)}
              className="w-32"
            >
              <option value="">All</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Media:</span>
            <Select
              value={filters.mediaType}
              onChange={(e) => update("mediaType", e.target.value as FilterValues["mediaType"])}
              className="w-28"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="all">All</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Niche:</span>
            <Select
              value={filters.niche}
              onChange={(e) => update("niche", e.target.value)}
              className="w-32"
            >
              {NICHE_OPTIONS.map((n) => (
                <option key={n} value={n === "All Niches" ? "" : n}>
                  {n.charAt(0).toUpperCase() + n.slice(1)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
