// Editor Types
export interface PhotoElement {
  id: string;
  type: 'photo';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  zIndex: number;
  quality?: number;
  aspectRatio?: number;
}

export interface TextElement {
  id: string;
  type: 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  opacity: number;
  zIndex: number;
}

export type PageElement = PhotoElement | TextElement;

export interface PageLayout {
  id: string;
  name: string;
  icon: string;
  slots: LayoutSlot[];
}

export interface LayoutSlot {
  x: number; // percentage
  y: number;
  width: number;
  height: number;
}

export interface PhotobookPage {
  id: string;
  elements: PageElement[];
  background: PageBackground;
  layoutId?: string;
}

export interface PageBackground {
  type: 'solid' | 'gradient' | 'image';
  value: string;
  secondaryValue?: string;
  gradientAngle?: number;
}

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
}

export type EditorTool = 
  | 'select'
  | 'pan'
  | 'crop'
  | 'text'
  | 'layout'
  | 'background';

export interface HistoryEntry {
  pages: PhotobookPage[];
  timestamp: number;
}

export interface LaneyMessage {
  id: string;
  message: string;
  type: 'suggestion' | 'tip' | 'warning' | 'praise';
  actionLabel?: string;
  action?: () => void;
}

// Layout presets
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
