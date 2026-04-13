import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { minioClient } from '@/lib/minio';

export const dynamic = 'force-dynamic';
export async function GET() {
  const cv = await db.cvAsset.findFirst({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!cv) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const bucket = process.env.MINIO_BUCKET ?? 'portfolio-assets';
    const stream = await minioClient.getObject(bucket, cv.storageKey);

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cv.fileName}"`,
        'Content-Length': String(cv.fileSize),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
}
