import { Check, BookOpen, Image, Layers, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PhotoAnalysis {
  title: string;
  pages: number;
  photos: number;
  chapters: number;
  style: string;
  summary: string;
}

interface BookPreviewProps {
  analysis: PhotoAnalysis;
  photos: File[];
}

export function BookPreview({ analysis, photos }: BookPreviewProps) {
  // Create preview URLs for first 4 photos
  const previewUrls = photos.slice(0, 4).map((file) => URL.createObjectURL(file));

  return (
    <div className="mx-auto max-w-4xl">
      {/* Success Message */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">AI design voltooid!</h2>
        <p className="mt-2 text-muted-foreground">
          Je fotoboek is klaar om te bewerken
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Book Mockup */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="grid h-full grid-cols-2 grid-rows-2 gap-1 p-2">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">
            AI Gegenereerd
          </div>
        </div>

        {/* Book Details */}
        <div className="flex flex-col justify-center">
          <h3 className="mb-4 text-2xl font-bold text-foreground">{analysis.title}</h3>
          
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>{analysis.pages} pagina's</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Image className="h-5 w-5 text-primary" />
              <span>{analysis.photos} foto's</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Layers className="h-5 w-5 text-primary" />
              <span>{analysis.chapters} hoofdstukken</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Palette className="h-5 w-5 text-primary" />
              <span>Stijl: {analysis.style}</span>
            </div>
          </div>

          <p className="mb-8 text-muted-foreground">{analysis.summary}</p>

          <Link to="/editor">
            <Button
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95"
            >
              Start met bewerken
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
