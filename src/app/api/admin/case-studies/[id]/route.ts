import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { notFound, ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { CaseStudySchema } from '@/lib/admin/validation';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async () => {
    const caseStudy = await db.caseStudy.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, title: true } },
        metrics: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!caseStudy) {
      return notFound();
    }

    return ok(caseStudy);
  })(req);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async (innerReq) => {
    const existing = await db.caseStudy.findUnique({ where: { id: params.id } });

    if (!existing) {
      return notFound();
    }

    const body = await innerReq.json();
    const payload = zodValidate(CaseStudySchema.partial(), body);

    if (payload instanceof NextResponse) {
      return payload;
    }

    const { projectId, ...data } = payload.data;

    if (projectId !== undefined && projectId !== null) {
      const project = await db.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 400 });
      }
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await db.caseStudy.findUnique({ where: { slug: data.slug } });
      if (slugConflict) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
      }
    }

    const caseStudy = await db.caseStudy.update({
      where: { id: params.id },
      data: {
        ...data,
        projectId: projectId === undefined ? existing.projectId : projectId || null,
      },
      include: {
        project: { select: { id: true, title: true } },
        metrics: { orderBy: { displayOrder: 'asc' } },
      },
    });

    return ok(caseStudy);
  })(req);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async () => {
    const existing = await db.caseStudy.findUnique({ where: { id: params.id } });

    if (!existing) {
      return notFound();
    }

    await db.caseStudy.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  })(req);
}
