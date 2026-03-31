import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/db';
import { buildSessionHash } from '@/lib/analytics/session';
import { sanitizeForStorage } from '@/lib/security/hash';

const pageViewSchema = z.object({
  pagePath: z.string().min(1).max(300).startsWith('/'),
  referrer: z.string().max(500).optional(),
});

function normalizePath(path: string): string {
  if (path === '/') {
    return '/';
  }

  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function extractIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts[0]?.trim() ?? 'unknown';
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return 'unknown';
}

function extractUserAgent(request: Request): string {
  return request.headers.get('user-agent') ?? 'unknown';
}

function extractReferrerHost(referrer: string | undefined): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    return sanitizeForStorage(url.host, 255);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = pageViewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { pagePath, referrer } = parsed.data;
    const ip = extractIp(request);
    const userAgent = extractUserAgent(request);
    const sessionHash = buildSessionHash({ ip, userAgent });
    const referrerHost = extractReferrerHost(referrer);

    try {
      await db.analyticsEvent.create({
        data: {
          pagePath: sanitizeForStorage(normalizePath(pagePath), 300),
          referrerHost,
          sessionHash,
        },
      });
    } catch (err) {
      console.error('Failed to persist analytics event:', err);
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (err) {
    console.error('Analytics ingest error:', err);
    return NextResponse.json({ ok: true }, { status: 202 });
  }
}
