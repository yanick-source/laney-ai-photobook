import { useState, useCallback } from "react";
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

const aiFeatures = [
  { icon: Camera, label: "Kwaliteit" },
  { icon: MapPin, label: "Locaties" },
  { icon: Heart, label: "Emoties" },
  { icon: Clock, label: "Tijdlijn" },
  { icon: Users, label: "Personen" },
  { icon: Palette, label: "Kleuren" },
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
    <MainLayout>
      <div className="p-6">
        {state === "upload" && (
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                Upload je foto's en laat Laney AI de rest doen
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Maak in minuten een prachtig fotoboek dat je voor altijd bewaart.<br />
                <span className="text-foreground/80">Geen design skills nodig, geen gedoe, alleen mooie herinneringen.</span>
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
                      Professionele stijl
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Ontwerp je fotoboek alsof je met een professionele designer werkt.
                    </p>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      Snelle creatie
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Je fotoboek is klaar in enkele minuten. Geen gedoe, geen ingewikkelde stappen.
                    </p>
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      Volledig veilig
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Je foto's zijn privé, veilig opgeslagen en volledig volgens de AVG wetgeving verwerkt.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* AI Assistant Panel - Right Side */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">AI Assistent</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Onze AI analyseert automatisch:
                </p>
                <div className="mb-6 space-y-3">
                  {aiFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <feature.icon className="h-4 w-4 text-primary" />
                      {feature.label}
                    </div>
                  ))}
                </div>
                
                {/* Status summary */}
                <div className="mb-4 space-y-2">
                  <div className="rounded-lg bg-secondary p-3 text-center">
                    <span className="text-2xl font-bold text-foreground">{readyPhotos.length}</span>
                    <span className="ml-2 text-muted-foreground">foto's klaar</span>
                  </div>
                  
                  {isLoadingPhotos && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      Foto's laden...
                    </div>
                  )}
                  
                  {hasFailedPhotos && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Sommige foto's zijn mislukt
                    </div>
                  )}
                  
                  {allPhotosReady && readyPhotos.length > 0 && !hasFailedPhotos && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Alle foto's geladen!
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleStartProcessing}
                  disabled={!canProceed || isLoadingPhotos}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                >
                  Doorgaan met AI <ArrowRight className="h-4 w-4" />
                </Button>
                
                {!canProceed && readyPhotos.length > 0 && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Wacht tot alle foto's zijn geladen
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
