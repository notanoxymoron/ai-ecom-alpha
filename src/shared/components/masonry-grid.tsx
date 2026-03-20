"use client";

import { useState, useEffect, useMemo } from "react";
import { AdCard } from "@/features/ui-facelift/components/dashboard/ad-card";
import type { ForeplayAd } from "@/shared/types/foreplay";
import type { AdAnalysis } from "@/shared/types";

function useColumnCount() {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

interface MasonryGridProps {
  ads: ForeplayAd[];
  analyses: Record<string, AdAnalysis>;
  onAnalyze: (ad: ForeplayAd) => void;
  onDuplicate: (ad: ForeplayAd) => void;
  onOpen: (ad: ForeplayAd) => void;
  variant?: "discover" | "saved";
}

export function MasonryGrid({ ads, analyses, onAnalyze, onDuplicate, onOpen, variant }: MasonryGridProps) {
  const colCount = useColumnCount();
  const columns = useMemo(() => {
    const cols: ForeplayAd[][] = Array.from({ length: colCount }, () => []);
    ads.forEach((ad, i) => cols[i % colCount].push(ad));
    return cols;
  }, [ads, colCount]);

  return (
    <div className="flex gap-4">
      {columns.map((col, ci) => (
        <div key={ci} className="flex-1 min-w-0 space-y-4">
          {col.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              analysisScore={analyses[ad.id]?.overallScore}
              onAnalyze={onAnalyze}
              onDuplicate={() => onDuplicate(ad)}
              onOpen={onOpen}
              variant={variant}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
