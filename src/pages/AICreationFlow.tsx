import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/components/laney/MainLayout";
import { EnhancedUploadDropzone } from "@/components/laney/EnhancedUploadDropzone";
import { AIProgress } from "@/components/laney/AIProgress";
import { BookPreview } from "@/components/laney/BookPreview";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Heart, Users, Palette, Clock, ArrowRight, AlertCircle, CheckCircle2, Camera, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { analyzePhotoQuality, PhotoQualityScore } from "@/lib/photoAnalysis";
import { LaneyAnalysis } from "@/lib/smartLayoutEngine";

type FlowState = "upload" | "analyzing" | "processing" | "preview";

interface PhotoAnalysis {
  title: string;
  pages: number;
  photos: number;
  chapters: number;
  style: string;
  summary: string;
}

interface AnalyzedPhotoData {
  dataUrl: string;
  quality: PhotoQualityScore;
}

const AICreationFlow = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<FlowState>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [analyzedPhotos, setAnalyzedPhotos] = useState<AnalyzedPhotoData[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<PhotoAnalysis>({
    title: "My Photobook",
    pages: 24,
    photos: 0,
    chapters: 4,
    style: "Modern Minimal",
    summary: "A beautiful photobook full of memories.",
  });
  const [fullAnalysis, setFullAnalysis] = useState<LaneyAnalysis | null>(null);
  const { toast } = useToast();

  const aiFeatures = [
    { icon: Camera, labelKey: "aiCreation.aiAssistant.features.quality" },
    { icon: MapPin, labelKey: "aiCreation.aiAssistant.features.locations" },
    { icon: Heart, labelKey: "aiCreation.aiAssistant.features.emotions" },
    { icon: Clock, labelKey: "aiCreation.aiAssistant.features.timeline" },
    { icon: Users, labelKey: "aiCreation.aiAssistant.features.people" },
    { icon: Palette, labelKey: "aiCreation.aiAssistant.features.colors" },
  ];

  const {
    photos,
    isUploading,
    uploadProgress,
    allPhotosReady,
    hasFailedPhotos,
    isProcessing: isLoadingPhotos,
    processFiles,
    retryUpload,
    removePhoto,
    getReadyPhotos,
  } = usePhotoUpload({ 
    maxPhotos: 100
  });

  const readyPhotos = getReadyPhotos();
  const canProceed = readyPhotos.length >= 1 && allPhotosReady && !hasFailedPhotos;

  // Analyze all photos for quality scoring
  const analyzeAllPhotos = useCallback(async (): Promise<AnalyzedPhotoData[]> => {
    const readyPhotos = getReadyPhotos();
    const analyzed: AnalyzedPhotoData[] = [];

    for (let i = 0; i < readyPhotos.length; i++) {
      const photo = readyPhotos[i];
      if (!photo.dataUrl || !photo.metadata) continue;

      try {
        const quality = await analyzePhotoQuality(photo.dataUrl, photo.metadata);
        analyzed.push({
          dataUrl: photo.dataUrl,
          quality,
        });
      } catch (error) {
        console.error("Error analyzing photo:", error);
        // Use photo anyway with default quality
        analyzed.push({
          dataUrl: photo.dataUrl,
          quality: {
            overall: 70,
            sharpness: 70,
            lighting: 70,
            composition: 70,
            faceDetected: false,
            isPortrait: photo.metadata.isPortrait,
            isLandscape: photo.metadata.isLandscape,
            aspectRatio: photo.metadata.aspectRatio,
          },
        });
      }

      setAnalysisProgress(Math.round(((i + 1) / readyPhotos.length) * 100));
    }

    // Sort by quality - best photos first
    analyzed.sort((a, b) => b.quality.overall - a.quality.overall);
    
    return analyzed;
  }, [getReadyPhotos]);

  const callAIAnalysis = async () => {
    try {
      // Get first 4 photos for AI visual analysis
      const imagesToAnalyze = analyzedPhotos.slice(0, 4).map(p => p.dataUrl);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            images: imagesToAnalyze,
            photoCount: analyzedPhotos.length,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          toast({
            title: t('toasts.waitMoment'),
            description: t('toasts.tooManyRequests'),
            variant: "destructive",
          });
          return null;
        }
        if (response.status === 402) {
          toast({
            title: t('toasts.creditsEmpty'),
            description: t('toasts.addMoreCredits'),
            variant: "destructive",
          });
          return null;
        }
        throw new Error(error.error || "AI analysis failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Photo analysis error:", error);
      toast({
        title: t('toasts.analysisFailed'),
        description: t('toasts.analysisFailedDesc'),
        variant: "destructive",
      });
      return null;
    }
  };

  const handleStartProcessing = async () => {
    setState("analyzing");
    setAnalysisProgress(0);

    // First, analyze all photos locally for quality
    const analyzed = await analyzeAllPhotos();
    setAnalyzedPhotos(analyzed);

    // Move to AI processing phase
    setState("processing");
  };

  const handleProcessingComplete = useCallback(async () => {
    const result = await callAIAnalysis();
    
    if (result) {
      // Store full AI analysis for smart layout engine
      setFullAnalysis(result as LaneyAnalysis);
      
      setAnalysis({
        title: result.title,
        pages: result.suggestedPages,
        photos: analyzedPhotos.length,
        chapters: result.chapters?.length || 4,
        style: result.style,
        summary: result.summary,
      });
    } else {
      // Use fallback if AI fails
      setAnalysis({
        title: "My Memories",
        pages: Math.max(16, Math.ceil(analyzedPhotos.length / 2)),
        photos: analyzedPhotos.length,
        chapters: 4,
        style: "Modern Minimal",
        summary: "A beautiful photobook full of special moments.",
      });
    }
    setState("preview");
  }, [analyzedPhotos, t]);

  // Convert analyzed photos to File[] for BookPreview compatibility
  const getPhotosAsFiles = (): File[] => {
    // We need to maintain reference to original files
    return getReadyPhotos().map(p => p.file);
  };

  return (
    <MainLayout>
      <div className="p-6">
        {state === "upload" && (
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                {t('aiCreation.title')}
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {t('aiCreation.subtitle')}<br />
                <span className="text-foreground/80">{t('aiCreation.subtitleHighlight')}</span>
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Upload Section - Primary Focus */}
              <div className="lg:col-span-2">
                <EnhancedUploadDropzone
                  photos={photos}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  allPhotosReady={allPhotosReady}
                  hasFailedPhotos={hasFailedPhotos}
                  isDragging={isDragging}
                  onDragChange={setIsDragging}
                  onFilesSelected={processFiles}
                  onRemovePhoto={removePhoto}
                  onRetryPhoto={retryUpload}
                />
                
                {/* Value Proposition - Below Upload */}
                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                      <Palette className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {t('aiCreation.valueProps.professionalStyle.title')}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t('aiCreation.valueProps.professionalStyle.description')}
                    </p>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {t('aiCreation.valueProps.fastCreation.title')}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t('aiCreation.valueProps.fastCreation.description')}
                    </p>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {t('aiCreation.valueProps.fullySafe.title')}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t('aiCreation.valueProps.fullySafe.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* AI Assistant Panel - Right Side */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{t('aiCreation.aiAssistant.title')}</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {t('aiCreation.aiAssistant.subtitle')}
                </p>
                <div className="mb-6 space-y-3">
                  {aiFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <feature.icon className="h-4 w-4 text-primary" />
                      {t(feature.labelKey)}
                    </div>
                  ))}
                </div>
                
                {/* Status summary */}
                <div className="mb-4 space-y-2">
                  <div className="rounded-lg bg-secondary p-3 text-center">
                    <span className="text-2xl font-bold text-foreground">{readyPhotos.length}</span>
                    <span className="ml-2 text-muted-foreground">{t('aiCreation.aiAssistant.photosReady')}</span>
                  </div>
                  
                  {isLoadingPhotos && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      {t('aiCreation.aiAssistant.loading')}
                    </div>
                  )}
                  
                  {hasFailedPhotos && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {t('aiCreation.aiAssistant.someFailed')}
                    </div>
                  )}
                  
                  {allPhotosReady && readyPhotos.length > 0 && !hasFailedPhotos && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {t('aiCreation.aiAssistant.allLoaded')}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleStartProcessing}
                  disabled={!canProceed || isLoadingPhotos}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                >
                  {t('aiCreation.aiAssistant.continueWithAI')} <ArrowRight className="h-4 w-4" />
                </Button>
                
                {!canProceed && readyPhotos.length > 0 && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {t('aiCreation.aiAssistant.waitForPhotos')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {state === "analyzing" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                <Camera className="h-10 w-10 animate-pulse text-primary-foreground" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">{t('aiCreation.analyzing.title')}</h2>
              <p className="mb-6 text-muted-foreground">
                {t('aiCreation.analyzing.subtitle', { count: readyPhotos.length })}
              </p>
              <div className="mx-auto max-w-xs">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('aiCreation.analyzing.progress')}</span>
                  <span className="font-medium text-foreground">{analysisProgress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {state === "processing" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <AIProgress onComplete={handleProcessingComplete} isProcessing={true} />
          </div>
        )}

        {state === "preview" && (
          <BookPreview 
            analysis={analysis} 
            photos={getPhotosAsFiles()} 
            analyzedPhotos={analyzedPhotos}
            fullAnalysis={fullAnalysis}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default AICreationFlow;
