import { NextResponse } from 'next/server';

import { ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { db } from '@/lib/db';
import { OpenSourceSchema } from '@/lib/admin/validation';

export const GET = withAdminAuth(async () => {
  const contributions = await db.openSourceContribution.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  return ok({ contributions });
});

export const POST = withAdminAuth(async (req) => {
  const body = await req.json();
  const validated = zodValidate(OpenSourceSchema, body);

  if (validated instanceof NextResponse) {
    return validated;
  }

  const contribution = await db.openSourceContribution.create({
    data: validated.data,
  });

  return NextResponse.json(contribution, { status: 201 });
});
