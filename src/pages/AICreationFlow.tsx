import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/components/laney/MainLayout";
import { EnhancedUploadDropzone } from "@/components/laney/EnhancedUploadDropzone";
import { AIProgress } from "@/components/laney/AIProgress";
import { BookPreview } from "@/components/laney/BookPreview";
import { BookFormatPopup, BookFormat } from "@/components/laney/BookFormatPopup";
import { Button } from "@/components/ui/button";
import { Palette, Clock, ArrowRight, AlertCircle, CheckCircle2, Camera, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { AnalyzedPhoto, PhotoQualityScore, analyzePhotoQuality } from "@/lib/photoAnalysis";
import { LaneyAnalysis } from "@/lib/smartLayoutEngine";
import { generateAIThumbnail } from "@/lib/imageOptimizer";
import { supabase } from "@/integrations/supabase/client";

type FlowState = "upload" | "format-selection" | "analyzing" | "processing" | "preview";

interface PhotoAnalysis {
  title: string;
  pages: number;
  photos: number;
  chapters: number;
  style: string;
  summary: string;
}

const AICreationFlow = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<FlowState>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [analyzedPhotos, setAnalyzedPhotos] = useState<AnalyzedPhoto[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [bookFormat, setBookFormat] = useState<BookFormat | null>(null);
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

  const processSlides = [
    {
      title: "Pick your size",
      description: "Choose the format that fits your story",
      image: "/images/ai-creation/Slide #1.png"
    },
    {
      title: "Laney designs",
      description: "Layout + captions, automatically",
      image: "/images/ai-creation/Slide #2.png",
    },
    {
      title: "Make it yours",
      description: "Fine-tune and perfect every page",
      image: "/images/ai-creation/slide #3.png",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (state !== "upload") return;
    const id = window.setInterval(() => {
      setActiveSlide((s) => (s + 1) % processSlides.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [state, processSlides.length]);

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
  const analyzeAllPhotos = useCallback(async (): Promise<AnalyzedPhoto[]> => {
    const readyPhotos = getReadyPhotos();
    const analyzed: AnalyzedPhoto[] = [];

    for (let i = 0; i < readyPhotos.length; i++) {
      const photo = readyPhotos[i];
      if (!photo.dataUrl || !photo.metadata) continue;

      try {
        const quality = await analyzePhotoQuality(photo.dataUrl, photo.metadata);
        analyzed.push({
          ...photo,
          quality,
          selectedForBook: false,
        });
      } catch (error) {
        console.error("Error analyzing photo:", error);
        // Use photo anyway with default quality
        analyzed.push({
          ...photo,
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
          selectedForBook: false,
        });
      }

      setAnalysisProgress(Math.round(((i + 1) / readyPhotos.length) * 100));
    }

    // Sort by quality - best photos first
    analyzed.sort((a, b) => b.quality.overall - a.quality.overall);
    
    return analyzed;
  }, [getReadyPhotos]);

  // Accept photos as parameter to avoid race condition with state
  const callAIAnalysis = async (photos: AnalyzedPhoto[]) => {
    try {
      console.log("callAIAnalysis called with", photos.length, "photos");
      
      if (!photos || photos.length === 0) {
        console.error("No photos provided to callAIAnalysis");
        toast({
          title: t('toasts.analysisFailed'),
          description: "No photos available for analysis",
          variant: "destructive",
        });
        return null;
      }

      // Get first 4 photos and generate optimized thumbnails for AI
      const photosToAnalyze = photos.slice(0, 4);
      console.log("Photos to analyze:", photosToAnalyze.length);
      
      const imagesToAnalyze = await Promise.all(
        photosToAnalyze.map(async (photo) => {
          try {
            if (photo.file) {
              return await generateAIThumbnail(photo.file, 512);
            }
            return photo.dataUrl;
          } catch (error) {
            console.warn("Thumbnail generation failed, using dataUrl fallback:", error);
            return photo.dataUrl; // Fallback to existing dataUrl
          }
        })
      );

      // Filter out any undefined/null values
      const validImages = imagesToAnalyze.filter((img): img is string => 
        typeof img === 'string' && img.length > 0
      );

      console.log("Valid images for analysis:", validImages.length);

      if (validImages.length === 0) {
        console.error("No valid images could be generated");
        toast({
          title: t('toasts.analysisFailed'),
          description: "Could not prepare images for analysis",
          variant: "destructive",
        });
        return null;
      }

      const requestBody = {
        images: validImages,
        photoCount: photos.length,
      };
      
      console.log("Sending request with photoCount:", requestBody.photoCount);

      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t('auth.signInRequired'),
          description: "Please sign in to use AI features",
          variant: "destructive",
        });
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
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

  // Handle "Continue with AI" click - show format selection
  const handleContinueClick = () => {
    setState("format-selection");
  };

  // Handle format selection confirmation
  const handleFormatConfirm = (format: BookFormat) => {
    setBookFormat(format);
    handleStartProcessing();
  };

  // Store analyzed photos in a ref to avoid stale closure in callback
  const [processedPhotos, setProcessedPhotos] = useState<AnalyzedPhoto[]>([]);
  const photosRef = useRef<AnalyzedPhoto[]>([]);

  // Keep ref updated whenever processedPhotos changes
  useEffect(() => {
    photosRef.current = processedPhotos;
  }, [processedPhotos]);

  const handleStartProcessing = async () => {
    setState("analyzing");
    setAnalysisProgress(0);

    // First, analyze all photos locally for quality
    const analyzed = await analyzeAllPhotos();
    setAnalyzedPhotos(analyzed);
    setProcessedPhotos(analyzed); // Store for use in handleProcessingComplete

    // Move to AI processing phase
    setState("processing");
  };

  const handleProcessingComplete = useCallback(async () => {
    // Use ref to get current photos, avoiding stale closure issue
    const photosForAnalysis = photosRef.current.length > 0 
      ? photosRef.current 
      : analyzedPhotos;
    
    console.log("handleProcessingComplete - photos available:", photosForAnalysis.length);
    
    if (photosForAnalysis.length === 0) {
      console.error("No photos available for analysis!");
      toast({
        title: t('toasts.analysisFailed'),
        description: "No photos were ready for analysis",
        variant: "destructive",
      });
      setState("upload");
      return;
    }
    
    const result = await callAIAnalysis(photosForAnalysis);
    
    if (result) {
      // Store full AI analysis for smart layout engine
      setFullAnalysis(result as LaneyAnalysis);
      
      setAnalysis({
        title: result.title,
        pages: result.suggestedPages,
        photos: photosForAnalysis.length,
        chapters: result.chapters?.length || 4,
        style: result.style,
        summary: result.summary,
      });
    } else {
      // Use fallback if AI fails
      setAnalysis({
        title: "My Memories",
        pages: Math.max(16, Math.ceil(photosForAnalysis.length / 2)),
        photos: photosForAnalysis.length,
        chapters: 4,
        style: "Modern Minimal",
        summary: "A beautiful photobook full of special moments.",
      });
    }
    setState("preview");
  }, [analyzedPhotos, t, toast]);

  // Convert analyzed photos to File[] for BookPreview compatibility
  const getPhotosAsFiles = (): File[] => {
    // We need to maintain reference to original files
    return getReadyPhotos().map(p => p.file);
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] p-6 overflow-y-auto">
        {state === "upload" && (
          <div className="flex w-full flex-col gap-6 overflow-y-auto">
            <div className="text-center shrink-0">
              <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
                {t('aiCreation.title')}
              </h1>
              <p className="mx-auto text-lg text-muted-foreground">
                <span className="text-foreground/80">{t('aiCreation.subtitleHighlight')}</span>
              </p>
            </div>
            
            <div className="grid flex-1 gap-6 lg:grid-cols-3 min-h-0 items-start">
              {/* Upload Section - Primary Focus */}
              <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
                <div className="shrink-0">
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
                </div>
                
                {/* Value Proposition - More Compact */}
                <div className="grid shrink-0 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-foreground">
                      {t('aiCreation.valueProps.professionalStyle.title')}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t('aiCreation.valueProps.professionalStyle.description')}
                    </p>
                  </div>
                  
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-foreground">
                      {t('aiCreation.valueProps.fastCreation.title')}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t('aiCreation.valueProps.fastCreation.description')}
                    </p>
                  </div>
                  
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-foreground">
                      {t('aiCreation.valueProps.fullySafe.title')}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t('aiCreation.valueProps.fullySafe.description')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mt-6 overflow-hidden rounded-xl border border-border bg-muted">
                  <div className="relative aspect-[16/11] w-full">
                    <img
                      src={processSlides[activeSlide]?.image}
                      alt={processSlides[activeSlide]?.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <div className="rounded-lg bg-white/90 p-3 backdrop-blur">
                        <div className="text-sm font-semibold text-foreground">
                          Step {activeSlide + 1}: {processSlides[activeSlide]?.title}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {processSlides[activeSlide]?.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex gap-1">
                      {processSlides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveSlide(i)}
                          className={`h-1.5 w-6 rounded-full transition-colors ${
                            i === activeSlide ? 'bg-primary' : 'bg-border'
                          }`}
                          aria-label={`Go to step ${i + 1}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Placeholder image
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
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
                  onClick={handleContinueClick}
                  disabled={!canProceed || isLoadingPhotos}
                  size="lg"
                  className="mt-4 w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-base font-semibold shadow-lg shadow-primary/25 hover:opacity-95"
                >
                  Create my photobook <ArrowRight className="h-5 w-5" />
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
          <div className="flex h-full w-full flex-col items-center justify-center">
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
          <div className="flex h-full w-full items-center justify-center">
            <AIProgress onComplete={handleProcessingComplete} isProcessing={true} />
          </div>
        )}

        {state === "preview" && bookFormat && (
          <BookPreview 
            analysis={analysis} 
            photos={getPhotosAsFiles()} 
            analyzedPhotos={analyzedPhotos.map(p => ({ dataUrl: p.dataUrl!, quality: p.quality }))}
            fullAnalysis={fullAnalysis}
            bookFormat={bookFormat}
          />
        )}

        {/* Book Format Selection Popup */}
        <BookFormatPopup 
          open={state === "format-selection"} 
          onConfirm={handleFormatConfirm} 
          onClose={() => setState("upload")}
        />
      </div>
    </MainLayout>
  );
};
export default AICreationFlow;