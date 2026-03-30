import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { CaseStudySchema } from '@/lib/admin/validation';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 150);
}

export const GET = withAdminAuth(async () => {
  const caseStudies = await db.caseStudy.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      project: { select: { id: true, title: true } },
      _count: { select: { metrics: true } },
    },
  });
  return ok({
    caseStudies: caseStudies.map((cs) => ({
      ...cs,
      metricsCount: cs._count.metrics,
      _count: undefined,
    })),
  });
});

export const POST = withAdminAuth(async (req) => {
  const body = await req.json();
  const payload = zodValidate(CaseStudySchema, body);

  if (payload instanceof NextResponse) {
    return payload;
  }

  const { projectId, ...data } = payload.data;

  if (projectId) {
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 400 });
    }
  }

  const slug = data.slug || generateSlug(data.title);

  const existingSlug = await db.caseStudy.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
  }

  const caseStudy = await db.caseStudy.create({
    data: {
      ...data,
      slug,
      projectId: projectId || null,
      mediaAssetIds: [],
    },
    include: {
      project: { select: { id: true, title: true } },
      metrics: true,
    },
  });

  return ok(caseStudy, { status: 201 });
});
