import { useCallback } from "react";
import { Upload, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

export function UploadDropzone({ onFilesSelected, isDragging, setIsDragging }: UploadDropzoneProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, [setIsDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, setIsDragging]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
      )}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
        <Upload className={cn("h-10 w-10 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")} />
      </div>
      
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        {isDragging ? "Laat los om te uploaden" : "Sleep je foto's hierheen"}
      </h3>
      <p className="mb-6 text-center text-muted-foreground">
        of klik om bestanden te selecteren
      </p>
      
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90">
          <Image className="h-5 w-5" />
          Selecteer foto's
        </span>
      </label>

      <p className="mt-6 text-xs text-muted-foreground">
        Ondersteund: JPG, PNG, GIF, WebP • Max 50MB per bestand
      </p>
    </div>
  );
}
