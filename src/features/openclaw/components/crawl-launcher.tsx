"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Search, Globe, Play } from "lucide-react";
import { Spinner } from "@/shared/components/ui/spinner";

interface CrawlLauncherProps {
  onStartCrawl: (source: string, query: string, options: Record<string, unknown>) => void;
  isLoading: boolean;
}

export function CrawlLauncher({ onStartCrawl, isLoading }: CrawlLauncherProps) {
  const [source, setSource] = useState("meta_ad_library");
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState("20");
  const [country, setCountry] = useState("US");

  const handleSubmit = () => {
    if (!query.trim()) return;
    onStartCrawl(source, query.trim(), {
      maxResults: Number(maxResults),
      country,
    });
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          Launch Crawl
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-48"
            >
              <option value="meta_ad_library">Meta Ad Library</option>
              <option value="tiktok_top_ads">TikTok Top Ads</option>
              <option value="landing_page">Landing Page</option>
            </Select>

            <div className="relative flex-1">
              {source === "landing_page" ? (
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder={
                  source === "landing_page"
                    ? "Enter URL to scrape..."
                    : "Search keyword or brand name..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="pl-9"
              />
            </div>
          </div>

          {source !== "landing_page" && (
            <div className="flex items-center gap-3">
              <Select
                value={maxResults}
                onChange={(e) => setMaxResults(e.target.value)}
                className="w-36"
              >
                <option value="10">10 results</option>
                <option value="20">20 results</option>
                <option value="30">30 results</option>
                <option value="50">50 results</option>
              </Select>

              {source === "meta_ad_library" && (
                <Select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-36"
                >
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="ALL">All Countries</option>
                </Select>
              )}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !query.trim()}
            className="w-fit"
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
      </CardContent>
    </Card>
  );
}
