// --- ELEMENTS ---

export type ElementType = 'photo' | 'text';

// Shared properties for all elements
export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;      // percentage
  y: number;      // percentage
  width: number;  // percentage
  height: number; // percentage
  rotation: number;
  zIndex: number;
}

export interface PhotoElement extends BaseElement {
  type: 'photo';
  src: string;
  quality?: number;
  
  // Frame/Smart Layout Logic
  prefillId?: string;      // Links to the prefill slot it belongs to
  cropX?: number;          // Pan/crop offset X (0-100, 50 = center)
  cropY?: number;          // Pan/crop offset Y (0-100, 50 = center)
  cropZoom?: number;       // Zoom level (1 = fit, >1 = zoomed in)
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  opacity: number;
}

export type PageElement = PhotoElement | TextElement;

// --- LAYOUTS & PAGES ---

// Smart placeholder that photos snap into
export interface ImagePrefill {
  id: string;
  slotIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  photoId?: string;  // ID of photo element filling this slot
  isEmpty: boolean;
}

export interface PageLayout {
  id: string;
  name: string;
  icon: string;
  slots: LayoutSlot[];
}

export interface LayoutSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageBackground {
  type: 'solid' | 'gradient' | 'image';
  value: string;
  secondaryValue?: string;
  gradientAngle?: number;
}

export interface PhotobookPage {
  id: string;
  elements: PageElement[];
  background: PageBackground;
  layoutId?: string;
  prefills?: ImagePrefill[];
}

// --- EDITOR STATE & TOOLS ---

export type EditorTool = 'select' | 'text' | 'hand';

export interface EditorState {
  pages: PhotobookPage[];
  currentPageIndex: number;
  selectedElementId: string | null;
  zoomLevel: number;
  viewMode: 'single' | 'spread';
  activeTool: EditorTool;
  
  // Guides
  showBleedGuides: boolean;
  showSafeArea: boolean;
  showGridLines: boolean;
}

// --- REDUCER ACTIONS (CRITICAL FOR NEW ARCHITECTURE) ---

// ... (Keep existing interfaces)

// Ensure EditorAction includes APPLY_LAYOUT and DROP_PHOTO
// ... (Previous imports)

// [Previous interfaces remain the same...]

export type EditorAction = 
  | { type: 'SET_STATE'; payload: Partial<EditorState> }
  | { type: 'ADD_PAGE' }
  | { type: 'DELETE_PAGE'; payload: number }
  | { type: 'DUPLICATE_PAGE'; payload: number }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; changes: Partial<PageElement> } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_TOOL'; payload: EditorTool }
  | { type: 'TOGGLE_GUIDES'; payload: 'bleed' | 'safe' | 'grid' }
  | { type: 'APPLY_LAYOUT'; payload: { layoutId: string } }
  | { type: 'DROP_PHOTO'; payload: { src: string; x: number; y: number } }
  | { type: 'ADD_TEXT' }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'SET_PAGE_BACKGROUND'; payload: { pageIndex: number; background: PageBackground } };



// --- CONSTANTS ---

export const LAYOUT_PRESETS: PageLayout[] = [
  {
    id: 'full-bleed',
    name: 'Volledig',
    icon: '◻️',
    slots: [{ x: 0, y: 0, width: 100, height: 100 }]
  },
  {
    id: 'two-horizontal',
    name: 'Twee horizontaal',
    icon: '⬜⬜',
    slots: [
      { x: 2, y: 2, width: 47, height: 96 },
      { x: 51, y: 2, width: 47, height: 96 }
    ]
  },
  {
    id: 'two-vertical',
    name: 'Twee verticaal',
    icon: '⬛',
    slots: [
      { x: 2, y: 2, width: 96, height: 47 },
      { x: 2, y: 51, width: 96, height: 47 }
    ]
  },
  {
    id: 'three-grid',
    name: 'Drie foto\'s',
    icon: '⬜⬜⬜',
    slots: [
      { x: 2, y: 2, width: 47, height: 47 },
      { x: 51, y: 2, width: 47, height: 47 },
      { x: 2, y: 51, width: 96, height: 47 }
    ]
  },
  {
    id: 'four-grid',
    name: 'Collage',
    icon: '⊞',
    slots: [
      { x: 2, y: 2, width: 47, height: 47 },
      { x: 51, y: 2, width: 47, height: 47 },
      { x: 2, y: 51, width: 47, height: 47 },
      { x: 51, y: 51, width: 47, height: 47 }
    ]
  },
  {
    id: 'featured',
    name: 'Uitgelicht',
    icon: '▣',
    slots: [
      { x: 2, y: 2, width: 65, height: 96 },
      { x: 69, y: 2, width: 29, height: 47 },
      { x: 69, y: 51, width: 29, height: 47 }
    ]
  },
  {
    id: 'panorama',
    name: 'Panorama',
    icon: '▬',
    slots: [
      { x: 0, y: 20, width: 100, height: 60 }
    ]
  },
  {
    id: 'corner',
    name: 'Hoek',
    icon: '⌐',
    slots: [
      { x: 5, y: 5, width: 60, height: 60 },
      { x: 68, y: 55, width: 27, height: 40 }
    ]
  }
];

export const BACKGROUND_COLORS = [
  '#FFFFFF', '#F8F5F2', '#FFF5EB', '#F5F5F5', '#EBEBEB',
  '#E6E0D8', '#D4C4B0', '#8B7355', '#4A3728', '#2C1810',
  '#000000', '#1A1A1A', '#333333', '#666666', '#999999'
];

export const FONT_FAMILIES = [
  { name: 'System', value: 'system-ui, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Elegant', value: 'Playfair Display, serif' },
  { name: 'Modern', value: 'Inter, sans-serif' },
  { name: 'Handwritten', value: 'Caveat, cursive' },
  { name: 'Minimal', value: 'DM Sans, sans-serif' }
];
