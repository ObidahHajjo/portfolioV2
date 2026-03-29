import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/admin/api-helpers';
import { db } from '@/lib/db';
import { deleteFromMinio, uploadToMinio } from '@/lib/minio';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

export const POST = withAdminAuth(async (req) => {
  const formData = await req.formData();
  const file = formData.get('file');
  const ownerType = formData.get('ownerType');
  const ownerId = formData.get('ownerId');

  if (!(file instanceof File) || typeof ownerType !== 'string' || typeof ownerId !== 'string') {
    return NextResponse.json({ error: 'Invalid upload payload' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  }

  const objectName = `${ownerType}/${ownerId}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let storageUrl: string;

  try {
    storageUrl = await uploadToMinio(objectName, buffer, file.type, file.size);
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  try {
    const asset = await db.mediaAsset.create({
      data: {
        fileName: file.name,
        storageUrl,
        fileType: file.type,
        fileSize: file.size,
        ownerType,
        ownerId,
      },
    });

    return NextResponse.json(
      {
        id: asset.id,
        storageUrl: asset.storageUrl,
        fileName: asset.fileName,
        fileType: asset.fileType,
      },
      { status: 201 }
    );
  } catch {
    await deleteFromMinio(objectName);
    return NextResponse.json(
      { error: 'Upload failed. Storage has been cleaned up.' },
      { status: 500 }
    );
  }
});
