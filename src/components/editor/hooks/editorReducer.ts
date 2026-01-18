import { EditorState, EditorAction, PhotobookPage, PageElement, TextElement, PageBackground, LAYOUT_PRESETS, ImagePrefill, PhotoElement } from '../types';

export const initialState: EditorState = {
  pages: [],
  currentPageIndex: 0,
  selectedElementId: null,
  zoomLevel: 100,
  viewMode: 'single',
  activeTool: 'select',
  showBleedGuides: true,
  showSafeArea: true,
  showGridLines: false,
  recentColors: [],
  past: [],
  future: []
};

// Helper to save current pages to history before a change
const saveHistory = (state: EditorState): EditorState => ({
  ...state,
  past: [...state.past, state.pages],
  future: [] // Clear redo stack on new action
});

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    
    // --- UNDO / REDO ---
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        ...state,
        pages: previous,
        past: newPast,
        future: [state.pages, ...state.future],
        selectedElementId: null // Deselect on undo to avoid ghost selections
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        ...state,
        pages: next,
        past: [...state.past, state.pages],
        future: newFuture,
        selectedElementId: null
      };
    }

    // --- ACTIONS THAT MODIFY CONTENT (Wrapped with saveHistory) ---

    case 'ADD_PAGE': {
      const historyState = saveHistory(state);
      const newPage: PhotobookPage = {
        id: `page-${Date.now()}`,
        elements: [],
        background: { type: 'solid', value: '#FFFFFF' },
        prefills: []
      };
      return { ...historyState, pages: [...historyState.pages, newPage], currentPageIndex: historyState.pages.length, selectedElementId: null };
    }

    case 'DELETE_PAGE': {
      if (state.pages.length <= 1) return state;
      const historyState = saveHistory(state);
      const index = action.payload;
      const newPages = historyState.pages.filter((_, i) => i !== index);
      const newIndex = index >= historyState.currentPageIndex ? Math.max(0, historyState.currentPageIndex - 1) : historyState.currentPageIndex;
      return { ...historyState, pages: newPages, currentPageIndex: newIndex, selectedElementId: null };
    }

    case 'DUPLICATE_PAGE': {
      const historyState = saveHistory(state);
      const index = action.payload;
      const pageToClone = historyState.pages[index];
      if (!pageToClone) return state;
      const newPage = { ...pageToClone, id: `page-${Date.now()}`, elements: pageToClone.elements.map(e => ({...e, id: `${e.id}-copy`})) };
      const newPages = [...historyState.pages];
      newPages.splice(index + 1, 0, newPage);
      return { ...historyState, pages: newPages, currentPageIndex: index + 1 };
    }

    case 'UPDATE_ELEMENT': {
      const historyState = saveHistory(state);
      const { id, changes } = action.payload;
      const newPages = historyState.pages.map((page, index) => {
        if (index !== historyState.currentPageIndex) return page;
        const newElements = page.elements.map(el => el.id === id ? { ...el, ...changes } : el) as PageElement[];
        return { ...page, elements: newElements };
      });
      return { ...historyState, pages: newPages };
    }
    
    case 'DELETE_ELEMENT': {
      const historyState = saveHistory(state);
      const idToDelete = action.payload;
      const newPages = historyState.pages.map(page => ({ ...page, elements: page.elements.filter(el => el.id !== idToDelete) }));
      return { ...historyState, pages: newPages, selectedElementId: null };
    }

    case 'ADD_TEXT': {
      const historyState = saveHistory(state);
      const page = historyState.pages[historyState.currentPageIndex];
      if (!page) return state;
      const newText: TextElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        content: 'Double click to edit',
        x: 35, y: 45, width: 30, height: 10, rotation: 0, zIndex: page.elements.length + 10, opacity: 1,
        fontFamily: 'Inter, sans-serif', fontSize: 32, fontWeight: 'normal', fontStyle: 'normal',
        color: '#1a1a1a', textAlign: 'center', lineHeight: 1.2, textDecoration: 'none', letterSpacing: 0, textTransform: 'none'
      };
      const newPages = [...historyState.pages];
      newPages[historyState.currentPageIndex] = { ...page, elements: [...page.elements, newText] };
      return { ...historyState, pages: newPages, selectedElementId: newText.id, activeTool: 'select' };
    }

    case 'SET_PAGE_BACKGROUND': {
      const historyState = saveHistory(state);
      const { pageIndex, background } = action.payload;
      const newPages = [...historyState.pages];
      if (newPages[pageIndex]) newPages[pageIndex] = { ...newPages[pageIndex], background: background };
      return { ...historyState, pages: newPages };
    }

    case 'APPLY_LAYOUT': {
      const historyState = saveHistory(state);
      const { layoutId } = action.payload;
      const layout = LAYOUT_PRESETS.find(l => l.id === layoutId);
      if (!layout) return state;
      const page = historyState.pages[historyState.currentPageIndex];
      if (!page) return state;
      const currentPhotos = page.elements.filter(el => el.type === 'photo') as PhotoElement[];
      const textElements = page.elements.filter(el => el.type === 'text');
      const newPrefills: ImagePrefill[] = layout.slots.map((slot, index) => ({
        id: `prefill-${Date.now()}-${index}`, slotIndex: index, x: slot.x, y: slot.y, width: slot.width, height: slot.height,
        isEmpty: !currentPhotos[index], photoId: currentPhotos[index]?.id
      }));
      const snappedPhotos = currentPhotos.map((photo, index) => {
        const slot = layout.slots[index];
        if (slot) return { ...photo, x: slot.x, y: slot.y, width: slot.width, height: slot.height, rotation: 0, prefillId: newPrefills[index].id };
        return photo;
      });
      const newPage = { ...page, layoutId: layoutId, elements: [...snappedPhotos, ...textElements] as PageElement[], prefills: newPrefills };
      const newPages = [...historyState.pages];
      newPages[historyState.currentPageIndex] = newPage;
      return { ...historyState, pages: newPages };
    }

    case 'DROP_PHOTO': {
      const historyState = saveHistory(state);
      const { src, x, y } = action.payload;
      const page = historyState.pages[historyState.currentPageIndex];
      if (!page) return state;
      const targetPrefill = page.prefills?.find(p => x >= p.x && x <= (p.x + p.width) && y >= p.y && y <= (p.y + p.height));
      let newElement: PhotoElement;
      let newPrefills = page.prefills || [];
      let newElements = [...page.elements];
      if (targetPrefill) {
        if (!targetPrefill.isEmpty && targetPrefill.photoId) newElements = newElements.filter(el => el.id !== targetPrefill.photoId);
        newElement = {
          id: `photo-${Date.now()}`, type: 'photo', src: src, x: targetPrefill.x, y: targetPrefill.y, width: targetPrefill.width, height: targetPrefill.height,
          rotation: 0, zIndex: 10, opacity: 1, prefillId: targetPrefill.id, imageX: 0, imageY: 0, imageZoom: 1, imageRotation: 0,
          filter: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, blur: 0 }
        };
        newPrefills = newPrefills.map(p => p.id === targetPrefill.id ? { ...p, isEmpty: false, photoId: newElement.id } : p);
      } else {
        newElement = {
          id: `photo-${Date.now()}`, type: 'photo', src: src, x: Math.max(0, Math.min(x - 20, 80)), y: Math.max(0, Math.min(y - 20, 80)), width: 40, height: 40,
          rotation: 0, zIndex: newElements.length + 10, opacity: 1, imageX: 0, imageY: 0, imageZoom: 1, imageRotation: 0,
          filter: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, blur: 0 }
        };
      }
      const newPage = { ...page, elements: [...newElements, newElement], prefills: newPrefills };
      const newPages = [...historyState.pages];
      newPages[historyState.currentPageIndex] = newPage;
      return { ...historyState, pages: newPages };
    }

    // --- NON-HISTORY ACTIONS ---
    
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_PAGE': return { ...state, currentPageIndex: action.payload, selectedElementId: null };
    case 'SET_ZOOM': return { ...state, zoomLevel: action.payload };
    case 'SET_TOOL': return { ...state, activeTool: action.payload };
    case 'SELECT_ELEMENT': {
      const id = action.payload;
      if (!id) return { ...state, selectedElementId: null };
      const pageIndex = state.pages.findIndex(p => p.elements.some(e => e.id === id));
      return { ...state, selectedElementId: id, currentPageIndex: pageIndex !== -1 ? pageIndex : state.currentPageIndex };
    }
    case 'ADD_RECENT_COLOR': {
      const newColor = action.payload;
      const updatedColors = [newColor, ...(state.recentColors || []).filter(c => c !== newColor)].slice(0, 7);
      return { ...state, recentColors: updatedColors };
    }
    case 'TOGGLE_GUIDES':
      if (action.payload === 'bleed') return { ...state, showBleedGuides: !state.showBleedGuides };
      if (action.payload === 'safe') return { ...state, showSafeArea: !state.showSafeArea };
      if (action.payload === 'grid') return { ...state, showGridLines: !state.showGridLines };
      return state;

    default: return state;
  }
}