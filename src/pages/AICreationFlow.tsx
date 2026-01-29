import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/components/laney/MainLayout";
import { EnhancedUploadDropzone } from "@/components/laney/EnhancedUploadDropzone";
import { AIProgress } from "@/components/laney/AIProgress";
import { BookPreview } from "@/components/laney/BookPreview";
import { BookFormatPopup, BookFormat } from "@/components/laney/BookFormatPopup";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Palette, Clock, ArrowRight, AlertCircle, CheckCircle2, Camera, Shield, Sparkles, Zap, Lock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { LaneyAnalysis } from "@/lib/aiTypes";
import { ProcessingStats, updateStats } from "@/lib/photoProcessing";
import { runPhotobookPipeline, PhotobookPipelineResult } from "@/lib/aiPhotobookPipeline";

type FlowState = "upload" | "format-selection" | "processing" | "preview";

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
  const [bookFormat, setBookFormat] = useState<BookFormat | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PhotobookPipelineResult | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysis>({
    title: "My Photobook",
    pages: 24,
    photos: 0,
    chapters: 4,
    style: "Modern Minimal",
    summary: "A beautiful photobook full of memories.",
  });
  const [fullAnalysis, setFullAnalysis] = useState<LaneyAnalysis | null>(null);
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
    total: 0,
    unique: 0,
    duplicates: 0,
    analyzed: 0,
    currentBatch: 0,
    totalBatches: 0,
    progress: 0,
    status: 'Ready to upload'
  });
  const { toast } = useToast();

  const processSlides = [
    {
      title: "Pick your size",
      description: "Choose the format that fits your story",
      image: "/images/ai-creation/Step 1.jpeg"
    },
    {
      title: "Laney designs",
      description: "Layout + captions, automatically",
      image: "/images/ai-creation/Step 2.jpeg",
    },
    {
      title: "Make it yours",
      description: "Fine-tune and perfect every page",
      image: "/images/ai-creation/Step 3.jpeg",
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
    maxPhotos: 500
  });

  const readyPhotos = getReadyPhotos();
  const canProceed = readyPhotos.length >= 1 && allPhotosReady && !hasFailedPhotos;

  // Handle "Continue with AI" click - show format selection
  const handleContinueClick = () => {
    setState("format-selection");
  };

  // Handle format selection confirmation
  const handleFormatConfirm = (format: BookFormat) => {
    setBookFormat(format);
    handleStartProcessing();
  };

  // Main processing function using the new pipeline
  const handleStartProcessing = useCallback(async () => {
    setState("processing");
    
    setProcessingStats(prev => updateStats(prev, {
      progress: 0,
      status: 'Starting photo analysis...'
    }));

    try {
      const readyPhotos = getReadyPhotos();
      
      if (readyPhotos.length === 0) {
        toast({
          title: t('toasts.analysisFailed'),
          description: "No photos available for analysis",
          variant: "destructive",
        });
        setState("upload");
        return;
      }

      // Prepare files for the pipeline
      const filesForPipeline = readyPhotos.map(p => ({
        file: p.file,
        dataUrl: p.dataUrl || '',
        metadata: p.metadata
      }));

      // Run the complete pipeline with progress updates
      const result = await runPhotobookPipeline(filesForPipeline, {
        apiUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photos`,
        onProgress: (stage, progress, message) => {
          setProcessingStats(prev => updateStats(prev, {
            progress: Math.round(progress),
            status: message,
            total: filesForPipeline.length,
            unique: stage === 'analyze' ? Math.round(progress / 30 * filesForPipeline.length) : prev.unique,
          }));
        }
      });

      // Store the result
      setPipelineResult(result);
      
      if (result.analysis) {
        setFullAnalysis(result.analysis);
        setAnalysis({
          title: result.analysis.title || "My Photobook",
          pages: result.pages.length,
          photos: result.stats.selected,
          chapters: result.analysis.chapters?.length || 4,
          style: result.analysis.style || "Modern Minimal",
          summary: result.analysis.summary || "A beautiful photobook full of memories.",
        });
      } else {
        // Fallback if AI analysis failed
        setAnalysis({
          title: "My Memories",
          pages: result.pages.length,
          photos: result.stats.selected,
          chapters: 4,
          style: "Modern Minimal",
          summary: "A beautiful photobook full of special moments.",
        });
      }

      setProcessingStats(prev => updateStats(prev, {
        progress: 100,
        status: 'Complete! All photos organized.',
        unique: result.stats.afterDeduplication,
        duplicates: result.stats.totalUploaded - result.stats.afterDeduplication,
        analyzed: result.stats.selected
      }));

      setState("preview");
    } catch (error) {
      console.error("Pipeline error:", error);
      toast({
        title: t('toasts.analysisFailed'),
        description: error instanceof Error ? error.message : "An error occurred during processing",
        variant: "destructive",
      });
      setState("upload");
    }
  }, [getReadyPhotos, t, toast]);

  // Convert pipeline photos to File[] for BookPreview compatibility
  const getPhotosAsFiles = useCallback((): File[] => {
    if (pipelineResult && pipelineResult.photos.length > 0) {
      return pipelineResult.photos.map(p => p.file);
    }
    return getReadyPhotos().map(p => p.file);
  }, [pipelineResult, getReadyPhotos]);


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
                
                {/* Value Proposition - Interactive Trust Builders */}
                <div className="grid shrink-0 gap-4 sm:grid-cols-3">
                  {/* Professional Style */}
                  <HoverCard openDelay={100} closeDelay={200}>
                    <HoverCardTrigger asChild>
                      <div className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 transition-transform group-hover:scale-110">
                          <Palette className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="mb-1 text-sm font-semibold text-foreground">
                          {t('aiCreation.valueProps.professionalStyle.title')}
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {t('aiCreation.valueProps.professionalStyle.description')}
                        </p>
                        <span className="mt-2 inline-flex items-center text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Learn more <ArrowRight className="ml-1 h-3 w-3" />
                        </span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side="top" 
                      align="center" 
                      className="w-80 border-primary/20 bg-card/95 backdrop-blur-sm"
                      sideOffset={8}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-semibold text-foreground">Magazine-Quality Design</h4>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Our AI is trained on professional design principles to ensure your photobook looks stunning.
                        </p>
                        <div className="space-y-2 rounded-lg bg-secondary/50 p-3">
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="text-xs text-foreground">Expert layouts that highlight your best memories</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="text-xs text-foreground">Polished, coffee-table book finish</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="text-xs text-foreground">Smart color matching across pages</span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  
                  {/* Fast Creation */}
                  <HoverCard openDelay={100} closeDelay={200}>
                    <HoverCardTrigger asChild>
                      <div className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 transition-transform group-hover:scale-110">
                          <Clock className="h-5 w-5 text-accent" />
                        </div>
                        <h3 className="mb-1 text-sm font-semibold text-foreground">
                          {t('aiCreation.valueProps.fastCreation.title')}
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {t('aiCreation.valueProps.fastCreation.description')}
                        </p>
                        <span className="mt-2 inline-flex items-center text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                          Learn more <ArrowRight className="ml-1 h-3 w-3" />
                        </span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side="top" 
                      align="center" 
                      className="w-80 border-accent/20 bg-card/95 backdrop-blur-sm"
                      sideOffset={8}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary">
                            <Zap className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-semibold text-foreground">Minutes, Not Hours</h4>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Transform your photos into a beautiful photobook in minutes. Our AI does the heavy lifting so you don't have to.
                        </p>
                        <div className="space-y-2 rounded-lg bg-secondary/50 p-3">
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <span className="text-xs text-foreground">Auto-organizes your photos intelligently</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <span className="text-xs text-foreground">Suggests perfect layouts instantly</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <span className="text-xs text-foreground">Generates captions automatically</span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  
                  {/* Fully Secure */}
                  <HoverCard openDelay={100} closeDelay={200}>
                    <HoverCardTrigger asChild>
                      <div className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10 transition-transform group-hover:scale-110">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="mb-1 text-sm font-semibold text-foreground">
                          {t('aiCreation.valueProps.fullySafe.title')}
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {t('aiCreation.valueProps.fullySafe.description')}
                        </p>
                        <span className="mt-2 inline-flex items-center text-xs text-green-600 opacity-0 transition-opacity group-hover:opacity-100">
                          Learn more <ArrowRight className="ml-1 h-3 w-3" />
                        </span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side="top" 
                      align="center" 
                      className="w-80 border-green-500/20 bg-card/95 backdrop-blur-sm"
                      sideOffset={8}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                            <Lock className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-semibold text-foreground">Your Privacy, Protected</h4>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Your photos are only temporarily scanned to understand layout and placement. They are never stored permanently or shared.
                        </p>
                        <div className="space-y-2 rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            <span className="text-xs text-foreground">Never used for AI training</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            <span className="text-xs text-foreground">Never shared with third parties</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            <span className="text-xs text-foreground">100% GDPR compliant</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            <span className="text-xs text-foreground">Only you can access your data</span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
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


        {state === "processing" && (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="mx-auto max-w-2xl w-full text-center px-6">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                <Camera className="h-10 w-10 animate-pulse text-primary-foreground" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">Processing Your Photos</h2>
              <p className="mb-6 text-muted-foreground">
                {processingStats.status}
              </p>
              
              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-3xl font-bold text-foreground">{processingStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Uploaded</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-3xl font-bold text-primary">{processingStats.unique}</div>
                  <div className="text-sm text-muted-foreground">Unique Photos</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-3xl font-bold text-destructive">{processingStats.duplicates}</div>
                  <div className="text-sm text-muted-foreground">Duplicates Removed</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-3xl font-bold text-accent">{processingStats.analyzed}</div>
                  <div className="text-sm text-muted-foreground">Analyzed by AI</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mx-auto max-w-md">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {processingStats.currentBatch > 0 && processingStats.totalBatches > 0 
                      ? `Batch ${processingStats.currentBatch} of ${processingStats.totalBatches}`
                      : 'Processing...'}
                  </span>
                  <span className="font-medium text-foreground">{processingStats.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${processingStats.progress}%` }}
                  />
                </div>
              </div>
              
              {/* Info Message */}
              {processingStats.analyzed > 0 && processingStats.unique > processingStats.analyzed && (
                <div className="mt-6 rounded-lg bg-primary/10 p-4 text-sm text-primary">
                  <p className="font-medium">Smart Sampling Active</p>
                  <p className="mt-1 text-xs opacity-90">
                    Analyzing {processingStats.analyzed} representative photos to save time and cost.
                    All {processingStats.unique} photos will be included in your final book.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {state === "preview" && bookFormat && (
          <BookPreview 
            analysis={analysis} 
            photos={getPhotosAsFiles()} 
            analyzedPhotos={pipelineResult?.photos.map(p => ({ dataUrl: p.dataUrl!, quality: p.quality })) || []}
            fullAnalysis={fullAnalysis}
            bookFormat={bookFormat}
            generatedPages={pipelineResult?.pages} // Pass the rich layouts from the pipeline!
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