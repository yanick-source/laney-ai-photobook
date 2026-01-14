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

import { PhotobookPage, PhotoElement, TextElement, PageElement, PageBackground, LAYOUT_PRESETS, LayoutSlot } from '@/components/editor/types';
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
  aspectRatio?: number;
  subjectCenter?: { x: number; y: number };
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
    pageType: 'cover' | 'opening' | 'spread' | 'detail' | 'closing';
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
 * Now includes aspect ratio and subject center from quality analysis
 */
export function classifyPhotos(
  photos: string[], 
  analysis?: LaneyAnalysis,
  photosWithQuality?: PhotoWithQualityData[]
): PhotoClassification[] {
  const classifications: PhotoClassification[] = [];
  
  // Create a map of dataUrl to quality for quick lookup
  const qualityMap = new Map<string, PhotoQualityScore>();
  if (photosWithQuality) {
    photosWithQuality.forEach(p => {
      if (p.quality) {
        qualityMap.set(p.dataUrl, p.quality);
      }
    });
  }
  
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
      
      // Get quality data for this photo
      const quality = qualityMap.get(src);
      
      classifications.push({ 
        index, 
        src, 
        category,
        aspectRatio: quality?.aspectRatio,
        subjectCenter: quality?.subjectCenter,
        isLandscape: quality?.isLandscape
      });
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
      
      // Get quality data for this photo
      const quality = qualityMap.get(src);
      
      classifications.push({ 
        index, 
        src, 
        category,
        aspectRatio: quality?.aspectRatio,
        subjectCenter: quality?.subjectCenter,
        isLandscape: quality?.isLandscape
      });
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
 * Calculate smart crop values based on photo and slot aspect ratios
 * This ensures photos fill slots beautifully while keeping focal points visible
 */
function calculateSmartCropForSlot(
  photoAspectRatio: number | undefined,
  slot: LayoutSlot,
  subjectCenter?: { x: number; y: number }
): { cropX: number; cropY: number; cropWidth: number; cropHeight: number } {
  // Default subject center is middle of image
  const focalX = subjectCenter?.x ?? 0.5;
  const focalY = subjectCenter?.y ?? 0.5;
  
  // If we don't know the photo's aspect ratio, use sensible defaults
  if (!photoAspectRatio) {
    return { cropX: 0, cropY: 0, cropWidth: 100, cropHeight: 100 };
  }
  
  // Calculate the slot's aspect ratio (width/height)
  // Slots use percentages of the canvas, canvas is 800x600 (4:3)
  const canvasAspect = 800 / 600; // 1.333
  const slotAspect = (slot.width / slot.height) * canvasAspect;
  
  // Compare photo aspect ratio to slot aspect ratio
  // Values are percentages (0-100 range)
  let cropX = 0;
  let cropY = 0;
  let cropWidth = 100;
  let cropHeight = 100;
  
  if (photoAspectRatio > slotAspect) {
    // Photo is wider than slot - need to crop horizontally
    // Calculate how much of the photo width we can show
    cropWidth = (slotAspect / photoAspectRatio) * 100;
    
    // Center crop on focal point, clamped to valid range
    const maxOffset = 100 - cropWidth;
    const idealOffset = (focalX * 100) - (cropWidth / 2);
    cropX = Math.max(0, Math.min(maxOffset, idealOffset));
  } else if (photoAspectRatio < slotAspect) {
    // Photo is taller than slot - need to crop vertically
    // Calculate how much of the photo height we can show
    cropHeight = (photoAspectRatio / slotAspect) * 100;
    
    // Center crop on focal point, clamped to valid range
    const maxOffset = 100 - cropHeight;
    const idealOffset = (focalY * 100) - (cropHeight / 2);
    cropY = Math.max(0, Math.min(maxOffset, idealOffset));
  }
  // If aspects match, no cropping needed (cropWidth/cropHeight stay at 100)
  
  return { cropX, cropY, cropWidth, cropHeight };
}

/**
 * Create a photo element with smart positioning and intelligent cropping
 */
function createPhotoElement(
  src: string,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  quality?: number,
  aspectRatio?: number,
  subjectCenter?: { x: number; y: number }
): PhotoElement {
  // Create a slot object from the position/size for crop calculation
  const slot: LayoutSlot = { x, y, width, height };
  
  // Calculate smart crop values based on photo and slot aspect ratios
  const cropValues = calculateSmartCropForSlot(aspectRatio, slot, subjectCenter);
  
  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'photo',
    src,
    x,
    y,
    width,
    height,
    rotation: 0,
    cropX: cropValues.cropX,
    cropY: cropValues.cropY,
    cropWidth: cropValues.cropWidth,
    cropHeight: cropValues.cropHeight,
    zIndex,
    quality,
    aspectRatio
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
 * Get caption for a page based on position and AI analysis
 */
function getCaptionForPage(
  pagePosition: 'opening' | 'journey' | 'climax' | 'closing' | 'middle',
  pageNumber: number,
  analysis?: LaneyAnalysis
): string | null {
  // First, check for specific page captions from AI
  if (analysis?.pageCaptions && analysis.pageCaptions.length > 0) {
    const pageTypeMap: Record<string, string> = {
      'opening': 'opening',
      'closing': 'closing',
      'climax': 'spread',
      'journey': 'spread',
      'middle': 'detail'
    };
    
    const matchingCaption = analysis.pageCaptions.find(
      c => c.pageType === pageTypeMap[pagePosition]
    );
    
    if (matchingCaption) {
      return matchingCaption.caption;
    }
  }
  
  // Check for chapter captions
  if (analysis?.chapters && analysis.chapters.length > 0) {
    // Map page number to chapter
    const chapterIndex = Math.floor((pageNumber / (analysis.suggestedPages || 20)) * analysis.chapters.length);
    const chapter = analysis.chapters[Math.min(chapterIndex, analysis.chapters.length - 1)];
    
    // Only return opening caption at start of chapter
    if (chapter.openingCaption && pageNumber % 4 === 1) {
      return chapter.openingCaption;
    }
  }
  
  return null;
}

/**
 * Select background based on page position and style
 */
function selectBackground(
  pagePosition: 'opening' | 'journey' | 'climax' | 'closing' | 'middle',
  analysis?: LaneyAnalysis,
  previousBg?: string
): PageBackground {
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
 * Now accepts quality data for intelligent cropping based on aspect ratios and focal points
 */
export function generateSmartPages(
  photos: string[],
  analysis?: LaneyAnalysis,
  photosWithQuality?: PhotoWithQualityData[]
): PhotobookPage[] {
  if (photos.length === 0) return [];
  
  const pages: PhotobookPage[] = [];
  const classifications = classifyPhotos(photos, analysis, photosWithQuality);
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
    createPhotoElement(coverPhoto.src, 0, 0, 100, 100, 0, coverPhoto.quality, coverPhoto.aspectRatio, coverPhoto.subjectCenter)
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
          photosForPage[i].quality,
          photosForPage[i].aspectRatio,
          photosForPage[i].subjectCenter
        ));
      }
    });
    
    // Select background
    const background = selectBackground(pagePosition, analysis, previousBg);
    
    // Add caption if appropriate for this page
    const caption = getCaptionForPage(pagePosition, pageNumber, analysis);
    if (caption && elements.length > 0) {
      // Position caption based on layout - bottom of page with subtle styling
      const isDarkBg = background.value === '#1A1A1A' || background.value === '#000000';
      elements.push(createTextElement(
        caption,
        5, 90, 90, 8,
        elements.length,
        'body'
      ));
      // Adjust color for dark backgrounds
      const captionElement = elements[elements.length - 1] as TextElement;
      captionElement.color = isDarkBg ? '#FFFFFF' : '#666666';
      captionElement.fontSize = 12;
      captionElement.textAlign = 'center';
      captionElement.opacity = 0.8;
    }
    
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
    
    // Add closing caption
    const closingCaption = getCaptionForPage('closing', pageNumber, analysis);
    if (closingCaption) {
      elements.push(createTextElement(
        closingCaption,
        10, 85, 80, 10,
        elements.length,
        'subtitle'
      ));
    }
    
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
