import { NextResponse } from 'next/server';
import { z } from 'zod';

import type { AdminSession } from '@/lib/session';
import { requireSession } from '@/lib/session';

export function withAdminAuth(
  handler: (req: Request, session: AdminSession) => Promise<NextResponse>
) {
  return async function wrapped(req: Request): Promise<NextResponse> {
    try {
      const session = await requireSession(req);

      if (session instanceof NextResponse) {
        return session;
      }

      return await handler(req, session);
    } catch {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export function zodValidate<T>(schema: z.ZodSchema<T>, data: unknown): { data: T } | NextResponse {
  const result = schema.safeParse(data);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        fields: Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : undefined,
          ])
        ),
      },
      { status: 422 }
    );
  }

  return { data: result.data };
}

export function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export function ok(data?: unknown, init?: ResponseInit) {
  return NextResponse.json(data ?? { ok: true }, init);
}
