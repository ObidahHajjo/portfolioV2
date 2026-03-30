import { NextResponse } from 'next/server';

import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession(req);

    if (!session.adminId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await session.destroy();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
