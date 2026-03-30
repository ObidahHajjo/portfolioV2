import { NextResponse } from 'next/server';

import { notFound, ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { db } from '@/lib/db';
import { TalkSchema } from '@/lib/admin/validation';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async () => {
    const talk = await db.talk.findUnique({
      where: { id: params.id },
    });

    if (!talk) {
      return notFound();
    }

    return ok(talk);
  })(req);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async (innerReq) => {
    const existing = await db.talk.findUnique({ where: { id: params.id } });

    if (!existing) {
      return notFound();
    }

    const body = await innerReq.json();
    const validated = zodValidate(TalkSchema.partial(), body);

    if (validated instanceof NextResponse) {
      return validated;
    }

    const talk = await db.talk.update({
      where: { id: params.id },
      data: validated.data,
    });

    return ok(talk);
  })(req);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async () => {
    const existing = await db.talk.findUnique({ where: { id: params.id } });

    if (!existing) {
      return notFound();
    }

    await db.talk.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  })(req);
}
