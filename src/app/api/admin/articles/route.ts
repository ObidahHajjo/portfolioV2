import { NextResponse } from 'next/server';

import { ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { db } from '@/lib/db';
import { ArticleSchema } from '@/lib/admin/validation';

export const GET = withAdminAuth(async () => {
  const articles = await db.article.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  return ok({ articles });
});

export const POST = withAdminAuth(async (req) => {
  const body = await req.json();
  const validated = zodValidate(ArticleSchema, body);

  if (validated instanceof NextResponse) {
    return validated;
  }

  const article = await db.article.create({
    data: validated.data,
  });

  return NextResponse.json(article, { status: 201 });
});
