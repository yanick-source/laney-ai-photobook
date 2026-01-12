import { useCallback, useRef } from "react";
import { Upload, FolderOpen, Image, AlertCircle, X, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadedPhoto } from "@/hooks/usePhotoUpload";

interface EnhancedUploadDropzoneProps {
  photos: UploadedPhoto[];
  isUploading: boolean;
  uploadProgress: number;
  allPhotosReady: boolean;
  hasFailedPhotos: boolean;
  isDragging: boolean;
  onDragChange: (isDragging: boolean) => void;
  onFilesSelected: (files: File[]) => void;
  onRemovePhoto: (id: string) => void;
  onRetryPhoto: (id: string) => void;
  className?: string;
}

export function EnhancedUploadDropzone({
  photos,
  isUploading,
  uploadProgress,
  allPhotosReady,
  hasFailedPhotos,
  isDragging,
  onDragChange,
  onFilesSelected,
  onRemovePhoto,
  onRetryPhoto,
  className,
}: EnhancedUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragChange(true);
  }, [onDragChange]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragChange(false);
  }, [onDragChange]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragChange(false);

    const items = e.dataTransfer.items;
    const files: File[] = [];

    // Handle both files and folders
    if (items) {
      const entries: FileSystemEntry[] = [];
      
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) {
          entries.push(entry);
        }
      }

      // Process entries (files and folders)
      const processEntry = async (entry: FileSystemEntry): Promise<File[]> => {
        if (entry.isFile) {
          return new Promise((resolve) => {
            (entry as FileSystemFileEntry).file((file) => {
              if (file.type.startsWith("image/") || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
                resolve([file]);
              } else {
                resolve([]);
              }
            });
          });
        } else if (entry.isDirectory) {
          const dirReader = (entry as FileSystemDirectoryEntry).createReader();
          return new Promise((resolve) => {
            dirReader.readEntries(async (entries) => {
              const filesInDir: File[] = [];
              for (const e of entries) {
                const subFiles = await processEntry(e);
                filesInDir.push(...subFiles);
              }
              resolve(filesInDir);
            });
          });
        }
        return [];
      };

      for (const entry of entries) {
        const entryFiles = await processEntry(entry);
        files.push(...entryFiles);
      }
    } else {
      // Fallback for browsers that don't support webkitGetAsEntry
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/") || f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif')
      );
      files.push(...droppedFiles);
    }

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onDragChange, onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("image/") || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
    );
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input to allow selecting same files again
    e.target.value = "";
  }, [onFilesSelected]);

  const readyCount = photos.filter((p) => p.status === "ready").length;
  const loadingCount = photos.filter((p) => p.status === "loading").length;
  const errorCount = photos.filter((p) => p.status === "error").length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300",
          photos.length > 0 ? "min-h-[200px]" : "min-h-[350px]",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
        )}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
          <Upload className={cn("h-8 w-8 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {isDragging ? "Laat los om te uploaden" : "Sleep je foto's of map hierheen"}
        </h3>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Ondersteuning voor 30-40+ foto's in één keer
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90">
              <Image className="h-4 w-4" />
              Selecteer foto's
            </span>
          </label>

          <label className="cursor-pointer">
            <input
              ref={folderInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              // @ts-ignore - webkitdirectory is a non-standard attribute
              webkitdirectory=""
              onChange={handleFileInput}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-secondary">
              <FolderOpen className="h-4 w-4" />
              Selecteer map
            </span>
          </label>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          JPG, PNG, HEIC, HEIF, WebP • Max 50MB per bestand
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Foto's laden...</span>
            <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-3">
          {/* Status summary */}
          <div className="flex items-center gap-4 text-sm">
            {readyCount > 0 && (
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {readyCount} geladen
              </span>
            )}
            {loadingCount > 0 && (
              <span className="flex items-center gap-1.5 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                {loadingCount} bezig...
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-1.5 text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errorCount} mislukt
              </span>
            )}
          </div>

          {/* Failed photos warning */}
          {hasFailedPhotos && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Sommige foto's konden niet worden geladen. Klik op de foto om opnieuw te proberen.</span>
            </div>
          )}

          {/* Photo thumbnails */}
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                  photo.status === "ready" && "border-transparent",
                  photo.status === "loading" && "border-primary/50",
                  photo.status === "error" && "border-destructive"
                )}
              >
                <img
                  src={photo.previewUrl}
                  alt=""
                  className={cn(
                    "h-full w-full object-cover transition-opacity",
                    photo.status === "loading" && "opacity-50",
                    photo.status === "error" && "opacity-30"
                  )}
                />

                {/* Loading overlay */}
                {photo.status === "loading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}

                {/* Error overlay */}
                {photo.status === "error" && (
                  <button
                    onClick={() => onRetryPhoto(photo.id)}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="mt-1 text-[10px]">Retry</span>
                  </button>
                )}

                {/* Remove button */}
                <button
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3 text-white" />
                </button>

                {/* Success indicator */}
                {photo.status === "ready" && (
                  <div className="absolute bottom-1 right-1 rounded-full bg-green-500 p-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
