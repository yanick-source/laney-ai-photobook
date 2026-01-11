import { UploadedPhoto, PhotoMetadata } from "@/hooks/usePhotoUpload";

export interface PhotoQualityScore {
  overall: number; // 0-100
  sharpness: number;
  lighting: number;
  composition: number;
  faceDetected: boolean;
  facePosition?: { x: number; y: number; width: number; height: number };
  subjectCenter?: { x: number; y: number };
  dominantColors?: string[];
  isPortrait: boolean;
  isLandscape: boolean;
  aspectRatio: number;
}

export interface AnalyzedPhoto extends UploadedPhoto {
  quality: PhotoQualityScore;
  selectedForBook: boolean;
  pageAssignment?: number;
}

// Analyze image quality using canvas
export async function analyzePhotoQuality(
  dataUrl: string,
  metadata: PhotoMetadata
): Promise<PhotoQualityScore> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(getDefaultScore(metadata));
        return;
      }

      // Use smaller dimensions for analysis
      const analysisWidth = Math.min(img.width, 400);
      const analysisHeight = Math.round((analysisWidth / img.width) * img.height);
      canvas.width = analysisWidth;
      canvas.height = analysisHeight;

      ctx.drawImage(img, 0, 0, analysisWidth, analysisHeight);

      const imageData = ctx.getImageData(0, 0, analysisWidth, analysisHeight);
      const data = imageData.data;

      // Calculate sharpness (edge detection approximation)
      const sharpness = calculateSharpness(data, analysisWidth, analysisHeight);

      // Calculate lighting score
      const lighting = calculateLighting(data);

      // Calculate composition score (rule of thirds)
      const composition = calculateComposition(data, analysisWidth, analysisHeight);

      // Extract dominant colors
      const dominantColors = extractDominantColors(data);

      // Estimate face/subject position (simplified - center of brightness)
      const subjectCenter = findSubjectCenter(data, analysisWidth, analysisHeight);

      // Overall score (weighted average)
      const overall = Math.round(
        sharpness * 0.35 +
        lighting * 0.3 +
        composition * 0.25 +
        (metadata.width >= 1200 ? 10 : 0) // Bonus for high resolution
      );

      resolve({
        overall: Math.min(100, overall),
        sharpness,
        lighting,
        composition,
        faceDetected: false, // Simplified - would need ML model for accurate detection
        subjectCenter,
        dominantColors,
        isPortrait: metadata.isPortrait,
        isLandscape: metadata.isLandscape,
        aspectRatio: metadata.aspectRatio,
      });
    };

    img.onerror = () => {
      resolve(getDefaultScore(metadata));
    };

    img.src = dataUrl;
  });
}

function getDefaultScore(metadata: PhotoMetadata): PhotoQualityScore {
  return {
    overall: 70,
    sharpness: 70,
    lighting: 70,
    composition: 70,
    faceDetected: false,
    isPortrait: metadata.isPortrait,
    isLandscape: metadata.isLandscape,
    aspectRatio: metadata.aspectRatio,
  };
}

function calculateSharpness(data: Uint8ClampedArray, width: number, height: number): number {
  let totalVariance = 0;
  let count = 0;

  // Sample pixels and check for edge-like patterns (high contrast neighbors)
  for (let y = 1; y < height - 1; y += 3) {
    for (let x = 1; x < width - 1; x += 3) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Compare with neighbors
      const idxUp = ((y - 1) * width + x) * 4;
      const idxDown = ((y + 1) * width + x) * 4;
      const idxLeft = (y * width + (x - 1)) * 4;
      const idxRight = (y * width + (x + 1)) * 4;

      const grayUp = (data[idxUp] + data[idxUp + 1] + data[idxUp + 2]) / 3;
      const grayDown = (data[idxDown] + data[idxDown + 1] + data[idxDown + 2]) / 3;
      const grayLeft = (data[idxLeft] + data[idxLeft + 1] + data[idxLeft + 2]) / 3;
      const grayRight = (data[idxRight] + data[idxRight + 1] + data[idxRight + 2]) / 3;

      const variance = Math.abs(gray - grayUp) + Math.abs(gray - grayDown) +
                       Math.abs(gray - grayLeft) + Math.abs(gray - grayRight);
      
      totalVariance += variance;
      count++;
    }
  }

  const avgVariance = totalVariance / count;
  // Normalize to 0-100 (higher variance = sharper image)
  return Math.min(100, Math.round(avgVariance * 2));
}

function calculateLighting(data: Uint8ClampedArray): number {
  let totalBrightness = 0;
  let pixelCount = 0;
  let underexposed = 0;
  let overexposed = 0;

  for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    totalBrightness += brightness;
    pixelCount++;

    if (brightness < 30) underexposed++;
    if (brightness > 240) overexposed++;
  }

  const avgBrightness = totalBrightness / pixelCount;
  const underexposedRatio = underexposed / pixelCount;
  const overexposedRatio = overexposed / pixelCount;

  // Ideal brightness is around 128, penalize extremes
  let score = 100 - Math.abs(avgBrightness - 128) * 0.5;
  
  // Penalize heavily under/overexposed images
  score -= underexposedRatio * 50;
  score -= overexposedRatio * 30;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateComposition(data: Uint8ClampedArray, width: number, height: number): number {
  // Check if interesting content is at rule-of-thirds positions
  const thirdX1 = Math.floor(width / 3);
  const thirdX2 = Math.floor((width * 2) / 3);
  const thirdY1 = Math.floor(height / 3);
  const thirdY2 = Math.floor((height * 2) / 3);

  // Sample contrast at rule of thirds intersections
  let ruleOfThirdsScore = 0;
  const samplePoints = [
    { x: thirdX1, y: thirdY1 },
    { x: thirdX2, y: thirdY1 },
    { x: thirdX1, y: thirdY2 },
    { x: thirdX2, y: thirdY2 },
  ];

  for (const point of samplePoints) {
    const contrast = getLocalContrast(data, point.x, point.y, width, height);
    ruleOfThirdsScore += contrast;
  }

  // Also check center - good composition often has subject offset from center
  const centerContrast = getLocalContrast(data, Math.floor(width / 2), Math.floor(height / 2), width, height);
  
  // Higher score if thirds have more interest than dead center
  const avgThirdsScore = ruleOfThirdsScore / 4;
  const compositionBalance = avgThirdsScore > centerContrast * 0.7 ? 20 : 0;

  return Math.min(100, Math.round(avgThirdsScore + compositionBalance));
}

function getLocalContrast(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): number {
  const radius = 10;
  let min = 255, max = 0;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const px = Math.max(0, Math.min(width - 1, x + dx));
      const py = Math.max(0, Math.min(height - 1, y + dy));
      const idx = (py * width + px) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      min = Math.min(min, gray);
      max = Math.max(max, gray);
    }
  }

  return max - min;
}

function findSubjectCenter(data: Uint8ClampedArray, width: number, height: number): { x: number; y: number } {
  // Find center of visual interest using weighted brightness/contrast
  let totalX = 0, totalY = 0, totalWeight = 0;

  for (let y = 0; y < height; y += 5) {
    for (let x = 0; x < width; x += 5) {
      const contrast = getLocalContrast(data, x, y, width, height);
      const weight = contrast * contrast; // Square to emphasize high-contrast areas
      
      totalX += x * weight;
      totalY += y * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) {
    return { x: 0.5, y: 0.5 };
  }

  return {
    x: (totalX / totalWeight) / width,
    y: (totalY / totalWeight) / height,
  };
}

function extractDominantColors(data: Uint8ClampedArray): string[] {
  const colorCounts: Record<string, number> = {};

  // Sample and quantize colors
  for (let i = 0; i < data.length; i += 40) { // Sample every 10th pixel
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    
    const key = `${r},${g},${b}`;
    colorCounts[key] = (colorCounts[key] || 0) + 1;
  }

  // Get top 3 colors
  return Object.entries(colorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([color]) => {
      const [r, g, b] = color.split(",").map(Number);
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    });
}

// Select best photos for the book based on quality and diversity
export function selectPhotosForBook(
  photos: AnalyzedPhoto[],
  targetCount: number
): AnalyzedPhoto[] {
  // Sort by quality
  const sorted = [...photos].sort((a, b) => b.quality.overall - a.quality.overall);

  // Select top photos, ensuring mix of portrait/landscape
  const selected: AnalyzedPhoto[] = [];
  const portraits = sorted.filter((p) => p.quality.isPortrait);
  const landscapes = sorted.filter((p) => p.quality.isLandscape);

  // Aim for balanced mix
  const portraitTarget = Math.floor(targetCount * 0.4);
  const landscapeTarget = targetCount - portraitTarget;

  // Select best from each category
  selected.push(...portraits.slice(0, portraitTarget));
  selected.push(...landscapes.slice(0, landscapeTarget));

  // If not enough, fill from remaining
  if (selected.length < targetCount) {
    const remaining = sorted.filter((p) => !selected.includes(p));
    selected.push(...remaining.slice(0, targetCount - selected.length));
  }

  return selected.map((p) => ({ ...p, selectedForBook: true }));
}

// Calculate smart crop position based on subject detection
export function calculateSmartCrop(
  quality: PhotoQualityScore,
  targetAspectRatio: number
): { x: number; y: number; width: number; height: number } {
  const sourceAspect = quality.aspectRatio;
  const subjectX = quality.subjectCenter?.x ?? 0.5;
  const subjectY = quality.subjectCenter?.y ?? 0.5;

  let cropX = 0, cropY = 0, cropWidth = 1, cropHeight = 1;

  if (sourceAspect > targetAspectRatio) {
    // Source is wider - crop horizontally
    cropWidth = targetAspectRatio / sourceAspect;
    // Center crop on subject, clamped to valid range
    cropX = Math.max(0, Math.min(1 - cropWidth, subjectX - cropWidth / 2));
  } else {
    // Source is taller - crop vertically
    cropHeight = sourceAspect / targetAspectRatio;
    // Center crop on subject, clamped to valid range
    cropY = Math.max(0, Math.min(1 - cropHeight, subjectY - cropHeight / 2));
  }

  return { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
}
