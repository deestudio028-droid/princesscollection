import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a Blob (or File) to Supabase Storage and returns the public URL.
 * 
 * @param file The file or blob to upload
 * @param bucketName The name of the storage bucket (default: 'princess_images')
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToSupabase(file: Blob, bucketName: string = 'princess_images'): Promise<string> {
  try {
    // Generate a unique filename using UUID and current timestamp
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `${Date.now()}_${uuidv4()}.${ext}`;

    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    throw error;
  }
}
