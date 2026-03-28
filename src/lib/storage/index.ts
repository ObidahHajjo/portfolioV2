import { S3Client } from '@aws-sdk/client-s3'

export const storageClient = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY ?? '',
    secretAccessKey: process.env.MINIO_SECRET_KEY ?? '',
  },
  forcePathStyle: true,
})

export const MEDIA_BUCKET = process.env.MINIO_BUCKET ?? 'portfolio-media'
