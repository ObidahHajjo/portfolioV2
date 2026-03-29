import { NextResponse } from 'next/server';

import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession(req);

    if (!session.adminId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    session.destroy();
    await session.save();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
