"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Search, Play } from "lucide-react";
import { Spinner } from "@/shared/components/ui/spinner";

const NICHE_OPTIONS = [
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

interface CrawlLauncherProps {
  onStartCrawl: (source: string, query: string, options: Record<string, unknown>) => void;
  isLoading: boolean;
}

const META_COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ALL", label: "All Countries" },
];

const TIKTOK_COUNTRIES = [
  { value: "ALL", label: "All Countries" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "SE", label: "Sweden" },
  { value: "PL", label: "Poland" },
  { value: "TR", label: "Turkey" },
];

export function CrawlLauncher({ onStartCrawl, isLoading }: CrawlLauncherProps) {
  const [source, setSource] = useState("meta_ad_library");
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState("");
  const [maxResults, setMaxResults] = useState("10");
  const [country, setCountry] = useState("US");

  const countryOptions = source === "tiktok_top_ads" ? TIKTOK_COUNTRIES : META_COUNTRIES;

  const handleSourceChange = (newSource: string) => {
    setSource(newSource);
    setCountry(newSource === "tiktok_top_ads" ? "ALL" : "US");
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    onStartCrawl(source, query.trim(), {
      maxResults: Number(maxResults),
      country,
      niche,
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Select
        value={source}
        onChange={(e) => handleSourceChange(e.target.value)}
        className="w-40"
      >
        <option value="meta_ad_library">Meta Ad Library</option>
        <option value="tiktok_top_ads">TikTok Top Ads</option>
      </Select>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search keyword or brand name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="pl-9"
        />
      </div>

      <Select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-36">
        <option value="">All Niches</option>
        {NICHE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n.charAt(0).toUpperCase() + n.slice(1)}
          </option>
        ))}
      </Select>

      <Select
        value={maxResults}
        onChange={(e) => setMaxResults(e.target.value)}
        className="w-32"
      >
        <option value="10">10 results</option>
        <option value="20">20 results</option>
        <option value="30">30 results</option>
        <option value="50">50 results</option>
      </Select>

      <Select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="w-36"
      >
        {countryOptions.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </Select>

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !query.trim()}
      >
        {isLoading ? (
          <>
            <Spinner className="h-4 w-4 mr-2" />
            Launching...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Start Crawl
          </>
        )}
      </Button>
    </div>
  );
}
