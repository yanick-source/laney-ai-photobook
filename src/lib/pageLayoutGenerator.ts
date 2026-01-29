/**
 * Creative Page Layout Generator for Laney AI
 * 
 * Philosophy: Rich, creative layouts that make even small books feel special.
 * Uses 2-4 photos per page intelligently based on photo characteristics.
 */

import { 
  PhotobookPage, 
  PhotoElement, 
  TextElement, 
  PageElement, 
  PageBackground,
  LAYOUT_PRESETS,
  PageLayout,
  ImagePrefill
} from '@/components/editor/types';
import { SelectedPhoto, PhotoTier, groupPhotosByTier, calculateRecommendedPages } from './photoSelection';
import { LaneyAnalysis } from './aiTypes';

/**
 * Generate prefills (frame slots) from a layout
 */
export function generatePrefillsFromLayout(layoutId: string): ImagePrefill[] {
  const layout = LAYOUT_PRESETS.find(l => l.id === layoutId);
  if (!layout) {
    const fallback = LAYOUT_PRESETS.find(l => l.id === 'split-h') || LAYOUT_PRESETS[0];
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

/** Layout categories by photo count */
const LAYOUTS_BY_PHOTO_COUNT: Record<number, string[]> = {
  1: ['full', 'classic-top', 'classic-bottom'],
  2: ['split-v', 'split-h', 'diagonal'],
  3: ['focus-left', 'focus-right', 'three-col', 'three-row'],
  4: ['focus-left', 'focus-right'] // Will use 3-photo layouts with one extra
};

/** Page types for narrative structure */
type PageType = 'cover' | 'opening' | 'chapter' | 'content' | 'highlight' | 'closing';

interface PagePlan {
  type: PageType;
  photoCount: number;
  layoutId: string;
  photos: SelectedPhoto[];
}

/**
 * Select the best layout for a given photo count and context
 */

/**
 * Select the best layout for a given photo count and context
 */
function selectLayout(
  photoCount: number, 
  pageType: PageType,
  previousLayoutId?: string,
  hasHeroPhoto?: boolean
): string {
  // Cover and closing pages get special treatment
  if (pageType === 'cover' || pageType === 'opening') {
    return 'full';
  }
  
  if (pageType === 'closing') {
    return photoCount === 1 ? 'classic-top' : 'split-h';
  }
  
  // Get available layouts for this photo count
  const count = Math.min(photoCount, 3); // Max 3 photos per layout preset
  const availableLayouts = LAYOUTS_BY_PHOTO_COUNT[count] || LAYOUTS_BY_PHOTO_COUNT[2];
  
  // Avoid repeating the previous layout
  const filtered = availableLayouts.filter(id => id !== previousLayoutId);
  const choices = filtered.length > 0 ? filtered : availableLayouts;
  
  // Prefer focus layouts for hero photos
  if (hasHeroPhoto && count >= 2) {
    const focusLayouts = choices.filter(id => id.includes('focus'));
    if (focusLayouts.length > 0) {
      return focusLayouts[Math.floor(Math.random() * focusLayouts.length)];
    }
  }
  
  // Random selection for variety
  return choices[Math.floor(Math.random() * choices.length)];
}

/**
 * Calculate optimal photos per page based on total photos and target pages
 */
function calculatePhotosPerPage(
  totalPhotos: number,
  targetPages: number,
  pageIndex: number,
  remainingPhotos: number
): number {
  const remainingPages = targetPages - pageIndex;
  
  if (remainingPages <= 0) return Math.min(3, remainingPhotos);
  
  const avgNeeded = remainingPhotos / remainingPages;
  
  // Vary between 2-3 photos per page for richness
  if (avgNeeded <= 1.5) return Math.min(2, remainingPhotos);
  if (avgNeeded <= 2.5) return Math.min(2 + (pageIndex % 2), remainingPhotos); // Alternate 2-3
  if (avgNeeded <= 3.5) return Math.min(3, remainingPhotos);
  
  return Math.min(3, remainingPhotos); // Cap at 3 per page
}

/**
 * Create a photo element with smart positioning
 */
function createPhotoElement(
  photo: SelectedPhoto,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number,
  prefillId?: string
): PhotoElement {
  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'photo',
    src: photo.dataUrl || '',
    x,
    y,
    width,
    height,
    rotation: 0,
    zIndex,
    opacity: 1,
    quality: photo.quality.overall,
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
  style: 'title' | 'subtitle' | 'caption' = 'caption'
): TextElement {
  const styles = {
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
    opacity: 1,
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'normal',
    textAlign: 'center',
    lineHeight: 1.4,
    textDecoration: 'none',
    letterSpacing: 0,
    textTransform: 'none',
    ...styles[style],
    zIndex
  };
}

/**
 * Select background based on page type
 */
function selectBackground(pageType: PageType, analysis?: LaneyAnalysis): PageBackground {
  // Use AI color if available and appropriate
  if (analysis?.colorPalette?.[0] && pageType !== 'content') {
    const color = analysis.colorPalette[0];
    if (color !== '#000000' && color !== '#1A1A1A') {
      return { type: 'solid', value: color };
    }
  }
  
  switch (pageType) {
    case 'cover':
    case 'opening':
      return { type: 'solid', value: '#FFFFFF' };
    case 'closing':
      return { type: 'solid', value: '#F8F5F2' };
    default:
      return { type: 'solid', value: '#FFFFFF' };
  }
}

/**
 * Generate creative photobook pages from selected photos
 * 
 * This is the main entry point for page generation.
 * It creates a rich, varied layout that uses all provided photos.
 */
export function generateCreativePages(
  photos: SelectedPhoto[],
  analysis?: LaneyAnalysis,
  options: {
    minPages?: number;
    maxPages?: number;
  } = {}
): PhotobookPage[] {
  if (photos.length === 0) return [];
  
  const { 
    minPages = 8, 
    maxPages = 60 
  } = options;
  
  // Calculate target page count
  const recommendedPages = calculateRecommendedPages(photos.length);
  const targetPages = Math.max(minPages, Math.min(maxPages, recommendedPages));
  
  const pages: PhotobookPage[] = [];
  const photosByTier = groupPhotosByTier(photos);
  
  // Create a queue of all photos, prioritized by tier
  const photoQueue: SelectedPhoto[] = [
    ...photosByTier.hero,
    ...photosByTier.featured,
    ...photosByTier.standard,
    ...photosByTier.supporting
  ];
  
  let photoIndex = 0;
  let previousLayoutId: string | null = null;
  
  // === COVER PAGE ===
  const coverPhoto = photoQueue[photoIndex++] || photos[0];
  const coverPage = createCoverPage(coverPhoto, analysis);
  pages.push(coverPage);
  previousLayoutId = 'full';
  
  // === CONTENT PAGES ===
  while (photoIndex < photoQueue.length && pages.length < targetPages) {
    const pageNumber = pages.length;
    const remainingPhotos = photoQueue.length - photoIndex;
    const remainingPages = targetPages - pageNumber - 1; // -1 for closing
    
    // Determine page type
    const pageType: PageType = 
      pageNumber === 1 ? 'opening' :
      remainingPhotos <= 3 ? 'closing' : 'content';
    
    // Calculate how many photos for this page
    const photosForPage = calculatePhotosPerPage(
      photoQueue.length,
      targetPages,
      pageNumber,
      remainingPhotos
    );
    
    // Get the photos for this page
    const pagePhotos = photoQueue.slice(photoIndex, photoIndex + photosForPage);
    const hasHero = pagePhotos.some(p => p.tier === 'hero');
    
    // Select layout
    const layoutId = selectLayout(photosForPage, pageType, previousLayoutId || undefined, hasHero);
    const layout = LAYOUT_PRESETS.find(l => l.id === layoutId) || LAYOUT_PRESETS[0];
    
    // Generate prefills
    const prefills = generatePrefillsFromLayout(layoutId);
    
    // Create elements
    const elements: PageElement[] = [];
    
    // Fill slots with photos
    pagePhotos.forEach((photo, i) => {
      if (layout.slots[i]) {
        const slot = layout.slots[i];
        const prefill = prefills[i];
        
        if (prefill) {
          prefill.isEmpty = false;
          const photoId = `photo-${pageNumber}-${i}-${Date.now()}`;
          prefill.photoId = photoId;
          
          const photoElement = createPhotoElement(
            photo,
            slot.x,
            slot.y,
            slot.width,
            slot.height,
            i,
            prefill.id
          );
          photoElement.id = photoId;
          elements.push(photoElement);
        }
      }
    });
    
    // Add chapter title for chapter pages (every 5-7 pages)
    if (analysis?.chapters && pages.length % 6 === 1 && pages.length > 1) {
      const chapterIndex = Math.floor(pages.length / 6);
      const chapter = analysis.chapters[chapterIndex];
      if (chapter?.title) {
        elements.push(createTextElement(
          chapter.title,
          5, 90, 90, 8,
          elements.length,
          'caption'
        ));
      }
    }
    
    pages.push({
      id: `page-${pageNumber}`,
      elements,
      background: selectBackground(pageType, analysis),
      layoutId,
      prefills
    });
    
    previousLayoutId = layoutId;
    photoIndex += photosForPage;
  }
  
  // Ensure we used all photos (add extra pages if needed)
  while (photoIndex < photoQueue.length) {
    const remainingPhotos = photoQueue.slice(photoIndex, photoIndex + 3);
    const layoutId = selectLayout(remainingPhotos.length, 'content', previousLayoutId || undefined);
    const layout = LAYOUT_PRESETS.find(l => l.id === layoutId) || LAYOUT_PRESETS[0];
    const prefills = generatePrefillsFromLayout(layoutId);
    
    const elements: PageElement[] = remainingPhotos.map((photo, i) => {
      const slot = layout.slots[i] || layout.slots[0];
      const prefill = prefills[i];
      
      if (prefill) {
        prefill.isEmpty = false;
        const photoId = `photo-extra-${photoIndex + i}-${Date.now()}`;
        prefill.photoId = photoId;
        
        const photoElement = createPhotoElement(photo, slot.x, slot.y, slot.width, slot.height, i, prefill.id);
        photoElement.id = photoId;
        return photoElement;
      }
      
      return createPhotoElement(photo, slot.x, slot.y, slot.width, slot.height, i);
    });
    
    pages.push({
      id: `page-${pages.length}`,
      elements,
      background: selectBackground('content', analysis),
      layoutId,
      prefills
    });
    
    previousLayoutId = layoutId;
    photoIndex += remainingPhotos.length;
  }
  
  return pages;
}

/**
 * Create the cover page with title overlay
 */
function createCoverPage(
  coverPhoto: SelectedPhoto,
  analysis?: LaneyAnalysis
): PhotobookPage {
  const prefills = generatePrefillsFromLayout('full');
  const elements: PageElement[] = [];
  
  // Full-page cover photo
  if (prefills[0]) {
    const prefill = prefills[0];
    prefill.isEmpty = false;
    const photoId = `photo-cover-${Date.now()}`;
    prefill.photoId = photoId;
    
    const photoElement = createPhotoElement(
      coverPhoto,
      0, 0, 100, 100,
      0,
      prefill.id
    );
    photoElement.id = photoId;
    elements.push(photoElement);
  }
  
  // Title overlay
  const title = analysis?.title || 'My Photobook';
  elements.push(createTextElement(title, 10, 70, 80, 15, 1, 'title'));
  
  // Subtitle if available
  if (analysis?.subtitle) {
    elements.push(createTextElement(analysis.subtitle, 10, 82, 80, 8, 2, 'subtitle'));
  }
  
  return {
    id: 'cover',
    elements,
    background: selectBackground('cover', analysis),
    layoutId: 'full',
    prefills
  };
}

/**
 * Get layout variety score to ensure diverse layouts
 */
export function getLayoutVarietyScore(pages: PhotobookPage[]): number {
  if (pages.length === 0) return 0;
  
  const layoutCounts: Record<string, number> = {};
  pages.forEach(page => {
    if (page.layoutId) {
      layoutCounts[page.layoutId] = (layoutCounts[page.layoutId] || 0) + 1;
    }
  });
  
  const uniqueLayouts = Object.keys(layoutCounts).length;
  const maxRepeats = Math.max(...Object.values(layoutCounts));
  
  // Score based on variety (higher is better)
  return (uniqueLayouts / pages.length) * 100 - (maxRepeats / pages.length) * 20;
}
