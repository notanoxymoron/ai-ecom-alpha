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
  Globe,
  MonitorPlay,
} from "lucide-react";
import { timeAgo } from "@/shared/lib/utils";

interface CrawlStatusCardProps {
  task: CrawlTask;
  onViewResults?: (taskId: string) => void;
}

const SOURCE_CONFIG = {
  meta_ad_library: {
    label: "Meta Ad Library",
    icon: Globe,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  tiktok_top_ads: {
    label: "TikTok Top Ads",
    icon: MonitorPlay,
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
  const statusConfig = STATUS_CONFIG[task.status];
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
