"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { CrawlTask } from "../types";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Search,
} from "lucide-react";
import { timeAgo } from "@/shared/lib/utils";

function MetaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

interface CrawlStatusCardProps {
  task: CrawlTask;
  onViewResults?: (taskId: string) => void;
}

const SOURCE_CONFIG = {
  meta_ad_library: {
    label: "Meta Ad Library",
    icon: MetaIcon,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  tiktok_top_ads: {
    label: "TikTok Top Ads",
    icon: TikTokIcon,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
  landing_page: {
    label: "Landing Page",
    icon: Search,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
};

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-zinc-400",
    badgeClass: "bg-zinc-500/20 text-zinc-400",
  },
  running: {
    icon: Loader2,
    label: "Running",
    color: "text-yellow-400",
    badgeClass: "bg-yellow-500/20 text-yellow-400",
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    color: "text-green-400",
    badgeClass: "bg-green-500/20 text-green-400",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    color: "text-red-400",
    badgeClass: "bg-red-500/20 text-red-400",
  },
};

export function CrawlStatusCard({ task, onViewResults }: CrawlStatusCardProps) {
  const sourceConfig = SOURCE_CONFIG[task.source];
  const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const SourceIcon = sourceConfig.icon;
  const StatusIcon = statusConfig.icon;

  const createdTimestamp = Math.floor(
    new Date(task.createdAt).getTime() / 1000
  );

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        task.status === "completed" && onViewResults ? "cursor-pointer" : ""
      }`}
      onClick={() =>
        task.status === "completed" && onViewResults?.(task.id)
      }
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center h-10 w-10 rounded-lg ${sourceConfig.bgColor}`}
          >
            <SourceIcon className={`h-5 w-5 ${sourceConfig.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{task.query}</p>
              <Badge className={`text-[10px] ${statusConfig.badgeClass}`}>
                <StatusIcon
                  className={`h-3 w-3 mr-1 ${
                    task.status === "running" ? "animate-spin" : ""
                  }`}
                />
                {statusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {sourceConfig.label}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(createdTimestamp)}
              </span>
              {task.status === "completed" && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-green-400">
                    {task.resultCount} ads found
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {task.error && (
          <p className="text-xs text-destructive mt-2 bg-destructive/10 p-2 rounded">
            {task.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
