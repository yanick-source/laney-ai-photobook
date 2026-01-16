import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, BookOpen, Image, Layers, Palette, Loader2, Star, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { savePhotobook, BookFormat } from "@/lib/photobookStorage";
import { PhotoQualityScore } from "@/lib/photoAnalysis";
import { LaneyAnalysis } from "@/lib/smartLayoutEngine";

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
}

export function BookPreview({ analysis, photos, analyzedPhotos, fullAnalysis, bookFormat }: BookPreviewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use analyzed photos if available, otherwise create preview from files
  const previewPhotos = analyzedPhotos 
    ? analyzedPhotos.slice(0, 4).map(p => ({ url: p.dataUrl, quality: p.quality.overall }))
    : photos.slice(0, 4).map(file => ({ url: URL.createObjectURL(file), quality: 70 }));

  // Calculate quality stats
  const avgQuality = analyzedPhotos 
    ? Math.round(analyzedPhotos.reduce((acc, p) => acc + p.quality.overall, 0) / analyzedPhotos.length)
    : 70;

  const handleStartEditing = async () => {
    setIsLoading(true);
    
    try {
      // Use analyzed photos if available (already have dataUrls)
      let photoDataUrls: string[];
      
      if (analyzedPhotos && analyzedPhotos.length > 0) {
        photoDataUrls = analyzedPhotos.map(p => p.dataUrl);
      } else {
        // Fallback: Convert files to data URLs
        photoDataUrls = await Promise.all(
          photos.map((file) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error("Failed to read file"));
              reader.readAsDataURL(file);
            });
          })
        );
      }

      // Prepare photos with quality data for smart cropping
      const photosWithQuality = analyzedPhotos?.map(p => ({
        dataUrl: p.dataUrl,
        quality: p.quality
      }));

      // Store photobook data in IndexedDB with full AI analysis for smart layouts
      await savePhotobook({
        title: analysis.title,
        photos: photoDataUrls,
        photosWithQuality, // Include quality data for smart cropping
        analysis: fullAnalysis || undefined, // Include full AI analysis for smart layout engine
        bookFormat, // Include the selected book format
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
    <div className="mx-auto max-w-4xl">
      {/* Success Message */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t('bookPreview.success')}</h2>
        <p className="mt-2 text-muted-foreground">
          {analyzedPhotos 
            ? (() => {
                console.log('analyzedPhotos.length:', analyzedPhotos.length);
                console.log('translation result:', t('bookPreview.analyzed', { count: analyzedPhotos.length }));
                return t('bookPreview.analyzed', { count: analyzedPhotos.length });
              })()
            : t('bookPreview.ready')}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Book Mockup */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="grid h-full grid-cols-2 grid-rows-2 gap-1 p-2">
              {previewPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={photo.url}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {/* Quality indicator */}
                  <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    {photo.quality}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">
            {t('bookPreview.aiGenerated')}
          </div>
        </div>

        {/* Book Details */}
        <div className="flex flex-col justify-center">
          <h3 className="mb-4 text-2xl font-bold text-foreground">{analysis.title}</h3>
          
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>{analysis.pages} {t('bookPreview.pages')}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Image className="h-5 w-5 text-primary" />
              <span>{analysis.photos} {t('bookPreview.photos')}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Layers className="h-5 w-5 text-primary" />
              <span>{analysis.chapters} {t('bookPreview.chapters')}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Palette className="h-5 w-5 text-primary" />
              <span>{t('bookPreview.style')}: {analysis.style}</span>
            </div>
            {analyzedPhotos && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Star className="h-5 w-5 text-primary" />
                <span>{t('bookPreview.avgQuality')}: {avgQuality}%</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-muted-foreground">
              <Ruler className="h-5 w-5 text-primary" />
              <span>
                {t('bookPreview.format', 'Format')}: {bookFormat.size.charAt(0).toUpperCase() + bookFormat.size.slice(1)} • {bookFormat.orientation.charAt(0).toUpperCase() + bookFormat.orientation.slice(1)}
              </span>
            </div>
          </div>

          <p className="mb-8 text-muted-foreground">{analysis.summary}</p>

          <Button
            size="lg"
            onClick={handleStartEditing}
            disabled={isLoading}
            className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('bookPreview.preparing')}
              </>
            ) : (
              t('bookPreview.startEditing')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
