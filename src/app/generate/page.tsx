"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Select } from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { useAppStore } from "@/shared/lib/store";
import { useGenerateStore, type GeneratedVariation } from "@/shared/lib/generate-store";
import { buildGenerationPrompt, type GenerationOverrides } from "@/lib/generation/generator";
import { getSupportedVideoAspectRatio, VIDEO_ASPECT_RATIO_OPTIONS } from "@/lib/video/config";
import { buildVideoGenerationPrompt } from "@/lib/video/prompt";
import { getAdMediaType, getPrimaryCreativeUrl, isImageAnalysis, isVideoAnalysis } from "@/shared/lib/media";
import {
  Zap,
  ChevronRight,
  Download,
  Check,
  XCircle,
  RefreshCw,
  ArrowLeft,
  SkipForward,
  Eye,
  X,
  Film,
} from "lucide-react";
import Image from "next/image";

export default function GeneratePage() {
  const { brandProfile, setAnalysis, incrementUsage, addErrorLog } = useAppStore();

  // All generate state lives in the dedicated store (survives navigation)
  const {
    step, setStep,
    selectedAd, setSelectedAd,
    localAnalysis, setLocalAnalysis,
    analyzing, setAnalyzing,
    generating, setGenerating,
    error, setError,
    aspectRatio, setAspectRatio,
    variationCount, setVariationCount,
    overrides, setOverrides,
    variations, setVariations,
    editedPrompt, setEditedPrompt,
    promptEditorOpen, setPromptEditorOpen,
  } = useGenerateStore();

  const openaiKey = typeof window !== "undefined" ? localStorage.getItem("openai_api_key") || "" : "";
  const setOpenaiKey = (key: string) => localStorage.setItem("openai_api_key", key);

  // Load context from sessionStorage (passed from ad feed / discover)
  useEffect(() => {
    const ctx = sessionStorage.getItem("generate_context");
    if (ctx) {
      try {
        const { ad, analysis: existingAnalysis, skipAnalysis } = JSON.parse(ctx);
        setSelectedAd(ad);
        setEditedPrompt(null);
        if (skipAnalysis) {
          setLocalAnalysis(null);
          setStep("configure");
        } else if (existingAnalysis) {
          setLocalAnalysis(existingAnalysis);
          setStep("configure");
        } else if (ad) {
          setStep("analyze");
        }
      } catch {
        // ignore
      }
      sessionStorage.removeItem("generate_context");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runAnalysis = async () => {
    const key = openaiKey;
    if (!selectedAd) return;
    setAnalyzing(true);
    setError(null);
    try {
      const isVideoAd = getAdMediaType(selectedAd) === "video";
      if (!isVideoAd && !key) return;

      const res = await fetch(isVideoAd ? "/api/video-remix/analyze" : "/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isVideoAd
            ? { ad: selectedAd, brandProfile }
            : { ad: selectedAd, brandProfile, openaiApiKey: key }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || `HTTP ${res.status}`;
        addErrorLog({
          source: "analysis",
          message: `Analysis failed for ad "${selectedAd.name || selectedAd.id}"`,
          details: errMsg,
          context: `Ad ID: ${selectedAd.id}`,
        });
        throw new Error(errMsg);
      }
      setLocalAnalysis(data.data);
      setAnalysis(selectedAd.id, data.data);
      incrementUsage("adsAnalyzed");
      setStep("configure");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const skipToGenerate = () => {
    setLocalAnalysis(null);
    setStep("configure");
  };

  const getVariationLabel = (index: number, total: number): string => {
    if (selectedAd && getAdMediaType(selectedAd) === "video") return "Video Remix";
    if (total <= 2 || index < 2) return `Exact Replica ${index + 1}`;
    return `Creative Variation ${index - 1}`;
  };

  // Build the auto-generated prompt for preview (first variation)
  const getPreviewPrompt = useCallback((): string => {
    if (isVideoAnalysis(localAnalysis)) {
      return buildVideoGenerationPrompt({
        analysis: localAnalysis,
        brandProfile,
        aspectRatio: getSupportedVideoAspectRatio(aspectRatio),
      });
    }

    const activeOverrides: GenerationOverrides = {};
    if (overrides.suggestedHeadline) activeOverrides.suggestedHeadline = overrides.suggestedHeadline;
    if (overrides.suggestedCta) activeOverrides.suggestedCta = overrides.suggestedCta;
    if (overrides.customColorScheme) activeOverrides.customColorScheme = overrides.customColorScheme;
    if (overrides.customBranding) activeOverrides.customBranding = overrides.customBranding;
    if (overrides.additionalInstructions) activeOverrides.additionalInstructions = overrides.additionalInstructions;

    return buildGenerationPrompt(
      localAnalysis,
      brandProfile,
      aspectRatio,
      0,
      variationCount,
      Object.keys(activeOverrides).length > 0 ? activeOverrides : undefined,
      selectedAd?.description || undefined
    );
  }, [localAnalysis, brandProfile, aspectRatio, variationCount, overrides, selectedAd]);

  const openPromptEditor = () => {
    if (editedPrompt === null) {
      setEditedPrompt(getPreviewPrompt());
    }
    setPromptEditorOpen(true);
  };

  const runGeneration = async () => {
    if (!selectedAd) return;
    setGenerating(true);
    setError(null);
    setStep("generate");

    const isVideoAd = getAdMediaType(selectedAd) === "video";

    if (isVideoAd) {
      if (!isVideoAnalysis(localAnalysis)) {
        setError("Analyze the video before generating a remix");
        setGenerating(false);
        setStep("configure");
        return;
      }

      const newVariation: GeneratedVariation = {
        id: `video-gen-${Date.now()}`,
        mediaType: "video",
        assetUrl: "",
        label: "Video Remix",
        aspectRatio,
        status: "queued",
      };
      setVariations([newVariation]);

      try {
        const res = await fetch("/api/video-remix/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis: localAnalysis,
            brandProfile,
            aspectRatio: selectedVideoAspectRatio,
            customPrompt: editedPrompt || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          const errMsg = data.error || `HTTP ${res.status}`;
          addErrorLog({
            source: "generation",
            message: `Video generation failed (${selectedAd.name || selectedAd.id})`,
            details: errMsg,
            context: `Ad: ${selectedAd.name || selectedAd.id} | Aspect: ${aspectRatio}`,
          });
          throw new Error(errMsg);
        }

        const jobId = data.data.jobId as string;
        let currentVariation: GeneratedVariation = {
          ...newVariation,
          remoteJobId: jobId,
          status: data.data.status === "completed" ? "generating" : data.data.status,
        };
        setVariations([currentVariation]);

        for (let attempt = 0; attempt < 60; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          const statusRes = await fetch(`/api/video-remix/jobs/status?jobId=${encodeURIComponent(jobId)}`);
          const statusData = await statusRes.json();
          if (!statusRes.ok) {
            throw new Error(statusData.error || `HTTP ${statusRes.status}`);
          }

          if (statusData.data.status === "failed") {
            throw new Error("Video generation failed at provider");
          }

          currentVariation = {
            ...currentVariation,
            status: statusData.data.status === "completed" ? "completed" : "generating",
          };

          if (statusData.data.status === "completed") {
            currentVariation = {
              ...currentVariation,
              assetUrl: `/api/video-remix/jobs/content?jobId=${encodeURIComponent(jobId)}`,
              mimeType: "video/mp4",
            };
            setVariations([currentVariation]);
            incrementUsage("adsGenerated");
            setGenerating(false);
            setStep("review");
            return;
          }

          setVariations([currentVariation]);
        }

        throw new Error("Video generation timed out while waiting for the provider");
      } catch (err) {
        setVariations([{ ...newVariation, status: "rejected" }]);
        setError(err instanceof Error ? err.message : "Video generation failed");
        setGenerating(false);
        setStep("review");
        return;
      }
    }

    const newVariations: GeneratedVariation[] = Array.from({ length: variationCount }, (_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      mediaType: "image",
      assetUrl: "",
      label: getVariationLabel(i, variationCount),
      aspectRatio,
      status: "generating",
    }));
    setVariations([...newVariations]);

    for (let i = 0; i < newVariations.length; i++) {
      try {
        const activeOverrides: GenerationOverrides = {};
        if (overrides.suggestedHeadline) activeOverrides.suggestedHeadline = overrides.suggestedHeadline;
        if (overrides.suggestedCta) activeOverrides.suggestedCta = overrides.suggestedCta;
        if (overrides.customColorScheme) activeOverrides.customColorScheme = overrides.customColorScheme;
        if (overrides.customBranding) activeOverrides.customBranding = overrides.customBranding;
        if (overrides.additionalInstructions) activeOverrides.additionalInstructions = overrides.additionalInstructions;

        // If user edited the prompt, use it for all variations. Otherwise auto-generate per variation.
        let promptForVariation: string | undefined;
        if (editedPrompt !== null) {
          promptForVariation = editedPrompt;
        }

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis: localAnalysis,
            brandProfile,
            sourceImageUrl: selectedAd.image || selectedAd.thumbnail,
            aspectRatio,
            variationIndex: i,
            totalVariations: variationCount,
            overrides: Object.keys(activeOverrides).length > 0 ? activeOverrides : undefined,
            adDescription: selectedAd.description || undefined,
            customPrompt: promptForVariation,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          const errMsg = data.error || `HTTP ${res.status}`;
          addErrorLog({
            source: "generation",
            message: `Generation failed (${newVariations[i].label})`,
            details: errMsg,
            context: `Ad: ${selectedAd.name || selectedAd.id} | Aspect: ${aspectRatio} | Variation: ${i + 1}/${variationCount}`,
          });
          throw new Error(errMsg);
        }

        const dataUrl = `data:${data.data.mimeType};base64,${data.data.imageBase64}`;
        newVariations[i] = {
          ...newVariations[i],
          assetUrl: dataUrl,
          mimeType: data.data.mimeType,
          status: "completed",
        };
        setVariations([...newVariations]);
        incrementUsage("adsGenerated");
        incrementUsage("generationCostUsd", 0.134);
      } catch (err) {
        newVariations[i] = { ...newVariations[i], status: "rejected" };
        setVariations([...newVariations]);
        setError(err instanceof Error ? err.message : `Generation ${i + 1} failed`);
      }
    }

    setGenerating(false);
    setStep("review");
  };

  const downloadAsset = (variation: GeneratedVariation, index: number) => {
    const link = document.createElement("a");
    link.href =
      variation.mediaType === "video"
        ? `${variation.assetUrl}${variation.assetUrl.includes("?") ? "&" : "?"}download=1`
        : variation.assetUrl;
    link.download =
      variation.mediaType === "video"
        ? `generated-video-${index + 1}.mp4`
        : `generated-ad-${index + 1}.png`;
    link.click();
  };

  const mediaType = selectedAd ? getAdMediaType(selectedAd) : "image";
  const creativeUrl = selectedAd ? getPrimaryCreativeUrl(selectedAd) : null;
  const isVideoFlow = mediaType === "video";
  const selectedVideoAspectRatio = getSupportedVideoAspectRatio(aspectRatio);
  const isDirectMode = !localAnalysis && !isVideoFlow;
  const showPromptEditor = promptEditorOpen && step === "configure";
  const renderCreativePreview = (mode: "cover" | "contain" = "cover") => {
    if (!selectedAd || !creativeUrl) return null;

    if (isVideoFlow && selectedAd.video) {
      return (
        <video
          src={selectedAd.video}
          poster={selectedAd.thumbnail || undefined}
          controls
          playsInline
          className={`h-full w-full ${mode === "cover" ? "object-cover" : "object-contain"} bg-black`}
        />
      );
    }

    return <Image src={creativeUrl} alt="" fill className={`object-${mode}`} unoptimized />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {isVideoFlow ? <Film className="h-6 w-6 text-primary" /> : <Zap className="h-6 w-6 text-primary" />}
          {isVideoFlow ? "Generate Video Ad" : "Generate Ad"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isVideoFlow
            ? "Recreate a winning competitor video with your brand identity."
            : "Duplicate a winning ad with your brand identity."}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(["select", "analyze", "configure", "generate", "review"] as const).map((s, i) => {
          const stepOrder = ["select", "analyze", "configure", "generate", "review"];
          const currentIdx = stepOrder.indexOf(step);
          const isSkipped = s === "analyze" && isDirectMode && currentIdx > 1;
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              <span
                className={
                  isSkipped
                    ? "text-muted-foreground/40 line-through"
                    : step === s
                      ? "text-primary font-medium"
                      : currentIdx > i
                        ? "text-foreground"
                        : "text-muted-foreground"
                }
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step: Select Source */}
      {step === "select" && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-muted-foreground">
              Select a competitor ad from the Ad Feed or Discover page, then come back here to generate.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Go to Ad Feed
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/discover"}>
                Go to Discover
              </Button>
            </div>
            {selectedAd && (
              <div className="pt-4">
                <p className="text-sm font-medium mb-2">Selected Ad:</p>
                <div className="inline-block">
                  {creativeUrl && (
                    <div className="relative w-48 aspect-[4/5] rounded-lg overflow-hidden border border-border">
                      {renderCreativePreview()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-center mt-3">
                  <Button onClick={() => setStep("analyze")}>
                    Analyze First
                  </Button>
                  {!isVideoFlow && (
                    <Button variant="outline" onClick={skipToGenerate}>
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip to Generate
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step: Analyze */}
      {step === "analyze" && selectedAd && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {creativeUrl && (
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border">
                {renderCreativePreview()}
              </div>
            )}
            {selectedAd.description && (
              <p className="text-sm text-muted-foreground mt-3">{selectedAd.description}</p>
            )}
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">{isVideoFlow ? "Analyze This Video Ad" : "Analyze This Ad"}</h3>
              <p className="text-sm text-muted-foreground">
                {isVideoFlow
                  ? "Gemini will break down the scenes, hook, pacing, overlays, audio, and CTA before generating a structured recreation."
                  : "GPT-4o Vision will analyze the conversion elements and create a replication brief. Or skip analysis to generate directly from the image."}
              </p>
              {!isVideoFlow && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">OpenAI API Key</label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    defaultValue={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                </div>
              )}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">Error</p>
                  <p className="text-xs text-destructive/80 mt-1 whitespace-pre-wrap break-all">{error}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("select")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={runAnalysis} disabled={analyzing || (!isVideoFlow && !openaiKey)}>
                  {analyzing ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
                {!isVideoFlow && (
                  <Button variant="ghost" onClick={skipToGenerate}>
                    <SkipForward className="h-4 w-4 mr-2" />
                    Skip
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Configure */}
      {step === "configure" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {localAnalysis ? (
                <Card>
                  <CardHeader><h3 className="text-sm font-semibold">Replication Brief</h3></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Score:</span>{" "}
                      <span className="text-primary font-bold">{localAnalysis.overallScore}/10</span>
                    </div>
                    {isImageAnalysis(localAnalysis) ? (
                      <div>
                        <span className="font-medium">Layout:</span>{" "}
                        <span className="text-muted-foreground">{localAnalysis.conversionElements.visualHierarchy.layoutType}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">Hook:</span>{" "}
                          <span className="text-muted-foreground">{localAnalysis.videoSummary.hookSummary}</span>
                        </p>
                        <p>
                          <span className="font-medium">Pacing:</span>{" "}
                          <span className="text-muted-foreground">{localAnalysis.audioAnalysis.pacing}</span>
                        </p>
                        <p>
                          <span className="font-medium">Audio:</span>{" "}
                          <span className="text-muted-foreground">
                            {localAnalysis.audioAnalysis.audioStrategy || "hybrid"} / {localAnalysis.audioAnalysis.musicMood}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Scenes:</span>{" "}
                          <span className="text-muted-foreground">{localAnalysis.sceneBreakdown.length}</span>
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Keep:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {localAnalysis.replicationBrief.mustKeepElements.map((e, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{e}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-yellow-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <SkipForward className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold">Direct Generation Mode</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Generating without analysis. The AI will study the reference image directly and replicate its visual design with your brand.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {creativeUrl && (
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border max-w-xs">
                  {renderCreativePreview()}
                </div>
              )}
            </div>

            <Card>
              <CardHeader><h3 className="text-sm font-semibold">Generation Settings</h3></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Aspect Ratio</label>
                  {isVideoFlow ? (
                    <Select value={selectedVideoAspectRatio} onChange={(e) => { setAspectRatio(e.target.value); setEditedPrompt(null); }}>
                      {VIDEO_ASPECT_RATIO_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                  ) : (
                    <Select value={aspectRatio} onChange={(e) => { setAspectRatio(e.target.value); setEditedPrompt(null); }}>
                      <option value="4:5">4:5 — Meta Feed</option>
                      <option value="9:16">9:16 — Stories</option>
                      <option value="1:1">1:1 — Square</option>
                      <option value="16:9">16:9 — Display</option>
                    </Select>
                  )}
                </div>
                {isVideoFlow ? (
                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <h4 className="text-sm font-semibold">Video Generation Mode</h4>
                    <p className="text-xs text-muted-foreground">
                      V1 generates one structured recreation per run. Use the full prompt editor to adjust shot list,
                      voiceover, overlays, and CTA framing before starting the render job.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Optional brand video references from the Knowledge Base will be summarized server-side and folded
                      into the prompt automatically.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Veo supports only <span className="text-foreground">9:16</span> and <span className="text-foreground">16:9</span>.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Variations</label>
                      <Select
                        value={String(variationCount)}
                        onChange={(e) => { setVariationCount(Number(e.target.value)); setEditedPrompt(null); }}
                      >
                        <option value="1">1 — Exact Replica</option>
                        <option value="2">2 — Exact Replicas</option>
                        <option value="3">3 — 2 Exact + 1 Creative</option>
                        <option value="4">4 — 2 Exact + 2 Creative</option>
                        <option value="5">5 — 2 Exact + 3 Creative</option>
                      </Select>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Exact replicas swap branding/colors only. Creative variations adjust layout, sizing, and colors.
                      </p>
                    </div>

                    <div className="space-y-1.5 border-t border-border pt-4">
                      <h4 className="text-sm font-semibold">Optional Text</h4>
                      <p className="text-xs text-muted-foreground">
                        Leave blank to keep only the text from the original ad (with competitor name swapped). Fill these to add specific text.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Suggested Headline</label>
                      <Input
                        value={overrides.suggestedHeadline}
                        onChange={(e) => { setOverrides({ ...overrides, suggestedHeadline: e.target.value }); setEditedPrompt(null); }}
                        placeholder="e.g., Transform Your Skin in 7 Days (optional)"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Suggested CTA</label>
                      <Input
                        value={overrides.suggestedCta}
                        onChange={(e) => { setOverrides({ ...overrides, suggestedCta: e.target.value }); setEditedPrompt(null); }}
                        placeholder="e.g., Shop Now (optional)"
                      />
                    </div>

                    <div className="space-y-1.5 border-t border-border pt-4">
                      <h4 className="text-sm font-semibold">Style Customizations</h4>
                      <p className="text-xs text-muted-foreground">
                        Empty fields use your brand profile defaults.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Custom Color Scheme</label>
                      <Input
                        value={overrides.customColorScheme}
                        onChange={(e) => { setOverrides({ ...overrides, customColorScheme: e.target.value }); setEditedPrompt(null); }}
                        placeholder="e.g., Use pastel pink and white with gold accents"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Custom Branding</label>
                      <Input
                        value={overrides.customBranding}
                        onChange={(e) => { setOverrides({ ...overrides, customBranding: e.target.value }); setEditedPrompt(null); }}
                        placeholder="e.g., Include logo top-left, tagline bottom"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Additional Instructions</label>
                      <Textarea
                        value={overrides.additionalInstructions}
                        onChange={(e) => { setOverrides({ ...overrides, additionalInstructions: e.target.value }); setEditedPrompt(null); }}
                        placeholder="Any other specific instructions for the generated ad..."
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground space-y-1">
                  <p>Estimated cost: {isVideoFlow ? "provider-dependent" : `~$${(variationCount * 0.134).toFixed(2)}`}</p>
                  <p>Using brand: <span className="text-foreground">{brandProfile.brandName || "Not set"}</span></p>
                  <p>
                    Logos: {brandProfile.logoFiles.length} | Example ads: {brandProfile.exampleAds.length}
                    {isVideoFlow && ` | Video refs: ${brandProfile.videoReferences?.length ?? 0}`}
                  </p>
                  {isDirectMode && <p className="text-yellow-500">Mode: Direct (no analysis)</p>}
                  {editedPrompt !== null && <p className="text-primary">Using custom edited prompt</p>}
                </div>
                {!brandProfile.brandName && (
                  <p className="text-xs text-yellow-500">
                    Set up your brand profile in Knowledge Base for better results.
                  </p>
                )}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">Error</p>
                    <p className="text-xs text-destructive/80 mt-1 whitespace-pre-wrap break-all">{error}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button variant="outline" onClick={() => setStep(localAnalysis ? "analyze" : "select")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button variant="outline" onClick={openPromptEditor}>
                    <Eye className="h-4 w-4 mr-2" />
                    {editedPrompt !== null ? "Edit Prompt" : "View Full Prompt"}
                  </Button>
                  <Button onClick={runGeneration} disabled={generating}>
                    {isVideoFlow ? <Film className="h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    {isVideoFlow
                      ? "Generate Video Remix"
                      : `Generate ${variationCount} Variation${variationCount > 1 ? "s" : ""}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prompt Editor Panel */}
          {showPromptEditor && (
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Full Prompt (Editable)
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditedPrompt(getPreviewPrompt())}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setEditedPrompt(null); setPromptEditorOpen(false); }}
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setPromptEditorOpen(false)}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isVideoFlow
                    ? "This is the exact prompt sent to Veo for the video recreation job."
                    : "This is the exact prompt sent to Gemini for image generation. Edit it to fine-tune the output."}
                  {!isVideoFlow && variationCount > 1 && " When edited, the same prompt is used for all variations."}
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editedPrompt ?? ""}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  rows={20}
                  className="font-mono text-xs leading-relaxed"
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step: Generate / Review */}
      {(step === "generate" || step === "review") && (
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">Generation Error</p>
              <p className="text-xs text-destructive/80 mt-1 whitespace-pre-wrap break-all">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Source ad */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Original</h3>
              {creativeUrl && (
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border">
                  {renderCreativePreview()}
                </div>
              )}
            </div>

            {/* Variations */}
            {variations.map((v, i) => (
              <div key={v.id} className="space-y-2">
                <h3 className="text-sm font-medium">{v.label}</h3>
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-border bg-muted">
                  {v.status === "queued" || v.status === "generating" ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Spinner className="h-8 w-8" />
                      <span className="text-xs text-muted-foreground">
                        {v.status === "queued" ? "Queued..." : "Generating..."}
                      </span>
                    </div>
                  ) : v.status === "rejected" ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <XCircle className="h-8 w-8 text-destructive" />
                      <span className="text-xs text-destructive">Failed</span>
                    </div>
                  ) : v.assetUrl ? (
                    v.mediaType === "video" ? (
                      <video src={v.assetUrl} controls playsInline className="h-full w-full object-cover bg-black" />
                    ) : (
                      <Image src={v.assetUrl} alt="" fill className="object-cover" unoptimized />
                    )
                  ) : null}
                </div>
                {v.status === "completed" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadAsset(v, i)}>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const updated = [...variations];
                        updated[i] = { ...v, status: "approved" };
                        setVariations(updated);
                      }}
                    >
                      <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                    </Button>
                  </div>
                )}
                {v.status === "approved" && (
                  <Badge className="bg-green-500/10 text-green-500">Approved</Badge>
                )}
              </div>
            ))}
          </div>

          {step === "review" && (
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep("configure")}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={() => {
                  variations
                    .filter((v) => v.status === "completed" || v.status === "approved")
                    .forEach((v, i) => downloadAsset(v, i));
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
