import { NextResponse } from 'next/server';

import { requireSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await requireSession(req);

    if (session instanceof NextResponse) {
      return session;
    }

    session.expiresAt = Date.now() + 28800000;
    await session.save();

    return NextResponse.json({
      ok: true,
      expiresAt: new Date(session.expiresAt).toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
