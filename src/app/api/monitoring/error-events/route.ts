import { NextResponse } from 'next/server';
import { z } from 'zod';

import { captureError } from '@/lib/monitoring/capture';
import { checkAndSendAlert } from '@/lib/monitoring/alerts';
import { requireSession } from '@/lib/session';

const errorEventSchema = z.object({
  surface: z.enum(['PUBLIC', 'ADMIN', 'API']),
  pagePath: z.string().startsWith('/').optional(),
  message: z.string().min(1).max(4000),
  stack: z.string().optional(),
  fingerprint: z.string().max(100).optional(),
});

const PUBLIC_EVENT_WINDOW_MS = 10 * 60 * 1000;
const PUBLIC_EVENT_MAX_PER_WINDOW = 30;
const publicEventWindow = new Map<string, { count: number; startedAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0];
    return first?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
}

function isTrustedPublicRequest(request: Request): boolean {
  const host = request.headers.get('host');
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const secFetchSite = request.headers.get('sec-fetch-site');

  if (!host) {
    return false;
  }

  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      if (new URL(referer).host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  }

  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'same-site') {
    return false;
  }

  return true;
}

function isWithinPublicRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const current = publicEventWindow.get(clientIp);

  if (!current || now - current.startedAt >= PUBLIC_EVENT_WINDOW_MS) {
    publicEventWindow.set(clientIp, { count: 1, startedAt: now });
    return true;
  }

  if (current.count >= PUBLIC_EVENT_MAX_PER_WINDOW) {
    return false;
  }

  current.count += 1;
  return true;
}

function formatZodErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    fields[path] = issue.message;
  }
  return fields;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = errorEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation failed',
          fields: formatZodErrors(parsed.error),
        },
        { status: 422 }
      );
    }

    const { surface, pagePath, message, stack, fingerprint } = parsed.data;

    if (surface === 'PUBLIC') {
      if (!isTrustedPublicRequest(request)) {
        return NextResponse.json({ ok: true }, { status: 202 });
      }

      const clientIp = getClientIp(request);
      if (!isWithinPublicRateLimit(clientIp)) {
        return NextResponse.json({ ok: true }, { status: 202 });
      }
    }

    if (surface === 'ADMIN') {
      const session = await requireSession(request);
      if (session instanceof NextResponse) {
        return NextResponse.json({ ok: true }, { status: 202 });
      }
    }

    await captureError({
      surface,
      pagePath,
      message,
      stack,
      fingerprint,
    });

    checkAndSendAlert(surface).catch((err) => {
      console.error('[monitoring] Alert check failed:', err);
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    console.error('[monitoring] Failed to ingest error event:', error);
    return NextResponse.json({ ok: true }, { status: 202 });
  }
}
