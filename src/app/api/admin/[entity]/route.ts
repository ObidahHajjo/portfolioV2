import { NextResponse } from 'next/server';

import { ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import {
  createEntityRecord,
  getSchemaForEntity,
  getSingletonRecord,
  isAdminEntitySegment,
  isListSegment,
  isSingletonSegment,
  listEntityRecords,
  updateSingletonRecord,
} from '@/lib/admin/server';

export async function GET(req: Request, { params }: { params: { entity: string } }) {
  if (!isAdminEntitySegment(params.entity)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return withAdminAuth(async () => {
    if (isSingletonSegment(params.entity)) {
      return ok(await getSingletonRecord(params.entity));
    }

    return ok(await listEntityRecords(params.entity as Parameters<typeof listEntityRecords>[0]));
  })(req);
}

export async function PATCH(req: Request, { params }: { params: { entity: string } }) {
  if (!isSingletonSegment(params.entity)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return withAdminAuth(async (innerReq) => {
    const schema = getSchemaForEntity(params.entity as Parameters<typeof getSchemaForEntity>[0]);

    if (!schema) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const payload = zodValidate(schema as any, await innerReq.json());

    if (payload instanceof NextResponse) {
      return payload;
    }

    return ok(
      await updateSingletonRecord(
        params.entity as Parameters<typeof updateSingletonRecord>[0],
        payload.data as Record<string, unknown>
      )
    );
  })(req);
}

export async function POST(req: Request, { params }: { params: { entity: string } }) {
  if (!isListSegment(params.entity)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return withAdminAuth(async (innerReq) => {
    const schema = getSchemaForEntity(params.entity as Parameters<typeof getSchemaForEntity>[0]);

    if (!schema) {
      return NextResponse.json(
        { error: 'Use the upload endpoint for media assets' },
        { status: 405 }
      );
    }

    const payload = zodValidate(schema as any, await innerReq.json());

    if (payload instanceof NextResponse) {
      return payload;
    }

    const result = await createEntityRecord(
      params.entity as Parameters<typeof createEntityRecord>[0],
      payload.data as Record<string, unknown>
    );

    if (result instanceof NextResponse) {
      return result;
    }

    return ok(result, { status: 201 });
  })(req);
}
