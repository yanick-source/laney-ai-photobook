import { useState, useCallback } from "react";
import { MainLayout } from "@/components/laney/MainLayout";
import { EnhancedUploadDropzone } from "@/components/laney/EnhancedUploadDropzone";
import { AIProgress } from "@/components/laney/AIProgress";
import { BookPreview } from "@/components/laney/BookPreview";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, Camera, Shield, Upload, Cpu, BookOpen, Lock } from "lucide-react";
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

const storySteps = [
  {
    step: 1,
    icon: Upload,
    title: "Upload je foto's",
    benefit: "Snel en eenvoudig starten",
  },
  {
    step: 2,
    icon: Cpu,
    title: "Laney ontwerpt je fotoboek",
    benefit: "Automatisch een professioneel ontwerp",
  },
  {
    step: 3,
    icon: BookOpen,
    title: "Klaar om te bestellen",
    benefit: "Direct klaar om te bewaren of cadeau te doen",
  },
];

const AICreationFlow = () => {
  const [state, setState] = useState<FlowState>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [analyzedPhotos, setAnalyzedPhotos] = useState<AnalyzedPhotoData[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<PhotoAnalysis>({
    title: "Mijn Fotoboek",
    pages: 24,
    photos: 0,
    chapters: 4,
    style: "Modern Minimaal",
    summary: "Een prachtig fotoboek vol herinneringen.",
  });
  const [fullAnalysis, setFullAnalysis] = useState<LaneyAnalysis | null>(null);
  const { toast } = useToast();

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
            title: "Even geduld",
            description: "Te veel verzoeken. Probeer het over een minuut opnieuw.",
            variant: "destructive",
          });
          return null;
        }
        if (response.status === 402) {
          toast({
            title: "Credits op",
            description: "Voeg meer AI credits toe in je instellingen.",
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
        title: "Analyse mislukt",
        description: "Er ging iets mis bij het analyseren. We gebruiken standaard instellingen.",
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
        title: "Mijn Herinneringen",
        pages: Math.max(16, Math.ceil(analyzedPhotos.length / 2)),
        photos: analyzedPhotos.length,
        chapters: 4,
        style: "Modern Minimaal",
        summary: "Een prachtig fotoboek vol bijzondere momenten.",
      });
    }
    setState("preview");
  }, [analyzedPhotos]);

  // Convert analyzed photos to File[] for BookPreview compatibility
  const getPhotosAsFiles = (): File[] => {
    // We need to maintain reference to original files
    return getReadyPhotos().map(p => p.file);
  };

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen">
        {state === "upload" && (
          <div className="relative">
            {/* Hero Section with Emotional Appeal */}
            <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-background to-background px-6 pb-12 pt-8">
              {/* Background decorations */}
              <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
              <div className="absolute -left-32 top-32 h-64 w-64 rounded-full bg-gradient-to-tr from-accent/5 to-primary/5 blur-3xl" />
              
              <div className="relative mx-auto max-w-5xl">
                {/* Emotional headline */}
                <div className="mb-10 text-center">
                  <h1 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
                    Upload je foto's en laat Laney AI de rest doen
                  </h1>
                  <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                    Maak in minuten een prachtig fotoboek dat je voor altijd bewaart.<br />
                    <span className="text-foreground/80">Geen design skills nodig, geen gedoe, alleen mooie herinneringen.</span>
                  </p>
                </div>

                {/* Enhanced Upload Area - Hero Moment */}
                <div className="relative mx-auto max-w-3xl">
                  {/* Animated glow border */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary via-accent to-primary opacity-20 blur-lg animate-pulse" />
                  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-30" />
                  
                  {/* Upload component with enhanced styling */}
                  <div className="relative rounded-3xl bg-card p-2">
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
                      className="rounded-2xl"
                    />
                  </div>

                  {/* Reassuring line under upload */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Laney maakt automatisch een professioneel ontworpen fotoboek van jouw foto's
                    </span>
                  </div>

                  {/* Trust signals - directly under upload */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>AVG proof en veilig opgeslagen</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>Alleen jij ziet je foto's</span>
                    </div>
                  </div>
                </div>

                {/* Status & CTA when photos are uploaded */}
                {photos.length > 0 && (
                  <div className="mx-auto mt-8 max-w-md">
                    <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-foreground">{readyPhotos.length}</span>
                          <span className="text-muted-foreground">foto's klaar</span>
                        </div>
                        {isLoadingPhotos && (
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                            Laden...
                          </div>
                        )}
                        {hasFailedPhotos && (
                          <div className="flex items-center gap-1 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            Mislukt
                          </div>
                        )}
                        {allPhotosReady && !hasFailedPhotos && readyPhotos.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Klaar!
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={handleStartProcessing}
                        disabled={!canProceed || isLoadingPhotos}
                        size="lg"
                        className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
                      >
                        <Sparkles className="h-5 w-5" />
                        Start met creëren
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                      {!canProceed && readyPhotos.length > 0 && (
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                          Wacht tot alle foto's zijn geladen
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Story Flow - Journey Steps */}
            <div className="border-t border-border bg-secondary/30 px-6 py-16">
              <div className="mx-auto max-w-4xl">
                <h2 className="mb-12 text-center text-2xl font-bold text-foreground">
                  Zo werkt het
                </h2>
                <div className="relative flex flex-col items-center gap-8 md:flex-row md:justify-between md:gap-4">
                  {/* Connection line for desktop */}
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-2/3 -translate-x-1/2 bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block" />
                  
                  {storySteps.map((step, index) => (
                    <div key={step.step} className="relative z-10 flex flex-col items-center text-center">
                      {/* Step number badge */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                        {step.step}
                      </div>
                      
                      {/* Icon container with animation */}
                      <div className="group mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                        <div className="relative">
                          <step.icon className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />
                          {index === 0 && (
                            <Sparkles className="absolute -right-1 -top-1 h-4 w-4 animate-pulse text-accent" />
                          )}
                        </div>
                      </div>
                      
                      <h3 className="mb-1 text-base font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="max-w-[180px] text-sm text-muted-foreground">
                        {step.benefit}
                      </p>
                    </div>
                  ))}
                </div>
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
              <h2 className="mb-2 text-2xl font-bold text-foreground">Foto's analyseren</h2>
              <p className="mb-6 text-muted-foreground">
                AI analyseert kwaliteit, compositie en inhoud van {readyPhotos.length} foto's
              </p>
              <div className="mx-auto max-w-xs">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Voortgang</span>
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
