import { useState, useCallback } from "react";
import { MainLayout } from "@/components/laney/MainLayout";
import { UploadDropzone } from "@/components/laney/UploadDropzone";
import { AIProgress } from "@/components/laney/AIProgress";
import { BookPreview } from "@/components/laney/BookPreview";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Heart, Users, Palette, Clock, ArrowRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FlowState = "upload" | "processing" | "preview";

interface PhotoAnalysis {
  title: string;
  pages: number;
  photos: number;
  chapters: number;
  style: string;
  summary: string;
}

const aiFeatures = [
  { icon: MapPin, label: "Locaties" },
  { icon: Heart, label: "Emoties" },
  { icon: Clock, label: "Tijdlijn" },
  { icon: Users, label: "Personen" },
  { icon: Palette, label: "Kleuren" },
];

const AICreationFlow = () => {
  const [state, setState] = useState<FlowState>("upload");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<PhotoAnalysis>({
    title: "Mijn Fotoboek",
    pages: 24,
    photos: 0,
    chapters: 4,
    style: "Modern Minimaal",
    summary: "Een prachtig fotoboek vol herinneringen.",
  });
  const { toast } = useToast();

  const handleFilesSelected = useCallback((files: File[]) => {
    setPhotos((prev) => [...prev, ...files]);
  }, []);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzePhotos = async () => {
    try {
      // Convert first 4 photos to base64 for AI analysis
      const imagesToAnalyze = photos.slice(0, 4);
      const base64Images = await Promise.all(
        imagesToAnalyze.map(convertToBase64)
      );

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            images: base64Images,
            photoCount: photos.length,
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
        description: "Er ging iets mis bij het analyseren. Probeer opnieuw.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleStartProcessing = async () => {
    setState("processing");
  };

  const handleProcessingComplete = useCallback(async () => {
    const result = await analyzePhotos();
    if (result) {
      setAnalysis({
        title: result.title,
        pages: result.suggestedPages,
        photos: photos.length,
        chapters: result.chapters?.length || 4,
        style: result.style,
        summary: result.summary,
      });
    } else {
      // Use fallback if AI fails
      setAnalysis({
        title: "Mijn Herinneringen",
        pages: Math.max(16, Math.ceil(photos.length / 2)),
        photos: photos.length,
        chapters: 4,
        style: "Modern Minimaal",
        summary: "Een prachtig fotoboek vol bijzondere momenten.",
      });
    }
    setState("preview");
  }, [photos]);

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen p-6">
        {state === "upload" && (
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground">Upload je foto's</h1>
              <p className="mt-2 text-muted-foreground">
                Laney AI analyseert je foto's en maakt een prachtig fotoboek
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <UploadDropzone
                  onFilesSelected={handleFilesSelected}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                />
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {photos.slice(0, 16).map((photo, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-lg"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {photos.length > 16 && (
                      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                        +{photos.length - 16}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                <div className="mb-4 rounded-lg bg-secondary p-3 text-center">
                  <span className="text-2xl font-bold text-foreground">{photos.length}</span>
                  <span className="ml-2 text-muted-foreground">foto's geselecteerd</span>
                </div>
                <Button
                  onClick={handleStartProcessing}
                  disabled={photos.length === 0}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                >
                  Doorgaan met AI <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {state === "processing" && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <AIProgress onComplete={handleProcessingComplete} isProcessing={true} />
          </div>
        )}

        {state === "preview" && <BookPreview analysis={analysis} photos={photos} />}
      </div>
    </MainLayout>
  );
};

export default AICreationFlow;
