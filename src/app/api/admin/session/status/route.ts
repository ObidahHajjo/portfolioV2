import { NextResponse } from 'next/server';

import { requireSession } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const session = await requireSession(req);

    if (session instanceof NextResponse) {
      return session;
    }

    return NextResponse.json({
      expiresAt: new Date(session.expiresAt!).toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
