import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { withAdminAuth } from '@/lib/admin/api-helpers';
import { deleteFromMinio, uploadToMinio } from '@/lib/minio';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const GET = withAdminAuth(async () => {
  const cv = await db.cvAsset.findFirst({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!cv) {
    return NextResponse.json({ cv: null });
  }

  const { storageKey: _, ...publicCv } = cv;
  return NextResponse.json({ cv: publicCv });
});

export const POST = withAdminAuth(async (req) => {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
  }

  const storageKey = `cv/${Date.now()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadToMinio(storageKey, buffer, 'application/pdf', file.size);
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const existingCv = await db.cvAsset.findFirst({
    where: { published: true },
  });

  if (existingCv) {
    await db.cvAsset.delete({ where: { id: existingCv.id } });
    try {
      await deleteFromMinio(existingCv.storageKey);
    } catch {
      // MinIO cleanup failure is non-critical; the DB record is already deleted
    }
  }

  const cv = await db.cvAsset.create({
    data: {
      fileName: file.name,
      storageKey,
      fileSize: file.size,
      published: true,
    },
  });

  const { storageKey: _, ...publicCv } = cv;
  return NextResponse.json({ cv: publicCv }, { status: 201 });
});

export const DELETE = withAdminAuth(async () => {
  const existingCv = await db.cvAsset.findFirst({
    where: { published: true },
  });

  if (!existingCv) {
    return NextResponse.json({ error: 'No CV found' }, { status: 404 });
  }

  await deleteFromMinio(existingCv.storageKey);
  await db.cvAsset.delete({ where: { id: existingCv.id } });

  return new NextResponse(null, { status: 204 });
});
