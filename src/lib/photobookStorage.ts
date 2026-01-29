// IndexedDB-based storage for photobook data to handle large image files

import { LaneyAnalysis } from './aiTypes';
import { PhotoQualityScore } from './photoAnalysis';

const DB_NAME = "laneyPhotobookDB";
const DB_VERSION = 4; // Bumped version for book format
const STORE_NAME = "photobooks";

export type BookSize = "small" | "medium" | "large";
export type BookOrientation = "vertical" | "horizontal";

export interface BookFormat {
  size: BookSize;
  orientation: BookOrientation;
}

// Standard book dimensions (in mm)
export const BOOK_DIMENSIONS = {
  small: { width: 170, height: 240 },  // A6-ish
  medium: { width: 210, height: 297 }, // A4
  large: { width: 240, height: 320 },   // Larger square
} as const;

// Calculate aspect ratio based on book format
export function getAspectRatio(format: BookFormat): number {
  const { size, orientation } = format;
  const dimensions = BOOK_DIMENSIONS[size];
  
  if (orientation === 'horizontal') {
    return dimensions.height / dimensions.width; // Landscape
  } else {
    return dimensions.width / dimensions.height; // Portrait
  }
}

// Get canvas dimensions based on format and available space
export function getCanvasDimensions(format: BookFormat, maxWidth: number = 1200, maxHeight: number = 800) {
  const aspectRatio = getAspectRatio(format);
  
  // Calculate dimensions that fit within max bounds
  let width, height;
  
  if (aspectRatio > 1) { // Portrait
    height = Math.min(maxHeight, maxWidth / aspectRatio);
    width = height * aspectRatio;
  } else { // Landscape
    width = Math.min(maxWidth, maxHeight * aspectRatio);
    height = width / aspectRatio;
  }
  
  return {
    width: Math.max(600, Math.min(1400, width)),
    height: Math.max(400, Math.min(1000, height))
  };
}

export interface PhotoWithQuality {
  dataUrl: string;
  quality?: PhotoQualityScore;
}

export interface PhotobookData {
  id: string;
  title: string;
  photos: string[];
  photosWithQuality?: PhotoWithQuality[]; // Enhanced photo data with quality analysis
  analysis?: LaneyAnalysis; // Full AI analysis for smart layouts
  bookFormat: BookFormat; // Required book format selection
  pages?: any[]; // Store page state for persistence
  metadata: {
    totalPages: number;
    photos: number;
    chapters: number;
    style: string;
    summary: string;
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function savePhotobook(data: Omit<PhotobookData, "id">): Promise<string> {
  const db = await openDB();
  const id = `photobook-${Date.now()}`;
  const photobookData: PhotobookData = { ...data, id };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(photobookData);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Store the current photobook ID in sessionStorage for quick access
      sessionStorage.setItem("currentPhotobookId", id);
      resolve(id);
    };
  });
}

export async function getPhotobook(id?: string): Promise<PhotobookData | null> {
  const photobookId = id || sessionStorage.getItem("currentPhotobookId");
  if (!photobookId) return null;

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(photobookId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function updatePhotobook(id: string, data: Partial<PhotobookData>): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  
  const existing = await new Promise<PhotobookData>((resolve, reject) => {
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
  
  if (!existing) {
    throw new Error('Photobook not found');
  }
  
  await new Promise<void>((resolve, reject) => {
    const request = store.put({ ...existing, ...data });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deletePhotobook(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Get all local photobooks
export async function getAllLocalPhotobooks(): Promise<PhotobookData[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}
