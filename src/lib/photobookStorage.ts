// IndexedDB-based storage for photobook data to handle large image files

const DB_NAME = "laneyPhotobookDB";
const DB_VERSION = 1;
const STORE_NAME = "photobooks";

interface PhotobookData {
  id: string;
  title: string;
  photos: string[];
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
