/**
 * Theme utilities for Genie OS Design System
 * Use these helpers in components instead of hardcoded class names.
 */

/** Toggle dark/light theme on <html data-theme="..."> */
export function setTheme(theme: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("genie-theme", theme);
}

export function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("genie-theme") as "dark" | "light") ?? "dark";
}

export function initTheme() {
  const saved = getTheme();
  document.documentElement.setAttribute("data-theme", saved);
}

/**
 * Returns the CSS variable for a performance status.
 * Use these for badge backgrounds, row highlights, and metric deltas.
 * Never use winning/losing/testing colors for non-performance UI.
 */
export type PerformanceStatus = "winning" | "losing" | "testing" | "neutral";

export function getStatusVars(status: PerformanceStatus) {
  switch (status) {
    case "winning":
      return {
        bg: "var(--color-winning-muted)",
        text: "var(--color-winning-text)",
        dot: "var(--color-winning)",
      };
    case "losing":
      return {
        bg: "var(--color-losing-muted)",
        text: "var(--color-losing-text)",
        dot: "var(--color-losing)",
      };
    case "testing":
      return {
        bg: "var(--color-testing-muted)",
        text: "var(--color-testing-text)",
        dot: "var(--color-testing)",
      };
    default:
      return {
        bg: "var(--bg-elevated)",
        text: "var(--text-secondary)",
        dot: "var(--text-tertiary)",
      };
  }
}

/** Maps ad running duration to performance status */
export function daysToStatus(days: number): PerformanceStatus {
  if (days >= 30) return "winning";
  if (days >= 7) return "testing";
  return "neutral";
}

/** Format relative timestamps — design spec: always relative, never absolute */
export function timeAgo(dateInput: string | number | null | undefined): string {
  if (!dateInput) return "";
  let date: Date;
  if (typeof dateInput === "number") {
    date = new Date(dateInput.toString().length === 10 ? dateInput * 1000 : dateInput);
  } else {
    date = new Date(dateInput);
  }
  if (isNaN(date.getTime())) return "";
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  return `${months}mo ago`;
}
