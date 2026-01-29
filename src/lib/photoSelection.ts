/**
 * Photo Selection Module for Laney AI
 * 
 * Philosophy: Be INCLUSIVE, not exclusive.
 * Only exclude photos with extreme quality issues.
 * Users want all their memories, not a curated subset.
 */

import { AnalyzedPhoto, PhotoQualityScore } from './photoAnalysis';

/** Minimum quality threshold - only exclude truly unusable photos */
const MINIMUM_QUALITY_THRESHOLD = 15; // Very low - only corrupted/extremely blurry

/** Quality tiers for layout prioritization (not exclusion) */
export type PhotoTier = 'hero' | 'featured' | 'standard' | 'supporting';

export interface SelectedPhoto extends AnalyzedPhoto {
  tier: PhotoTier;
  selectionReason?: string;
}

export interface PhotoSelectionResult {
  selected: SelectedPhoto[];
  excluded: AnalyzedPhoto[];
  stats: {
    total: number;
    selected: number;
    excluded: number;
    byTier: Record<PhotoTier, number>;
  };
}

/**
 * Classify a photo into a quality tier for layout purposes
 * All tiers are INCLUDED - tiers just affect placement priority
 */
function classifyPhotoTier(quality: PhotoQualityScore): PhotoTier {
  const score = quality.overall;
  
  if (score >= 80) return 'hero';
  if (score >= 60) return 'featured';
  if (score >= 40) return 'standard';
  return 'supporting';
}

/**
 * Check if a photo should be excluded (extremely rare)
 * Only excludes photos that are genuinely unusable
 */
function shouldExcludePhoto(photo: AnalyzedPhoto): { exclude: boolean; reason?: string } {
  const { quality } = photo;
  
  // Only exclude if quality is extremely poor
  if (quality.overall < MINIMUM_QUALITY_THRESHOLD) {
    return { 
      exclude: true, 
      reason: 'Quality too low to display clearly' 
    };
  }
  
  // Check for extreme issues (all must be very bad to exclude)
  const isCompletelyBlurry = quality.sharpness < 10;
  const isCompletelyDark = quality.lighting < 10;
  
  if (isCompletelyBlurry && isCompletelyDark) {
    return { 
      exclude: true, 
      reason: 'Image is both extremely blurry and dark' 
    };
  }
  
  // Include everything else!
  return { exclude: false };
}

/**
 * Select photos for the photobook - INCLUSIVE by default
 * 
 * This function classifies photos into tiers for layout optimization
 * but includes nearly all photos. Only truly unusable images are excluded.
 */
export function selectPhotosForBook(
  photos: AnalyzedPhoto[],
  options: {
    includeAll?: boolean; // Force include all photos regardless of quality
  } = {}
): PhotoSelectionResult {
  const { includeAll = false } = options;
  
  const selected: SelectedPhoto[] = [];
  const excluded: AnalyzedPhoto[] = [];
  const byTier: Record<PhotoTier, number> = {
    hero: 0,
    featured: 0,
    standard: 0,
    supporting: 0
  };
  
  for (const photo of photos) {
    // Check for exclusion (very rare)
    const exclusionCheck = includeAll 
      ? { exclude: false } 
      : shouldExcludePhoto(photo);
    
    if (exclusionCheck.exclude) {
      excluded.push(photo);
      continue;
    }
    
    // Classify into tier (for layout prioritization, not exclusion)
    const tier = classifyPhotoTier(photo.quality);
    byTier[tier]++;
    
    selected.push({
      ...photo,
      tier,
      selectionReason: getTierDescription(tier),
      selectedForBook: true
    });
  }
  
  // Sort by quality (hero photos first) but keep all photos
  selected.sort((a, b) => {
    const tierOrder: Record<PhotoTier, number> = { hero: 0, featured: 1, standard: 2, supporting: 3 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });
  
  return {
    selected,
    excluded,
    stats: {
      total: photos.length,
      selected: selected.length,
      excluded: excluded.length,
      byTier
    }
  };
}

function getTierDescription(tier: PhotoTier): string {
  switch (tier) {
    case 'hero': return 'Best quality - perfect for full-page layouts';
    case 'featured': return 'Great quality - ideal for prominent placement';
    case 'standard': return 'Good quality - works well in any layout';
    case 'supporting': return 'Included - adds variety to the story';
  }
}

/**
 * Get the recommended number of pages based on photo count
 * Ensures enough pages for all photos with creative layouts
 */
export function calculateRecommendedPages(photoCount: number): number {
  if (photoCount <= 5) return Math.max(6, photoCount + 2); // Generous for small sets
  if (photoCount <= 15) return Math.ceil(photoCount / 2) + 2;
  if (photoCount <= 30) return Math.ceil(photoCount / 2.5) + 2;
  if (photoCount <= 60) return Math.ceil(photoCount / 3);
  return Math.min(60, Math.ceil(photoCount / 3.5)); // Cap at 60 pages
}

/**
 * Distribute photos across pages evenly
 * Returns recommended photos per page for even distribution
 */
export function getPhotosPerPageDistribution(
  photoCount: number, 
  pageCount: number
): { min: number; max: number; average: number } {
  const average = photoCount / pageCount;
  
  return {
    min: Math.max(1, Math.floor(average)),
    max: Math.min(4, Math.ceil(average) + 1),
    average: Math.round(average * 10) / 10
  };
}

/**
 * Group photos by tier for layout assignment
 */
export function groupPhotosByTier(photos: SelectedPhoto[]): Record<PhotoTier, SelectedPhoto[]> {
  return {
    hero: photos.filter(p => p.tier === 'hero'),
    featured: photos.filter(p => p.tier === 'featured'),
    standard: photos.filter(p => p.tier === 'standard'),
    supporting: photos.filter(p => p.tier === 'supporting')
  };
}
