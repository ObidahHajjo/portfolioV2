import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { unsealData } from 'iron-session';

import type { AdminSessionData } from '@/lib/session';
import { sessionOptions } from '@/lib/session';

async function getSessionFromRequest(req: NextRequest) {
  const sealedSession = req.cookies.get(sessionOptions.cookieName)?.value;

  if (!sealedSession) {
    return null;
  }

  try {
    return await unsealData<AdminSessionData>(sealedSession, {
      password: sessionOptions.password,
      ttl: 28800,
    });
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/api/admin/auth/login') {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);
  const isSessionValid =
    Boolean(session?.adminId) &&
    typeof session?.expiresAt === 'number' &&
    session.expiresAt > Date.now();

  if (pathname === '/admin/login') {
    if (isSessionValid) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    return NextResponse.next();
  }

  if (!isSessionValid) {
    if (pathname.startsWith('/api/admin/')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const redirectUrl = new URL('/admin/login', req.url);
    const reason = session?.expiresAt ? 'session_expired' : 'unauthorized';
    redirectUrl.searchParams.set('reason', reason);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
