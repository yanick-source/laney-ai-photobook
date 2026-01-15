// IndexedDB-based storage for photobook data to handle large image files

import { LaneyAnalysis } from './smartLayoutEngine';
import { PhotoQualityScore } from './photoAnalysis';

const DB_NAME = "laneyPhotobookDB";
const DB_VERSION = 3; // Bumped version for schema change
const STORE_NAME = "photobooks";

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
