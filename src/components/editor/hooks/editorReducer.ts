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
  showGridLines: false
};

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };

    case 'ADD_PAGE': {
      const newPage: PhotobookPage = {
        id: `page-${Date.now()}`,
        elements: [],
        background: { type: 'solid', value: '#FFFFFF' },
        prefills: []
      };
      return {
        ...state,
        pages: [...state.pages, newPage],
        currentPageIndex: state.pages.length, // Go to new page
        selectedElementId: null
      };
    }

    case 'DELETE_PAGE': {
      if (state.pages.length <= 1) return state;
      const index = action.payload;
      const newPages = state.pages.filter((_, i) => i !== index);
      const newIndex = index >= state.currentPageIndex ? Math.max(0, state.currentPageIndex - 1) : state.currentPageIndex;
      return { ...state, pages: newPages, currentPageIndex: newIndex, selectedElementId: null };
    }

    case 'DUPLICATE_PAGE': {
      const index = action.payload;
      const pageToClone = state.pages[index];
      if (!pageToClone) return state;
      
      const newPage = {
        ...pageToClone,
        id: `page-${Date.now()}`,
        elements: pageToClone.elements.map(e => ({...e, id: `${e.id}-copy`}))
      };
      
      const newPages = [...state.pages];
      newPages.splice(index + 1, 0, newPage);
      return { ...state, pages: newPages, currentPageIndex: index + 1 };
    }

    case 'SELECT_ELEMENT': {
      const id = action.payload;
      if (!id) return { ...state, selectedElementId: null };
      
      const pageIndex = state.pages.findIndex(p => p.elements.some(e => e.id === id));
      return {
        ...state,
        selectedElementId: id,
        currentPageIndex: pageIndex !== -1 ? pageIndex : state.currentPageIndex
      };
    }

    case 'UPDATE_ELEMENT': {
      const { id, changes } = action.payload;
      const newPages = state.pages.map((page, index) => {
        if (index !== state.currentPageIndex) return page;
        
        const newElements = page.elements.map(el => 
          el.id === id ? { ...el, ...changes } : el
        ) as PageElement[];

        return { ...page, elements: newElements };
      });
      return { ...state, pages: newPages };
    }
    
    // ACTION: Deletes an element by ID
    case 'DELETE_ELEMENT': {
      const idToDelete = action.payload;
      const newPages = state.pages.map(page => ({
        ...page,
        elements: page.elements.filter(el => el.id !== idToDelete)
      }));
      return { ...state, pages: newPages, selectedElementId: null };
    }

    // ACTION: Adds a text box to the center of the page
    case 'ADD_TEXT': {
      const page = state.pages[state.currentPageIndex];
      if (!page) return state;

      const newText: TextElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        content: 'Double click to edit',
        x: 35, // Centered roughly
        y: 45, 
        width: 30,
        height: 10,
        rotation: 0,
        zIndex: page.elements.length + 10,
        fontFamily: 'sans-serif',
        fontSize: 24,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        textAlign: 'center',
        lineHeight: 1.2,
        opacity: 1
      };

      const newPages = [...state.pages];
      newPages[state.currentPageIndex] = {
        ...page,
        elements: [...page.elements, newText]
      };

      return {
        ...state,
        pages: newPages,
        selectedElementId: newText.id,
        activeTool: 'select'
      };
    }

    case 'SET_PAGE':
      return { ...state, currentPageIndex: action.payload, selectedElementId: null };

    case 'SET_ZOOM':
      return { ...state, zoomLevel: action.payload };
      
    case 'SET_TOOL':
      return { ...state, activeTool: action.payload };
      
    case 'TOGGLE_GUIDES':
      if (action.payload === 'bleed') return { ...state, showBleedGuides: !state.showBleedGuides };
      if (action.payload === 'safe') return { ...state, showSafeArea: !state.showSafeArea };
      if (action.payload === 'grid') return { ...state, showGridLines: !state.showGridLines };
      return state;

    // ACTION: Updates the background of a specific page
    case 'SET_PAGE_BACKGROUND': {
      const { pageIndex, background } = action.payload;
      const newPages = [...state.pages];
      
      if (newPages[pageIndex]) {
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          background: background
        };
      }
      return { ...state, pages: newPages };
    }

    // ACTION: Applies a layout template -> Generates Prefills (Smart Frames)
    case 'APPLY_LAYOUT': {
      const { layoutId } = action.payload;
      const layout = LAYOUT_PRESETS.find(l => l.id === layoutId);
      if (!layout) return state;
      
      const page = state.pages[state.currentPageIndex];
      if (!page) return state;

      const currentPhotos = page.elements.filter(el => el.type === 'photo') as PhotoElement[];
      const textElements = page.elements.filter(el => el.type === 'text');

      // 1. Generate Prefills (The Empty Slots)
      const newPrefills: ImagePrefill[] = layout.slots.map((slot, index) => ({
        id: `prefill-${Date.now()}-${index}`,
        slotIndex: index,
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
        isEmpty: !currentPhotos[index], // Empty if no photo exists for this slot
        photoId: currentPhotos[index]?.id
      }));

      // 2. Snap existing photos to the new slots
      const snappedPhotos = currentPhotos.map((photo, index) => {
        const slot = layout.slots[index];
        if (slot) {
          return {
            ...photo,
            x: slot.x,
            y: slot.y,
            width: slot.width,
            height: slot.height,
            rotation: 0,
            prefillId: newPrefills[index].id
          };
        }
        return photo; // Keep floating if no slot matches
      });

      const newPage = {
        ...page,
        layoutId: layoutId,
        elements: [...snappedPhotos, ...textElements] as PageElement[],
        prefills: newPrefills
      };

      const newPages = [...state.pages];
      newPages[state.currentPageIndex] = newPage;

      return { ...state, pages: newPages };
    }

    // ACTION: Handles Drag & Drop logic (Hit testing against Prefills)
    case 'DROP_PHOTO': {
      const { src, x, y } = action.payload;
      const page = state.pages[state.currentPageIndex];
      if (!page) return state;

      // 1. Check if dropped onto a Prefill (Slot)
      const targetPrefill = page.prefills?.find(p => 
        x >= p.x && x <= (p.x + p.width) &&
        y >= p.y && y <= (p.y + p.height)
      );

      let newElement: PhotoElement;
      let newPrefills = page.prefills || [];
      let newElements = [...page.elements];

      if (targetPrefill) {
        // HIT! Replace content in this slot
        
        // Remove old photo if it exists in this slot
        if (!targetPrefill.isEmpty && targetPrefill.photoId) {
          newElements = newElements.filter(el => el.id !== targetPrefill.photoId);
        }

        // Create new photo snapped to frame
        newElement = {
          id: `photo-${Date.now()}`,
          type: 'photo',
          src: src,
          x: targetPrefill.x,
          y: targetPrefill.y,
          width: targetPrefill.width,
          height: targetPrefill.height,
          rotation: 0,
          zIndex: 10,
          prefillId: targetPrefill.id
        };

        // Update prefill status
        newPrefills = newPrefills.map(p => p.id === targetPrefill.id ? { ...p, isEmpty: false, photoId: newElement.id } : p);

      } else {
        // MISS! Drop as free-floating image
        newElement = {
          id: `photo-${Date.now()}`,
          type: 'photo',
          src: src,
          x: Math.max(0, Math.min(x - 20, 80)), // Center on mouse
          y: Math.max(0, Math.min(y - 20, 80)),
          width: 40,
          height: 40,
          rotation: 0,
          zIndex: newElements.length + 10
        };
      }

      const newPage = {
        ...page,
        elements: [...newElements, newElement],
        prefills: newPrefills
      };

      const newPages = [...state.pages];
      newPages[state.currentPageIndex] = newPage;

      return { ...state, pages: newPages };
    }

    default:
      return state;
  }
}