import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types.supabase';
import { BookFormat, PhotobookData } from './photobookStorage';
import { LaneyAnalysis } from './smartLayoutEngine';

export interface CloudPhotobook {
  id: string;
  user_id: string;
  local_id: string | null;
  title: string;
  thumbnail_url: string | null;
  book_format: BookFormat;
  pages: any[] | null;
  photos: string[] | null;
  photos_with_quality: any[] | null;
  analysis: LaneyAnalysis | null;
  metadata: any;
  status: string;
  created_at: string;
  updated_at: string;
}

// Convert database row to PhotobookData format
function toPhotobookData(row: any): PhotobookData {
  return {
    id: row.id,
    title: row.title,
    photos: row.photos || [],
    photosWithQuality: row.photos_with_quality || undefined,
    analysis: row.analysis || undefined,
    bookFormat: row.book_format as BookFormat || { size: 'medium', orientation: 'vertical' },
    pages: row.pages || undefined,
    metadata: row.metadata || {
      totalPages: row.pages?.length || 0,
      photos: row.photos?.length || 0,
      chapters: 0,
      style: '',
      summary: ''
    }
  };
}

// Get all cloud photobooks for current user
export async function getCloudPhotobooks(): Promise<PhotobookData[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('photobooks')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching cloud photobooks:', error);
    return [];
  }

  return (data || []).map(row => toPhotobookData(row));
}

// Get a single cloud photobook by ID
export async function getCloudPhotobook(id: string): Promise<PhotobookData | null> {
  const { data, error } = await supabase
    .from('photobooks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching cloud photobook:', error);
    return null;
  }

  return data ? toPhotobookData(data) : null;
}

// Get a cloud photobook by its local ID (for sync detection)
export async function getCloudPhotobookByLocalId(localId: string): Promise<PhotobookData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('photobooks')
    .select('*')
    .eq('user_id', user.id)
    .eq('local_id', localId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching cloud photobook by local ID:', error);
    return null;
  }

  return data ? toPhotobookData(data) : null;
}

// Save a new photobook to the cloud
export async function savePhotobookToCloud(
  data: Omit<PhotobookData, 'id'>,
  localId?: string
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Cannot save to cloud: user not authenticated');
    return null;
  }

  const insertData = {
    user_id: user.id,
    local_id: localId || null,
    title: data.title,
    book_format: data.bookFormat as unknown as Json,
    pages: (data.pages || null) as unknown as Json,
    photos: data.photos || null,
    photos_with_quality: (data.photosWithQuality || null) as unknown as Json,
    analysis: (data.analysis || null) as unknown as Json,
    metadata: (data.metadata || {}) as unknown as Json,
    status: 'draft'
  };

  const { data: result, error } = await supabase
    .from('photobooks')
    .insert([insertData])
    .select('id')
    .single();

  if (error) {
    console.error('Error saving photobook to cloud:', error);
    return null;
  }

  return result.id;
}

// Update an existing cloud photobook
export async function updateCloudPhotobook(
  id: string,
  updates: Partial<PhotobookData>
): Promise<boolean> {
  const dbUpdates: Record<string, any> = {};

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.bookFormat !== undefined) dbUpdates.book_format = updates.bookFormat;
  if (updates.pages !== undefined) dbUpdates.pages = updates.pages;
  if (updates.photos !== undefined) dbUpdates.photos = updates.photos;
  if (updates.photosWithQuality !== undefined) dbUpdates.photos_with_quality = updates.photosWithQuality;
  if (updates.analysis !== undefined) dbUpdates.analysis = updates.analysis;
  if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

  const { error } = await supabase
    .from('photobooks')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating cloud photobook:', error);
    return false;
  }

  return true;
}

// Delete a cloud photobook
export async function deleteCloudPhotobook(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('photobooks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting cloud photobook:', error);
    return false;
  }

  return true;
}

// Upload a photo to cloud storage
export async function uploadPhotoToCloud(
  photoData: string,
  photobookId: string
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Convert base64 to blob if needed
  let blob: Blob;
  if (photoData.startsWith('data:')) {
    const response = await fetch(photoData);
    blob = await response.blob();
  } else {
    // Already a URL, just return it
    return photoData;
  }

  const fileName = `${user.id}/${photobookId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

  const { error } = await supabase.storage
    .from('photobook-images')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) {
    console.error('Error uploading photo to cloud:', error);
    return null;
  }

  // Get signed URL (valid for 24 hours)
  const { data: urlData, error: signError } = await supabase.storage
    .from('photobook-images')
    .createSignedUrl(fileName, 86400); // 24 hour expiry

  if (signError || !urlData) {
    console.error('Error creating signed URL:', signError);
    return null;
  }

  return urlData.signedUrl;
}

// Sync a local photobook to the cloud
export async function syncPhotobookToCloud(
  localData: PhotobookData
): Promise<{ cloudId: string | null; success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { cloudId: null, success: false };
  }

  // Check if already synced
  const existing = await getCloudPhotobookByLocalId(localData.id);
  
  if (existing) {
    // Update existing
    const success = await updateCloudPhotobook(existing.id, localData);
    return { cloudId: existing.id, success };
  } else {
    // Create new
    const cloudId = await savePhotobookToCloud(localData, localData.id);
    return { cloudId, success: !!cloudId };
  }
}

// Check if user is authenticated
export async function isUserAuthenticated(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}
