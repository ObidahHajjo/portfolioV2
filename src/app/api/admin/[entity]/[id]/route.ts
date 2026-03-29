import { NextResponse } from 'next/server';

import { notFound, ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import {
  deleteEntityRecord,
  getEntityRecord,
  getSchemaForEntity,
  isListSegment,
  updateEntityRecord,
} from '@/lib/admin/server';

export async function GET(req: Request, { params }: { params: { entity: string; id: string } }) {
  if (!isListSegment(params.entity)) {
    return notFound();
  }

  return withAdminAuth(async () => {
    const record = await getEntityRecord(
      params.entity as Parameters<typeof getEntityRecord>[0],
      params.id
    );
    return record ? ok(record) : notFound();
  })(req);
}

export async function PATCH(req: Request, { params }: { params: { entity: string; id: string } }) {
  if (!isListSegment(params.entity)) {
    return notFound();
  }

  return withAdminAuth(async (innerReq) => {
    const schema = getSchemaForEntity(params.entity as Parameters<typeof getSchemaForEntity>[0]);

    if (!schema) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 422 });
    }

    const payload = zodValidate(schema as any, await innerReq.json());

    if (payload instanceof NextResponse) {
      return payload;
    }

    const existing = await getEntityRecord(
      params.entity as Parameters<typeof getEntityRecord>[0],
      params.id
    );

    if (!existing) {
      return notFound();
    }

    const result = await updateEntityRecord(
      params.entity as Parameters<typeof updateEntityRecord>[0],
      params.id,
      payload.data as Record<string, unknown>
    );
    return result instanceof NextResponse ? result : ok(result);
  })(req);
}

export async function DELETE(req: Request, { params }: { params: { entity: string; id: string } }) {
  if (!isListSegment(params.entity)) {
    return notFound();
  }

  return withAdminAuth(async () => {
    const existing = await getEntityRecord(
      params.entity as Parameters<typeof getEntityRecord>[0],
      params.id
    );

    if (!existing) {
      return notFound();
    }

    const result = await deleteEntityRecord(
      params.entity as Parameters<typeof deleteEntityRecord>[0],
      params.id
    );
    return result instanceof NextResponse ? result : ok(result);
  })(req);
}
