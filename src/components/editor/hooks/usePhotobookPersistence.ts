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

  // Helper function to create photo elements
  const createPhotoElement = (
    src: string, x: number, y: number, width: number, height: number, zIndex: number
  ): PhotoElement => ({
    id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'photo',
    src, x, y, width, height, rotation: 0, zIndex,
    opacity: 1 // ADDED: Required by PhotoElement type
  });

  // Helper function to create text elements
  const createTextElement = (
    content: string, x: number, y: number, width: number, height: number, zIndex: number
  ): TextElement => ({
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    content, x, y, width, height, rotation: 0, zIndex,
    fontSize: 16, fontFamily: 'Arial', color: '#000000',
    textAlign: 'center', fontWeight: 'normal', fontStyle: 'normal',
    lineHeight: 1.2,
    opacity: 1,           // ADDED: Required property
    textDecoration: 'none', // ADDED: Required property
    letterSpacing: 0,     // ADDED: Required property
    textTransform: 'none' // ADDED: Required property
  });

  // Helper function to generate basic pages
  const generatePagesFromPhotos = (photos: string[], title: string): PhotobookPage[] => {
    const pages: PhotobookPage[] = [];
    let photoIndex = 0;

    // Cover page
    pages.push({
      id: 'cover',
      elements: photos[0] ? [
        createPhotoElement(photos[0], 0, 0, 100, 100, 0),
        createTextElement(title || 'Mijn Fotoboek', 10, 80, 80, 15, 1)
      ] : [
        createTextElement(title || 'Mijn Fotoboek', 10, 40, 80, 20, 0)
      ],
      background: { type: 'solid', value: '#FFFFFF' }
    });
    
    // Skip used cover photo
    if(photos.length > 0) photoIndex = 1;

    // Generate content pages
    while (photoIndex < photos.length) {
      const elements: (PhotoElement | TextElement)[] = [];
      const photosPerPage = Math.min(3, photos.length - photoIndex);
      
      for (let i = 0; i < photosPerPage; i++) {
        const x = (i % 2) * 50;
        const y = Math.floor(i / 2) * 40;
        elements.push(createPhotoElement(photos[photoIndex++], x, y, 45, 35, i));
      }

      pages.push({
        id: `page-${pages.length}`,
        elements,
        background: { type: 'solid', value: '#FFFFFF' }
      });
    }

    return pages; // ADDED: Missing return statement
  };
  
  // Auto-save functionality
  const savePagesToStorage = useCallback(async (pages: PhotobookPage[]) => {
    if (!photobookId) return;
    try {
      window.dispatchEvent(new CustomEvent('autosave'));
      await updatePhotobook(photobookId, { pages });
    } catch (error) {
      console.error('Error saving pages to storage:', error);
    }
  }, [photobookId]);

  // Load photobook data
  const loadPhotobook = useCallback(async () => {
    try {
      let activeId = photobookId;
      if (!activeId) {
        activeId = sessionStorage.getItem('currentPhotobookId');
        if (activeId && activeId !== photobookId) setPhotobookId(activeId);
      }
      
      if (!activeId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await getPhotobook(activeId);
      
      if (data) {
        setBookTitle(data.title);
        setAllPhotos(data.photos);
        
        if (data.bookFormat) {
          setBookFormat(data.bookFormat);
        }
        
        if (data.analysis) setAnalysis(data.analysis);
        
        let pages;
        if (data.pages && data.pages.length > 0) {
          pages = data.pages;
        } else if (data.analysis) {
          pages = generateSmartPages(data.photos, data.analysis, data.photosWithQuality);
        } else {
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
  }, [photobookId, setBookTitle, setAllPhotos, setBookFormat, setPhotobookId, setAnalysis, setState, saveToHistory, setIsLoading]);

  const updateBookTitle = useCallback(async (newTitle: string) => {
    setBookTitle(newTitle);
    if (photobookId) await updatePhotobook(photobookId, { title: newTitle });
  }, [photobookId, setBookTitle]);

  const updateBookFormat = useCallback(async (newFormat: BookFormat) => {
    setBookFormat(newFormat);
    if (photobookId) await updatePhotobook(photobookId, { bookFormat: newFormat });
  }, [photobookId, setBookFormat]);

  const addPhotosToBook = useCallback(async (newPhotos: string[]) => {
    if(!photobookId) return;
    const current = await getPhotobook(photobookId);
    const combined = [...(current?.photos || []), ...newPhotos];
    setAllPhotos(combined);
    await updatePhotobook(photobookId, { photos: combined });
  }, [photobookId, setAllPhotos]);

  useEffect(() => {
    loadPhotobook();
  }, [photobookId]);

  return {
    savePagesToStorage,
    updateBookTitle,
    updateBookFormat,
    addPhotosToBook,
    loadPhotobook
  };
};