/**
 * AI Photobook Pipeline
 * 
 * Orchestrates the complete AI photobook generation flow:
 * 1. Photo Analysis - Quality scoring and deduplication
 * 2. Photo Selection - Inclusive selection (almost all photos)
 * 3. Page Layout Generation - Creative, varied layouts
 * 
 * This module provides clean separation of concerns and makes
 * the AI flow easier to understand, debug, and extend.
 */

import { AnalyzedPhoto, analyzePhotoQuality } from './photoAnalysis';
import { selectPhotosForBook, SelectedPhoto, PhotoSelectionResult, calculateRecommendedPages } from './photoSelection';
import { generateCreativePages } from './pageLayoutGenerator';
import { LaneyAnalysis } from './aiTypes';
import { PhotobookPage } from '@/components/editor/types';
import { deduplicatePhotos, smartSampling, createBatches, calculateBatchConfig } from './photoProcessing';
import { generateAIThumbnail } from './imageOptimizer';

/** Pipeline stage result */
export interface PipelineStageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  stats?: Record<string, number | string>;
}

/** Complete pipeline result */
export interface PhotobookPipelineResult {
  photos: SelectedPhoto[];
  pages: PhotobookPage[];
  analysis?: LaneyAnalysis;
  stats: {
    totalUploaded: number;
    afterDeduplication: number;
    selected: number;
    excluded: number;
    pagesGenerated: number;
    photosPerPage: number;
  };
}

/** Progress callback for UI updates */
export type ProgressCallback = (stage: string, progress: number, message: string) => void;

/**
 * Stage 1: Analyze and deduplicate photos
 * 
 * Performs quality analysis on each photo and removes duplicates.
 * This is done client-side for speed and privacy.
 */
export async function analyzePhotos(
  files: Array<{ file: File; dataUrl: string; metadata: any }>,
  onProgress?: ProgressCallback
): Promise<PipelineStageResult<AnalyzedPhoto[]>> {
  try {
    onProgress?.('analyze', 0, 'Starting photo analysis...');
    
    // Deduplicate based on file metadata
    const { unique, duplicates } = deduplicatePhotos(files.map(f => f.file));
    
    onProgress?.('analyze', 10, `Found ${unique.length} unique photos (${duplicates} duplicates removed)`);
    
    // Create a map for O(1) lookup
    const fileMap = new Map(
      files.map(f => [`${f.file.name}-${f.file.size}-${f.file.lastModified}`, f])
    );
    
    const analyzed: AnalyzedPhoto[] = [];
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < unique.length; i += BATCH_SIZE) {
      const batch = unique.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.all(batch.map(async (file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        const photo = fileMap.get(key);
        
        if (!photo || !photo.dataUrl || !photo.metadata) return null;
        
        try {
          const quality = await analyzePhotoQuality(photo.dataUrl, photo.metadata);
          return {
            ...photo,
            quality,
            selectedForBook: false,
          } as AnalyzedPhoto;
        } catch (error) {
          console.warn('Photo analysis failed, using defaults:', error);
          return {
            ...photo,
            quality: {
              overall: 70,
              sharpness: 70,
              lighting: 70,
              composition: 70,
              faceDetected: false,
              isPortrait: photo.metadata.isPortrait,
              isLandscape: photo.metadata.isLandscape,
              aspectRatio: photo.metadata.aspectRatio,
            },
            selectedForBook: false,
          } as AnalyzedPhoto;
        }
      }));
      
      batchResults.forEach(r => r && analyzed.push(r));
      
      const progress = Math.round(((i + BATCH_SIZE) / unique.length) * 90);
      onProgress?.('analyze', Math.min(progress, 90), `Analyzing photo ${Math.min(i + BATCH_SIZE, unique.length)} of ${unique.length}...`);
      
      // Yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Sort by quality
    analyzed.sort((a, b) => b.quality.overall - a.quality.overall);
    
    onProgress?.('analyze', 100, 'Photo analysis complete');
    
    return {
      success: true,
      data: analyzed,
      stats: {
        total: files.length,
        unique: unique.length,
        duplicates,
        analyzed: analyzed.length
      }
    };
  } catch (error) {
    console.error('Photo analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Photo analysis failed'
    };
  }
}

/**
 * Stage 2: Select photos for the book (INCLUSIVE)
 * 
 * Classifies photos into quality tiers but includes almost all of them.
 * Only truly unusable photos are excluded.
 */
export function selectPhotos(
  analyzedPhotos: AnalyzedPhoto[],
  onProgress?: ProgressCallback
): PipelineStageResult<PhotoSelectionResult> {
  try {
    onProgress?.('select', 0, 'Selecting photos for your book...');
    
    // Use inclusive selection (almost all photos included)
    const result = selectPhotosForBook(analyzedPhotos, { includeAll: false });
    
    onProgress?.('select', 100, `Selected ${result.selected.length} photos (${result.excluded.length} excluded)`);
    
    return {
      success: true,
      data: result,
      stats: {
        selected: result.selected.length,
        excluded: result.excluded.length,
        heroPhotos: result.stats.byTier.hero,
        featuredPhotos: result.stats.byTier.featured,
        standardPhotos: result.stats.byTier.standard,
        supportingPhotos: result.stats.byTier.supporting
      }
    };
  } catch (error) {
    console.error('Photo selection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Photo selection failed'
    };
  }
}

/**
 * Stage 3: Call AI for analysis (optional, enhances layouts)
 * 
 * Sends a sample of photos to the AI for creative analysis.
 * This provides titles, chapters, and mood information.
 */
export async function callAIAnalysis(
  photos: AnalyzedPhoto[],
  apiUrl: string,
  onProgress?: ProgressCallback
): Promise<PipelineStageResult<LaneyAnalysis>> {
  try {
    onProgress?.('ai', 0, 'Preparing photos for AI analysis...');
    
    // Smart sample for AI (max 50 photos)
    const sampledPhotos = smartSampling(photos, 50);
    
    onProgress?.('ai', 10, `Sending ${sampledPhotos.length} representative photos to AI...`);
    
    // Create batches and generate thumbnails
    const { batchSize, maxConcurrent } = calculateBatchConfig(sampledPhotos.length);
    const batches = createBatches(sampledPhotos, batchSize);
    
    const allImages: string[] = [];
    
    for (let i = 0; i < batches.length; i += maxConcurrent) {
      const concurrentBatches = batches.slice(i, i + maxConcurrent);
      
      const batchResults = await Promise.all(
        concurrentBatches.map(async (batch) => {
          return Promise.all(
            batch.map(async (photo) => {
              try {
                if (photo.file) {
                  return await generateAIThumbnail(photo.file, 512);
                }
                return photo.dataUrl;
              } catch {
                return photo.dataUrl;
              }
            })
          );
        })
      );
      
      allImages.push(...batchResults.flat());
      
      const progress = 10 + Math.round((i / batches.length) * 40);
      onProgress?.('ai', progress, `Processing batch ${i + 1} of ${batches.length}...`);
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const validImages = allImages.filter((img): img is string => 
      typeof img === 'string' && img.length > 0
    );
    
    if (validImages.length === 0) {
      return {
        success: false,
        error: 'No valid images for AI analysis'
      };
    }
    
    onProgress?.('ai', 60, 'Analyzing with AI...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: validImages,
        photoCount: photos.length,
        sampledCount: sampledPhotos.length
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || `AI analysis failed: ${response.status}`
      };
    }
    
    const result = await response.json() as LaneyAnalysis;
    
    onProgress?.('ai', 100, 'AI analysis complete');
    
    return {
      success: true,
      data: result,
      stats: {
        sampledPhotos: sampledPhotos.length,
        suggestedPages: result.suggestedPages,
        chapters: result.chapters?.length || 0
      }
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI analysis failed'
    };
  }
}

/**
 * Stage 4: Generate page layouts
 * 
 * Creates creative, varied layouts using all selected photos.
 * Uses AI analysis for enhanced layouts if available.
 */
export function generatePages(
  selectedPhotos: SelectedPhoto[],
  analysis?: LaneyAnalysis,
  onProgress?: ProgressCallback
): PipelineStageResult<PhotobookPage[]> {
  try {
    onProgress?.('layout', 0, 'Generating creative layouts...');
    
    const pages = generateCreativePages(selectedPhotos, analysis);
    
    onProgress?.('layout', 100, `Generated ${pages.length} pages`);
    
    const photoCount = selectedPhotos.length;
    const avgPhotosPerPage = pages.length > 0 ? photoCount / pages.length : 0;
    
    return {
      success: true,
      data: pages,
      stats: {
        pagesGenerated: pages.length,
        photosPerPage: Math.round(avgPhotosPerPage * 10) / 10
      }
    };
  } catch (error) {
    console.error('Page generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Page generation failed'
    };
  }
}

/**
 * Run the complete photobook pipeline
 * 
 * Orchestrates all stages: analyze → select → AI → layout
 */
export async function runPhotobookPipeline(
  files: Array<{ file: File; dataUrl: string; metadata: any }>,
  options: {
    apiUrl: string;
    skipAI?: boolean;
    onProgress?: ProgressCallback;
  }
): Promise<PhotobookPipelineResult> {
  const { apiUrl, skipAI = false, onProgress } = options;
  
  // Stage 1: Analyze photos
  const analyzeResult = await analyzePhotos(files, (stage, progress, msg) => {
    onProgress?.(stage, progress * 0.3, msg); // 0-30%
  });
  
  if (!analyzeResult.success || !analyzeResult.data) {
    throw new Error(analyzeResult.error || 'Photo analysis failed');
  }
  
  // Stage 2: Select photos
  const selectResult = selectPhotos(analyzeResult.data, (stage, progress, msg) => {
    onProgress?.(stage, 30 + progress * 0.1, msg); // 30-40%
  });
  
  if (!selectResult.success || !selectResult.data) {
    throw new Error(selectResult.error || 'Photo selection failed');
  }
  
  // Stage 3: AI Analysis (optional)
  let analysis: LaneyAnalysis | undefined;
  
  if (!skipAI) {
    const aiResult = await callAIAnalysis(analyzeResult.data, apiUrl, (stage, progress, msg) => {
      onProgress?.(stage, 40 + progress * 0.4, msg); // 40-80%
    });
    
    if (aiResult.success && aiResult.data) {
      analysis = aiResult.data;
    }
    // Continue even if AI fails - we can generate layouts without it
  }
  
  // Stage 4: Generate pages
  const pageResult = generatePages(selectResult.data.selected, analysis, (stage, progress, msg) => {
    onProgress?.(stage, 80 + progress * 0.2, msg); // 80-100%
  });
  
  if (!pageResult.success || !pageResult.data) {
    throw new Error(pageResult.error || 'Page generation failed');
  }
  
  return {
    photos: selectResult.data.selected,
    pages: pageResult.data,
    analysis,
    stats: {
      totalUploaded: files.length,
      afterDeduplication: analyzeResult.data.length,
      selected: selectResult.data.selected.length,
      excluded: selectResult.data.excluded.length,
      pagesGenerated: pageResult.data.length,
      photosPerPage: pageResult.stats?.photosPerPage as number || 0
    }
  };
}
