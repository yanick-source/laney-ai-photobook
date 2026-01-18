// --- ELEMENTS ---

export type ElementType = 'photo' | 'text';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number; 
}

export interface PhotoElement extends BaseElement {
  type: 'photo';
  src: string;
  quality?: number;
  prefillId?: string;
  imageX?: number;      
  imageY?: number;      
  imageZoom?: number;   
  imageRotation?: number; 
  filter?: {
    brightness: number;
    contrast: number;
    saturation: number;
    sepia: number;
    blur: number;
  };
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  textDecoration: 'none' | 'underline' | 'line-through';
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export type PageElement = PhotoElement | TextElement;

// --- BOOK FORMAT ---
// FIXED: Matched these types with BookFormatPopup.tsx
export type BookSize = 'small' | 'medium' | 'large';
export type BookOrientation = 'vertical' | 'horizontal';

export interface BookFormat {
  size: BookSize;
  orientation: BookOrientation;
}

// --- LAYOUTS & PAGES ---

export interface ImagePrefill {
  id: string;
  slotIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  photoId?: string;
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

// --- EDITOR STATE ---

export type EditorTool = 'select' | 'text' | 'hand';

export interface EditorState {
  pages: PhotobookPage[];
  currentPageIndex: number;
  selectedElementId: string | null;
  zoomLevel: number;
  viewMode: 'single' | 'spread';
  activeTool: EditorTool;
  showBleedGuides: boolean;
  showSafeArea: boolean;
  showGridLines: boolean;
  recentColors: string[];
  past: PhotobookPage[][];
  future: PhotobookPage[][];
}

// --- ACTIONS ---

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
  | { type: 'SET_PAGE_BACKGROUND'; payload: { pageIndex: number; background: PageBackground } }
  | { type: 'ADD_RECENT_COLOR'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

// --- CONSTANTS ---

export const LAYOUT_PRESETS: PageLayout[] = [
  {
    id: 'full-bleed',
    name: 'Full',
    icon: '◻️',
    slots: [{ x: 0, y: 0, width: 100, height: 100 }]
  },
  {
    id: 'two-horizontal',
    name: '2 Horizontal',
    icon: '⬜⬜',
    slots: [
      { x: 2, y: 2, width: 47, height: 96 },
      { x: 51, y: 2, width: 47, height: 96 }
    ]
  },
  {
    id: 'two-vertical',
    name: '2 Vertical',
    icon: '⬛',
    slots: [
      { x: 2, y: 2, width: 96, height: 47 },
      { x: 2, y: 51, width: 96, height: 47 }
    ]
  },
  {
    id: 'four-grid',
    name: 'Grid',
    icon: '⊞',
    slots: [
      { x: 2, y: 2, width: 47, height: 47 },
      { x: 51, y: 2, width: 47, height: 47 },
      { x: 2, y: 51, width: 47, height: 47 },
      { x: 51, y: 51, width: 47, height: 47 }
    ]
  }
];

export const FONT_FAMILIES = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Playfair', value: 'Playfair Display, serif' },
  { name: 'Caveat', value: 'Caveat, cursive' },
  { name: 'Mono', value: 'monospace' },
  { name: 'System', value: 'system-ui, sans-serif' }
];

export const COLORS = [
  '#000000', '#FFFFFF', '#333333', '#666666',
  '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#D946EF', '#F43F5E'
];