// OpenClaw-specific types

export interface CrawlTask {
  id: string;
  source: "meta_ad_library" | "tiktok_top_ads" | "landing_page";
  query: string;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  resultCount: number;
  error?: string;
}

export interface CrawlOptions {
  maxResults?: number;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  country?: string;
  activeOnly?: boolean;
}

export interface ScrapedAd {
  id: string;
  crawlTaskId: string;
  source: "meta" | "tiktok";
  advertiserName: string;
  adText: string;
  imageUrl?: string;
  videoUrl?: string;
  landingPageUrl?: string;
  startDate?: string;
  isActive: boolean;
  platform: string[];
  estimatedReach?: string;
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

export interface LandingPageIntel {
  url: string;
  headline: string;
  subheadline?: string;
  cta: string;
  offers: string[];
  socialProof: string[];
  pricePoints: string[];
  rawContent?: string;
}

export interface OpenClawAgentTask {
  task_id: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  result?: string;
  error?: string;
}
