import { useCallback, useEffect } from 'react';
import { getPhotobook, updatePhotobook, BookFormat } from '@/lib/photobookStorage';
import { generateSmartPages, LaneyAnalysis } from '@/lib/smartLayoutEngine';
import { PhotobookPage, PhotoElement, TextElement } from '../types';

interface UsePhotobookPersistenceProps {
  photobookId: string | null;
  setBookTitle: (title: string) => void;
  setAllPhotos: (photos: string[]) => void;
  setBookFormat: (format: BookFormat) => void;
  setPhotobookId: (id: string | null) => void;
  setAnalysis: (analysis: LaneyAnalysis | null) => void;
  setState: (updater: (state: any) => any) => void;
  saveToHistory: (pages: PhotobookPage[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const usePhotobookPersistence = ({
  photobookId,
  setBookTitle,
  setAllPhotos,
  setBookFormat,
  setPhotobookId,
  setAnalysis,
  setState,
  saveToHistory,
  setIsLoading
}: UsePhotobookPersistenceProps) => {
  
  // Auto-save functionality
  const savePagesToStorage = useCallback(async (pages: PhotobookPage[]) => {
    if (!photobookId) return;
    
    try {
      // Trigger save indicator
      window.dispatchEvent(new CustomEvent('autosave'));
      
      await updatePhotobook(photobookId, { pages });
    } catch (error) {
      console.error('Error saving pages to storage:', error);
    }
  }, [photobookId]);

  // Load photobook data and generate smart pages
  const loadPhotobook = useCallback(async () => {
    try {
      const data = await getPhotobook();
      if (data) {
        setBookTitle(data.title);
        setAllPhotos(data.photos);
        setBookFormat(data.bookFormat);
        setPhotobookId(data.id);
        
        // Store analysis if available
        if (data.analysis) {
          setAnalysis(data.analysis);
        }
        
        // Use saved pages if available, otherwise generate new ones
        let pages;
        if (data.pages && data.pages.length > 0) {
          // Restore saved pages
          pages = data.pages;
        } else if (data.analysis) {
          // Generate smart pages from analysis
          pages = generateSmartPages(data.photos, data.analysis, data.photosWithQuality);
        } else {
          // Generate basic pages from photos
          pages = generatePagesFromPhotos(data.photos, data.title);
        }
        
        setState((prev: any) => ({ ...prev, pages }));
        saveToHistory(pages);
      }
    } catch (error) {
      console.error('Error loading photobook:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setBookTitle, setAllPhotos, setBookFormat, setPhotobookId, setAnalysis, setState, saveToHistory, setIsLoading]);

  // Helper function to generate basic pages
  const generatePagesFromPhotos = (photos: string[], title: string): PhotobookPage[] => {
    const pages: PhotobookPage[] = [];
    let photoIndex = 0;

    // Cover page
    pages.push({
      id: 'cover',
      elements: photos[0] ? [
        createPhotoElement(photos[photoIndex++], 0, 0, 100, 100, 0),
        createTextElement(title || 'Mijn Fotoboek', 10, 80, 80, 15, 1)
      ] : [
        createTextElement(title || 'Mijn Fotoboek', 10, 40, 80, 20, 0)
      ],
      layoutId: 'cover',
      background: { type: 'solid', value: '#FFFFFF' }
    });

    // Generate content pages
    while (photoIndex < photos.length) {
      const elements: (PhotoElement | TextElement)[] = [];
      
      // Add 2-3 photos per page
      const photosPerPage = Math.min(3, photos.length - photoIndex + 1);
      for (let i = 0; i < photosPerPage && photoIndex < photos.length; i++) {
        const x = (i % 2) * 50;
        const y = Math.floor(i / 2) * 40;
        elements.push(createPhotoElement(photos[photoIndex++], x, y, 45, 35, i));
      }

      pages.push({
        id: `page-${pages.length}`,
        elements,
        layoutId: 'auto',
        background: { type: 'solid', value: '#FFFFFF' }
      });
    }

    return pages;
  };

  // Helper function to create photo elements
  const createPhotoElement = (
    src: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number,
    zIndex: number
  ): PhotoElement => ({
    id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'photo',
    src,
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex
  });

  // Helper function to create text elements
  const createTextElement = (
    content: string,
    x: number,
    y: number,
    width: number,
    height: number,
    zIndex: number
  ): TextElement => ({
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    content,
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex,
    fontSize: 16,
    fontFamily: 'Arial',
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 1.2,
    opacity: 1
  });

  // Update book title
  const updateBookTitle = useCallback(async (newTitle: string) => {
    setBookTitle(newTitle);
    if (photobookId) {
      try {
        await updatePhotobook(photobookId, { title: newTitle });
      } catch (error) {
        console.error('Error updating book title:', error);
      }
    }
  }, [photobookId, setBookTitle]);

  // Update book format
  const updateBookFormat = useCallback(async (newFormat: BookFormat) => {
    setBookFormat(newFormat);
    if (photobookId) {
      try {
        await updatePhotobook(photobookId, { bookFormat: newFormat });
      } catch (error) {
        console.error('Error updating book format:', error);
      }
    }
  }, [photobookId, setBookFormat]);

  // Add more photos to the photobook
  const addPhotosToBook = useCallback(async (newPhotos: string[]) => {
    setAllPhotos(prev => [...prev, ...newPhotos]);
    
    // Also update in storage
    try {
      const currentPhotobook = await getPhotobook();
      if (currentPhotobook) {
        await updatePhotobook(currentPhotobook.id, { 
          photos: [...currentPhotobook.photos, ...newPhotos] 
        });
      }
    } catch (error) {
      console.error('Error saving new photos:', error);
    }
  }, [setAllPhotos]);

  // Load data on mount
  useEffect(() => {
    loadPhotobook();
  }, [loadPhotobook]);

  return {
    savePagesToStorage,
    updateBookTitle,
    updateBookFormat,
    addPhotosToBook,
    loadPhotobook
  };
};
