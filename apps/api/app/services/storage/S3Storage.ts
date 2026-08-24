import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageService, UploadResult } from './StorageInterface';

/**
 * S3Storage
 *
 * Storage provider backed by AWS S3.
 * Used in all deployed environments (Staging + Production) when STORAGE_PROVIDER=s3.
 *
 * On ECS Fargate, the task IAM role (mhn-ecs-task-role-*) provides S3 access
 * automatically — no AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY needed in the secret.
 * The SDK picks up IAM role credentials from the ECS metadata endpoint.
 *
 * For local testing with S3, set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.
 */
export class S3Storage extends StorageService {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor() {
    super();
    this.bucketName = process.env.STORAGE_BUCKET || 'maihoonna-staff-documents-staging';
    this.region = process.env.AWS_REGION || 'ap-south-1';

    // On ECS Fargate the SDK uses IAM role credentials automatically.
    // Locally, it falls back to AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY in .env.
    this.s3 = new S3Client({ region: this.region });
    console.log('[Storage] Using AWS S3 provider → bucket:', this.bucketName, '| region:', this.region);
  }

  async upload(fileBuffer: Buffer, path: string, mimeType: string): Promise<UploadResult> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: path,
        Body: fileBuffer,
        ContentType: mimeType,
        // Buckets are private — access via pre-signed URLs or CloudFront OAC
      })
    );

    const url = await this.getPublicUrl(path);
    return { path, url };
  }

  async delete(path: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: path,
      })
    );
  }

  async getPublicUrl(path: string): Promise<string> {
    // Standard S3 URL. For private buckets, replace with pre-signed URL logic.
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${path}`;
  }
}
