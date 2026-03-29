import { NextResponse } from 'next/server';

import { notFound, ok, withAdminAuth } from '@/lib/admin/api-helpers';
import {
  isActionSegment,
  isLifecycleSegment,
  updateEntityOrder,
  updateLifecycleRecord,
} from '@/lib/admin/server';

export async function PATCH(
  req: Request,
  { params }: { params: { entity: string; id: string; action: string } }
) {
  if (!isActionSegment(params.action)) {
    return notFound();
  }

  return withAdminAuth(async (innerReq) => {
    if (!isLifecycleSegment(params.entity)) {
      return notFound();
    }

    if (params.action === 'order') {
      const result = await updateEntityOrder(
        params.entity as Parameters<typeof updateEntityOrder>[0],
        params.id,
        await innerReq.json()
      );
      return result instanceof NextResponse ? result : ok(result);
    }

    const result = await updateLifecycleRecord(
      params.entity as Parameters<typeof updateLifecycleRecord>[0],
      params.id,
      params.action as Parameters<typeof updateLifecycleRecord>[2]
    );
    return result instanceof NextResponse ? result : ok(result);
  })(req);
}
