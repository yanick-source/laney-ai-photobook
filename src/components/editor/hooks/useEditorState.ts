import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { EditorState, PhotobookPage, PageElement, PhotoElement, TextElement, EditorTool, LAYOUT_PRESETS, PageBackground } from '../types';
import { BookFormat } from '@/lib/photobookStorage';
import { suggestLayoutForPage, generatePrefillsFromLayout, LaneyAnalysis } from '@/lib/smartLayoutEngine';
import { createPhotoElement, createTextElement } from '@/lib/editorFactory';

// Sibling hooks (Engine specific)
import { usePhotobookPersistence } from './usePhotobookPersistence';
import { useEditorHistory } from './useEditorHistory';
import { useClipboard } from './useClipboard'; // Ensure this file exists in current folder

// Global hooks (The Toolbox - Fixed Paths)
import { useAutoSave } from '@/hooks/useautosave';
import { useEditorView } from '@/hooks/useEditorView';

export function useEditorState() {
  // --- 1. State ---
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

  const [meta, setMeta] = useState({
    allPhotos: [] as string[],
    isLoading: true,
    bookTitle: 'Mijn Fotoboek',
    analysis: null as LaneyAnalysis | null,
    bookFormat: { size: 'medium', orientation: 'vertical' } as BookFormat,
    photobookId: null as string | null,
    isRestoring: false,
    isDragging: false
  });

  const isSavingRef = useRef(false);

  // --- 2. Core Actions ---
  const updateMeta = useCallback((updates: Partial<typeof meta>) => {
    setMeta(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize from Session Storage
  useEffect(() => {
    const savedId = sessionStorage.getItem('currentPhotobookId');
    if (savedId && !meta.photobookId) {
      updateMeta({ photobookId: savedId });
    }
  }, [meta.photobookId, updateMeta]);

  const updatePages = useCallback((updater: (pages: PhotobookPage[]) => PhotobookPage[]) => {
    setState(prev => ({
      ...prev,
      pages: updater(prev.pages)
    }));
  }, []);

  // --- 3. Sub-Hooks ---
  const { 
    zoomLevel, viewMode, activeTool, 
    showBleedGuides, showSafeArea, showGridLines,
    setZoom, setViewMode, setTool, toggleGuides 
  } = useEditorView({ zoomLevel: 100 }); 

  const history = useEditorHistory({
    onHistoryChange: (pages) => {
      if (!isSavingRef.current) {
        isSavingRef.current = true;
        updateMeta({ isRestoring: true });
        setState(prev => ({ ...prev, pages }));
        setTimeout(() => {
           updateMeta({ isRestoring: false });
           isSavingRef.current = false;
        }, 0);
      }
    }
  });

  const { 
    addPhotosToBook, 
    savePagesToStorage, 
    updateBookTitle, 
    updateBookFormat 
  } = usePhotobookPersistence({
    photobookId: meta.photobookId,
    setBookTitle: (t) => updateMeta({ bookTitle: t }),
    setAllPhotos: (p) => updateMeta({ allPhotos: p }),
    setBookFormat: (f) => updateMeta({ bookFormat: f }),
    setPhotobookId: (id) => updateMeta({ photobookId: id }),
    setAnalysis: (a) => updateMeta({ analysis: a }),
    setState, 
    saveToHistory: history.saveToHistory,
    setIsLoading: (l) => updateMeta({ isLoading: l })
  });

  useAutoSave({
    pages: state.pages,
    photobookId: meta.photobookId,
    isRestoring: meta.isRestoring,
    isDragging: meta.isDragging,
    saveToHistory: history.saveToHistory,
    saveToStorage: savePagesToStorage
  });

  // --- 4. Atomic Page Actions ---
  const addPage = useCallback(() => {
    console.log('[State] addPage called');
    setState(prev => {
      const defaultLayoutId = 'two-horizontal';
      const newPrefills = generatePrefillsFromLayout(defaultLayoutId);
      
      console.log('[State] Creating new page:', {
        layoutId: defaultLayoutId,
        prefillCount: newPrefills.length,
        currentPageCount: prev.pages.length
      });
      
      const newPage: PhotobookPage = {
        id: `page-${Date.now()}`,
        elements: [] as PageElement[],
        background: { type: 'solid', value: '#FFFFFF' },
        layoutId: defaultLayoutId,
        prefills: newPrefills
      };
      const newPages = [...prev.pages, newPage];
      
      console.log('[State] New page created:', {
        pageId: newPage.id,
        newPageCount: newPages.length,
        newCurrentIndex: newPages.length - 1
      });
      
      return {
        ...prev,
        pages: newPages,
        currentPageIndex: newPages.length - 1, 
        selectedElementId: null
      };
    });
  }, []);

  const deletePage = useCallback((index: number) => {
    setState(prev => {
      if (prev.pages.length <= 1) return prev; 
      const newPages = prev.pages.filter((_, i) => i !== index);
      let newIndex = prev.currentPageIndex;
      if (index === prev.currentPageIndex) {
        newIndex = Math.max(0, index - 1);
      } else if (index < prev.currentPageIndex) {
        newIndex--;
      }
      return { ...prev, pages: newPages, currentPageIndex: newIndex, selectedElementId: null };
    });
  }, []);

  const duplicatePage = useCallback((index: number) => {
    setState(prev => {
      const pageToDuplicate = prev.pages[index];
      if (!pageToDuplicate) return prev;
      const newPage: PhotobookPage = {
        ...pageToDuplicate,
        id: `page-${Date.now()}`,
        elements: pageToDuplicate.elements.map(el => ({ ...el, id: `${el.id}-copy-${Date.now()}` }))
      };
      const newPages = [...prev.pages];
      newPages.splice(index + 1, 0, newPage);
      return { ...prev, pages: newPages, currentPageIndex: index + 1 };
    });
  }, []);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === 0 || toIndex === 0) return;
    setState(prev => {
      const newPages = [...prev.pages];
      const [removed] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, removed);
      let newIndex = prev.currentPageIndex;
      if (prev.currentPageIndex === fromIndex) newIndex = toIndex;
      else if (fromIndex < prev.currentPageIndex && toIndex >= prev.currentPageIndex) newIndex--;
      else if (fromIndex > prev.currentPageIndex && toIndex <= prev.currentPageIndex) newIndex++;
      return { ...prev, pages: newPages, currentPageIndex: newIndex };
    });
  }, []);

  // --- 5. Element Actions ---
  const deleteElement = useCallback((id: string) => {
    updatePages(pages => pages.map(page => ({
        ...page,
        elements: page.elements.filter(el => el.id !== id)
    })));
    setState(prev => ({ ...prev, selectedElementId: null }));
  }, [updatePages]);

  const selectElement = useCallback((id: string | null) => {
    console.log('[State] selectElement called with:', id);
    setState(prev => {
      console.log('[State] Setting selectedElementId from', prev.selectedElementId, 'to', id);
      return { ...prev, selectedElementId: id };
    });
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<PageElement>) => {
    updatePages(pages => pages.map(p => ({ 
      ...p, 
      elements: p.elements.map(e => {
        if (e.id !== id) return e;
        // Explicitly handle each type to maintain discriminated union type safety
        if (e.type === 'photo') {
          return { ...e, ...updates } as PhotoElement;
        }
        return { ...e, ...updates } as TextElement;
      })
    })));
  }, [updatePages]);

  // --- 6. Clipboard Actions ---
  const { copyElement, cutElement, pasteElement, clipboard } = useClipboard({
    state,
    setState: setState as any,
    updatePages,
    deleteElement
  });

  // --- 7. Other Actions ---
  const handleDragStart = useCallback(() => updateMeta({ isDragging: true }), [updateMeta]);
  const handleDragEnd = useCallback(() => updateMeta({ isDragging: false }), [updateMeta]);

  const setCurrentPage = useCallback((i: number) => {
    setState(prev => ({ 
      ...prev, 
      currentPageIndex: Math.max(0, Math.min(i, prev.pages.length - 1)), 
      selectedElementId: null 
    }));
  }, []);

  const addPhotoToPage = useCallback((photoSrc: string, pageIndex: number, slotIndex?: number) => {
    updatePages(pages => {
      const page = pages[pageIndex];
      if (!page) return pages;
      const layout = LAYOUT_PRESETS.find(l => l.id === page.layoutId);
      let coords = { x: 10, y: 10, width: 40, height: 40 };
      if (slotIndex !== undefined && layout?.slots[slotIndex]) {
        coords = layout.slots[slotIndex];
      }
      const newElement = createPhotoElement(photoSrc, coords.x, coords.y, coords.width, coords.height, page.elements.length);
      return pages.map((p, i) => i === pageIndex ? { ...p, elements: [...p.elements, newElement] } : p);
    });
  }, [updatePages]);

  const addTextToPage = useCallback((idx: number) => {
    updatePages(pages => pages.map((p, i) => i === idx ? { ...p, elements: [...p.elements, createTextElement('Text', 20, 40, 60, 20, p.elements.length)]} : p));
    setTool('select');
  }, [updatePages, setTool]);

  const setPageBackground = useCallback((pageIndex: number, background: PageBackground) => {
    updatePages(pages => pages.map((p, i) => i === pageIndex ? { ...p, background } : p));
  }, [updatePages]);

  const replacePage = useCallback((pageIndex: number, nextPage: PhotobookPage) => {
    updatePages(pages => pages.map((p, i) => i === pageIndex ? { ...nextPage, id: p.id } : p));
  }, [updatePages]);

  // --- 8. Layout Actions ---
  const applyLayoutToPage = useCallback((pageIndex: number, layoutId: string) => {
    console.log('[State] applyLayoutToPage called:', { pageIndex, layoutId });
    
    updatePages(pages => {
      const page = pages[pageIndex];
      if (!page) {
        console.error('[State] Page not found at index:', pageIndex);
        return pages;
      }
      
      const layout = LAYOUT_PRESETS.find(l => l.id === layoutId);
      if (!layout) {
        console.error('[State] Layout not found:', layoutId);
        return pages;
      }
      
      console.log('[State] Applying layout:', {
        layoutName: layout.name,
        slotCount: layout.slots.length,
        currentElementCount: page.elements.length,
        currentPhotoCount: page.elements.filter(e => e.type === 'photo').length
      });
      
      const newPrefills = generatePrefillsFromLayout(layoutId);
      const photoElements = page.elements.filter(el => el.type === 'photo') as PhotoElement[];
      const textElements = page.elements.filter(el => el.type === 'text');
      const newPhotoElements = newPrefills.map((prefill, i) => {
        if (!photoElements[i]) return null;
        prefill.isEmpty = false;
        prefill.photoId = `photo-layout-${Date.now()}-${i}`;
        return {
          ...photoElements[i],
          id: prefill.photoId,
          x: prefill.x, y: prefill.y, width: prefill.width, height: prefill.height,
          zIndex: i,
          prefillId: prefill.id
        };
      }).filter(Boolean) as PhotoElement[];
      
      const allElements = [...newPhotoElements, ...textElements] as PageElement[];
      
      console.log('[State] Layout applied:', {
        newPrefillCount: newPrefills.length,
        newElementCount: allElements.length
      });
      
      return pages.map((p, i) => i === pageIndex ? { ...p, elements: allElements, prefills: newPrefills, layoutId } : p);
    });
  }, [updatePages]);

  const updatePrefillContent = useCallback((pageIndex: number, prefillId: string, updater: (el: PhotoElement) => PhotoElement) => {
    updatePages(pages => {
      const page = pages[pageIndex];
      if (!page) return pages;
      const newElements = page.elements.map(el => 
        (el.type === 'photo' && (el as PhotoElement).prefillId === prefillId) ? updater(el as PhotoElement) : el
      );
      return pages.map((p, i) => i === pageIndex ? { ...p, elements: newElements } : p);
    });
  }, [updatePages]);

  const dropPhotoIntoPrefill = useCallback((src: string, prefillId: string, pageIndex: number) => {
    console.log('[State] dropPhotoIntoPrefill called:', { prefillId, pageIndex, srcLength: src?.length });
    
    updatePages(pages => {
      const page = pages[pageIndex];
      if (!page) {
        console.error('[State] Page not found at index:', pageIndex);
        return pages;
      }
      
      const prefillIndex = page.prefills?.findIndex(p => p.id === prefillId) ?? -1;
      console.log('[State] Found prefill at index:', prefillIndex, 'of', page.prefills?.length);
      
      if (prefillIndex === -1 || !page.prefills) {
        console.error('[State] Prefill not found:', prefillId);
        return pages;
      }
      
      const prefill = page.prefills[prefillIndex];
      const newEl: PhotoElement = {
        ...createPhotoElement(src, prefill.x, prefill.y, prefill.width, prefill.height, prefillIndex + 10),
        prefillId: prefill.id
      };
      
      console.log('[State] Created new photo element:', { id: newEl.id, prefillId: newEl.prefillId });
      
      const newPrefills = [...page.prefills];
      newPrefills[prefillIndex] = { ...prefill, isEmpty: false, photoId: newEl.id };
      return pages.map((p, i) => i === pageIndex ? { ...p, elements: [...p.elements, newEl], prefills: newPrefills } : p);
    });
  }, [updatePages]);

  const swapPhotosInPrefills = useCallback((srcId: string, targetId: string, pageIndex: number) => {
    updatePages(pages => {
        const page = pages[pageIndex];
        if (!page) return pages;
        const srcEl = page.elements.find(e => e.type === 'photo' && (e as PhotoElement).prefillId === srcId) as PhotoElement;
        const targetEl = page.elements.find(e => e.type === 'photo' && (e as PhotoElement).prefillId === targetId) as PhotoElement;
        if (!srcEl || !targetEl) return pages;
        const newElements = page.elements.map(el => {
            if (el.id === srcEl.id) return { ...el, src: targetEl.src, cropX: 50, cropY: 50, cropZoom: 1 };
            if (el.id === targetEl.id) return { ...el, src: srcEl.src, cropX: 50, cropY: 50, cropZoom: 1 };
            return el;
        }) as PageElement[];
        return pages.map((p, i) => i === pageIndex ? { ...p, elements: newElements } : p);
    });
  }, [updatePages]);

  const removePhotoFromPrefill = useCallback((prefillId: string, pageIndex: number) => {
    updatePages(pages => {
        const page = pages[pageIndex];
        if (!page) return pages;
        const newElements = page.elements.filter(el => el.type !== 'photo' || (el as PhotoElement).prefillId !== prefillId);
        const newPrefills = page.prefills?.map(p => p.id === prefillId ? { ...p, isEmpty: true, photoId: undefined } : p);
        return pages.map((p, i) => i === pageIndex ? { ...p, elements: newElements, prefills: newPrefills } : p);
    });
  }, [updatePages]);

  const replacePhotoInPrefill = useCallback((src: string, pid: string, idx: number) => {
    updatePrefillContent(idx, pid, el => ({ ...el, src, cropX: 50, cropY: 50, cropZoom: 1 }));
  }, [updatePrefillContent]);

  // --- 9. Safe State Export ---
  const currentPage = state.pages[state.currentPageIndex] || null;
  const selectedElement = currentPage?.elements.find(el => el.id === state.selectedElementId) || null;

  const compositeState = useMemo(() => ({
    ...state,
    zoomLevel,
    viewMode,
    activeTool,
    showBleedGuides,
    showSafeArea,
    showGridLines,
    currentPageIndex: state.currentPageIndex,
    selectedElementId: state.selectedElementId,
  }), [state, zoomLevel, viewMode, activeTool, showBleedGuides, showSafeArea, showGridLines]);

  return {
    state: compositeState,
    allPhotos: meta.allPhotos,
    isLoading: meta.isLoading,
    bookTitle: meta.bookTitle,
    analysis: meta.analysis,
    clipboard,
    bookFormat: meta.bookFormat,
    currentPage,
    selectedElement,
    
    // Actions
    setBookTitle: (t: string) => updateMeta({ bookTitle: t }),
    setCurrentPage,
    selectElement,
    setZoom,
    setTool,
    setViewMode,
    toggleGuides,
    updateElement,
    deleteElement,
    addPage,
    deletePage,
    duplicatePage,
    reorderPages,
    replacePage,
    setPageBackground,
    addPhotoToPage,
    addTextToPage,
    applyLayoutToPage,
    dropPhotoIntoPrefill,
    replacePhotoInPrefill,
    swapPhotosInPrefills,
    removePhotoFromPrefill,
    handleDragStart,
    handleDragEnd,
    addPhotosToBook,
    savePagesToStorage,
    updateBookTitle,
    updateBookFormat,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo: history.undo,
    redo: history.redo,
    copyElement,
    cutElement,
    pasteElement,
    
    // View props
    zoomLevel,
    viewMode,
    activeTool,
    showBleedGuides,
    showSafeArea,
    showGridLines
  };
}