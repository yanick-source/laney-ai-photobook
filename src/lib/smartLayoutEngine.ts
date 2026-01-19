/**
 * Smart Layout Engine for Laney AI - Simplified Version
 */

import { PhotobookPage, PhotoElement, TextElement, PageElement, PageBackground, LAYOUT_PRESETS, LayoutSlot, ImagePrefill } from '@/components/editor/types';
import { PhotoQualityScore } from './photoAnalysis';

// Photo with quality data from storage
export interface PhotoWithQualityData {
  dataUrl: string;
  quality?: PhotoQualityScore;
}

// Photo classification from AI analysis
export interface PhotoClassification {
  index: number;
  src: string;
  category: 'hero' | 'supporting' | 'detail';
  quality?: number;
  hasMultipleFaces?: boolean;
  isLandscape?: boolean;
  mood?: string;
}

// Enhanced AI analysis result with captioning protocol
export interface LaneyAnalysis {
  titleOptions?: {
    iconic: string;
    playful: string;
    minimalist: string;
    sentimental: string;
  };
  title: string;
  subtitle?: string;
  style: string;
  summary: string;
  mood: string;
  colorPalette: string[];
  visualAnchors?: {
    dominantObjects: string[];
    location: string;
    aesthetic: string;
  };
  narrativeArc?: {
    opening: string;
    journey: string;
    climax: string;
    closing: string;
  };
  chapters: Array<{
    title: string;
    description: string;
    mood?: string;
    openingCaption?: string;
    suggestedLayouts?: string[];
  }>;
  pageCaptions?: Array<{
    pageType: 'cover' | 'opening' | 'middle' | 'closing';
    caption: string;
    tone: 'poetic' | 'nostalgic' | 'joyful' | 'intimate';
  }>;
  photoAnalysis?: {
    heroImages: number[];
    supportingImages: number[];
    detailImages: number[];
    duplicateClusters: number[][];
    suggestedRemovals: number[];
  };
  designGuidelines?: {
    preferredLayouts: string[];
    avoidLayouts: string[];
    cropSuggestions: string;
    pacingNotes: string;
  };
  suggestedPages: number;
  photoCount: number;
}

// Layout selection by category
const LAYOUTS = {
  hero: ['full-bleed', 'panorama'],
  grid: ['two-horizontal', 'two-vertical'],
  collage: ['three-grid', 'four-grid'],
  featured: ['featured'],
  minimal: ['corner', 'two-horizontal']
} as const;

/**
 * Generate prefills (frame slots) from a layout
 */
export function generatePrefillsFromLayout(layoutId: string): ImagePrefill[] {
  const layout = LAYOUT_PRESETS.find(l => l.id === layoutId);
  if (!layout) {
    // Fallback to two-horizontal if layout not found
    const fallback = LAYOUT_PRESETS.find(l => l.id === 'two-horizontal') || LAYOUT_PRESETS[0];
    return fallback.slots.map((slot, index) => ({
      id: `prefill-${layoutId}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      slotIndex: index,
      x: slot.x,
      y: slot.y,
      width: slot.width,
      height: slot.height,
      isEmpty: true,
      photoId: undefined
    }));
  }
  
  return layout.slots.map((slot, index) => ({
    id: `prefill-${layoutId}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    slotIndex: index,
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
    isEmpty: true,
    photoId: undefined
  }));
}

/**
 * Classify photos based on AI analysis or heuristics
 */
export function classifyPhotos(
  photos: string[], 
  analysis?: LaneyAnalysis,
  photosWithQuality?: PhotoWithQualityData[]
): PhotoClassification[] {
  const { heroImages = [], detailImages = [] } = analysis?.photoAnalysis || {};
  
  return photos.map((src, index) => {
    let category: 'hero' | 'supporting' | 'detail' = 'supporting';
    
    if (analysis?.photoAnalysis) {
      if (heroImages.includes(index)) category = 'hero';
      else if (detailImages.includes(index)) category = 'detail';
    } else {
      // Fallback heuristics
      if (index === 0 || index % 5 === 0) category = 'hero';
      else if (index % 3 === 2) category = 'detail';
    }
    
    return { index, src, category };
  });
}

/**
 * Select the best layout for a photo group based on:
 * - Photo categories (hero, supporting, detail)
 * - Previous layout (no repeats)
 * - Available photos
 */
export function selectLayout(
  photos: PhotoClassification[],
  previousLayoutId: string | null,
  pageType: 'cover' | 'opening' | 'middle' | 'closing'
): string {
  if (pageType === 'cover' || pageType === 'opening') return 'full-bleed';
  if (pageType === 'closing' && photos.length <= 2) return 'two-horizontal';
  
  const heroCount = photos.filter(p => p.category === 'hero').length;
  const detailCount = photos.filter(p => p.category === 'detail').length;
  
  // Determine layout category
  let layouts: readonly string[];
  if (heroCount > 0 && photos.length <= 2) {
    layouts = LAYOUTS.hero;
  } else if (detailCount > photos.length / 2) {
    layouts = LAYOUTS.minimal;
  } else if (photos.length >= 3) {
    layouts = LAYOUTS.collage;
  } else {
    layouts = LAYOUTS.grid;
  }
  
  // Avoid repeating previous layout
  const filtered = layouts.filter(id => id !== previousLayoutId);
  return (filtered.length > 0 ? filtered[0] : layouts[0]) || 'two-horizontal';
}

/**
 * Suggest layout for a specific page based on context
 */
export function suggestLayoutForPage(
  page: PhotobookPage,
  previousLayoutId: string | null
): string {
  const photos = (page.elements.filter(el => el.type === 'photo') as PhotoElement[])
    .map((el, index) => ({ index, src: el.src, category: 'supporting' as const }));
  
  return selectLayout(photos, previousLayoutId, 'middle');
}

/**
 * Select background color based on page type and analysis
 */
export function selectBackground(
  pageType: 'cover' | 'opening' | 'middle' | 'closing',
  analysis?: LaneyAnalysis,
  previousBg?: string
): PageBackground {
  // Use AI color palette if available and has valid colors
  if (analysis?.colorPalette && analysis.colorPalette.length > 0) {
    const color = analysis.colorPalette[0];
    // Only use AI color if it's not too dark (avoid dark backgrounds by default)
    if (color && color !== '#000000' && color !== '#1A1A1A') {
      return { type: 'solid', value: color };
    }
  }
  
  // Default to white/light backgrounds
  switch (pageType) {
    case 'cover':
    case 'opening':
    case 'middle':
      return { type: 'solid', value: '#FFFFFF' };
    case 'closing':
      return { type: 'solid', value: '#F8F5F2' };
    default:
      return { type: 'solid', value: '#FFFFFF' };
  }
}

/**
 * Get caption for a specific page type
 */
export function getCaptionForPage(
  pageType: 'cover' | 'opening' | 'middle' | 'closing',
  pageNumber: number,
  analysis?: LaneyAnalysis
): string | null {
  if (!analysis?.pageCaptions) return null;
  
  const caption = analysis.pageCaptions.find(c => c.pageType === pageType);
  return caption?.caption || null;
}

/**
 * Create a photo element - simple object-cover approach
 */
function createPhotoElement(
  src: string,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  quality?: number,
  prefillId?: string
): PhotoElement {
  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'photo',
    src,
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex,
    opacity: 1,
    quality,
    prefillId,
    cropX: 50,
    cropY: 50,
    cropZoom: 1
  };
}

/**
 * Create a text element
 */
function createTextElement(
  content: string,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  type: 'title' | 'subtitle' | 'caption' = 'caption'
): TextElement {
  const baseStyle = {
    fontFamily: 'Playfair Display, serif',
    textAlign: 'center' as const,
    lineHeight: 1.4,
    opacity: 1,
    textDecoration: 'none' as const,
    letterSpacing: 0,
    textTransform: 'none' as const
  };
  
  const typeStyles = {
    title: { fontSize: 48, fontWeight: 'bold' as const, color: '#FFFFFF' },
    subtitle: { fontSize: 24, fontWeight: 'normal' as const, color: '#F0F0F0' },
    caption: { fontSize: 14, fontWeight: 'normal' as const, color: '#666666' }
  };
  
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    content,
    x,
    y,
    width,
    height,
    rotation: 0,
    fontStyle: 'normal',
    ...baseStyle,
    ...typeStyles[type],
    zIndex
  };
}

/**
 * Generate smart photobook pages using AI analysis
 */
export function generateSmartPages(
  photos: string[],
  analysis: LaneyAnalysis,
  photosWithQuality?: PhotoWithQualityData[]
): PhotobookPage[] {
  const pages: PhotobookPage[] = [];
  
  if (photos.length === 0) return pages;
  
  // Classify photos
  const classifications = classifyPhotos(photos, analysis, photosWithQuality);
  
  // Track state for pacing
  let previousLayoutId: string | null = null;
  let previousBg: string | undefined;
  let photoIndex = 0;
  let pageNumber = 0;
  
  // === COVER PAGE (Opening) ===
  const coverPhoto = classifications.find(p => p.category === 'hero') || classifications[0];
  const coverPrefills = generatePrefillsFromLayout('full-bleed');
  const coverElements: PageElement[] = [];
  
  // Fill the cover prefill
  if (coverPrefills[0]) {
    const prefill = coverPrefills[0];
    prefill.isEmpty = false;
    const photoId = `photo-cover-${Date.now()}`;
    prefill.photoId = photoId;
    coverElements.push({
      ...createPhotoElement(coverPhoto.src, prefill.x, prefill.y, prefill.width, prefill.height, 0, coverPhoto.quality, prefill.id),
      id: photoId
    });
  }
  
  // Add title overlay
  coverElements.push(createTextElement(analysis.title, 10, 70, 80, 15, 1, 'title'));
  if (analysis.subtitle) {
    coverElements.push(createTextElement(analysis.subtitle, 10, 82, 80, 8, 2, 'subtitle'));
  }
  
  pages.push({
    id: 'cover',
    elements: coverElements,
    background: selectBackground('opening', analysis),
    layoutId: 'full-bleed',
    prefills: coverPrefills
  });
  
  previousLayoutId = 'full-bleed';
  photoIndex = 1; // Skip cover photo
  pageNumber = 1;
  
  // === CONTENT PAGES ===
  while (photoIndex < classifications.length && pageNumber < 20) {
    const totalPages = Math.ceil((classifications.length - photoIndex) / 3) + pageNumber;
    const pageType: 'opening' | 'middle' | 'closing' = 
      pageNumber === 1 ? 'opening' : 
      pageNumber >= totalPages - 2 ? 'closing' : 'middle';
    
    const photosPerPage = pageType === 'closing' ? 2 : Math.min(3, classifications.length - photoIndex);
    const photosForPage = classifications.slice(photoIndex, photoIndex + photosPerPage);
    
    const layoutId = selectLayout(photosForPage, previousLayoutId, pageType);
    const layout = LAYOUT_PRESETS.find(l => l.id === layoutId) ?? LAYOUT_PRESETS.find(l => l.id === 'two-horizontal') ?? LAYOUT_PRESETS[0];
    
    // Generate prefills for this page
    const prefills = generatePrefillsFromLayout(layoutId);
    
    // Create elements - fill prefills with photos
    const elements: PageElement[] = [];
    prefills.forEach((prefill, i) => {
      if (photosForPage[i]) {
        prefill.isEmpty = false;
        const photoId = `photo-${pageNumber}-${i}-${Date.now()}`;
        prefill.photoId = photoId;
        
        elements.push({
          ...createPhotoElement(
            photosForPage[i].src,
            prefill.x,
            prefill.y,
            prefill.width,
            prefill.height,
            i,
            photosForPage[i].quality,
            prefill.id
          ),
          id: photoId
        });
      }
    });
    
    // Select background
    const background = selectBackground(pageType, analysis, previousBg);
    
    // Add caption if appropriate for this page
    const caption = getCaptionForPage(pageType, pageNumber, analysis);
    if (caption && elements.length > 0) {
      elements.push(createTextElement(
        caption,
        5, 90, 90, 8,
        elements.length,
        'caption'
      ));
    }
    
    pages.push({
      id: `page-${pageNumber}`,
      elements,
      background,
      layoutId,
      prefills
    });
    
    // Update state
    previousLayoutId = layoutId;
    previousBg = background.value;
    photoIndex += photosPerPage;
    pageNumber++;
  }
  
  return pages;
}
