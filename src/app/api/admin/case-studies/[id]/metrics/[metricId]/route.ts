import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { notFound, ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { caseStudyMetricSchema } from '@/lib/admin/validation';

export async function PUT(req: Request, { params }: { params: { id: string; metricId: string } }) {
  return withAdminAuth(async (innerReq) => {
    const metric = await db.caseStudyMetric.findUnique({
      where: { id: params.metricId },
    });

    if (!metric || metric.caseStudyId !== params.id) {
      return notFound();
    }

    const body = await innerReq.json();
    const payload = zodValidate(caseStudyMetricSchema.partial(), body);

    if (payload instanceof NextResponse) {
      return payload;
    }

    const updated = await db.caseStudyMetric.update({
      where: { id: params.metricId },
      data: payload.data,
    });

    return ok(updated);
  })(req);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; metricId: string } }
) {
  return withAdminAuth(async () => {
    const metric = await db.caseStudyMetric.findUnique({
      where: { id: params.metricId },
    });

    if (!metric || metric.caseStudyId !== params.id) {
      return notFound();
    }

    await db.caseStudyMetric.delete({ where: { id: params.metricId } });

    return new NextResponse(null, { status: 204 });
  })(req);
}
