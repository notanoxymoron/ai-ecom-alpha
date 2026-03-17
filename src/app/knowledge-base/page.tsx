"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Spinner } from "@/shared/components/ui/spinner";
import { useAppStore } from "@/shared/lib/store";
import type { BrandVideoReference, Competitor, UploadedAsset } from "@/shared/types";
import type { ForeplayBrand } from "@/shared/types/foreplay";
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  X,
  Upload,
  Palette,
  Target,
  Users,
  ShieldCheck,
  Film,
} from "lucide-react";
import Image from "next/image";

function TagInput({
  tags,
  onTagsChange,
  placeholder,
}: {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={addTag} type="button">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1">
              {tag}
              <button onClick={() => onTagsChange(tags.filter((t) => t !== tag))}>
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function FileUpload({
  label,
  assets,
  profileField,
  assetType,
}: {
  label: string;
  assets: UploadedAsset[];
  profileField: "logoFiles" | "exampleAds" | "productImages";
  assetType: UploadedAsset["type"];
}) {
  const { addBrandAsset, removeBrandAsset } = useAppStore();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        addBrandAsset(
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            url: reader.result as string,
            type: assetType,
          },
          profileField
        );
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {assets.map((asset) => (
          <div key={asset.id} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border">
            <Image src={asset.url} alt={asset.name} fill className="object-cover" unoptimized />
            <button
              onClick={() => removeBrandAsset(asset.id, profileField)}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>
        ))}
        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}

function VideoReferenceInput({
  references,
  onReferencesChange,
}: {
  references: BrandVideoReference[];
  onReferencesChange: (references: BrandVideoReference[]) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const addReference = () => {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    onReferencesChange([
      ...references,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: trimmedName || `Reference ${references.length + 1}`,
        url: trimmedUrl,
      },
    ]);
    setName("");
    setUrl("");
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-[1fr,2fr,auto]">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Reference name (optional)"
        />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addReference())}
          placeholder="https://example.com/brand-video.mp4"
        />
        <Button type="button" variant="outline" onClick={addReference}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {references.length > 0 && (
        <div className="space-y-2">
          {references.map((reference) => (
            <div key={reference.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <Film className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{reference.name}</p>
                <p className="text-xs text-muted-foreground truncate">{reference.url}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onReferencesChange(references.filter((item) => item.id !== reference.id))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddCompetitorModal({ onClose }: { onClose: () => void }) {
  const { addCompetitor } = useAppStore();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ForeplayBrand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const searchBrands = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/foreplay/discover-brands?query=${encodeURIComponent(search)}&limit=10`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const selectBrand = (brand: ForeplayBrand) => {
    const competitor: Competitor = {
      id: brand.id,
      name: brand.name,
      url: brand.domain || "",
      foreplayBrandId: brand.id,
      facebookPageId: brand.facebook_page_id,
      avatar: brand.avatar,
      notes,
      trackingSince: new Date().toISOString(),
      adCount: brand.ad_count || 0,
    };
    addCompetitor(competitor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold">Add Competitor</h3>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by brand name or domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchBrands()}
            />
            <Button onClick={searchBrands} disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <Input
            placeholder="Notes (optional) — why track this competitor?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="max-h-60 overflow-y-auto space-y-2">
            {results.map((brand) => (
              <button
                key={brand.id}
                onClick={() => selectBrand(brand)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left"
              >
                {brand.avatar && (
                  <Image src={brand.avatar} alt="" width={32} height={32} className="rounded-full" unoptimized />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{brand.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{brand.domain}</div>
                </div>
                {brand.niche && <Badge variant="outline" className="text-[10px]">{brand.niche}</Badge>}
                <span className="text-xs text-muted-foreground">{brand.ad_count} ads</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const { brandProfile, setBrandProfile, competitors, removeCompetitor } = useAppStore();
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [activeTab, setActiveTab] = useState<"brand" | "competitors">("brand");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Knowledge Base
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Teach the engine about your brand and competitors.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("brand")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "brand"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Brand Profile
        </button>
        <button
          onClick={() => setActiveTab("competitors")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "competitors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Competitors ({competitors.length})
        </button>
      </div>

      {activeTab === "brand" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identity */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Brand Identity
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Brand Name</label>
                <Input
                  value={brandProfile.brandName}
                  onChange={(e) => setBrandProfile({ brandName: e.target.value })}
                  placeholder="Your Brand"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  value={brandProfile.brandUrl}
                  onChange={(e) => setBrandProfile({ brandUrl: e.target.value })}
                  placeholder="https://yourbrand.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Brand Description</label>
                <Textarea
                  value={brandProfile.brandDescription}
                  onChange={(e) => setBrandProfile({ brandDescription: e.target.value })}
                  placeholder="Describe your brand in 1-3 paragraphs..."
                  rows={4}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Brand Voice</label>
                <Input
                  value={brandProfile.brandVoice}
                  onChange={(e) => setBrandProfile({ brandVoice: e.target.value })}
                  placeholder="e.g., playful, bold, direct"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Price Range</label>
                <Input
                  value={brandProfile.priceRange}
                  onChange={(e) => setBrandProfile({ priceRange: e.target.value })}
                  placeholder="e.g., $30-$80 per product"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audience */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Target Audience & Niche
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Target Audience</label>
                <Textarea
                  value={brandProfile.targetAudience}
                  onChange={(e) => setBrandProfile({ targetAudience: e.target.value })}
                  placeholder="Describe your ideal customer (demographics, psychographics)..."
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Primary Niche</label>
                <Input
                  value={brandProfile.niche}
                  onChange={(e) => setBrandProfile({ niche: e.target.value })}
                  placeholder="e.g., Skincare, Fitness, Fashion"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sub-Niches</label>
                <TagInput
                  tags={brandProfile.subNiches}
                  onTagsChange={(subNiches) => setBrandProfile({ subNiches })}
                  placeholder="Add a sub-niche..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Unique Selling Points</label>
                <TagInput
                  tags={brandProfile.usps}
                  onTagsChange={(usps) => setBrandProfile({ usps })}
                  placeholder="Add a USP..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Product Categories</label>
                <TagInput
                  tags={brandProfile.productCategories}
                  onTagsChange={(productCategories) => setBrandProfile({ productCategories })}
                  placeholder="Add a category..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Visual Identity */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Visual Identity
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Primary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandProfile.brandColors.primary}
                      onChange={(e) =>
                        setBrandProfile({
                          brandColors: { ...brandProfile.brandColors, primary: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs text-muted-foreground">{brandProfile.brandColors.primary}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Secondary</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandProfile.brandColors.secondary}
                      onChange={(e) =>
                        setBrandProfile({
                          brandColors: { ...brandProfile.brandColors, secondary: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs text-muted-foreground">{brandProfile.brandColors.secondary}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandProfile.brandColors.accent}
                      onChange={(e) =>
                        setBrandProfile({
                          brandColors: { ...brandProfile.brandColors, accent: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs text-muted-foreground">{brandProfile.brandColors.accent}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Heading Font</label>
                  <Input
                    value={brandProfile.fonts.heading}
                    onChange={(e) =>
                      setBrandProfile({ fonts: { ...brandProfile.fonts, heading: e.target.value } })
                    }
                    placeholder="e.g., Montserrat Bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Body Font</label>
                  <Input
                    value={brandProfile.fonts.body}
                    onChange={(e) =>
                      setBrandProfile({ fonts: { ...brandProfile.fonts, body: e.target.value } })
                    }
                    placeholder="e.g., Inter Regular"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets & Exclusions */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Brand Assets & Exclusions
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload label="Logos" assets={brandProfile.logoFiles} profileField="logoFiles" assetType="logo" />
              <FileUpload label="Example Ads" assets={brandProfile.exampleAds} profileField="exampleAds" assetType="example_ad" />
              <FileUpload label="Product Images" assets={brandProfile.productImages} profileField="productImages" assetType="product_image" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Brand Video References</label>
                <p className="text-xs text-muted-foreground">
                  Add public video URLs that represent your brand's pacing, creator energy, and CTA style.
                </p>
                <VideoReferenceInput
                  references={brandProfile.videoReferences ?? []}
                  onReferencesChange={(videoReferences) => setBrandProfile({ videoReferences })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Excluded Themes</label>
                <TagInput
                  tags={brandProfile.excludedThemes}
                  onTagsChange={(excludedThemes) => setBrandProfile({ excludedThemes })}
                  placeholder="e.g., fear-based, medical claims"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "competitors" && (
        <div className="space-y-4">
          <Button onClick={() => setShowAddCompetitor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>

          {competitors.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No competitors tracked yet. Add your first competitor to start monitoring their ads.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitors.map((comp) => (
                <Card key={comp.id} className="group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {comp.avatar && (
                        <Image
                          src={comp.avatar}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full shrink-0"
                          unoptimized
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{comp.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCompetitor(comp.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                        {comp.url && (
                          <p className="text-xs text-muted-foreground truncate">{comp.url}</p>
                        )}
                        {comp.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{comp.notes}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{comp.adCount} ads</span>
                          <span>Tracking since {new Date(comp.trackingSince).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {showAddCompetitor && (
            <AddCompetitorModal onClose={() => setShowAddCompetitor(false)} />
          )}
        </div>
      )}
    </div>
  );
}
