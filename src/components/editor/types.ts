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
  // Crop controls (used by FloatingPhotoControls)
  cropX?: number;       // Horizontal pan position (0-100)
  cropY?: number;       // Vertical pan position (0-100)
  cropZoom?: number;    // Zoom level (1-3)
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
  | { type: 'DUPLICATE_ELEMENT'; payload: string } 
  | { type: 'DUPLICATE_PAGE'; payload: number }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; changes: Partial<PageElement> } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_TOOL'; payload: EditorTool }
  | { type: 'TOGGLE_GUIDES'; payload: 'bleed' | 'safe' | 'grid' }
  | { type: 'APPLY_LAYOUT'; payload: { layoutId: string } }
  | { type: 'DROP_PHOTO'; payload: { src: string; x: number; y: number } }
  | { type: 'DROP_STICKER'; payload: { src: string; x: number; y: number } }
  | { type: 'ADD_TEXT'; payload?: 'heading' | 'body' | 'subtitle' }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'SET_PAGE_BACKGROUND'; payload: { pageIndex: number; background: PageBackground } }
  | { type: 'ADD_RECENT_COLOR'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

// --- CONSTANTS ---

export const LAYOUT_PRESETS: PageLayout[] = [
  // 1. Full Page (1 Photo)
  {
    id: 'full',
    name: 'Full Page',
    icon: '◻️',
    slots: [{ x: 0, y: 0, width: 100, height: 100 }]
  },
  // 2. Top Picture / Caption Style (1 Photo)
  {
    id: 'classic-top',
    name: 'Top Picture',
    icon: '▀', 
    slots: [
      { x: 5, y: 5, width: 90, height: 65 } // Leaves bottom 30% for text
    ]
  },
  // 3. Bottom Picture (1 Photo)
  {
    id: 'classic-bottom',
    name: 'Bottom Picture',
    icon: '▄',
    slots: [
      { x: 5, y: 30, width: 90, height: 65 } // Leaves top 30% for text
    ]
  },
  // 4. Diagonal / Dynamic (2 Photos)
  {
    id: 'diagonal',
    name: 'Diagonal',
    icon: '⚏',
    slots: [
      { x: 0, y: 0, width: 65, height: 65 },  // Large Top-Left
      { x: 67, y: 67, width: 33, height: 33 } // Small Bottom-Right
    ]
  },
  // 5. Two Vertical (2 Photos)
  {
    id: 'split-v',
    name: '2 Vertical',
    icon: '◫',
    slots: [
      { x: 0, y: 0, width: 49.5, height: 100 },
      { x: 50.5, y: 0, width: 49.5, height: 100 }
    ]
  },
  // 6. Two Horizontal (2 Photos)
  {
    id: 'split-h',
    name: '2 Horizontal',
    icon: '⊟',
    slots: [
      { x: 0, y: 0, width: 100, height: 49.5 },
      { x: 0, y: 50.5, width: 100, height: 49.5 }
    ]
  },
  // 7. Focus Left (3 Photos)
  {
    id: 'focus-left',
    name: 'Focus Left',
    icon: '▍',
    slots: [
      { x: 0, y: 0, width: 66, height: 100 },     // Big Left
      { x: 67, y: 0, width: 33, height: 49.5 },   // Top Right
      { x: 67, y: 50.5, width: 33, height: 49.5 } // Bottom Right
    ]
  },
  // 8. Focus Right (3 Photos)
  {
    id: 'focus-right',
    name: 'Focus Right',
    icon: '▐',
    slots: [
      { x: 0, y: 0, width: 33, height: 49.5 },    // Top Left
      { x: 0, y: 50.5, width: 33, height: 49.5 }, // Bottom Left
      { x: 34, y: 0, width: 66, height: 100 }     // Big Right
    ]
  },
  // 9. Three Columns (3 Photos)
  {
    id: 'three-col',
    name: '3 Columns',
    icon: '|||',
    slots: [
      { x: 0, y: 0, width: 32.5, height: 100 },
      { x: 33.5, y: 0, width: 33, height: 100 },
      { x: 67.5, y: 0, width: 32.5, height: 100 }
    ]
  },
  // 10. Three Rows (3 Photos)
  {
    id: 'three-row',
    name: '3 Rows',
    icon: '☰',
    slots: [
      { x: 0, y: 0, width: 100, height: 32.5 },
      { x: 0, y: 33.5, width: 100, height: 33 },
      { x: 0, y: 67.5, width: 100, height: 32.5 }
    ]
  },
  // 11. Grid 2x2 (4 Photos)
  {
    id: 'grid-2x2',
    name: 'Grid 2x2',
    icon: '⊞',
    slots: [
      { x: 0, y: 0, width: 49.5, height: 49.5 },
      { x: 50.5, y: 0, width: 49.5, height: 49.5 },
      { x: 0, y: 50.5, width: 49.5, height: 49.5 },
      { x: 50.5, y: 50.5, width: 49.5, height: 49.5 }
    ]
  },
  // 12. Mosaic 4 (4 Photos - 1 large + 3 small)
  {
    id: 'mosaic-4',
    name: 'Mosaic',
    icon: '▚',
    slots: [
      { x: 0, y: 0, width: 66, height: 100 },         // Big left
      { x: 67, y: 0, width: 33, height: 32.5 },       // Top right
      { x: 67, y: 33.5, width: 33, height: 33 },      // Middle right
      { x: 67, y: 67.5, width: 33, height: 32.5 }     // Bottom right
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