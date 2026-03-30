import { NextResponse } from 'next/server';

import { ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { db } from '@/lib/db';
import { TalkSchema } from '@/lib/admin/validation';

export const GET = withAdminAuth(async () => {
  const talks = await db.talk.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  return ok({ talks });
});

export const POST = withAdminAuth(async (req) => {
  const body = await req.json();
  const validated = zodValidate(TalkSchema, body);

  if (validated instanceof NextResponse) {
    return validated;
  }

  const talk = await db.talk.create({
    data: validated.data,
  });

  return NextResponse.json(talk, { status: 201 });
});
