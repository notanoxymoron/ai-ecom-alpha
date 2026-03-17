"use client";

import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { LandingPageIntel } from "../types";
import {
  FileText,
  Target,
  Star,
  DollarSign,
  Quote,
  ExternalLink,
} from "lucide-react";

interface LandingPageIntelCardProps {
  intel: LandingPageIntel;
}

export function LandingPageIntelCard({ intel }: LandingPageIntelCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Landing Page Intel
          </h3>
          <a
            href={intel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View Page
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Headline */}
        {intel.headline && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Headline</p>
            <p className="text-sm font-medium">{intel.headline}</p>
            {intel.subheadline && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {intel.subheadline}
              </p>
            )}
          </div>
        )}

        {/* CTA */}
        {intel.cta && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Primary CTA
            </p>
            <Badge className="bg-primary/20 text-primary">{intel.cta}</Badge>
          </div>
        )}

        {/* Offers */}
        {intel.offers.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Offers & Discounts
            </p>
            <div className="flex flex-wrap gap-1.5">
              {intel.offers.map((offer, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[10px] text-green-400 border-green-500/20"
                >
                  {offer}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Social Proof */}
        {intel.socialProof.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Social Proof
            </p>
            <div className="space-y-1">
              {intel.socialProof.map((proof, i) => (
                <p key={i} className="text-xs flex items-start gap-1.5">
                  <Quote className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                  {proof}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Price Points */}
        {intel.pricePoints.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Price Points
            </p>
            <div className="flex flex-wrap gap-1.5">
              {intel.pricePoints.map((price, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[10px] text-yellow-400 border-yellow-500/20"
                >
                  {price}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
