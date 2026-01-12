import { useState, useCallback, useRef } from "react";
import heic2any from "heic2any";

export interface UploadedPhoto {
  id: string;
  file: File;
  previewUrl: string;
  status: "loading" | "ready" | "error";
  progress: number;
  dataUrl?: string;
  error?: string;
  metadata?: PhotoMetadata;
}

export interface PhotoMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  isPortrait: boolean;
  isLandscape: boolean;
  fileSize: number;
  fileName: string;
}

interface UsePhotoUploadOptions {
  maxPhotos?: number;
  maxFileSize?: number; // in bytes
  initialPhotos?: UploadedPhoto[];
  onUploadComplete?: (photos: UploadedPhoto[]) => void;
}

const readAsDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(blob);
  });
};

const getMetadataFromDataUrl = (dataUrl: string, file: File): Promise<PhotoMetadata> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
        isPortrait: img.height > img.width,
        isLandscape: img.width > img.height,
        fileSize: file.size,
        fileName: file.name,
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
};

export function usePhotoUpload(options: UsePhotoUploadOptions = {}) {
  const { maxPhotos = 100, maxFileSize = 50 * 1024 * 1024 } = options;
  
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Set initial photos if provided (using useEffect pattern via useState initializer)
  const [initialized] = useState(() => {
    if (options.initialPhotos) {
      setPhotos(options.initialPhotos);
    }
    return true;
  });

  const generateId = () => `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const loadImage = useCallback(async (file: File): Promise<{ dataUrl: string; metadata: PhotoMetadata }> => {
    const lowerName = file.name.toLowerCase();

    let dataUrl: string;
    if (lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8,
      });
      const convertedBlob = Array.isArray(converted) ? converted[0] : converted;
      dataUrl = await readAsDataUrl(convertedBlob as Blob);
    } else {
      dataUrl = await readAsDataUrl(file);
    }

    const metadata = await getMetadataFromDataUrl(dataUrl, file);
    return { dataUrl, metadata };
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((file) => 
      file.type.startsWith("image/") || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
    );
    
    if (imageFiles.length === 0) return;

    // Check max photos limit
    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = imageFiles.slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    setIsUploading(true);
    abortControllerRef.current = new AbortController();

    // Create initial photo entries with loading state
    const newPhotos: UploadedPhoto[] = filesToProcess.map((file) => ({
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "loading" as const,
      progress: 0,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    // Process each file
    let completed = 0;
    
    for (const photo of newPhotos) {
      if (abortControllerRef.current?.signal.aborted) break;

      try {
        // Validate file size
        if (photo.file.size > maxFileSize) {
          throw new Error(`Bestand te groot (max ${maxFileSize / 1024 / 1024}MB)`);
        }

        // Load image and get metadata
        const { dataUrl, metadata } = await loadImage(photo.file);

        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, status: "ready" as const, progress: 100, dataUrl, metadata, previewUrl: dataUrl }
              : p
          )
        );
      } catch (error) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { 
                  ...p, 
                  status: "error" as const, 
                  progress: 0,
                  error: error instanceof Error ? error.message : "Upload mislukt"
                }
              : p
          )
        );
      }

      completed++;
      setUploadProgress(Math.round((completed / newPhotos.length) * 100));
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, [photos.length, maxPhotos, maxFileSize, loadImage]);

  const retryUpload = useCallback(async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo || photo.status !== "error") return;

    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, status: "loading" as const, progress: 0, error: undefined } : p
      )
    );

    try {
      const { dataUrl, metadata } = await loadImage(photo.file);
      
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, status: "ready" as const, progress: 100, dataUrl, metadata, previewUrl: dataUrl } : p
        )
      );
    } catch (error) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, status: "error" as const, error: "Retry mislukt" }
            : p
        )
      );
    }
  }, [photos, loadImage]);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId);
      if (photo?.previewUrl && photo.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  }, []);

  const clearAllPhotos = useCallback(() => {
    photos.forEach((photo) => {
      if (photo.previewUrl && photo.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    });
    setPhotos([]);
  }, [photos]);

  const cancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const getReadyPhotos = useCallback(() => {
    return photos.filter((p) => p.status === "ready");
  }, [photos]);

  const getFailedPhotos = useCallback(() => {
    return photos.filter((p) => p.status === "error");
  }, [photos]);

  const allPhotosReady = photos.length > 0 && photos.every((p) => p.status === "ready");
  const hasFailedPhotos = photos.some((p) => p.status === "error");
  const isProcessing = photos.some((p) => p.status === "loading");

  return {
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
    cancelUpload,
    getReadyPhotos,
    getFailedPhotos,
  };
}
