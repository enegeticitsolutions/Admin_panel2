/**
 * StorageService Interface
 *
 * Every storage provider (Supabase, AWS S3, etc.) must implement this contract.
 * Switching providers is done purely via the STORAGE_PROVIDER env variable —
 * no code change is ever needed.
 */
export interface UploadResult {
  /** The storage key / path where the file was saved */
  path: string;
  /** The publicly accessible URL to the file */
  url: string;
}

export abstract class StorageService {
  /**
   * Upload a file buffer to the given storage path.
   * @param fileBuffer - raw file bytes
   * @param path       - destination key/path inside the bucket
   * @param mimeType   - MIME type of the file (e.g. 'image/jpeg')
   */
  abstract upload(fileBuffer: Buffer, path: string, mimeType: string): Promise<UploadResult>;

  /**
   * Delete a file from storage by its path/key.
   * @param path - the key/path returned from upload()
   */
  abstract delete(path: string): Promise<void>;

  /**
   * Get the publicly accessible URL for a stored file.
   * @param path - the key/path of the stored file
   */
  abstract getPublicUrl(path: string): Promise<string>;
}
