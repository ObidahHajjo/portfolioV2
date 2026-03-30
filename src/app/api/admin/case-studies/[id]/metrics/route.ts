import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { notFound, ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { caseStudyMetricSchema } from '@/lib/admin/validation';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async () => {
    const caseStudy = await db.caseStudy.findUnique({ where: { id: params.id } });

    if (!caseStudy) {
      return notFound();
    }

    const metrics = await db.caseStudyMetric.findMany({
      where: { caseStudyId: params.id },
      orderBy: { displayOrder: 'asc' },
    });

    return ok(metrics);
  })(req);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return withAdminAuth(async (innerReq) => {
    const caseStudy = await db.caseStudy.findUnique({ where: { id: params.id } });

    if (!caseStudy) {
      return notFound();
    }

    const body = await innerReq.json();
    const payload = zodValidate(caseStudyMetricSchema, body);

    if (payload instanceof NextResponse) {
      return payload;
    }

    const metric = await db.caseStudyMetric.create({
      data: {
        ...payload.data,
        caseStudyId: params.id,
      },
    });

    return ok(metric, { status: 201 });
  })(req);
}
