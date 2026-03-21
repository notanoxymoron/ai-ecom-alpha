"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/shared/lib/store";
import {
  Eye, EyeOff, Download, Trash2, RefreshCw, AlertTriangle,
  FlaskConical, Key, Sliders,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

type Tab = "api-keys" | "data" | "preferences";

// ── Reusable card wrapper ────────────────────────────────────────────────────
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card-bg border border-card-border rounded-[14px] p-5", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] font-semibold text-text-primary mb-4">{children}</h3>
  );
}

// ── API Keys Tab ─────────────────────────────────────────────────────────────
function KeyInput({
  label,
  placeholder,
  value,
  show,
  toggle,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  show: boolean;
  toggle: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-text-secondary block">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-9 px-3 pr-10 bg-content-bg border border-border-subtle rounded-[8px] text-text-primary text-[13px] font-mono outline-none focus:border-border-default transition-colors"
        />
        <button
          onClick={toggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function ApiKeysTab() {
  const { apiKeys, setApiKeys } = useAppStore();
  const [showOpenai,    setShowOpenai]    = useState(false);
  const [showClaude,    setShowClaude]    = useState(false);
  const [showOpenrouter, setShowOpenrouter] = useState(false);
  const [showForeplay,  setShowForeplay]  = useState(false);
  const [showGoogleAi,  setShowGoogleAi]  = useState(false);
  const [showApify,     setShowApify]     = useState(false);

  const providers = [
    { id: "openai" as const, label: "OpenAI" },
    { id: "claude" as const, label: "Claude" },
    { id: "openrouter" as const, label: "OpenRouter" },
  ];

  return (
    <div className="space-y-4">
      {/* AI Analysis Keys */}
      <Card>
        <SectionTitle>AI Analysis Keys</SectionTitle>

        {/* Provider selector */}
        <div className="mb-5">
          <label className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.06em] mb-2 block">
            Default Provider
          </label>
          <div className="flex gap-1 p-1 bg-content-bg border border-border-subtle rounded-[8px] w-fit">
            {providers.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setApiKeys({ analysisProvider: id })}
                className={cn(
                  "px-3 h-7 rounded-[6px] text-[12px] font-medium transition-all",
                  apiKeys.analysisProvider === id
                    ? "bg-sidebar-accent text-white"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <KeyInput label="OpenAI API Key" placeholder="sk-..." value={apiKeys.openaiKey} show={showOpenai} toggle={() => setShowOpenai(v => !v)} onChange={v => setApiKeys({ openaiKey: v })} />
          <KeyInput label="Claude (Anthropic) API Key" placeholder="sk-ant-..." value={apiKeys.claudeKey} show={showClaude} toggle={() => setShowClaude(v => !v)} onChange={v => setApiKeys({ claudeKey: v })} />
          <KeyInput label="OpenRouter API Key" placeholder="sk-or-..." value={apiKeys.openrouterKey} show={showOpenrouter} toggle={() => setShowOpenrouter(v => !v)} onChange={v => setApiKeys({ openrouterKey: v })} />
        </div>

        <p className="mt-4 text-[11px] text-text-tertiary">
          Keys are stored locally in your browser and never sent to our servers.
        </p>
      </Card>

      {/* Server-Side Keys */}
      <Card>
        <SectionTitle>Server-Side Keys</SectionTitle>
        <p className="text-[12px] text-text-tertiary mb-4">
          Required to use Discover and Generate features. Stored locally in your browser.
        </p>
        <div className="space-y-4">
          <KeyInput label="Foreplay API Key" placeholder="Enter your Foreplay API key…" value={apiKeys.foreplayKey} show={showForeplay} toggle={() => setShowForeplay(v => !v)} onChange={v => setApiKeys({ foreplayKey: v })} />
          <KeyInput label="Google AI API Key" placeholder="Enter your Google AI (Gemini) API key…" value={apiKeys.googleAiKey} show={showGoogleAi} toggle={() => setShowGoogleAi(v => !v)} onChange={v => setApiKeys({ googleAiKey: v })} />
          <KeyInput label="Apify API Token" placeholder="Enter your Apify API token…" value={apiKeys.apifyToken} show={showApify} toggle={() => setShowApify(v => !v)} onChange={v => setApiKeys({ apifyToken: v })} />
        </div>
        <p className="mt-4 text-[11px] text-text-tertiary">
          Keys are stored locally in your browser and never sent to our servers.
        </p>
      </Card>
    </div>
  );
}

// ── Data Tab ─────────────────────────────────────────────────────────────────
function DataTab() {
  const { usage, errorLogs, clearErrorLogs, clearAnalyses, resetUsage, resetStore } = useAppStore();
  const router = useRouter();

  const [confirmClearLogs, setConfirmClearLogs] = useState(false);
  const [confirmClearAnalyses, setConfirmClearAnalyses] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleClearLogs = () => {
    if (confirmClearLogs) {
      clearErrorLogs();
      setConfirmClearLogs(false);
    } else {
      setConfirmClearLogs(true);
      setTimeout(() => setConfirmClearLogs(false), 3000);
    }
  };

  const handleClearAnalyses = () => {
    if (confirmClearAnalyses) {
      clearAnalyses();
      setConfirmClearAnalyses(false);
    } else {
      setConfirmClearAnalyses(true);
      setTimeout(() => setConfirmClearAnalyses(false), 3000);
    }
  };

  const handleExport = () => {
    const raw = localStorage.getItem("ai-ecom-engine-store");
    if (!raw) return;
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genie-os-workspace-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirmReset) {
      resetStore();
      router.push("/discover");
    } else {
      setConfirmReset(true);
    }
  };

  const stats = [
    { label: "Credits Used", value: usage.foreplayCreditsUsed },
    { label: "Ads Discovered", value: usage.adsDiscovered },
    { label: "Ads Analysed", value: usage.adsAnalyzed },
    { label: "Ads Generated", value: usage.adsGenerated },
    { label: "Generation Cost", value: `$${usage.generationCostUsd.toFixed(2)}` },
    { label: "Error Logs", value: errorLogs.length },
  ];

  return (
    <div className="space-y-4">
      {/* Usage stats */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Usage Stats</SectionTitle>
          <button
            onClick={resetUsage}
            className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            Reset
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-content-bg border border-border-subtle rounded-[10px] p-3">
              <div className="text-[20px] font-semibold text-text-primary tabular-nums leading-none mb-1">
                {value}
              </div>
              <div className="text-[11px] text-text-tertiary">{label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cache & Logs */}
      <Card>
        <SectionTitle>Cache & Logs</SectionTitle>
        <div className="space-y-1">
          {/* Clear error logs */}
          <div className="flex items-center justify-between py-3 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <AlertTriangle size={15} className="text-text-tertiary shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-[13px] font-medium text-text-primary">Clear error logs</p>
                <p className="text-[11px] text-text-tertiary">{errorLogs.length} entries stored</p>
              </div>
            </div>
            <button
              onClick={handleClearLogs}
              className={cn(
                "text-[12px] font-medium px-3 py-1.5 rounded-[6px] border transition-all",
                confirmClearLogs
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-content-bg border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
              )}
            >
              {confirmClearLogs ? "Confirm?" : "Clear"}
            </button>
          </div>

          {/* Clear analyses */}
          <div className="flex items-center justify-between py-3 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <FlaskConical size={15} className="text-text-tertiary shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-[13px] font-medium text-text-primary">Clear analyses cache</p>
                <p className="text-[11px] text-text-tertiary">In-memory ad analyses (not persisted)</p>
              </div>
            </div>
            <button
              onClick={handleClearAnalyses}
              className={cn(
                "text-[12px] font-medium px-3 py-1.5 rounded-[6px] border transition-all",
                confirmClearAnalyses
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-content-bg border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
              )}
            >
              {confirmClearAnalyses ? "Confirm?" : "Clear"}
            </button>
          </div>

          {/* Export workspace */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Download size={15} className="text-text-tertiary shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-[13px] font-medium text-text-primary">Export workspace</p>
                <p className="text-[11px] text-text-tertiary">Download persisted store as JSON</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="text-[12px] font-medium px-3 py-1.5 rounded-[6px] border bg-content-bg border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary transition-all"
            >
              Export
            </button>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/20 bg-red-500/[0.03]">
        <SectionTitle>Danger Zone</SectionTitle>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-text-primary">Reset all data</p>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              Permanently clears your brand profile, competitors, API keys, and all settings.
            </p>
          </div>
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="text-[12px] font-medium px-3 py-1.5 rounded-[6px] border bg-content-bg border-border-subtle text-text-secondary hover:text-text-primary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="text-[12px] font-medium px-3 py-1.5 rounded-[6px] bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Yes, reset
              </button>
            </div>
          ) : (
            <button
              onClick={handleReset}
              className="text-[12px] font-medium px-3 py-1.5 rounded-[6px] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Preferences Tab ──────────────────────────────────────────────────────────
function PreferencesTab() {
  const { preferences, setPreferences } = useAppStore();

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>Display</SectionTitle>
        <div className="space-y-5">
          {/* Grid density */}
          <div>
            <label className="text-[12px] font-medium text-text-secondary block mb-2">
              Grid Density
            </label>
            <div className="flex gap-1 p-1 bg-content-bg border border-border-subtle rounded-[8px] w-fit">
              {(["comfortable", "compact"] as const).map((density) => (
                <button
                  key={density}
                  onClick={() => setPreferences({ gridDensity: density })}
                  className={cn(
                    "px-4 h-7 rounded-[6px] text-[12px] font-medium transition-all capitalize",
                    preferences.gridDensity === density
                      ? "bg-sidebar-accent text-white"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>

          {/* App theme */}
          <div>
            <label className="text-[12px] font-medium text-text-secondary block mb-2">
              App Theme
            </label>
            <div className="flex gap-1 p-1 bg-content-bg border border-border-subtle rounded-[8px] w-fit">
              {(["contrast", "dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPreferences({ theme: t })}
                  className={cn(
                    "px-4 h-7 rounded-[6px] text-[12px] font-medium transition-all capitalize",
                    preferences.theme === t
                      ? "bg-sidebar-accent text-white"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Coming Soon</SectionTitle>
        <p className="text-[13px] text-text-tertiary leading-relaxed">
          More preferences are on the way — theme overrides, notification settings, keyboard shortcuts, and workspace sharing.
        </p>
      </Card>
    </div>
  );
}

// ── Settings Page ────────────────────────────────────────────────────────────
const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "data", label: "Data", icon: FlaskConical },
  { id: "preferences", label: "Preferences", icon: Sliders },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("api-keys");

  return (
    <div className="space-y-6 px-6 py-6 lg:px-8 max-w-2xl">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border-subtle">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === id
                ? "border-sidebar-accent text-text-primary"
                : "border-transparent text-text-tertiary hover:text-text-secondary"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "api-keys" && <ApiKeysTab />}
      {activeTab === "data" && <DataTab />}
      {activeTab === "preferences" && <PreferencesTab />}
    </div>
  );
}
