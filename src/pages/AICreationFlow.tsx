import { useState, useCallback } from "react";
import { MainLayout } from "@/components/laney/MainLayout";
import { UploadDropzone } from "@/components/laney/UploadDropzone";
import { AIProgress } from "@/components/laney/AIProgress";
import { BookPreview } from "@/components/laney/BookPreview";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Heart, Users, Palette, Clock, ArrowRight, X } from "lucide-react";

type FlowState = "upload" | "processing" | "preview";

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
  const [analysis] = useState({
    title: "Zomer Herinneringen 2024",
    pages: 24,
    photos: 0,
    chapters: 4,
    style: "Modern Minimaal",
    summary: "Een prachtig fotoboek vol zomerse momenten, vakantie-avonturen en familieherinneringen.",
  });

  const handleFilesSelected = useCallback((files: File[]) => {
    setPhotos((prev) => [...prev, ...files]);
  }, []);

  const handleStartProcessing = () => setState("processing");
  const handleProcessingComplete = useCallback(() => setState("preview"), []);
  const removePhoto = (index: number) => setPhotos((prev) => prev.filter((_, i) => i !== index));

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen p-6">
        {state === "upload" && (
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground">Upload je foto's</h1>
              <p className="mt-2 text-muted-foreground">Laney AI analyseert je foto's en maakt een prachtig fotoboek</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <UploadDropzone onFilesSelected={handleFilesSelected} isDragging={isDragging} setIsDragging={setIsDragging} />
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {photos.slice(0, 16).map((photo, index) => (
                      <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
                        <img src={URL.createObjectURL(photo)} alt="" className="h-full w-full object-cover" />
                        <button onClick={() => removePhoto(index)} className="absolute right-1 top-1 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {photos.length > 16 && <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">+{photos.length - 16}</div>}
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">AI Assistent</h3>
                <p className="mb-6 text-sm text-muted-foreground">Onze AI analyseert automatisch:</p>
                <div className="mb-6 space-y-3">
                  {aiFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <feature.icon className="h-4 w-4 text-primary" />
                      {feature.label}
                    </div>
                  ))}
                </div>
                <div className="mb-4 rounded-lg bg-secondary p-3 text-center">
                  <span className="text-2xl font-bold text-foreground">{photos.length}</span>
                  <span className="ml-2 text-muted-foreground">foto's geselecteerd</span>
                </div>
                <Button onClick={handleStartProcessing} disabled={photos.length === 0} className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
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
        {state === "preview" && <BookPreview analysis={{ ...analysis, photos: photos.length }} photos={photos} />}
      </div>
    </MainLayout>
  );
};

export default AICreationFlow;
