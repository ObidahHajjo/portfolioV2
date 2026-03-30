import { NextResponse } from 'next/server';

import { notFound, ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { db } from '@/lib/db';
import { ArticleSchema } from '@/lib/admin/validation';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async () => {
    const article = await db.article.findUnique({
      where: { id: params.id },
    });

    if (!article) {
      return notFound();
    }

    return ok(article);
  })(req);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async (innerReq) => {
    const existing = await db.article.findUnique({ where: { id: params.id } });

    if (!existing) {
      return notFound();
    }

    const body = await innerReq.json();
    const validated = zodValidate(ArticleSchema.partial(), body);

    if (validated instanceof NextResponse) {
      return validated;
    }

    const article = await db.article.update({
      where: { id: params.id },
      data: validated.data,
    });

    return ok(article);
  })(req);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async () => {
    const existing = await db.article.findUnique({ where: { id: params.id } });

    if (!existing) {
      return notFound();
    }

    await db.article.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  })(req);
}
