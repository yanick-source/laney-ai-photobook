import React, { useReducer, useCallback, useEffect, useState } from 'react';
import { editorReducer, initialState } from './editorReducer';
import { usePhotobookPersistence } from './usePhotobookPersistence';
import { PageElement, EditorState, EditorAction, PhotobookPage, PageBackground } from '../types';

export function useEditorState() {
  // Explicitly type the reducer to fix "0 arguments" errors
  const [state, dispatch] = useReducer<React.Reducer<EditorState, EditorAction>>(
    editorReducer, 
    initialState
  );
  
  const [meta, setMeta] = useState({ 
    isLoading: true, 
    bookTitle: 'My Book', 
    photobookId: null as string | null,
    allPhotos: [] as string[],
    analysis: null as any
  });

  // --- Derived State ---
  const currentPage = state.pages[state.currentPageIndex] || null;
  const selectedElement = currentPage?.elements.find(el => el.id === state.selectedElementId) || null;

  // --- Actions ---
  const selectElement = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', payload: id });
  }, []);

  const updateElement = useCallback((id: string, changes: Partial<PageElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id, changes } });
  }, []);

  const addPage = useCallback(() => {
    dispatch({ type: 'ADD_PAGE' });
  }, []);

  const deletePage = useCallback((index: number) => {
    dispatch({ type: 'DELETE_PAGE', payload: index });
  }, []);

  const duplicatePage = useCallback((index: number) => {
    dispatch({ type: 'DUPLICATE_PAGE', payload: index });
  }, []);

  const setCurrentPage = useCallback((index: number) => {
    dispatch({ type: 'SET_PAGE', payload: index });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);
  
  const setTool = useCallback((tool: any) => {
    dispatch({ type: 'SET_TOOL', payload: tool });
  }, []);
  
  const toggleGuides = useCallback((type: 'bleed' | 'safe' | 'grid') => {
    dispatch({ type: 'TOGGLE_GUIDES', payload: type });
  }, []);

  const applyLayoutToPage = useCallback((pageIndex: number, layoutId: string) => {
    dispatch({ type: 'APPLY_LAYOUT', payload: { layoutId } });
  }, []);

  const handlePhotoDrop = useCallback((src: string, x: number, y: number) => {
    dispatch({ type: 'DROP_PHOTO', payload: { src, x, y } });
  }, []);

  const addTextToPage = useCallback(() => {
    dispatch({ type: 'ADD_TEXT' });
  }, []);

  const deleteElement = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ELEMENT', payload: id });
  }, []);

  // NEW: The missing background function required by the UI
  const setPageBackground = useCallback((pageIndex: number, background: PageBackground) => {
    dispatch({ type: 'SET_PAGE_BACKGROUND', payload: { pageIndex, background } });
  }, []);

  // --- Persistence Handlers (Stable) ---
  const handleSetBookTitle = useCallback((t: string) => setMeta(p => ({...p, bookTitle: t})), []);
  const handleSetPhotobookId = useCallback((id: string | null) => setMeta(p => ({...p, photobookId: id})), []);
  const handleSetAllPhotos = useCallback((photos: string[]) => setMeta(p => ({...p, allPhotos: photos})), []);
  const handleSetIsLoading = useCallback((l: boolean) => setMeta(p => ({...p, isLoading: l})), []);
  const handleSetAnalysis = useCallback((a: any) => setMeta(p => ({...p, analysis: a})), []);

  const handleSetState = useCallback((updater: any) => {
     const dummyPrev = { pages: [] }; 
     const newState = typeof updater === 'function' ? updater(dummyPrev) : updater;
     
     if (newState && newState.pages) {
       dispatch({ type: 'SET_STATE', payload: { pages: newState.pages } });
     }
  }, []);

  // --- Persistence Integration ---
  const persistence = usePhotobookPersistence({
    photobookId: meta.photobookId,
    setBookTitle: handleSetBookTitle,
    setPhotobookId: handleSetPhotobookId,
    setAllPhotos: handleSetAllPhotos,
    setIsLoading: handleSetIsLoading,
    setAnalysis: handleSetAnalysis,
    setState: handleSetState,
    setBookFormat: () => {}, 
    saveToHistory: () => {}
  });

  // Hydrate from SessionStorage
  useEffect(() => {
    const savedId = sessionStorage.getItem('currentPhotobookId');
    if (savedId && !meta.photobookId) {
      handleSetPhotobookId(savedId);
    }
  }, []);

  return {
    state,
    currentPage,
    selectedElement,
    isLoading: meta.isLoading,
    bookTitle: meta.bookTitle,
    allPhotos: meta.allPhotos,
    analysis: meta.analysis,
    
    // Actions
    selectElement,
    updateElement,
    deleteElement,
    addPage,
    deletePage,
    duplicatePage,
    setCurrentPage,
    setZoom,
    setTool,
    toggleGuides,
    applyLayoutToPage,
    handlePhotoDrop,
    addTextToPage,
    setPageBackground,
    
    // Persistence Helpers (Now exposed to fix errors)
    updateBookTitle: persistence.updateBookTitle,
    addPhotosToBook: persistence.addPhotosToBook,
    updateBookFormat: persistence.updateBookFormat,
    savePagesToStorage: persistence.savePagesToStorage,
    
    // View Props
    zoomLevel: state.zoomLevel,
    viewMode: state.viewMode,
    activeTool: state.activeTool,
    showBleedGuides: state.showBleedGuides,
    showSafeArea: state.showSafeArea,
    showGridLines: state.showGridLines,
    
    // Legacy/Stub Props
    setViewMode: () => {},
    handleDragStart: () => {}, 
    handleDragEnd: () => {},
    
    // Stubs
    undo: () => {}, redo: () => {}, canUndo: false, canRedo: false,
    copyElement: () => {}, cutElement: () => {}, pasteElement: () => {},
    addPhotoToPage: () => {}, // Handled by drop
    replacePage: (idx: number, page: PhotobookPage) => {}, // Stub for AI
    reorderPages: (from: number, to: number) => {},
    dropPhotoIntoPrefill: (src: string, id: string, idx: number) => {}, // Handled by reducer now
    replacePhotoInPrefill: () => {},
    swapPhotosInPrefills: () => {},
    removePhotoFromPrefill: () => {},
    bookFormat: { size: 'medium', orientation: 'vertical' } // Stub
  };
}