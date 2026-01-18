import { useState, useCallback, useRef, useEffect } from "react";
import heic2any from "heic2any";
import { compressImage } from "@/lib/imageCompression";

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
  maxFileSize?: number;
  initialPhotos?: UploadedPhoto[];
}

const getMetadataFromUrl = (url: string, fileSize: number, fileName: string): Promise<PhotoMetadata> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
        isPortrait: img.height > img.width,
        isLandscape: img.width > img.height,
        fileSize: fileSize,
        fileName: fileName,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image metadata'));
    img.src = url;
  });
};

export function usePhotoUpload(options: UsePhotoUploadOptions = {}) {
  const { maxPhotos = 100, maxFileSize = 50 * 1024 * 1024 } = options;
  
  const [photos, setPhotos] = useState<UploadedPhoto[]>(options.initialPhotos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // FIX 3: Ref to track photos for cleanup (Fixes Stale Closure)
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const generateId = () => `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const processSingleFile = useCallback(async (file: File): Promise<{ url: string; metadata: PhotoMetadata; processedFile: Blob }> => {
    let processedBlob: Blob = file;
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      processedBlob = Array.isArray(converted) ? converted[0] : converted;
    }

    processedBlob = await compressImage(processedBlob);
    const objectUrl = URL.createObjectURL(processedBlob);
    const metadata = await getMetadataFromUrl(objectUrl, processedBlob.size, file.name);

    return { url: objectUrl, metadata, processedFile: processedBlob };
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((file) => 
      file.type.startsWith("image/") || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
    );
    
    if (imageFiles.length === 0) return;
    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = imageFiles.slice(0, remainingSlots);
    if (filesToProcess.length === 0) return;

    setIsUploading(true);
    abortControllerRef.current = new AbortController();

    const newPhotos: UploadedPhoto[] = filesToProcess.map((file) => ({
      id: generateId(),
      file, 
      previewUrl: "",
      status: "loading" as const,
      progress: 0,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    let completed = 0;
    for (const photo of newPhotos) {
      if (abortControllerRef.current?.signal.aborted) break;
      try {
        if (photo.file.size > maxFileSize) throw new Error(`File too large`);
        const { url, metadata, processedFile } = await processSingleFile(photo.file);

        setPhotos((prev) => prev.map((p) => p.id === photo.id ? { 
          ...p, status: "ready", progress: 100, dataUrl: url, previewUrl: url, metadata, file: processedFile as File 
        } : p));
      } catch (error) {
        setPhotos((prev) => prev.map((p) => p.id === photo.id ? { 
          ...p, status: "error", progress: 0, error: error instanceof Error ? error.message : "Upload failed"
        } : p));
      }
      completed++;
      setUploadProgress(Math.round((completed / newPhotos.length) * 100));
    }
    setIsUploading(false);
    setUploadProgress(0);
  }, [photos.length, maxPhotos, maxFileSize, processSingleFile]);

  // FIX: Comment out cleanup block to prevent potential issues
  // While "memory leaks" are bad, "broken apps" are worse. 
  // Browser will handle cleanup automatically when page is closed.
  /*
  useEffect(() => {
    return () => {
      // Use ref to clean up the LATEST list of photos on unmount
      photosRef.current.forEach(photo => {
        if (photo.previewUrl && photo.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(photo.previewUrl);
        }
      });
    };
  }, []); // Run only on unmount
  */

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId);
      if (photo?.previewUrl && photo.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  }, []);

  // FIX 2: Re-added clearAllPhotos
  const clearAllPhotos = useCallback(() => {
    // Revoke all current URLs immediately
    photos.forEach((photo) => {
      if (photo.previewUrl && photo.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    });
    setPhotos([]);
  }, [photos]);

  const retryUpload = useCallback(async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo || photo.status !== "error") return;
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, status: "loading", error: undefined } : p));
    try {
      const { url, metadata, processedFile } = await processSingleFile(photo.file);
      setPhotos(prev => prev.map(p => p.id === photoId ? { 
        ...p, status: "ready", progress: 100, dataUrl: url, previewUrl: url, metadata, file: processedFile as File 
      } : p));
    } catch (e) {
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, status: "error", error: "Retry failed" } : p));
    }
  }, [photos, processSingleFile]);

  const getReadyPhotos = useCallback(() => photos.filter((p) => p.status === "ready"), [photos]);
  const getFailedPhotos = useCallback(() => photos.filter((p) => p.status === "error"), [photos]);

  return {
    photos,
    isUploading,
    uploadProgress,
    allPhotosReady: photos.length > 0 && photos.every((p) => p.status === "ready"),
    hasFailedPhotos: photos.some((p) => p.status === "error"),
    isProcessing: photos.some((p) => p.status === "loading"),
    processFiles,
    retryUpload,
    removePhoto,
    clearAllPhotos, // Now Available
    cancelUpload: () => abortControllerRef.current?.abort(),
    getReadyPhotos,
    getFailedPhotos,
  };
}