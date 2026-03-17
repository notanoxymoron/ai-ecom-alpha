"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SavedSearch {
  query: string;
  niche: string;
  minDays: string;
  order: string;
  /** Human-readable summary, e.g. "skincare · 30+ days" */
  label: string;
  savedAt: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "genie_recent_searches";
const MAX_SEARCHES = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildLabel(s: Pick<SavedSearch, "query" | "niche" | "minDays">) {
  const parts: string[] = [];
  if (s.query)   parts.push(s.query);
  if (s.niche)   parts.push(s.niche.charAt(0).toUpperCase() + s.niche.slice(1));
  if (s.minDays) parts.push(`${s.minDays}+ days`);
  return parts.join(" · ") || "All ads";
}

function loadFromStorage(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedSearch[]) : [];
  } catch {
    return [];
  }
}

function persistToStorage(searches: SavedSearch[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // storage full / private browsing — silently ignore
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useRecentSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  // Hydrate from localStorage after mount (SSR safe)
  useEffect(() => {
    setSearches(loadFromStorage());
  }, []);

  /**
   * Add a search to the top of the list.
   * Deduplicates by label — if an identical search already exists it moves to top.
   */
  const addSearch = useCallback(
    (params: Omit<SavedSearch, "label" | "savedAt">) => {
      const label = buildLabel(params);
      const entry: SavedSearch = { ...params, label, savedAt: Date.now() };
      setSearches((prev) => {
        const filtered = prev.filter((s) => s.label !== label);
        const updated  = [entry, ...filtered].slice(0, MAX_SEARCHES);
        persistToStorage(updated);
        return updated;
      });
    },
    []
  );

  /** Remove a single search by index */
  const removeSearch = useCallback((idx: number) => {
    setSearches((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      persistToStorage(updated);
      return updated;
    });
  }, []);

  /** Wipe the entire list */
  const clearAll = useCallback(() => {
    persistToStorage([]);
    setSearches([]);
  }, []);

  return { searches, addSearch, removeSearch, clearAll };
}
