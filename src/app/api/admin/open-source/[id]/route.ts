import { NextResponse } from 'next/server';

import { notFound, ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { db } from '@/lib/db';
import { OpenSourceSchema } from '@/lib/admin/validation';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async () => {
    const contribution = await db.openSourceContribution.findUnique({
      where: { id: params.id },
    });

    if (!contribution) {
      return notFound();
    }

    return ok(contribution);
  })(req);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async (innerReq) => {
    const existing = await db.openSourceContribution.findUnique({ where: { id: params.id } });

    if (!existing) {
      return notFound();
    }

    const body = await innerReq.json();
    const validated = zodValidate(OpenSourceSchema.partial(), body);

    if (validated instanceof NextResponse) {
      return validated;
    }

    const contribution = await db.openSourceContribution.update({
      where: { id: params.id },
      data: validated.data,
    });

    return ok(contribution);
  })(req);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async () => {
    const existing = await db.openSourceContribution.findUnique({ where: { id: params.id } });

    if (!existing) {
      return notFound();
    }

    await db.openSourceContribution.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  })(req);
}
