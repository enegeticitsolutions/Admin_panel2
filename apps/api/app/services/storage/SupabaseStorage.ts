import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService, UploadResult } from './StorageInterface';

/**
 * SupabaseStorage
 *
 * Storage provider backed by Supabase Storage.
 * Used LOCALLY during development when STORAGE_PROVIDER=supabase (default).
 * Not used in any deployed AWS environment.
 */
export class SupabaseStorage extends StorageService {
  private readonly client: SupabaseClient;
  private readonly bucketName: string;

  constructor() {
    super();
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        '[SupabaseStorage] Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ' +
        'Set them in apps/api/.env for local development.'
      );
    }

    this.bucketName = process.env.STORAGE_BUCKET || 'staff-documents';
    this.client = createClient(url, key);
    console.log('[Storage] Using Supabase provider → bucket:', this.bucketName);
  }

  async upload(fileBuffer: Buffer, path: string, mimeType: string): Promise<UploadResult> {
    const { error } = await this.client.storage
      .from(this.bucketName)
      .upload(path, fileBuffer, { contentType: mimeType, upsert: true });

    if (error) throw new Error(`[SupabaseStorage] Upload failed: ${error.message}`);

    const url = await this.getPublicUrl(path);
    return { path, url };
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) throw new Error(`[SupabaseStorage] Delete failed: ${error.message}`);
  }

  async getPublicUrl(path: string): Promise<string> {
    const { data } = this.client.storage.from(this.bucketName).getPublicUrl(path);
    return data.publicUrl;
  }
}
