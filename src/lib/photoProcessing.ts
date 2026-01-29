/**
 * Photo Processing Utilities for Smart Scalable AI Pipeline
 * Handles deduplication, smart sampling, and batched processing
 */

import { AnalyzedPhoto } from './photoAnalysis';

export interface ProcessingStats {
  total: number;       // Raw upload count
  unique: number;      // After deduplication
  duplicates: number;  // Count removed
  analyzed: number;    // Count sent to AI (max 50)
  currentBatch: number;
  totalBatches: number;
  progress: number;    // 0-100%
  status: string;      // User-facing text
}

export interface DeduplicationResult {
  unique: File[];
  duplicates: number;
  duplicateFiles: File[];
}

/**
 * Stage 1: Fast Deduplication
 * Creates a unique key based on file metadata to identify duplicates
 */
export function deduplicatePhotos(files: File[]): DeduplicationResult {
  const seen = new Map<string, File>();
  const duplicateFiles: File[] = [];
  
  files.forEach(file => {
    // Create unique key from metadata
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    
    if (!seen.has(key)) {
      seen.set(key, file);
    } else {
      duplicateFiles.push(file);
    }
  });
  
  const unique = Array.from(seen.values());
  
  return {
    unique,
    duplicates: duplicateFiles.length,
    duplicateFiles
  };
}

/**
 * Stage 2: Smart Sampling (The Director)
 * Selects exactly 50 representative photos for AI analysis
 * Algorithm:
 * - First 10 (Intro/Start)
 * - Last 10 (Outro/End)
 * - 30 evenly distributed from middle
 */
export function smartSampling(photos: AnalyzedPhoto[], maxSamples: number = 50): AnalyzedPhoto[] {
  if (photos.length <= maxSamples) {
    return photos;
  }
  
  const firstTen = photos.slice(0, 10);
  const lastTen = photos.slice(-10);
  const middle = photos.slice(10, -10);
  
  // Even sampling from middle
  const middleSamples: AnalyzedPhoto[] = [];
  const step = Math.max(1, Math.floor(middle.length / 30));
  
  for (let i = 0; i < 30 && i * step < middle.length; i++) {
    middleSamples.push(middle[i * step]);
  }
  
  // Combine and ensure we don't exceed maxSamples
  return [...firstTen, ...middleSamples, ...lastTen].slice(0, maxSamples);
}

/**
 * Stage 3: Create batches for processing
 * Splits photos into manageable batches to prevent browser crashes
 */
export function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Calculate optimal batch configuration based on photo count
 */
export function calculateBatchConfig(photoCount: number): {
  batchSize: number;
  maxConcurrent: number;
  estimatedTime: number;
} {
  // Optimize batch size based on total count
  let batchSize = 12;
  let maxConcurrent = 3;
  
  if (photoCount <= 20) {
    batchSize = 10;
    maxConcurrent = 2;
  } else if (photoCount > 40) {
    batchSize = 15;
    maxConcurrent = 3;
  }
  
  // Estimate processing time (rough calculation)
  const totalBatches = Math.ceil(photoCount / batchSize);
  const estimatedTime = Math.ceil((totalBatches / maxConcurrent) * 3); // ~3 seconds per batch
  
  return {
    batchSize,
    maxConcurrent,
    estimatedTime
  };
}

/**
 * Update processing stats with current progress
 */
export function updateStats(
  current: ProcessingStats,
  updates: Partial<ProcessingStats>
): ProcessingStats {
  return {
    ...current,
    ...updates
  };
}

/**
 * Memory-safe file processing
 * Converts File to object URL to reduce memory usage
 */
export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Cleanup object URLs to prevent memory leaks
 */
export function revokeObjectURLs(urls: string[]): void {
  urls.forEach(url => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Failed to revoke object URL:', error);
    }
  });
}

/**
 * Check if browser memory usage is approaching limits
 */
export function checkMemoryUsage(): {
  usedMB: number;
  limitMB: number;
  percentUsed: number;
  isHigh: boolean;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
    const percentUsed = (usedMB / limitMB) * 100;
    
    return {
      usedMB,
      limitMB,
      percentUsed,
      isHigh: percentUsed > 80
    };
  }
  
  return null;
}
