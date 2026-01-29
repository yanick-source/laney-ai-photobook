/**
 * Shared types for the AI photobook pipeline
 * 
 * This file contains type definitions used across multiple modules
 * to avoid circular dependencies.
 */

import { PhotoQualityScore } from './photoAnalysis';

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
