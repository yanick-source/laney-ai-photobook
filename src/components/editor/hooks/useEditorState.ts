import React, { useReducer, useCallback, useEffect, useState } from 'react';
import { editorReducer, initialState } from './editorReducer';
import { usePhotobookPersistence } from './usePhotobookPersistence';
import { PageElement, EditorState, EditorAction, PhotobookPage, PageBackground, BookFormat } from '../types';

export function useEditorState() {
  const [state, dispatch] = useReducer<React.Reducer<EditorState, EditorAction>>(
    editorReducer, 
    initialState
  );
  
  const [meta, setMeta] = useState({ 
    isLoading: true, 
    bookTitle: 'My Book', 
    photobookId: null as string | null,
    allPhotos: [] as string[],
    analysis: null as any,
    bookFormat: { size: 'medium', orientation: 'horizontal' } as BookFormat
  });

  const currentPage = state.pages[state.currentPageIndex] || null;
  const selectedElement = currentPage?.elements.find(el => el.id === state.selectedElementId) || null;

  // --- Actions ---
  const selectElement = useCallback((id: string | null) => dispatch({ type: 'SELECT_ELEMENT', payload: id }), []);
  const updateElement = useCallback((id: string, changes: Partial<PageElement>) => dispatch({ type: 'UPDATE_ELEMENT', payload: { id, changes } }), []);
  const addPage = useCallback(() => dispatch({ type: 'ADD_PAGE' }), []);
  const deletePage = useCallback((index: number) => dispatch({ type: 'DELETE_PAGE', payload: index }), []);
  const duplicatePage = useCallback((index: number) => dispatch({ type: 'DUPLICATE_PAGE', payload: index }), []);
  const setCurrentPage = useCallback((index: number) => dispatch({ type: 'SET_PAGE', payload: index }), []);
  const setZoom = useCallback((zoom: number) => dispatch({ type: 'SET_ZOOM', payload: zoom }), []);
  const setTool = useCallback((tool: any) => dispatch({ type: 'SET_TOOL', payload: tool }), []);
  const toggleGuides = useCallback((type: 'bleed' | 'safe' | 'grid') => dispatch({ type: 'TOGGLE_GUIDES', payload: type }), []);
  const applyLayoutToPage = useCallback((pageIndex: number, layoutId: string) => dispatch({ type: 'APPLY_LAYOUT', payload: { layoutId } }), []);
  const handlePhotoDrop = useCallback((src: string, x: number, y: number) => dispatch({ type: 'DROP_PHOTO', payload: { src, x, y } }), []);
  
  // NEW: Sticker Drop Action
  const handleStickerDrop = useCallback((src: string, x: number, y: number) => {
    dispatch({ type: 'DROP_STICKER', payload: { src, x, y } });
  }, []);

  const addTextToPage = useCallback((textType: 'heading' | 'body' | 'subtitle' = 'heading') => dispatch({ type: 'ADD_TEXT', payload: textType }), []);
  const deleteElement = useCallback((id: string) => dispatch({ type: 'DELETE_ELEMENT', payload: id }), []);
  const duplicateElement = useCallback((id: string) => dispatch({ type: 'DUPLICATE_ELEMENT', payload: id }), []);
  const setPageBackground = useCallback((pageIndex: number, background: PageBackground) => dispatch({ type: 'SET_PAGE_BACKGROUND', payload: { pageIndex, background } }), []);
  const addRecentColor = useCallback((color: string) => dispatch({ type: 'ADD_RECENT_COLOR', payload: color }), []);
  
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const handleSetBookTitle = useCallback((t: string) => setMeta(p => ({...p, bookTitle: t})), []);
  const handleSetPhotobookId = useCallback((id: string | null) => setMeta(p => ({...p, photobookId: id})), []);
  const handleSetAllPhotos = useCallback((photos: string[]) => setMeta(p => ({...p, allPhotos: photos})), []);
  const handleSetIsLoading = useCallback((l: boolean) => setMeta(p => ({...p, isLoading: l})), []);
  const handleSetAnalysis = useCallback((a: any) => setMeta(p => ({...p, analysis: a})), []);
  const handleSetBookFormat = useCallback((f: BookFormat) => setMeta(p => ({...p, bookFormat: f})), []);
  
  const handleSetState = useCallback((updater: any) => {
     const dummyPrev = { pages: [] }; 
     const newState = typeof updater === 'function' ? updater(dummyPrev) : updater;
     if (newState && newState.pages) dispatch({ type: 'SET_STATE', payload: { pages: newState.pages } });
  }, []);

  const persistence = usePhotobookPersistence({
    photobookId: meta.photobookId,
    setBookTitle: handleSetBookTitle,
    setPhotobookId: handleSetPhotobookId,
    setAllPhotos: handleSetAllPhotos,
    setIsLoading: handleSetIsLoading,
    setAnalysis: handleSetAnalysis,
    setState: handleSetState,
    setBookFormat: handleSetBookFormat,
    saveToHistory: () => {}
  });

  useEffect(() => {
    const savedId = sessionStorage.getItem('currentPhotobookId');
    if (savedId && !meta.photobookId) handleSetPhotobookId(savedId);
  }, []);

  const copyElement = useCallback(() => { if (selectedElement) sessionStorage.setItem('clipboard', JSON.stringify(selectedElement)); }, [selectedElement]);
  const pasteElement = useCallback(() => { /* Paste implementation */ }, []);
  const cutElement = useCallback(() => { if (selectedElement) { copyElement(); deleteElement(selectedElement.id); } }, [selectedElement, copyElement, deleteElement]);

  return {
    state,
    dispatch, // Expose dispatch for AI-driven page updates
    currentPage,
    selectedElement,
    isLoading: meta.isLoading,
    bookTitle: meta.bookTitle,
    allPhotos: meta.allPhotos,
    analysis: meta.analysis,
    recentColors: state.recentColors || [],
    bookFormat: meta.bookFormat,
    
    undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0,
    selectElement, updateElement, deleteElement, duplicateElement, addPage, deletePage, duplicatePage, setCurrentPage, setZoom, setTool, toggleGuides, applyLayoutToPage, handlePhotoDrop, handleStickerDrop, addTextToPage, setPageBackground, addRecentColor,
    updateBookTitle: persistence.updateBookTitle,
    addPhotosToBook: persistence.addPhotosToBook,
    updateBookFormat: persistence.updateBookFormat,
    savePagesToStorage: persistence.savePagesToStorage,
    
    zoomLevel: state.zoomLevel,
    viewMode: state.viewMode,
    activeTool: state.activeTool,
    showBleedGuides: state.showBleedGuides,
    showSafeArea: state.showSafeArea,
    showGridLines: state.showGridLines,
    
    setViewMode: () => {},
    handleDragStart: () => {}, 
    handleDragEnd: () => {},
    copyElement, cutElement, pasteElement,
    addPhotoToPage: () => {}, replacePage: () => {}, reorderPages: () => {},
    dropPhotoIntoPrefill: () => {}, replacePhotoInPrefill: () => {},
    swapPhotosInPrefills: () => {}, removePhotoFromPrefill: () => {},
  };
}