import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, BookOpen, Image, Layers, Palette, Loader2, Ruler, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { savePhotobook, BookFormat } from "@/lib/photobookStorage";
import { PhotoQualityScore } from "@/lib/photoAnalysis";
import { LaneyAnalysis } from "@/lib/smartLayoutEngine";
import { PhotobookPage } from "@/components/editor/types";

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

interface BookPreviewProps {
  analysis: PhotoAnalysis;
  photos: File[];
  analyzedPhotos?: AnalyzedPhotoData[];
  fullAnalysis?: LaneyAnalysis | null;
  bookFormat: BookFormat;
  generatedPages?: PhotobookPage[]; // Pre-generated rich layouts from the pipeline
}

export function BookPreview({ analysis: initialAnalysis, photos, analyzedPhotos, fullAnalysis, bookFormat, generatedPages }: BookPreviewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(initialAnalysis.title);
  
  // Create analysis object with potentially updated title
  const analysis = { ...initialAnalysis, title: selectedTitle };
  
  // Title options from AI (if available)
  const titleOptions = fullAnalysis?.titleOptions;
  
  // Use analyzed photos if available, otherwise create preview from files
  const previewPhotos = analyzedPhotos 
    ? analyzedPhotos.slice(0, 4).map(p => ({ url: p.dataUrl }))
    : photos.slice(0, 4).map(file => ({ url: URL.createObjectURL(file) }));

  const coverUrl = previewPhotos[0]?.url;

  const handleStartEditing = async () => {
    setIsLoading(true);
    
    try {
      // Use analyzed photos if available (already have dataUrls)
      let photoDataUrls: string[];
      
      if (analyzedPhotos && analyzedPhotos.length > 0) {
        // Convert blob URLs to base64 data URLs for persistent storage
        photoDataUrls = await Promise.all(
          analyzedPhotos.map(async (p) => {
            if (p.dataUrl.startsWith('blob:')) {
              // Convert blob URL to base64
              const response = await fetch(p.dataUrl);
              const blob = await response.blob();
              return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
            }
            return p.dataUrl;
          })
        );
      } else {
        // Fallback: Convert files to data URLs
        photoDataUrls = await Promise.all(
          photos.map((file) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          })
        );
      }

      // Prepare photos with quality data for smart cropping
      const photosWithQuality = analyzedPhotos?.map((p, index) => ({
        dataUrl: photoDataUrls[index], // Use the converted base64 URL
        quality: p.quality
      }));

      // Store photobook data in IndexedDB with full AI analysis AND generated pages
      await savePhotobook({
        title: analysis.title,
        photos: photoDataUrls,
        photosWithQuality, // Include quality data for smart cropping
        analysis: fullAnalysis || undefined, // Include full AI analysis for smart layout engine
        bookFormat, // Include the selected book format
        pages: generatedPages, // CRITICAL: Include pre-generated rich layouts from the pipeline!
        metadata: {
          totalPages: analysis.pages,
          photos: analysis.photos,
          chapters: analysis.chapters,
          style: analysis.style,
          summary: analysis.summary,
        },
      });
      
      navigate("/editor");
    } catch (error) {
      console.error("Error preparing photobook:", error);
      toast({
        title: t('toasts.somethingWrong'),
        description: t('toasts.tryAgainOrLessPhotos'),
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in zoom-in-95 duration-500">
      {/* Success Message */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/20">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t('bookPreview.success')}</h2>
        <p className="mt-2 text-muted-foreground">
          {/* Fix 3: Direct text interpolation for count */}
          {analyzedPhotos 
            ? `${analyzedPhotos.length} photos analyzed and sorted by quality`
            : t('bookPreview.ready')}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Book Mockup */}
        <div className="relative group">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 group-hover:shadow-3xl">
            <div className="relative h-full">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={analysis.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />

              <div className="absolute bottom-6 left-6 right-20">
                <h3 className="text-2xl font-bold text-white drop-shadow-md">
                  {analysis.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/90 drop-shadow-md">
                  {analysis.summary}
                </p>
              </div>

              {/* Fix 2: Cleaner button style (glassmorphism/no blue background) */}
              <button
                type="button"
                onClick={handleStartEditing}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/20 backdrop-blur-md p-4 shadow-lg transition-all hover:bg-white/30 hover:scale-110 disabled:opacity-60 disabled:hover:scale-100 border border-white/40 text-white"
                aria-label={t('bookPreview.startEditing')}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <ChevronRight className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="flex flex-col justify-center">
          <h3 className="mb-4 text-2xl font-bold text-foreground">{analysis.title}</h3>
          
          {/* Title Selection UI - Only show if AI provided options */}
          {titleOptions && (
            <div className="mb-6 p-4 rounded-xl border border-border bg-card/50">
              <p className="text-sm font-medium text-muted-foreground mb-3">Choose your title:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(titleOptions).map(([style, title]) => (
                  <button
                    key={style}
                    onClick={() => setSelectedTitle(title)}
                    className={`relative p-3 text-left rounded-lg border transition-all ${
                      selectedTitle === title
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-accent/5'
                    }`}
                  >
                    <span className="text-sm font-medium text-foreground line-clamp-2">{title}</span>
                    <span className="text-xs text-muted-foreground capitalize mt-1 block">{style}</span>
                    {selectedTitle === title && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg hover:bg-accent/5 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>{analysis.pages} {t('bookPreview.pages')}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg hover:bg-accent/5 transition-colors">
              <Image className="h-5 w-5 text-primary" />
              <span>{analysis.photos} {t('bookPreview.photos')}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg hover:bg-accent/5 transition-colors">
              <Layers className="h-5 w-5 text-primary" />
              <span>{analysis.chapters} {t('bookPreview.chapters')}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg hover:bg-accent/5 transition-colors">
              <Palette className="h-5 w-5 text-primary" />
              <span>{t('bookPreview.style')}: {analysis.style}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground p-2 rounded-lg hover:bg-accent/5 transition-colors">
              <Ruler className="h-5 w-5 text-primary" />
              <span>
                {t('bookPreview.format', 'Format')}: {bookFormat.size.charAt(0).toUpperCase() + bookFormat.size.slice(1)} • {bookFormat.orientation.charAt(0).toUpperCase() + bookFormat.orientation.slice(1)}
              </span>
            </div>
          </div>

          <p className="mb-8 text-muted-foreground leading-relaxed">{analysis.summary}</p>

          {/* Fix 1: Added Start Editing Button */}
          <Button 
            onClick={handleStartEditing} 
            disabled={isLoading}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md transition-all hover:translate-y-[-2px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Editor...
              </>
            ) : (
              <>
                Start Editing Book
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}