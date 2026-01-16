import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FolderOpen, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { usePhotoUpload, UploadedPhoto } from '@/hooks/usePhotoUpload';

interface EditorUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosAdded: (photos: string[]) => void;
  existingPhotoCount: number;
}

export function EditorUploadModal({
  isOpen,
  onClose,
  onPhotosAdded,
  existingPhotoCount,
}: EditorUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const {
    photos,
    isUploading,
    uploadProgress,
    allPhotosReady,
    hasFailedPhotos,
    isProcessing,
    processFiles,
    retryUpload,
    removePhoto,
    clearAllPhotos,
    getReadyPhotos,
  } = usePhotoUpload({ maxPhotos: 100 - existingPhotoCount });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const items = e.dataTransfer.items;
      const files: File[] = [];

      // Handle both files and folders
      const processEntry = async (entry: FileSystemEntry): Promise<void> => {
        if (entry.isFile) {
          const file = await new Promise<File>((resolve) => {
            (entry as FileSystemFileEntry).file(resolve);
          });
          if (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
            files.push(file);
          }
        } else if (entry.isDirectory) {
          const dirReader = (entry as FileSystemDirectoryEntry).createReader();
          const entries = await new Promise<FileSystemEntry[]>((resolve) => {
            dirReader.readEntries(resolve);
          });
          for (const subEntry of entries) {
            await processEntry(subEntry);
          }
        }
      };

      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
          await processEntry(entry);
        }
      }

      if (files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        processFiles(files);
      }
      e.target.value = '';
    },
    [processFiles]
  );

  const handleAddPhotos = useCallback(() => {
    const readyPhotos = getReadyPhotos();
    const photoUrls = readyPhotos
      .map((p) => p.dataUrl)
      .filter((url): url is string => !!url);
    
    if (photoUrls.length > 0) {
      onPhotosAdded(photoUrls);
      clearAllPhotos();
      onClose();
    }
  }, [getReadyPhotos, onPhotosAdded, clearAllPhotos, onClose]);

  const handleClose = useCallback(() => {
    clearAllPhotos();
    onClose();
  }, [clearAllPhotos, onClose]);

  const readyCount = photos.filter((p) => p.status === 'ready').length;
  const loadingCount = photos.filter((p) => p.status === 'loading').length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add More Photos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <Upload
              className={cn(
                'mb-4 h-12 w-12 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <p className="mb-2 text-center text-sm font-medium">
              Drag & drop photos or folders here
            </p>
            <p className="mb-4 text-center text-xs text-muted-foreground">
              Supports JPG, PNG, HEIC • Max 50MB per file
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Photos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => folderInputRef.current?.click()}
                disabled={isUploading}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Select Folder
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={folderInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              // @ts-ignore - webkitdirectory is not in the standard types
              webkitdirectory=""
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing photos...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {readyCount} photo{readyCount !== 1 ? 's' : ''} ready
                  {loadingCount > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      ({loadingCount} processing...)
                    </span>
                  )}
                </p>
                {photos.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllPhotos}>
                    Clear all
                  </Button>
                )}
              </div>

              <ScrollArea className="h-48">
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((photo) => (
                    <PhotoPreview
                      key={photo.id}
                      photo={photo}
                      onRemove={() => removePhoto(photo.id)}
                      onRetry={() => retryUpload(photo.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPhotos}
              disabled={readyCount === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Add {readyCount} Photo{readyCount !== 1 ? 's' : ''}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PhotoPreview({
  photo,
  onRemove,
  onRetry,
}: {
  photo: UploadedPhoto;
  onRemove: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
      <img
        src={photo.previewUrl}
        alt=""
        className={cn(
          'h-full w-full object-cover transition-opacity',
          photo.status === 'loading' && 'opacity-50'
        )}
      />

      {/* Status Overlay */}
      {photo.status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}

      {photo.status === 'ready' && (
        <div className="absolute bottom-1 right-1 rounded-full bg-green-500 p-1">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}

      {photo.status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
          <AlertCircle className="mb-1 h-5 w-5 text-red-400" />
          <button
            onClick={onRetry}
            className="text-xs text-white underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="h-3 w-3 text-white" />
      </button>
    </div>
  );
}
