import { Client } from 'minio';

const bucket = process.env.MINIO_BUCKET ?? 'portfolio-assets';
const endpoint = process.env.MINIO_ENDPOINT!;
const port = Number(process.env.MINIO_PORT ?? 9000);
const useSSL = process.env.MINIO_USE_SSL === 'true';

export const minioClient = new Client({
  endPoint: endpoint,
  port,
  useSSL,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

let bucketReadyPromise: Promise<void> | null = null;

async function ensureBucketReady() {
  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      const exists = await minioClient.bucketExists(bucket);

      if (!exists) {
        await minioClient.makeBucket(bucket);
      }
    })().catch((error) => {
      bucketReadyPromise = null;
      throw error;
    });
  }

  await bucketReadyPromise;
}

export async function uploadToMinio(
  objectName: string,
  buffer: Buffer,
  mimeType: string,
  size: number
): Promise<string> {
  await ensureBucketReady();

  await minioClient.putObject(bucket, objectName, buffer, size, {
    'Content-Type': mimeType,
  });

  const protocol = useSSL ? 'https' : 'http';

  return `${protocol}://${endpoint}:${port}/${bucket}/${objectName}`;
}

export async function deleteFromMinio(objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(bucket, objectName);
  } catch (error) {
    console.warn('Failed to delete MinIO object', { objectName, error });
  }
}
