import { useEffect, useRef } from 'react';
import type { PhotobookPage } from '@/components/editor/types';

interface UseAutoSaveProps {
  pages: PhotobookPage[];
  photobookId: string | null;
  isRestoring: boolean;
  isDragging: boolean;
  saveToHistory: (pages: PhotobookPage[]) => void;
  saveToStorage: (pages: PhotobookPage[]) => Promise<void>;
}

export function useAutoSave({ 
  pages, 
  photobookId, 
  isRestoring, 
  isDragging, 
  saveToHistory, 
  saveToStorage 
}: UseAutoSaveProps) {
  const isPersistingRef = useRef(false);

  useEffect(() => {
    // 1. Safety Checks: Don't save if invalid, restoring, or user is dragging
    if (!photobookId || pages.length === 0 || isRestoring || isDragging) return;

    const timeoutId = setTimeout(async () => {
      // 2. Mutex Lock: Prevent overlapping writes
      if (isPersistingRef.current) return;
      
      isPersistingRef.current = true;
      try {
        saveToHistory(pages);
        await saveToStorage(pages);
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        isPersistingRef.current = false;
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [pages, photobookId, isRestoring, isDragging, saveToHistory, saveToStorage]);
}