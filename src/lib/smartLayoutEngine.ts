/**
 * Smart Layout Engine for Laney AI
 * 
 * Automatically applies professional photobook layout rules:
 * - Hero images → full-bleed or large layouts
 * - Group shots → balanced multi-image layouts
 * - Details → minimal layouts with whitespace
 * - Never repeat same layout twice in a row
 * - Pacing: busy → calm, wide → details
 */

import { PhotobookPage, PhotoElement, TextElement, PageElement, PageBackground, LAYOUT_PRESETS } from '@/components/editor/types';

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

// Enhanced AI analysis result
export interface LaneyAnalysis {
  title: string;
  subtitle?: string;
  style: string;
  summary: string;
  mood: string;
  colorPalette: string[];
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
    suggestedLayouts?: string[];
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

// Layout categories matching Laney's rules
type LayoutCategory = 'hero' | 'grid' | 'minimal' | 'collage' | 'featured';

// Map layout IDs to categories
const LAYOUT_CATEGORIES: Record<string, LayoutCategory> = {
  'full-bleed': 'hero',
  'panorama': 'hero',
  'two-horizontal': 'grid',
  'two-vertical': 'grid',
  'three-grid': 'collage',
  'four-grid': 'collage',
  'featured': 'featured',
  'corner': 'minimal'
};

// Inverse: which layouts are good for each category
const CATEGORY_LAYOUTS: Record<LayoutCategory, string[]> = {
  hero: ['full-bleed', 'panorama'],
  grid: ['two-horizontal', 'two-vertical'],
  collage: ['three-grid', 'four-grid'],
  featured: ['featured'],
  minimal: ['corner', 'two-horizontal']
};

// Pacing rules: what should follow each category
const PACING_RULES: Record<LayoutCategory, LayoutCategory[]> = {
  hero: ['grid', 'minimal', 'collage'],      // After hero, calm down
  grid: ['hero', 'featured', 'collage'],     // After grid, can go anywhere
  collage: ['hero', 'minimal', 'grid'],      // After busy collage, breathing room
  featured: ['grid', 'collage', 'minimal'],  // After featured, variety
  minimal: ['hero', 'featured', 'collage']   // After minimal, can go bold
};

/**
 * Classify photos based on AI analysis or heuristics
 */
export function classifyPhotos(
  photos: string[], 
  analysis?: LaneyAnalysis
): PhotoClassification[] {
  const classifications: PhotoClassification[] = [];
  
  if (analysis?.photoAnalysis) {
    // Use AI classifications
    const { heroImages, supportingImages, detailImages } = analysis.photoAnalysis;
    
    photos.forEach((src, index) => {
      let category: 'hero' | 'supporting' | 'detail' = 'supporting';
      
      if (heroImages.includes(index)) {
        category = 'hero';
      } else if (detailImages.includes(index)) {
        category = 'detail';
      }
      
      classifications.push({ index, src, category });
    });
  } else {
    // Fallback: heuristic classification
    // First photo is hero (cover), every 4th is potential hero, every 3rd is detail
    photos.forEach((src, index) => {
      let category: 'hero' | 'supporting' | 'detail' = 'supporting';
      
      if (index === 0 || (index > 0 && index % 5 === 0)) {
        category = 'hero';
      } else if (index % 3 === 2) {
        category = 'detail';
      }
      
      classifications.push({ index, src, category });
    });
  }
  
  return classifications;
}

/**
 * Select the best layout for a photo group based on:
 * - Photo categories (hero, supporting, detail)
 * - Previous layout (no repeats)
 * - Available photos
 * - Pacing rules
 */
function selectLayout(
  photos: PhotoClassification[],
  previousLayoutId: string | null,
  pagePosition: 'opening' | 'journey' | 'climax' | 'closing' | 'middle',
  analysis?: LaneyAnalysis
): string {
  const previousCategory = previousLayoutId 
    ? LAYOUT_CATEGORIES[previousLayoutId] 
    : null;
  
  // Determine ideal category based on photos
  const hasHero = photos.some(p => p.category === 'hero');
  const hasDetail = photos.some(p => p.category === 'detail');
  const photoCount = photos.length;
  
  let idealCategory: LayoutCategory;
  
  // Narrative position affects layout choice
  if (pagePosition === 'opening' || pagePosition === 'climax') {
    idealCategory = 'hero';
  } else if (pagePosition === 'closing') {
    idealCategory = hasHero ? 'hero' : 'minimal';
  } else if (hasHero && photoCount === 1) {
    idealCategory = 'hero';
  } else if (hasDetail && photoCount <= 2) {
    idealCategory = 'minimal';
  } else if (photoCount >= 4) {
    idealCategory = 'collage';
  } else if (photoCount === 3) {
    idealCategory = 'featured';
  } else {
    idealCategory = 'grid';
  }
  
  // Apply pacing rules - avoid same category twice
  if (previousCategory === idealCategory) {
    const alternatives = PACING_RULES[previousCategory];
    idealCategory = alternatives[0];
  }
  
  // Check preferred/avoided layouts from AI
  const preferred = analysis?.designGuidelines?.preferredLayouts || [];
  const avoided = analysis?.designGuidelines?.avoidLayouts || [];
  
  // Get layouts for the ideal category
  let candidateLayouts = CATEGORY_LAYOUTS[idealCategory];
  
  // Filter out avoided layouts
  candidateLayouts = candidateLayouts.filter(l => !avoided.includes(l));
  
  // Prefer AI-suggested layouts
  const preferredMatches = candidateLayouts.filter(l => preferred.includes(l));
  if (preferredMatches.length > 0) {
    candidateLayouts = preferredMatches;
  }
  
  // Avoid exact repeat
  candidateLayouts = candidateLayouts.filter(l => l !== previousLayoutId);
  
  // If no options left, fall back to any non-repeat
  if (candidateLayouts.length === 0) {
    candidateLayouts = Object.keys(LAYOUT_CATEGORIES).filter(l => l !== previousLayoutId);
  }
  
  // Select best match for photo count
  const layoutsWithSlots = candidateLayouts
    .map(id => ({ id, slots: LAYOUT_PRESETS.find(l => l.id === id)?.slots.length || 0 }))
    .sort((a, b) => Math.abs(a.slots - photoCount) - Math.abs(b.slots - photoCount));
  
  return layoutsWithSlots[0]?.id || 'two-horizontal';
}

/**
 * Determine page position in narrative arc
 */
function getPagePosition(
  pageIndex: number, 
  totalPages: number
): 'opening' | 'journey' | 'climax' | 'closing' | 'middle' {
  if (pageIndex === 0) return 'opening';
  if (pageIndex === totalPages - 1) return 'closing';
  
  const position = pageIndex / totalPages;
  if (position < 0.2) return 'journey';
  if (position > 0.6 && position < 0.8) return 'climax';
  return 'middle';
}

/**
 * Create a photo element with smart positioning
 */
function createPhotoElement(
  src: string,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  quality?: number
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
    cropX: 0,
    cropY: 0,
    cropWidth: 100,
    cropHeight: 100,
    zIndex,
    quality
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
  style: 'title' | 'subtitle' | 'body' = 'title'
): TextElement {
  const styles = {
    title: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
    subtitle: { fontSize: 18, fontWeight: 'normal', color: '#FFFFFF' },
    body: { fontSize: 14, fontWeight: 'normal', color: '#333333' }
  };
  
  const s = styles[style];
  
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    content,
    x,
    y,
    width,
    height,
    rotation: 0,
    fontFamily: 'Playfair Display, serif',
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    fontStyle: 'normal',
    color: s.color,
    textAlign: 'center',
    lineHeight: 1.4,
    opacity: 1,
    zIndex
  };
}

/**
 * Select background based on page position and style
 */
function selectBackground(
  pagePosition: 'opening' | 'journey' | 'climax' | 'closing' | 'middle',
  analysis?: LaneyAnalysis,
  previousBg?: string
): PageBackground {
  const palette = analysis?.colorPalette || ['#FFFFFF', '#F8F5F2', '#FFF5EB'];
  const style = analysis?.style || 'Modern Minimal';
  
  // Alternate backgrounds to create rhythm
  const isCalm = pagePosition === 'closing' || pagePosition === 'middle';
  
  // Default white for most pages
  let value = '#FFFFFF';
  
  // Add subtle warmth on certain pages
  if (style.toLowerCase().includes('warm') || style.toLowerCase().includes('organic')) {
    value = isCalm ? '#FFF8F0' : '#FFFFFF';
  } else if (style.toLowerCase().includes('nordic') || style.toLowerCase().includes('minimal')) {
    value = isCalm ? '#F8F8F8' : '#FFFFFF';
  } else if (style.toLowerCase().includes('bold') || style.toLowerCase().includes('editorial')) {
    // Occasionally use darker backgrounds for drama
    if (pagePosition === 'climax') {
      value = '#1A1A1A';
    }
  }
  
  // Avoid same background twice in a row
  if (value === previousBg && previousBg !== '#FFFFFF') {
    value = '#FFFFFF';
  }
  
  return { type: 'solid', value };
}

/**
 * Main function: Generate smart pages from photos and AI analysis
 */
export function generateSmartPages(
  photos: string[],
  analysis?: LaneyAnalysis
): PhotobookPage[] {
  if (photos.length === 0) return [];
  
  const pages: PhotobookPage[] = [];
  const classifications = classifyPhotos(photos, analysis);
  const title = analysis?.title || 'My Photobook';
  const subtitle = analysis?.subtitle;
  
  // Estimate total pages based on analysis or photo count
  const targetPages = analysis?.suggestedPages || Math.max(8, Math.ceil(photos.length / 2.5));
  
  // Track state for pacing
  let previousLayoutId: string | null = null;
  let previousBg: string | undefined;
  let photoIndex = 0;
  let pageNumber = 0;
  
  // === COVER PAGE (Opening) ===
  const coverPhoto = classifications.find(p => p.category === 'hero') || classifications[0];
  const coverElements: PageElement[] = [
    createPhotoElement(coverPhoto.src, 0, 0, 100, 100, 0, coverPhoto.quality)
  ];
  
  // Add title overlay
  coverElements.push(createTextElement(title, 10, 70, 80, 15, 1, 'title'));
  if (subtitle) {
    coverElements.push(createTextElement(subtitle, 10, 82, 80, 8, 2, 'subtitle'));
  }
  
  pages.push({
    id: 'cover',
    elements: coverElements,
    background: { type: 'solid', value: '#000000' },
    layoutId: 'full-bleed'
  });
  
  previousLayoutId = 'full-bleed';
  photoIndex = 1; // Skip cover photo
  pageNumber = 1;
  
  // === CONTENT PAGES ===
  // Group remaining photos intelligently
  const remainingPhotos = classifications.slice(photoIndex);
  
  while (photoIndex < classifications.length && pages.length < targetPages) {
    const pagePosition = getPagePosition(pageNumber, targetPages);
    
    // Decide how many photos for this page
    let photosForPage: PhotoClassification[] = [];
    const currentPhoto = classifications[photoIndex];
    
    if (currentPhoto.category === 'hero') {
      // Hero photos get their own page
      photosForPage = [currentPhoto];
      photoIndex++;
    } else if (currentPhoto.category === 'detail') {
      // Details: 1-2 photos with breathing room
      photosForPage = classifications.slice(photoIndex, photoIndex + 2);
      photoIndex += photosForPage.length;
    } else {
      // Supporting: 2-4 photos based on pacing
      const maxPhotos = pagePosition === 'journey' ? 4 : 
                       pagePosition === 'climax' ? 2 : 3;
      photosForPage = classifications.slice(photoIndex, photoIndex + maxPhotos);
      photoIndex += photosForPage.length;
    }
    
    // Select layout based on rules
    const layoutId = selectLayout(photosForPage, previousLayoutId, pagePosition, analysis);
    const layout = LAYOUT_PRESETS.find(l => l.id === layoutId)!;
    
    // Create elements
    const elements: PageElement[] = [];
    layout.slots.forEach((slot, i) => {
      if (photosForPage[i]) {
        elements.push(createPhotoElement(
          photosForPage[i].src,
          slot.x,
          slot.y,
          slot.width,
          slot.height,
          i,
          photosForPage[i].quality
        ));
      }
    });
    
    // Select background
    const background = selectBackground(pagePosition, analysis, previousBg);
    
    if (elements.length > 0) {
      pages.push({
        id: `page-${pageNumber}`,
        elements,
        background,
        layoutId
      });
      
      previousLayoutId = layoutId;
      previousBg = background.value;
      pageNumber++;
    }
  }
  
  // === CLOSING PAGE ===
  // If we have photos left, add a closing spread
  if (photoIndex < classifications.length) {
    const closingPhotos = classifications.slice(photoIndex, photoIndex + 2);
    const closingLayout = selectLayout(closingPhotos, previousLayoutId, 'closing', analysis);
    const layout = LAYOUT_PRESETS.find(l => l.id === closingLayout)!;
    
    const elements: PageElement[] = [];
    layout.slots.forEach((slot, i) => {
      if (closingPhotos[i]) {
        elements.push(createPhotoElement(
          closingPhotos[i].src,
          slot.x,
          slot.y,
          slot.width,
          slot.height,
          i
        ));
      }
    });
    
    pages.push({
      id: `page-${pageNumber}`,
      elements,
      background: selectBackground('closing', analysis),
      layoutId: closingLayout
    });
  }
  
  return pages;
}

/**
 * Suggest a layout change for a specific page
 */
export function suggestLayoutForPage(
  page: PhotobookPage,
  previousLayoutId: string | null,
  analysis?: LaneyAnalysis
): string {
  const photoElements = page.elements.filter(el => el.type === 'photo');
  
  // Create mock classifications
  const classifications: PhotoClassification[] = photoElements.map((el, i) => ({
    index: i,
    src: (el as PhotoElement).src,
    category: 'supporting' as const
  }));
  
  return selectLayout(classifications, previousLayoutId, 'middle', analysis);
}

/**
 * Get layout suggestions for the current page
 */
export function getLayoutSuggestions(
  photoCount: number,
  previousLayoutId: string | null
): string[] {
  const suggestions: string[] = [];
  
  // Filter layouts by photo count compatibility
  LAYOUT_PRESETS.forEach(layout => {
    if (layout.slots.length >= photoCount && layout.id !== previousLayoutId) {
      suggestions.push(layout.id);
    }
  });
  
  // Limit to 4 suggestions
  return suggestions.slice(0, 4);
}
