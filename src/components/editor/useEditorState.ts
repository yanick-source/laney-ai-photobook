import { useState, useCallback, useEffect } from 'react';
import { 
  EditorState, 
  PhotobookPage, 
  PageElement, 
  PhotoElement,
  TextElement,
  HistoryEntry,
  EditorTool,
  LAYOUT_PRESETS,
  PageBackground
} from './types';
import { getPhotobook } from '@/lib/photobookStorage';
import { generateSmartPages, LaneyAnalysis, suggestLayoutForPage } from '@/lib/smartLayoutEngine';

const MAX_HISTORY = 50;

export function useEditorState() {
  const [state, setState] = useState<EditorState>({
    pages: [],
    currentPageIndex: 0,
    selectedElementId: null,
    zoomLevel: 100,
    viewMode: 'single',
    activeTool: 'select',
    showBleedGuides: true,
    showSafeArea: true,
    showGridLines: false
  });

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [allPhotos, setAllPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookTitle, setBookTitle] = useState('Mijn Fotoboek');
  const [analysis, setAnalysis] = useState<LaneyAnalysis | null>(null);

  // Load photobook data and generate smart pages
  useEffect(() => {
    const loadPhotobook = async () => {
      try {
        const data = await getPhotobook();
        if (data) {
          setBookTitle(data.title);
          setAllPhotos(data.photos);
          
          // Store analysis if available
          if (data.analysis) {
            setAnalysis(data.analysis);
          }
          
          // Use smart layout engine if analysis is available
          const pages = data.analysis 
            ? generateSmartPages(data.photos, data.analysis)
            : generatePagesFromPhotos(data.photos, data.title);
          
          setState(prev => ({ ...prev, pages }));
          saveToHistory(pages);
        }
      } catch (error) {
        console.error('Error loading photobook:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPhotobook();
  }, []);

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
      background: { type: 'solid', value: '#FFFFFF' }
    });

    // Generate content pages using various layouts
    const layoutSequence = ['full-bleed', 'two-horizontal', 'four-grid', 'featured', 'two-vertical', 'three-grid'];
    let layoutIndex = 0;
    let pageNumber = 1;

    while (photoIndex < photos.length) {
      const layout = LAYOUT_PRESETS.find(l => l.id === layoutSequence[layoutIndex % layoutSequence.length])!;
      const elements: PageElement[] = [];

      for (const slot of layout.slots) {
        if (photoIndex < photos.length) {
          elements.push(createPhotoElement(
            photos[photoIndex++],
            slot.x,
            slot.y,
            slot.width,
            slot.height,
            elements.length
          ));
        }
      }

      if (elements.length > 0) {
        pages.push({
          id: `page-${pageNumber}`,
          elements,
          background: { 
            type: 'solid', 
            value: pageNumber % 3 === 0 ? '#F8F5F2' : '#FFFFFF' 
          },
          layoutId: layout.id
        });
        pageNumber++;
      }
      layoutIndex++;
    }

    return pages;
  };

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
    cropX: 0,
    cropY: 0,
    cropWidth: 100,
    cropHeight: 100,
    zIndex
  });

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
    fontFamily: 'Playfair Display, serif',
    fontSize: 32,
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 1.4,
    opacity: 1,
    zIndex
  });

  const saveToHistory = useCallback((pages: PhotobookPage[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ pages: JSON.parse(JSON.stringify(pages)), timestamp: Date.now() });
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setState(prev => ({
        ...prev,
        pages: JSON.parse(JSON.stringify(history[newIndex].pages))
      }));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setState(prev => ({
        ...prev,
        pages: JSON.parse(JSON.stringify(history[newIndex].pages))
      }));
    }
  }, [history, historyIndex]);

  const updatePages = useCallback((updater: (pages: PhotobookPage[]) => PhotobookPage[]) => {
    setState(prev => {
      const newPages = updater(prev.pages);
      saveToHistory(newPages);
      return { ...prev, pages: newPages };
    });
  }, [saveToHistory]);

  const replacePage = useCallback((pageIndex: number, nextPage: PhotobookPage) => {
    updatePages(pages => {
      if (!pages[pageIndex]) return pages;
      const newPages = [...pages];
      newPages[pageIndex] = { ...nextPage, id: pages[pageIndex].id };
      return newPages;
    });
  }, [updatePages]);

  const setCurrentPage = useCallback((index: number) => {
    setState(prev => ({ 
      ...prev, 
      currentPageIndex: Math.max(0, Math.min(index, prev.pages.length - 1)),
      selectedElementId: null
    }));
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedElementId: id }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoomLevel: Math.max(25, Math.min(200, zoom)) }));
  }, []);

  const setTool = useCallback((tool: EditorTool) => {
    setState(prev => ({ ...prev, activeTool: tool }));
  }, []);

  const setViewMode = useCallback((mode: 'single' | 'spread') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const updateElement = useCallback((elementId: string, updates: Partial<PageElement>) => {
    updatePages(pages => pages.map(page => ({
      ...page,
      elements: page.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } as PageElement : el
      )
    })));
  }, [updatePages]);

  const deleteElement = useCallback((elementId: string) => {
    updatePages(pages => pages.map(page => ({
      ...page,
      elements: page.elements.filter(el => el.id !== elementId)
    })));
    setState(prev => ({ ...prev, selectedElementId: null }));
  }, [updatePages]);

  const addPhotoToPage = useCallback((photoSrc: string, pageIndex: number, slotIndex?: number) => {
    updatePages(pages => {
      const newPages = [...pages];
      const page = newPages[pageIndex];
      
      // Default position if no slot specified
      let x = 10, y = 10, width = 40, height = 40;
      
      if (slotIndex !== undefined) {
        const layout = LAYOUT_PRESETS.find(l => l.id === page.layoutId);
        if (layout && layout.slots[slotIndex]) {
          const slot = layout.slots[slotIndex];
          x = slot.x;
          y = slot.y;
          width = slot.width;
          height = slot.height;
        }
      }

      const newElement = createPhotoElement(
        photoSrc, x, y, width, height, page.elements.length
      );
      
      newPages[pageIndex] = {
        ...page,
        elements: [...page.elements, newElement]
      };
      
      return newPages;
    });
  }, [updatePages]);

  const addTextToPage = useCallback((pageIndex: number) => {
    updatePages(pages => {
      const newPages = [...pages];
      const page = newPages[pageIndex];
      
      const newElement = createTextElement(
        'Dubbelklik om te bewerken',
        20, 40, 60, 20,
        page.elements.length
      );
      
      newPages[pageIndex] = {
        ...page,
        elements: [...page.elements, newElement]
      };
      
      return newPages;
    });
    setState(prev => ({ ...prev, activeTool: 'select' }));
  }, [updatePages]);

  const setPageBackground = useCallback((pageIndex: number, background: PageBackground) => {
    updatePages(pages => {
      const newPages = [...pages];
      newPages[pageIndex] = { ...newPages[pageIndex], background };
      return newPages;
    });
  }, [updatePages]);

  const applyLayoutToPage = useCallback((pageIndex: number, layoutId: string) => {
    updatePages(pages => {
      const newPages = [...pages];
      const page = newPages[pageIndex];
      const layout = LAYOUT_PRESETS.find(l => l.id === layoutId);
      
      if (!layout) return pages;

      // Get all photo elements
      const photoElements = page.elements.filter(el => el.type === 'photo') as PhotoElement[];
      const textElements = page.elements.filter(el => el.type === 'text');

      // Redistribute photos to new layout slots
      const newPhotoElements: PhotoElement[] = [];
      layout.slots.forEach((slot, i) => {
        if (photoElements[i]) {
          newPhotoElements.push({
            ...photoElements[i],
            x: slot.x,
            y: slot.y,
            width: slot.width,
            height: slot.height,
            zIndex: i
          });
        }
      });

      newPages[pageIndex] = {
        ...page,
        elements: [...newPhotoElements, ...textElements],
        layoutId
      };

      return newPages;
    });
  }, [updatePages]);

  // Smart layout suggestion based on current page
  const suggestSmartLayout = useCallback((pageIndex: number): string => {
    const page = state.pages[pageIndex];
    if (!page) return 'two-horizontal';
    
    const previousLayout = pageIndex > 0 ? state.pages[pageIndex - 1]?.layoutId : null;
    return suggestLayoutForPage(page, previousLayout || null, analysis || undefined);
  }, [state.pages, analysis]);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === 0 || toIndex === 0) return; // Don't move cover
    
    updatePages(pages => {
      const newPages = [...pages];
      const [removed] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, removed);
      return newPages;
    });
    
    // Update current page index if needed
    setState(prev => {
      let newIndex = prev.currentPageIndex;
      if (prev.currentPageIndex === fromIndex) {
        newIndex = toIndex;
      } else if (fromIndex < prev.currentPageIndex && toIndex >= prev.currentPageIndex) {
        newIndex--;
      } else if (fromIndex > prev.currentPageIndex && toIndex <= prev.currentPageIndex) {
        newIndex++;
      }
      return { ...prev, currentPageIndex: newIndex };
    });
  }, [updatePages]);

  const toggleGuides = useCallback((guide: 'bleed' | 'safe' | 'grid') => {
    setState(prev => ({
      ...prev,
      showBleedGuides: guide === 'bleed' ? !prev.showBleedGuides : prev.showBleedGuides,
      showSafeArea: guide === 'safe' ? !prev.showSafeArea : prev.showSafeArea,
      showGridLines: guide === 'grid' ? !prev.showGridLines : prev.showGridLines
    }));
  }, []);

  const currentPage = state.pages[state.currentPageIndex];
  const selectedElement = currentPage?.elements.find(el => el.id === state.selectedElementId);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    state,
    currentPage,
    selectedElement,
    allPhotos,
    bookTitle,
    isLoading,
    canUndo,
    canRedo,
    analysis,
    undo,
    redo,
    setCurrentPage,
    selectElement,
    setZoom,
    setTool,
    setViewMode,
    updateElement,
    deleteElement,
    addPhotoToPage,
    addTextToPage,
    setPageBackground,
    applyLayoutToPage,
    suggestSmartLayout,
    reorderPages,
    toggleGuides,
    replacePage
  };
}
